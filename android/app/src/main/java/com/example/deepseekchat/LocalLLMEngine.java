package com.example.deepseekchat;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class LocalLLMEngine {
    
    private static final String TAG = "LocalLLMEngine";
    private static final String MODEL_FILE_NAME = "qwen3-4b-instruct-2507-q4_k_m.gguf";
    
    private Context context;
    private String modelPath;
    private ExecutorService executor;
    private Handler mainHandler;
    private boolean initialized = false;
    private long modelHandle = 0;
    
    // llama.cpp JNI 方法
    private native void nativeInit(String nativeLibraryDir);
    private native long nativeLoadModel(String modelPath);
    private native String nativeGenerate(long handle, String prompt, String systemPrompt, int maxTokens, float temperature);
    private native void nativeFreeModel(long handle);
    
    static {
        try {
            System.loadLibrary("llama-android");
            Log.i(TAG, "llama-android JNI loaded successfully");
        } catch (UnsatisfiedLinkError e) {
            Log.e(TAG, "Failed to load llama-android JNI: " + e.getMessage());
            Log.i(TAG, "Using Java fallback implementation");
        }
    }
    
    public LocalLLMEngine() {
        executor = Executors.newSingleThreadExecutor();
        mainHandler = new Handler(Looper.getMainLooper());
    }
    
    public boolean initialize(Context context, String modelPath) {
        this.context = context.getApplicationContext();
        this.modelPath = modelPath;
        
        Log.i(TAG, "Initializing LocalLLMEngine...");
        Log.i(TAG, "Model path: " + modelPath);
        nativeInit(this.context.getApplicationInfo().nativeLibraryDir);
        
        // 检查模型文件
        File modelFile = new File(modelPath);
        if (!modelFile.exists()) {
            Log.e(TAG, "Model file does not exist: " + modelPath);
            
            // 尝试从 assets 复制
            return initializeFromAssets();
        }
        
        long fileSize = modelFile.length();
        Log.i(TAG, "Model file size: " + (fileSize / 1024 / 1024) + " MB");
        
        if (fileSize < 1000000) {
            Log.e(TAG, "Model file is too small: " + fileSize + " bytes");
            return false;
        }
        
        // 尝试加载本地 JNI 库
        try {
            modelHandle = nativeLoadModel(modelPath);
            if (modelHandle != 0) {
                initialized = true;
                Log.i(TAG, "Model loaded successfully via JNI!");
                return true;
            }
        } catch (Error e) {
            Log.w(TAG, "JNI not available, using Java fallback: " + e.getMessage());
        }
        
        Log.e(TAG, "Native llama.cpp model load failed");
        initialized = false;
        return false;
    }
    
    private boolean initializeFromAssets() {
        Log.i(TAG, "Trying to copy model from assets...");
        
        try {
            File assetsDir = new File(context.getFilesDir(), "models");
            if (!assetsDir.exists()) {
                assetsDir.mkdirs();
            }
            
            File destFile = new File(assetsDir, MODEL_FILE_NAME);
            
            // 检查 assets 中是否有模型
            String[] assets = context.getAssets().list("");
            boolean hasModel = false;
            for (String asset : assets) {
                if (asset.endsWith(".gguf")) {
                    hasModel = true;
                    Log.i(TAG, "Found model in assets: " + asset);
                    break;
                }
            }
            
            if (hasModel && !destFile.exists()) {
                Log.i(TAG, "Copying model from assets to: " + destFile.getAbsolutePath());
                copyAssetFile(MODEL_FILE_NAME, destFile);
                this.modelPath = destFile.getAbsolutePath();
                return initialize(context, this.modelPath);
            }
            
        } catch (IOException e) {
            Log.e(TAG, "Failed to copy from assets: " + e.getMessage());
        }
        
        return false;
    }
    
    private void copyAssetFile(String assetName, File destFile) throws IOException {
        InputStream in = context.getAssets().open(assetName);
        FileOutputStream out = new FileOutputStream(destFile);
        
        byte[] buffer = new byte[8192];
        int read;
        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
        
        in.close();
        out.close();
        Log.i(TAG, "Model copied successfully, size: " + (destFile.length() / 1024 / 1024) + " MB");
    }
    
    public String generate(String prompt, String systemPrompt, int maxTokens, double temperature) {
        if (!initialized) {
            Log.e(TAG, "Engine not initialized");
            return "错误：模型未初始化。请确保模型文件已放置在正确位置。\n\n" +
                   "模型路径：" + modelPath;
        }
        
        try {
            // 尝试使用 JNI
            if (modelHandle != 0) {
                try {
                    String response = nativeGenerate(modelHandle, prompt, systemPrompt, maxTokens, (float) temperature);
                    Log.i(TAG, "Generated response via JNI");
                    return response;
                } catch (Error e) {
                    Log.w(TAG, "JNI generation failed: " + e.getMessage());
                }
            }
            
            return "错误：本地 llama.cpp 推理库未能生成回复，请检查模型文件和手机内存。";
            
        } catch (Exception e) {
            Log.e(TAG, "Error generating text", e);
            return "生成失败：" + e.getMessage();
        }
    }
    
    private String generateWithJava(String prompt, String systemPrompt) {
        Log.i(TAG, "Using Java fallback generation (demo mode)");
        
        // 模拟推理延迟
        try {
            Thread.sleep(2000); // 2秒延迟模拟真实推理
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 构建上下文
        StringBuilder context = new StringBuilder();
        if (systemPrompt != null && !systemPrompt.isEmpty()) {
            context.append("【系统设定】\n").append(systemPrompt).append("\n\n");
        }
        context.append("【对话】\n").append(prompt);
        
        // 生成演示回复
        String response = generateDemoResponse(context.toString());
        Log.i(TAG, "Generated demo response, length: " + response.length());
        
        return response;
    }
    
    private String generateDemoResponse(String context) {
        // 演示实现 - 根据上下文生成简单的回复
        if (context.contains("你好") || context.contains("hi") || context.contains("hello")) {
            return "你好！很高兴和你聊天！😊\n\n" +
                   "我是小涵星叙，一个本地 AI 助手。\n" +
                   "由于当前使用演示模式，实际的 AI 推理功能需要集成完整的 llama.cpp 库。\n\n" +
                   "如果你想体验完整的本地 AI 功能，可以：\n" +
                   "1. 下载并集成 llama.cpp Android JNI 库\n" +
                   "2. 将 qwen3-4b-instruct-2507-q4_k_m.gguf 模型文件放入正确位置\n" +
                   "3. 重新编译应用\n\n" +
                   "有什么我可以帮助你的吗？";
        }
        
        if (context.contains("帮助") || context.contains("help")) {
            return "我可以帮助你：\n\n" +
                   "🌐 **在线模式**：使用豆包 API，支持语音合成\n" +
                   "📱 **离线模式**：使用本地 AI 模型，无需网络\n\n" +
                   "当前处于演示模式，要获得真实能力请：\n" +
                   "1. 集成 llama.cpp Android 库\n" +
                   "2. 放置 GGUF 模型文件\n\n" +
                   "需要我帮你做什么？";
        }
        
        return "我收到了你的消息：\n\n「" + extractLastUserMessage(context) + "」\n\n" +
               "在演示模式下，我只能给出简单的回复。\n\n" +
               "要体验完整的本地 AI 对话功能，需要集成 llama.cpp JNI 库。\n\n" +
               "你想试试什么话题？";
    }
    
    private String extractLastUserMessage(String context) {
        // 简单提取最后一条用户消息
        String[] lines = context.split("\n");
        String lastUserMsg = "";
        
        for (int i = lines.length - 1; i >= 0; i--) {
            String line = lines[i].trim();
            if (line.startsWith("User:") || line.startsWith("用户:")) {
                lastUserMsg = line.replaceFirst("(?i)^(User:|用户:)", "").trim();
                break;
            }
        }
        
        return lastUserMsg.isEmpty() ? "..." : lastUserMsg;
    }
    
    public void shutdown() {
        Log.i(TAG, "Shutting down LocalLLMEngine...");
        
        if (modelHandle != 0) {
            try {
                nativeFreeModel(modelHandle);
            } catch (Error e) {
                Log.w(TAG, "Failed to free model via JNI: " + e.getMessage());
            }
            modelHandle = 0;
        }
        
        if (executor != null && !executor.isShutdown()) {
            executor.shutdown();
        }
        initialized = false;
        Log.i(TAG, "Shutdown complete");
    }
    
    public boolean isInitialized() {
        return initialized;
    }
    
    public String getModelPath() {
        return modelPath;
    }
}
