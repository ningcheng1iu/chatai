#include <jni.h>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
#include <unistd.h>

#include "chat.h"
#include "common.h"
#include "llama.h"
#include "logging.h"
#include "sampling.h"

namespace {

constexpr int N_THREADS_MIN = 2;
constexpr int N_THREADS_MAX = 4;
constexpr int N_THREADS_HEADROOM = 2;
constexpr int DEFAULT_CONTEXT_SIZE = 4096;
constexpr int OVERFLOW_HEADROOM = 4;
constexpr int BATCH_SIZE = 512;

llama_model *g_model = nullptr;
llama_context *g_context = nullptr;
llama_batch g_batch{};
common_chat_templates_ptr g_chat_templates;
common_sampler *g_sampler = nullptr;
llama_pos g_position = 0;

std::string jstring_to_string(JNIEnv *env, jstring value) {
    if (!value) {
        return "";
    }

    const char *chars = env->GetStringUTFChars(value, nullptr);
    std::string result(chars ? chars : "");
    env->ReleaseStringUTFChars(value, chars);
    return result;
}

void clear_runtime() {
    if (g_sampler) {
        common_sampler_free(g_sampler);
        g_sampler = nullptr;
    }
    g_chat_templates.reset();
    if (g_context) {
        llama_free(g_context);
        g_context = nullptr;
    }
    if (g_batch.token) {
        llama_batch_free(g_batch);
        g_batch = {};
    }
    g_position = 0;
}

void clear_model() {
    clear_runtime();
    if (g_model) {
        llama_model_free(g_model);
        g_model = nullptr;
    }
}

int thread_count() {
    const int cpu_count = static_cast<int>(sysconf(_SC_NPROCESSORS_ONLN));
    return std::max(N_THREADS_MIN, std::min(N_THREADS_MAX, cpu_count - N_THREADS_HEADROOM));
}

bool init_runtime(float temperature) {
    clear_runtime();

    llama_context_params ctx_params = llama_context_default_params();
    ctx_params.n_ctx = DEFAULT_CONTEXT_SIZE;
    ctx_params.n_batch = BATCH_SIZE;
    ctx_params.n_ubatch = BATCH_SIZE;
    ctx_params.n_threads = thread_count();
    ctx_params.n_threads_batch = ctx_params.n_threads;

    g_context = llama_init_from_model(g_model, ctx_params);
    if (!g_context) {
        LOGe("Failed to create llama context");
        return false;
    }

    g_batch = llama_batch_init(BATCH_SIZE, 0, 1);
    g_chat_templates = common_chat_templates_init(g_model, "");

    common_params_sampling sampling_params;
    sampling_params.temp = temperature;
    sampling_params.top_k = 40;
    sampling_params.top_p = 0.9f;
    g_sampler = common_sampler_init(g_model, sampling_params);
    if (!g_sampler) {
        LOGe("Failed to create sampler");
        clear_runtime();
        return false;
    }

    return true;
}

bool decode_tokens(const llama_tokens &tokens, bool logits_last) {
    for (int offset = 0; offset < static_cast<int>(tokens.size()); offset += BATCH_SIZE) {
        const int current_size = std::min(static_cast<int>(tokens.size()) - offset, BATCH_SIZE);
        common_batch_clear(g_batch);

        for (int i = 0; i < current_size; ++i) {
            const bool want_logits = logits_last && (offset + i == static_cast<int>(tokens.size()) - 1);
            common_batch_add(g_batch, tokens[offset + i], g_position + i, {0}, want_logits);
        }

        if (llama_decode(g_context, g_batch) != 0) {
            LOGe("llama_decode failed while processing prompt");
            return false;
        }

        g_position += current_size;
    }

    return true;
}

std::string format_prompt(const std::string &system_prompt, const std::string &prompt) {
    std::vector<common_chat_msg> messages;
    if (!system_prompt.empty()) {
        messages.push_back({"system", system_prompt});
    }
    messages.push_back({"user", prompt});

    common_chat_templates_inputs inputs;
    inputs.messages = messages;
    inputs.add_generation_prompt = true;
    inputs.use_jinja = false;

    common_chat_params params;
    return common_chat_templates_apply(g_chat_templates.get(), inputs).prompt;
}

bool is_valid_utf8(const char *string) {
    if (!string) {
        return true;
    }

    const auto *bytes = reinterpret_cast<const unsigned char *>(string);
    while (*bytes != 0x00) {
        int count;
        if ((*bytes & 0x80) == 0x00) {
            count = 1;
        } else if ((*bytes & 0xE0) == 0xC0) {
            count = 2;
        } else if ((*bytes & 0xF0) == 0xE0) {
            count = 3;
        } else if ((*bytes & 0xF8) == 0xF0) {
            count = 4;
        } else {
            return false;
        }

        bytes += 1;
        for (int i = 1; i < count; ++i) {
            if ((*bytes & 0xC0) != 0x80) {
                return false;
            }
            bytes += 1;
        }
    }
    return true;
}

std::string generate_text(const std::string &prompt, const std::string &system_prompt, int max_tokens, float temperature) {
    if (!g_model) {
        return "错误：本地模型尚未加载。";
    }

    if (!init_runtime(temperature)) {
        return "错误：本地推理上下文初始化失败，可能是手机内存不足。";
    }

    const std::string formatted_prompt = format_prompt(system_prompt, prompt);
    llama_tokens prompt_tokens = common_tokenize(g_context, formatted_prompt, true, true);
    if (prompt_tokens.empty()) {
        clear_runtime();
        return "错误：无法解析本地提示词。";
    }

    const int max_prompt_tokens = DEFAULT_CONTEXT_SIZE - max_tokens - OVERFLOW_HEADROOM;
    if (static_cast<int>(prompt_tokens.size()) > max_prompt_tokens) {
        prompt_tokens.erase(prompt_tokens.begin(), prompt_tokens.end() - max_prompt_tokens);
    }

    if (!decode_tokens(prompt_tokens, true)) {
        clear_runtime();
        return "错误：本地模型处理提示词失败。";
    }

    std::ostringstream output;
    std::string cache;
    const llama_vocab *vocab = llama_model_get_vocab(g_model);

    for (int i = 0; i < max_tokens; ++i) {
        llama_token token = common_sampler_sample(g_sampler, g_context, -1);
        common_sampler_accept(g_sampler, token, true);

        if (llama_vocab_is_eog(vocab, token)) {
            break;
        }

        common_batch_clear(g_batch);
        common_batch_add(g_batch, token, g_position, {0}, true);
        if (llama_decode(g_context, g_batch) != 0) {
            LOGe("llama_decode failed during generation");
            break;
        }
        g_position += 1;

        cache += common_token_to_piece(g_context, token);
        if (is_valid_utf8(cache.c_str())) {
            output << cache;
            cache.clear();
        }
    }

    clear_runtime();

    std::string text = output.str();
    if (text.empty()) {
        return "本地模型没有生成内容。";
    }
    return text;
}

} // namespace

extern "C"
JNIEXPORT void JNICALL
Java_com_example_deepseekchat_LocalLLMEngine_nativeInit(JNIEnv *env, jobject, jstring native_lib_dir) {
    llama_log_set(local_llm_log_callback, nullptr);

    const std::string lib_dir = jstring_to_string(env, native_lib_dir);
    if (!lib_dir.empty()) {
        ggml_backend_load_all_from_path(lib_dir.c_str());
    } else {
        ggml_backend_load_all();
    }

    llama_backend_init();
    LOGi("llama.cpp backend initialized");
}

extern "C"
JNIEXPORT jlong JNICALL
Java_com_example_deepseekchat_LocalLLMEngine_nativeLoadModel(JNIEnv *env, jobject, jstring model_path) {
    clear_model();

    const std::string path = jstring_to_string(env, model_path);
    llama_model_params params = llama_model_default_params();
    params.n_gpu_layers = 0;

    g_model = llama_model_load_from_file(path.c_str(), params);
    if (!g_model) {
        LOGe("Failed to load model: %s", path.c_str());
        return 0;
    }

    LOGi("Model loaded: %s", path.c_str());
    return 1;
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_example_deepseekchat_LocalLLMEngine_nativeGenerate(
        JNIEnv *env,
        jobject,
        jlong,
        jstring prompt,
        jstring system_prompt,
        jint max_tokens,
        jfloat temperature) {
    const std::string result = generate_text(
            jstring_to_string(env, prompt),
            jstring_to_string(env, system_prompt),
            std::max(16, std::min(1024, static_cast<int>(max_tokens))),
            std::max(0.05f, std::min(1.5f, temperature)));
    return env->NewStringUTF(result.c_str());
}

extern "C"
JNIEXPORT void JNICALL
Java_com_example_deepseekchat_LocalLLMEngine_nativeFreeModel(JNIEnv *, jobject, jlong) {
    clear_model();
}
