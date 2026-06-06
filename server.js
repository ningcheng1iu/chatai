import "dotenv/config";
import cors from "cors";
import express from "express";
const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.static("public"));

const apiKey = process.env.ARK_API_KEY || process.env.DOUBAO_API_KEY || process.env.DEEPSEEK_API_KEY;
const model = process.env.ARK_MODEL || "doubao-seed-2-0-lite-260428";
const baseURL = process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3";
const ttsAppId = process.env.DOUBAO_TTS_APP_ID || process.env.VOLC_TTS_APP_ID || "";
const ttsToken = process.env.DOUBAO_TTS_TOKEN || process.env.VOLC_TTS_TOKEN || "";
const ttsCluster = process.env.DOUBAO_TTS_CLUSTER || "volcano_tts";
const ttsVoiceType = process.env.DOUBAO_TTS_VOICE_TYPE || "BV421_streaming";
const ttsEndpoint = process.env.DOUBAO_TTS_ENDPOINT || "https://openspeech.bytedance.com/api/v1/tts";

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    provider: "volcengine-ark",
    model,
    configured: Boolean(apiKey && model),
    ttsConfigured: Boolean(ttsAppId && ttsToken),
    ttsVoiceType,
  });
});

app.post("/api/chat", async (req, res) => {
  try {
    if (!apiKey || !model) {
      return res.status(400).json({
        error: "还没有配置火山方舟 API。请在 .env 中填写 ARK_API_KEY。",
      });
    }

    const messages = normalizeMessages(req.body?.messages);
    if (messages.length === 0) {
      return res.status(400).json({ error: "请先输入一条消息。" });
    }

    const data = await createArkResponse({
      model,
      instructions: normalizeSystemPrompt(req.body?.systemPrompt),
      input: formatMessagesForResponses(messages),
      temperature: 0.7,
      max_output_tokens: 900,
    });

    res.json({
      reply: extractResponseText(data) || "抱歉，我暂时没有生成回复。",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "调用豆包模型失败，请检查 API Key、模型名、账户余额或网络状态。",
    });
  }
});

app.post("/api/memory", async (req, res) => {
  try {
    if (!apiKey || !model) {
      return res.status(400).json({
        error: "还没有配置火山方舟 API。请在 .env 中填写 ARK_API_KEY。",
      });
    }

    const messages = normalizeMessages(req.body?.messages, 24);
    if (messages.length < 4) {
      return res.status(400).json({ error: "可压缩的聊天内容还不够。" });
    }

    const data = await createArkResponse({
      model,
      instructions: buildMemoryCompressionPrompt(),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                existingMemory: normalizeMemory(req.body?.existingMemory),
                newMessages: messages,
              }),
            },
          ],
        },
      ],
      temperature: 0.2,
      max_output_tokens: 700,
    });

    res.json({
      memory: parseMemoryJson(extractResponseText(data)),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "压缩聊天记忆失败，请稍后重试。",
    });
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    if (!ttsAppId || !ttsToken) {
      return res.status(400).json({
        error: "还没有配置豆包语音合成。请在 .env 中填写 DOUBAO_TTS_APP_ID 和 DOUBAO_TTS_TOKEN。",
      });
    }

    const text = normalizeTtsText(req.body?.text);
    if (!text) {
      return res.status(400).json({ error: "没有可朗读的回复内容。" });
    }

    const data = await createDoubaoSpeech(text);
    res.json({
      audio: `data:audio/mp3;base64,${data.data}`,
      voiceType: ttsVoiceType,
      duration: data.addition?.duration || "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "调用豆包语音合成失败，请检查 TTS AppID、Token、音色授权、余额或网络状态。",
    });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Doubao chat app is running at http://localhost:${port}`);
});

function normalizeMessages(value, limit = 10) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((message) => {
      return (
        message &&
        ["user", "assistant"].includes(message.role) &&
        hasMessageContent(message)
      );
    })
    .slice(-limit)
    .map((message) => ({
      role: message.role,
      content: typeof message.content === "string" ? message.content.trim().slice(0, 3000) : "",
      attachments: Array.isArray(message.attachments) ? message.attachments : [],
    }));
}

function hasMessageContent(message) {
  if (typeof message.content === "string" && message.content.trim()) {
    return true;
  }

  return Array.isArray(message.attachments) && message.attachments.length > 0;
}

function normalizeMessageContent(message) {
  const text = typeof message.content === "string" ? message.content.trim().slice(0, 3000) : "";
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];

  if (message.role !== "user" || attachments.length === 0) {
    return text;
  }

  const content = [];
  if (text) {
    content.push({ type: "input_text", text });
  }

  for (const attachment of attachments) {
    if (attachment.type === "image" && attachment.dataUrl) {
      content.push({
        type: "input_image",
        image_url: String(attachment.dataUrl).slice(0, 6_000_000),
      });
    }

    if (attachment.type === "audio") {
      content.push({
        type: "input_text",
        text: "[Voice message omitted: doubao-seed-2-0-lite does not support direct audio input.]",
      });
      continue;
    }

  }

  return content.length ? content : text;
}

function formatMessagesForResponses(messages) {
  const transcript = messages
    .map((message) => {
      const speaker = message.role === "assistant" ? "AI" : "用户";
      const attachmentText = (message.attachments || [])
        .map((attachment) => (attachment.type === "image" ? "[图片]" : "[语音]"))
        .join("");
      return `${speaker}：${message.content || ""}${attachmentText}`.trim();
    })
    .filter(Boolean)
    .join("\n");

  const content = [{ type: "input_text", text: transcript || "继续对话。" }];
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");

  if (latestUserMessage) {
    const formatted = normalizeMessageContent(latestUserMessage);
    if (Array.isArray(formatted)) {
      content.push(...formatted.filter((item) => item.type !== "input_text"));
    }
  }

  return [
    {
      role: "user",
      content,
    },
  ];
}

async function createArkResponse(payload) {
  const response = await fetch(`${baseURL.replace(/\/$/, "")}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Ark Responses API request failed.");
  }

  return data;
}

async function createDoubaoSpeech(text) {
  const payload = {
    app: {
      appid: ttsAppId,
      token: ttsToken,
      cluster: ttsCluster,
    },
    user: {
      uid: "chat-app-user",
    },
    audio: {
      voice_type: ttsVoiceType,
      encoding: "mp3",
      compression_rate: 1,
      rate: 24000,
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0,
      language: "cn",
    },
    request: {
      reqid: crypto.randomUUID(),
      text,
      text_type: "plain",
      operation: "query",
      silence_duration: "125",
    },
  };

  const response = await fetch(ttsEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer;${ttsToken}`,
    },
    body: JSON.stringify(payload),
  });

  // 先读取响应文本，检查是否是有效的JSON
  const responseText = await response.text();
  let data;
  
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error("TTS API返回了非JSON响应:", responseText);
    throw new Error("TTS API返回格式错误，请检查配置。");
  }

  if (!response.ok || data.code !== 3000 || !data.data) {
    throw new Error(data.message || "Doubao TTS request failed.");
  }

  return data;
}

function normalizeTtsText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/https?:\/\/\S+/g, "链接")
    .replace(/[`*_#>\[\](){}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
}

function extractResponseText(data) {
  if (typeof data?.output_text === "string") {
    return data.output_text.trim();
  }

  if (Array.isArray(data?.output)) {
    for (const outputItem of data.output) {
      if (!Array.isArray(outputItem?.content)) {
        continue;
      }

      const text = outputItem.content
        .map((contentItem) => contentItem?.text || "")
        .join("")
        .trim();
      if (text) {
        return text;
      }
    }
  }

  return "";
}

function normalizeSystemPrompt(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim().slice(0, 2500);
  }

  return "你是小宁为用户设计的专属中文聊天 AI，回复友好、清晰、实用。你可以理解文字、图片和用户录音内容。除非用户要求详细展开，否则保持简洁。";
}

function normalizeMemory(value) {
  if (!value || typeof value !== "object") {
    return { summary: "", items: [] };
  }

  return {
    summary: String(value.summary || "").trim().slice(0, 260),
    items: Array.isArray(value.items)
      ? value.items
          .filter((item) => item && (item.detail || item.text || item.title))
          .map((item) => ({
            title: String(item.title || "记忆").trim().slice(0, 32),
            detail: String(item.detail || item.text || "").trim().slice(0, 180),
            importance: Number(item.importance || 3),
          }))
          .slice(0, 12)
      : [],
  };
}

function buildMemoryCompressionPrompt() {
  return [
    "你是聊天记忆压缩器。请把已有记忆和新聊天合并为短小、可靠、对后续对话有帮助的长期记忆。",
    "只保留重要信息：用户偏好、稳定事实、长期目标、正在进行的项目、明确承诺或待办、强烈情绪背景。",
    "删除寒暄、一次性问题、重复内容、敏感密钥、账号密码、完整联系方式和不确定猜测。",
    "必须只输出 JSON，不要解释。格式：{\"summary\":\"120字以内摘要\",\"items\":[{\"title\":\"短标题\",\"detail\":\"具体记忆\",\"importance\":1-5}],\"updatedAt\":\"ISO时间\"}",
  ].join("\n");
}

function parseMemoryJson(content) {
  if (!content) {
    throw new Error("Memory response is empty.");
  }

  const jsonText = content.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) {
    throw new Error("Memory response is not JSON.");
  }

  const parsed = JSON.parse(jsonText);
  return {
    ...normalizeMemory(parsed),
    updatedAt: parsed.updatedAt || new Date().toISOString(),
  };
}
