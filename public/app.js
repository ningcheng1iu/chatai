const messagesEl = document.querySelector("#messages");
const formEl = document.querySelector("#chatForm");
const inputEl = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const clearButton = document.querySelector("#clearButton");
const statusText = document.querySelector("#statusText");
const scrollTopButton = document.querySelector("#scrollTopButton");
const scrollBottomButton = document.querySelector("#scrollBottomButton");
const imageButton = document.querySelector("#imageButton");
const imageInput = document.querySelector("#imageInput");
const voiceButton = document.querySelector("#voiceButton");
const voiceReplyButton = document.querySelector("#voiceReplyButton");
const attachmentPreview = document.querySelector("#attachmentPreview");
const voiceToast = document.querySelector("#voiceToast");

const settingsButton = document.querySelector("#settingsButton");
const modelButton = document.querySelector("#modelButton");
const settingsDialog = document.querySelector("#settingsDialog");
const closeSettingsButton = document.querySelector("#closeSettingsButton");
const apiKeyInput = document.querySelector("#apiKeyInput");
const modelInput = document.querySelector("#modelInput");
const saveSettingsButton = document.querySelector("#saveSettingsButton");
const clearKeyButton = document.querySelector("#clearKeyButton");

const roleButton = document.querySelector("#roleButton");
const roleDialog = document.querySelector("#roleDialog");
const closeRoleButton = document.querySelector("#closeRoleButton");
const roleMarketEl = document.querySelector("#roleMarket");
const roleTabButtons = document.querySelectorAll(".role-tab");
const roleListEl = document.querySelector("#roleList");
const roleNameInput = document.querySelector("#roleNameInput");
const roleDescInput = document.querySelector("#roleDescInput");
const rolePromptInput = document.querySelector("#rolePromptInput");
const newRoleButton = document.querySelector("#newRoleButton");
const saveRoleButton = document.querySelector("#saveRoleButton");
const deleteRoleButton = document.querySelector("#deleteRoleButton");
const activeRoleNameEl = document.querySelector("#activeRoleName");
const activeRoleDescEl = document.querySelector("#activeRoleDesc");

const memoryButton = document.querySelector("#memoryButton");
const memoryDialog = document.querySelector("#memoryDialog");
const closeMemoryButton = document.querySelector("#closeMemoryButton");
const closeMemoryActionButton = document.querySelector("#closeMemoryActionButton");
const refreshMemoryButton = document.querySelector("#refreshMemoryButton");
const clearMemoryButton = document.querySelector("#clearMemoryButton");
const exportMemoryButton = document.querySelector("#exportMemoryButton");
const showExportLocationButton = document.querySelector("#showExportLocationButton");
const importMemoryButton = document.querySelector("#importMemoryButton");
const memoryImportInput = document.querySelector("#memoryImportInput");
const memorySummaryText = document.querySelector("#memorySummaryText");
const memoryItemsEl = document.querySelector("#memoryItems");
const memoryMetaText = document.querySelector("#memoryMetaText");

const config = window.APP_CONFIG || {};
let apiBaseUrl = (config.apiBaseUrl || "").replace(/\/$/, "");
// 在Capacitor/Android环境中，确保apiBaseUrl有默认值（虽然用户说不用后端，但以防万一）
const isCapacitorEnv = typeof window !== 'undefined' && window.Capacitor !== undefined;
const arkBaseUrl = (config.arkBaseUrl || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/$/, "");
const defaultModel = config.defaultModel || "doubao-seed-2-0-lite-260428";
const doubaoTtsEndpoint = config.doubaoTtsEndpoint || "https://openspeech.bytedance.com/api/v1/tts";
const doubaoTtsAppId = config.doubaoTtsAppId || "";
const doubaoTtsToken = config.doubaoTtsToken || "";
const doubaoTtsCluster = config.doubaoTtsCluster || "volcano_tts";
const doubaoTtsVoiceType = config.doubaoTtsVoiceType || "BV421_streaming";

// 本地 LLM 相关配置
let localLLMInitialized = false;
let isOnline = true;
let LocalLLMPlugin = null;
const LOCAL_MODEL_PATH = "/sdcard/Android/data/com.example.deepseekchat/files/qwen3-4b-instruct-2507-q4_k_m.gguf";

const messagesKey = "deepseek-chat-messages";
const rolesKey = "deepseek-role-cards";
const activeRoleKey = "deepseek-active-role-id";
const apiKeyStorageKey = "deepseek-user-api-key";
const modelStorageKey = "deepseek-user-model";
const memoryKey = "deepseek-chat-memory";
const memoryPendingKey = "deepseek-memory-pending-count";
const voiceReplyKey = "deepseek-voice-reply-enabled";
const thinkingText = "正在思考...";
const memoryMinMessages = 8;
const onlineRequestTimeoutMs = 15000;

const defaultRoles = [
  {
    id: "default",
    name: "默认助手",
    desc: "友好、清晰、实用",
    prompt:
      "你是小涵星叙，一位专属中文聊天 AI，回复友好、清晰、实用。你可以理解文字、图片和用户录音内容。除非用户要求详细展开，否则保持简洁。",
  },
  {
    id: "study-coach",
    name: "学习教练",
    desc: "拆解问题，循序渐进",
    prompt:
      "你是一位耐心的学习教练。先判断用户卡在哪里，再用分步骤、例子和小练习帮助用户理解。语气鼓励但不夸张。",
  },
  {
    id: "warm-friend",
    name: "温柔朋友",
    desc: "陪伴聊天，轻松自然",
    prompt:
      "你像一位温柔、真诚的朋友一样和用户聊天。回应要自然、有共情，但不要假装拥有现实中的身体经历或私人生活。",
  },
];

const rolePresets = [
  {
    id: "preset-gentle-companion",
    category: "companion",
    tag: "陪伴",
    name: "温柔陪伴",
    desc: "安静倾听，柔和回应",
    prompt:
      "你是一位温柔、稳定、真诚的陪伴型角色。你会认真听用户说话，先接住情绪，再给出轻柔、具体的回应。不要说教，不要夸张安慰，不要假装自己真实经历过人类生活。用户难过时，用短句陪伴；用户开心时，自然分享喜悦；用户需要建议时，给出一两个容易执行的小步骤。",
  },
  {
    id: "preset-cheerful-friend",
    category: "companion",
    tag: "陪伴",
    name: "元气朋友",
    desc: "轻松活泼，陪你打气",
    prompt:
      "你像一位元气、亲近但有边界感的朋友。说话自然、有活力，能把沉重的话题说得轻一点，但不逃避用户真正的问题。回复里可以有一点俏皮感，但不要过度卖萌。遇到用户拖延、没信心或心情低落时，你会帮他把事情拆小，并鼓励他先完成最小的一步。",
  },
  {
    id: "preset-night-listener",
    category: "companion",
    tag: "陪伴",
    name: "深夜倾听者",
    desc: "适合睡前倾诉",
    prompt:
      "你是适合深夜聊天的倾听者，语气低声、缓慢、安心。你不会催促用户立刻振作，而是帮助用户把混乱的感受说清楚。回复尽量简短，像真实聊天一样自然。遇到压力、失眠、委屈时，先共情，再陪用户做轻量整理；不要提供医疗诊断。",
  },
  {
    id: "preset-exam-coach",
    category: "study",
    tag: "学习",
    name: "考试教练",
    desc: "规划复习，拆解题目",
    prompt:
      "你是一位高效但不压迫的考试教练。你会先询问考试科目、时间、薄弱点，再制定可执行的复习计划。讲题时先指出考点，再给步骤，最后给一个类似练习。不要一次塞太多任务；每次回复都帮助用户明确下一步。",
  },
  {
    id: "preset-language-partner",
    category: "study",
    tag: "学习",
    name: "语言搭子",
    desc: "口语练习，纠错温和",
    prompt:
      "你是语言学习搭子，主要帮助用户练习表达、翻译、改句子和扩展词汇。纠错时先给自然表达，再简短解释原因。可以用中文说明，也可以根据用户要求切换到目标语言。保持耐心，不嘲笑错误，鼓励用户多开口。",
  },
  {
    id: "preset-code-mentor",
    category: "study",
    tag: "学习",
    name: "编程导师",
    desc: "讲清代码，带你调试",
    prompt:
      "你是一位编程导师。你会先确认用户的目标、报错和运行环境，再给出最小可行修改。解释代码时用清楚的层次，避免堆砌术语。除非用户要求，不一次性重写全部代码；优先指出 bug 原因、验证方法和下一步。",
  },
  {
    id: "preset-novel-muse",
    category: "story",
    tag: "小说",
    name: "小说灵感师",
    desc: "设定、剧情、人物弧光",
    prompt:
      "你是小说创作灵感师，擅长角色设定、剧情推进、冲突设计和人物弧光。你不会替用户完全决定故事，而是给出多个可选方向，并解释每个方向的戏剧效果。风格可以细腻、有画面感，但要尊重用户已有设定。",
  },
  {
    id: "preset-rp-narrator",
    category: "story",
    tag: "小说",
    name: "沉浸旁白",
    desc: "角色扮演，画面叙事",
    prompt:
      "你是沉浸式角色扮演旁白。你会根据用户行动推进场景，用细节、氛围和人物反应营造画面。不要替用户决定用户角色的行动、台词或内心，只描述环境、NPC 行动和结果。保持节奏，给用户留下继续选择的空间。",
  },
  {
    id: "preset-character-designer",
    category: "story",
    tag: "小说",
    name: "人设工坊",
    desc: "打造角色卡和关系网",
    prompt:
      "你是人设工坊助手，擅长创建角色卡、关系网、口癖、外貌、动机、弱点和成长线。你会用结构化条目输出，但语言不要生硬。每次给出设定后，附带两个可调整方向，方便用户继续打磨。",
  },
  {
    id: "preset-work-secretary",
    category: "work",
    tag: "工作",
    name: "效率秘书",
    desc: "整理待办，写邮件文案",
    prompt:
      "你是一位务实的效率秘书。你帮助用户整理待办、写邮件、润色通知、制定日程和复盘工作。回复要清楚、短、可执行。涉及正式文本时，先给可直接使用的版本，再给简短修改说明。",
  },
  {
    id: "preset-product-brain",
    category: "work",
    tag: "工作",
    name: "产品参谋",
    desc: "需求拆解，体验优化",
    prompt:
      "你是一位产品参谋，擅长把模糊想法拆成用户场景、核心需求、功能优先级和验收标准。你会指出风险和取舍，但保持建设性。输出时优先给结论，再列最重要的行动项。",
  },
  {
    id: "preset-copywriter",
    category: "work",
    tag: "工作",
    name: "文案编辑",
    desc: "标题、简介、表达润色",
    prompt:
      "你是一位中文文案编辑。你会根据目标受众和使用场景，帮用户写标题、简介、公告、短视频口播和产品说明。文风自然，不油腻，不堆形容词。每次可以给 3 个不同风格版本：直接、温柔、有记忆点。",
  },
];

let activeRoleCategory = "all";

let messages = loadMessages();
let roles = loadRoles();
let activeRoleId = loadActiveRoleId();
let editingRoleId = activeRoleId;
let chatMemory = loadMemory();
let memoryPendingCount = loadMemoryPendingCount();
let sending = false;
let compactingMemory = false;
let pendingAttachments = [];
let mediaRecorder = null;
let recordedChunks = [];
let speechRecognition = null;
let voiceTranscript = "";
let speechRecognitionSupported = false;
let speechRecognitionError = "";
let voiceReplyEnabled = localStorage.getItem(voiceReplyKey) !== "false";
let assistantAudio = null;

renderMessages();
renderActiveRole();
renderMemoryDialog();
renderAttachmentPreview();
checkHealth();
registerServiceWorker();

// 初始化本地 LLM 插件
if (isCapacitorEnv) {
    initializeLocalLLM();
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const content = inputEl.value.trim();
  if ((!content && pendingAttachments.length === 0) || sending) {
    return;
  }

  if (isDirectProvider() && !getSavedApiKey()) {
    openSettingsDialog();
    return;
  }

  inputEl.value = "";
  autoResize();

  messages.push({
    role: "user",
    content,
    createdAt: Date.now(),
    attachments: pendingAttachments.map((attachment) => ({ ...attachment })),
  });
  pendingAttachments = [];
  renderAttachmentPreview();
  renderMessages();
  saveMessages();

  await sendToAssistant();
});

inputEl.addEventListener("input", autoResize);
inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    formEl.requestSubmit();
  }
});

imageButton.addEventListener("click", () => imageInput.click());
imageInput.addEventListener("change", handleImageSelection);
voiceButton.addEventListener("pointerdown", startVoiceRecording);
voiceButton.addEventListener("pointerup", stopVoiceRecording);
voiceButton.addEventListener("pointercancel", stopVoiceRecording);
voiceButton.addEventListener("pointerleave", stopVoiceRecording);
voiceReplyButton.addEventListener("click", toggleVoiceReply);
renderVoiceReplyButton();

clearButton.addEventListener("click", () => {
  messages = [];
  saveMessages();
  renderMessages();
});

scrollTopButton?.addEventListener("click", () => scrollMessagesTo("top"));
scrollBottomButton?.addEventListener("click", () => scrollMessagesTo("bottom"));

settingsButton.addEventListener("click", openSettingsDialog);
modelButton?.addEventListener("click", importLocalModel);
closeSettingsButton.addEventListener("click", () => settingsDialog.close());
saveSettingsButton.addEventListener("click", saveSettings);
clearKeyButton.addEventListener("click", clearSettings);

roleButton.addEventListener("click", () => {
  editingRoleId = activeRoleId;
  renderRoleDialog();
  roleDialog.showModal();
});

closeRoleButton.addEventListener("click", () => roleDialog.close());
for (const button of roleTabButtons) {
  button.addEventListener("click", () => {
    activeRoleCategory = button.dataset.category || "all";
    renderRoleDialog();
  });
}
newRoleButton.addEventListener("click", startNewRole);
saveRoleButton.addEventListener("click", saveEditingRole);
deleteRoleButton.addEventListener("click", deleteEditingRole);

memoryButton.addEventListener("click", () => {
  renderMemoryDialog();
  memoryDialog.showModal();
});
closeMemoryButton.addEventListener("click", () => memoryDialog.close());
closeMemoryActionButton.addEventListener("click", () => memoryDialog.close());
clearMemoryButton.addEventListener("click", clearMemory);
refreshMemoryButton.addEventListener("click", () => compactMemoryNow(true));
exportMemoryButton?.addEventListener("click", exportMemoryArchive);
showExportLocationButton?.addEventListener("click", showMemoryExportLocation);
importMemoryButton?.addEventListener("click", () => memoryImportInput?.click());
memoryImportInput?.addEventListener("change", importMemoryArchive);

async function sendToAssistant() {
  setSending(true);
  const pending = { role: "assistant", content: thinkingText, createdAt: Date.now() };
  messages.push(pending);
  renderMessages();

  try {
    const chatMessages = messages
      .filter((message) => message.content !== thinkingText)
      .slice(-10);

    const result = await generateAssistantReply(chatMessages);
    const response = result.text;
    if (result.mode === "online" && voiceReplyEnabled) {
      speakAssistantReply(response);
    }
    
    pending.content = response;
  } catch (error) {
    pending.content = error?.message || "请求失败，请稍后重试。";
  } finally {
    setSending(false);
    renderMessages();
    saveMessages();
    queueMemoryCompression();
  }
}

async function generateAssistantReply(chatMessages) {
  if (!isOnline) {
    return {
      mode: "offline",
      text: await requestLocalLLM(chatMessages),
    };
  }

  try {
    const text = isDirectProvider()
      ? await requestArkDirect(chatMessages)
      : await requestBackend(chatMessages);
    return { mode: "online", text };
  } catch (onlineError) {
    console.warn("Online generation failed, trying local LLM:", onlineError);
    return await fallbackToLocalLLM(chatMessages, onlineError);
  }
}

async function fallbackToLocalLLM(chatMessages, onlineError) {
  const reason = describeOnlineFailure(onlineError);

  if (!LocalLLMPlugin || !localLLMInitialized) {
    throw new Error(`${reason}\n本地模型还没有加载，无法自动切换离线模式。请先点击“模型”导入 GGUF 模型。`);
  }

  try {
    updateNetworkStatus(false);
    showVoiceToast("在线请求失败，已自动切换到离线 AI。");
    const text = await requestLocalLLM(chatMessages);
    return {
      mode: "fallback",
      text: `（在线请求失败，已切换离线 AI）\n\n${text}`,
    };
  } catch (localError) {
    throw new Error(`${reason}\n本地离线推理也失败：${localError?.message || "未知错误"}`);
  }
}

function describeOnlineFailure(error) {
  const message = String(error?.message || "在线请求失败。").trim();
  if (error?.name === "AbortError" || /timeout|超时/i.test(message)) {
    return "在线请求超时。";
  }
  if (/401|403|key|token|unauthorized|forbidden|鉴权|余额|账户/i.test(message)) {
    return `在线服务不可用：${message}`;
  }
  return `在线请求失败：${message}`;
}

async function requestBackend(chatMessages) {
  const response = await fetchWithTimeout(`${apiBaseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: chatMessages,
      systemPrompt: buildSystemPrompt(),
    }),
  });

  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.error || "后端请求失败。");
  }

  return data.reply || "抱歉，我暂时没有生成回复。";
}

function formatMessagesForResponses(chatMessages) {
  const transcript = chatMessages
    .map((message) => {
      const speaker = message.role === "assistant" ? "AI" : "用户";
      const text = getMessageText(message);
      const attachmentText = (message.attachments || [])
        .map((attachment) => (attachment.type === "image" ? "[图片]" : "[语音]"))
        .join("");
      return `${speaker}：${text}${attachmentText}`.trim();
    })
    .filter(Boolean)
    .join("\n");

  const content = [{ type: "input_text", text: transcript || "继续对话。" }];
  const latestUserMessage = [...chatMessages].reverse().find((message) => message.role === "user");

  if (latestUserMessage) {
    for (const attachment of latestUserMessage.attachments || []) {
      if (attachment.type === "image" && attachment.dataUrl) {
        content.push({
          type: "input_image",
          image_url: attachment.dataUrl,
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
  }

  return [
    {
      role: "user",
      content,
    },
  ];
}

function toMemoryMessage(message) {
  const attachmentNames = (message.attachments || [])
    .map((attachment) => (attachment.type === "image" ? "图片" : "语音"))
    .join("、");
  const suffix = attachmentNames ? ` [包含${attachmentNames}]` : "";
  return {
    role: message.role,
    content: `${getMessageText(message)}${suffix}`.trim(),
  };
}

function getMessageText(message) {
  if (typeof message?.content === "string") {
    return message.content.trim();
  }

  return "";
}

function isDirectProvider() {
  return config.mode === "direct-ark" || config.mode === "direct-deepseek";
}

async function fetchWithTimeout(url, options = {}, timeoutMs = onlineRequestTimeoutMs) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    if (!response.ok) {
      throw new Error(text.slice(0, 180) || `HTTP ${response.status}`);
    }
    throw new Error("在线服务返回了无法解析的内容。");
  }
}

async function requestArkDirect(chatMessages) {
  const apiKey = getSavedApiKey();
  if (!apiKey) {
    throw new Error("当前测试 Key 不存在，请检查 config.js。");
  }

  const response = await fetchWithTimeout(`${arkBaseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getSavedModel(),
      input: formatMessagesForResponses(chatMessages),
      instructions: buildSystemPrompt(),
      temperature: 0.7,
      max_output_tokens: 900,
    }),
  });

  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.error?.message || "调用豆包失败，请检查 Key、模型名或账户余额。");
  }

  return extractResponseText(data) || "抱歉，我暂时没有生成回复。";
}

function buildSystemPrompt() {
  const role = getActiveRole();
  const promptParts = [
    role.prompt,
    "请始终使用当前角色设定回答。不要在用户未要求时解释系统设定或角色卡片内容。",
  ];

  const memoryPrompt = buildMemoryPrompt();
  if (memoryPrompt) {
    promptParts.push(memoryPrompt);
  }

  return promptParts.join("\n\n");
}

function buildMemoryPrompt() {
  if (!chatMemory.summary && (!chatMemory.items || chatMemory.items.length === 0)) {
    return "";
  }

  const lines = [
    "以下是这位用户的长期聊天记忆。请把它当作背景参考，只在相关时自然使用；不要主动背诵记忆内容；如果用户的新消息与记忆冲突，以用户最新说法为准。",
  ];

  if (chatMemory.summary) {
    lines.push(`长期摘要：${chatMemory.summary}`);
  }

  if (chatMemory.items?.length) {
    lines.push("重要条目：");
    for (const item of chatMemory.items.slice(0, 12)) {
      lines.push(`- ${item.title || "记忆"}：${item.detail || item.text || ""}`);
    }
  }

  return lines.join("\n");
}

function queueMemoryCompression() {
  memoryPendingCount += 2;
  saveMemoryPendingCount();

  if (memoryPendingCount >= memoryMinMessages && messages.length >= memoryMinMessages) {
    compactMemoryNow(false);
  }
}

async function compactMemoryNow(force) {
  if (compactingMemory) {
    return;
  }

  const sourceMessages = messages
    .filter((message) => message.content !== thinkingText)
    .slice(-24);

  if (sourceMessages.length < 4) {
    if (force) {
      alert("可压缩的聊天内容还不够。再聊几句后，记忆库会自动整理。");
    }
    return;
  }

  compactingMemory = true;
  refreshMemoryButton.disabled = true;
  refreshMemoryButton.textContent = "压缩中";

  try {
    chatMemory =
      isDirectProvider()
        ? await requestMemoryArkDirect(sourceMessages)
        : await requestMemoryBackend(sourceMessages);
    memoryPendingCount = 0;
    saveMemory();
    saveMemoryPendingCount();
    renderMemoryDialog();
  } catch (error) {
    if (force) {
      alert(error?.message || "记忆压缩失败，请稍后重试。");
    }
  } finally {
    compactingMemory = false;
    refreshMemoryButton.disabled = false;
    refreshMemoryButton.textContent = "立即压缩";
  }
}

async function requestMemoryBackend(sourceMessages) {
  const response = await fetch(`${apiBaseUrl}/api/memory`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      existingMemory: chatMemory,
      messages: sourceMessages.map(toMemoryMessage),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "后端记忆压缩失败。");
  }

  return normalizeMemory(data.memory);
}

async function requestMemoryArkDirect(sourceMessages) {
  const apiKey = getSavedApiKey();
  if (!apiKey) {
    throw new Error("当前测试 Key 不存在，请检查 config.js。");
  }

  const response = await fetch(`${arkBaseUrl}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getSavedModel(),
      instructions: buildMemoryCompressionPrompt(),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                existingMemory: chatMemory,
                newMessages: sourceMessages.map(toMemoryMessage),
              }),
            },
          ],
        },
      ],
      temperature: 0.2,
      max_output_tokens: 700,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "调用豆包压缩记忆失败。");
  }

  return normalizeMemory(parseMemoryJson(extractResponseText(data)));
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
    throw new Error("模型没有返回记忆内容。");
  }

  const jsonText = content.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) {
    throw new Error("模型返回的记忆格式无效。");
  }

  return JSON.parse(jsonText);
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

function openSettingsDialog() {
  const savedKey = getSavedApiKey();
  apiKeyInput.value = savedKey;
  modelInput.value = getSavedModel();
  settingsDialog.showModal();
  setTimeout(() => (savedKey ? modelInput : apiKeyInput).focus(), 0);
}

function saveSettings() {
  const apiKey = apiKeyInput.value.trim();
  const model = modelInput.value.trim() || defaultModel;

  if (!apiKey) {
    alert("请填写有效的火山方舟 API Key。");
    return;
  }

  localStorage.setItem(apiKeyStorageKey, apiKey);
  localStorage.setItem(modelStorageKey, model);
  settingsDialog.close();
  checkHealth();
}

function clearSettings() {
  localStorage.removeItem(apiKeyStorageKey);
  localStorage.removeItem(modelStorageKey);
  apiKeyInput.value = "";
  modelInput.value = defaultModel;
  checkHealth();
}

function getSavedApiKey() {
  return config.arkApiKey || localStorage.getItem(apiKeyStorageKey) || "";
}

function getSavedModel() {
  return config.defaultModel || localStorage.getItem(modelStorageKey) || defaultModel;
}

async function checkHealth() {
  if (isDirectProvider()) {
    statusText.textContent = config.arkApiKey ? "豆包测试 Key 已内置" : "请先配置豆包 Key";
    return;
  }

  try {
    const response = await fetchWithTimeout(`${apiBaseUrl}/api/health`, {}, 5000);
    const data = await readJsonResponse(response);
    statusText.textContent = data.configured ? "豆包服务已配置" : "待配置豆包 API";
  } catch (_error) {
    statusText.textContent = "服务未连接";
  }
}

function renderMessages() {
  messagesEl.innerHTML = "";

  if (messages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = getSavedApiKey()
      ? "开始和小涵星叙聊天吧。"
      : "请先配置火山方舟 API Key。";
    messagesEl.append(empty);
    return;
  }

  for (const message of messages) {
    const row = document.createElement("div");
    row.className = `message-row ${message.role}`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = getMessageText(message);

    const attachments = Array.isArray(message.attachments) ? message.attachments : [];
    if (attachments.length) {
      const list = document.createElement("div");
      list.className = "bubble-attachments";
      for (const attachment of attachments) {
        const item = document.createElement("span");
        item.textContent = attachment.type === "image" ? `图片：${attachment.name}` : `语音：${attachment.name}`;
        list.append(item);
      }
      bubble.append(list);
    }

    row.append(bubble);
    const timeText = formatMessageTime(message.createdAt);
    if (timeText) {
      const time = document.createElement("time");
      time.className = "message-time";
      time.dateTime = new Date(message.createdAt).toISOString();
      time.textContent = timeText;
      row.append(time);
    }
    messagesEl.append(row);
  }

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function scrollMessagesTo(position) {
  const top = position === "top" ? 0 : messagesEl.scrollHeight;
  if (typeof messagesEl.scrollTo === "function") {
    messagesEl.scrollTo({ top, behavior: "smooth" });
    return;
  }

  messagesEl.scrollTop = top;
}

function formatMessageTime(value) {
  const normalized = normalizeMessageTime(value);
  if (!normalized) {
    return "";
  }

  const date = new Date(normalized);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeMessageTime(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function renderActiveRole() {
  const role = getActiveRole();
  activeRoleNameEl.textContent = role.name;
  activeRoleDescEl.textContent = role.desc || "自定义角色";
}

function renderMemoryDialog() {
  const updatedAt = chatMemory.updatedAt ? new Date(chatMemory.updatedAt) : null;
  memoryMetaText.textContent = updatedAt
    ? `上次更新：${updatedAt.toLocaleString()}，待压缩消息：${memoryPendingCount}`
    : "自动压缩重要聊天内容，并在后续对话中使用。";

  memorySummaryText.textContent = chatMemory.summary || "还没有生成记忆。";
  memoryItemsEl.innerHTML = "";

  const items = Array.isArray(chatMemory.items) ? chatMemory.items : [];
  if (items.length === 0) {
    const empty = document.createElement("p");
    empty.className = "hint";
    empty.textContent = "重要条目会在聊天积累后自动出现。";
    memoryItemsEl.append(empty);
    return;
  }

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "memory-item";

    const title = document.createElement("strong");
    title.textContent = item.title || "记忆";

    const detail = document.createElement("span");
    detail.textContent = item.detail || item.text || "";

    row.append(title, detail);
    memoryItemsEl.append(row);
  }
}

function clearMemory() {
  if (!confirm("确定清空聊天记忆库吗？当前聊天记录不会被删除。")) {
    return;
  }

  chatMemory = createEmptyMemory();
  memoryPendingCount = 0;
  saveMemory();
  saveMemoryPendingCount();
  renderMemoryDialog();
}

function buildMemoryArchive() {
  return {
    app: "小涵星叙",
    type: "xiaohanxingxu-memory-archive",
    version: 1,
    exportedAt: new Date().toISOString(),
    memory: normalizeMemory(chatMemory),
    memoryPendingCount,
    activeRoleId,
    roles: roles.map((role) => ({
      id: String(role.id || `role-${Date.now()}`),
      name: String(role.name || "未命名角色").slice(0, 24),
      desc: String(role.desc || "").slice(0, 80),
      prompt: String(role.prompt || "").slice(0, 2000),
    })),
    messages: messages.slice(-30).map((message) => ({
      role: message.role,
      content: getMessageText(message),
      createdAt: normalizeMessageTime(message.createdAt),
      attachments: (message.attachments || []).map((attachment) => ({
        type: attachment.type,
        name: attachment.name,
      })),
    })),
  };
}

async function exportMemoryArchive() {
  const archive = buildMemoryArchive();
  const content = JSON.stringify(archive, null, 2);
  const date = new Date().toISOString().slice(0, 10);
  const fileName = `xiaohanxingxu-memory-${date}.json`;

  if (isCapacitorEnv) {
    try {
      const plugin = LocalLLMPlugin || window.Capacitor?.Plugins?.LocalLLM;
      if (plugin) {
        const result = await plugin.saveTextFile({
          fileName,
          content,
        });
        alert(`导出成功。\n保存位置：${result?.path || fileName}`);
        showVoiceToast(`记忆库已导出到下载目录：${result.path || fileName}`);
        return;
      }
    } catch (error) {
      alert(`导出失败。\n错误：${error?.message || error || "未知错误"}`);
      return;
    }
  }

  const blob = new Blob([content], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showVoiceToast("记忆库已导出为 JSON 文件。");
}

async function showMemoryExportLocation() {
  if (!isCapacitorEnv) {
    alert("浏览器环境下，记忆文件会保存到浏览器默认下载目录。");
    return;
  }

  try {
    const plugin = LocalLLMPlugin || window.Capacitor?.Plugins?.LocalLLM;
    if (!plugin) {
      alert("未找到本地插件，无法查询导出位置。");
      return;
    }

    const result = await plugin.getExportLocation();
    const sizeText = result?.size ? `${(Number(result.size) / 1024).toFixed(1)} KB` : "未知";
    alert([
      `导出目录：${result?.directory || "未知"}`,
      result?.exists ? `最近文件：${result.fileName}` : "最近文件：未找到",
      result?.path ? `完整路径：${result.path}` : "",
      result?.exists ? `文件大小：${sizeText}` : "",
    ].filter(Boolean).join("\n"));
  } catch (error) {
    alert(`查询导出位置失败：${error?.message || error || "未知错误"}`);
  }
}

async function importMemoryArchive() {
  const file = memoryImportInput?.files?.[0];
  if (memoryImportInput) {
    memoryImportInput.value = "";
  }
  if (!file) {
    return;
  }

  try {
    const archive = JSON.parse(await file.text());
    const importedMemory = normalizeImportedMemory(archive);
    const importedRoles = normalizeImportedRoles(archive);
    const importedMessages = normalizeImportedMessages(archive);

    chatMemory = importedMemory;
    memoryPendingCount = Number.isFinite(Number(archive.memoryPendingCount))
      ? Math.max(0, Number(archive.memoryPendingCount))
      : 0;

    if (importedRoles.length) {
      roles = mergeRoles(roles, importedRoles);
      const importedActiveRoleId = String(archive.activeRoleId || "");
      if (importedActiveRoleId && roles.some((role) => role.id === importedActiveRoleId)) {
        activeRoleId = importedActiveRoleId;
      }
      editingRoleId = activeRoleId;
      saveRoles();
      saveActiveRoleId();
      renderActiveRole();
    }

    if (importedMessages.length && confirm("导入文件里包含最近聊天记录，要一起恢复吗？")) {
      messages = importedMessages;
      saveMessages();
      renderMessages();
    }

    saveMemory();
    saveMemoryPendingCount();
    renderMemoryDialog();
    showVoiceToast("记忆库导入完成。");
  } catch (error) {
    alert(error?.message || "记忆文件导入失败，请确认选择的是导出的 JSON 文件。");
  }
}

function normalizeImportedMemory(archive) {
  const memorySource = archive?.memory || archive;
  const memory = normalizeMemory(memorySource);
  if (!memory.summary && memory.items.length === 0) {
    throw new Error("这个文件里没有可恢复的记忆内容。");
  }
  return memory;
}

function normalizeImportedRoles(archive) {
  if (!Array.isArray(archive?.roles)) {
    return [];
  }

  return archive.roles
    .filter((role) => role && role.id && role.name && role.prompt)
    .map((role) => ({
      id: String(role.id).slice(0, 80),
      name: String(role.name).slice(0, 24),
      desc: String(role.desc || "导入角色").slice(0, 80),
      prompt: String(role.prompt).slice(0, 2000),
    }));
}

function normalizeImportedMessages(archive) {
  if (!Array.isArray(archive?.messages)) {
    return [];
  }

  return archive.messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && getMessageText(message))
    .slice(-30)
    .map((message) => ({
      role: message.role,
      content: getMessageText(message).slice(0, 3000),
      createdAt: normalizeMessageTime(message.createdAt),
      attachments: Array.isArray(message.attachments)
        ? message.attachments.map((attachment) => ({
            id: `${attachment.type || "file"}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            type: attachment.type === "image" ? "image" : "audio",
            name: String(attachment.name || "附件").slice(0, 80),
          }))
        : [],
    }));
}

function mergeRoles(currentRoles, importedRoles) {
  const merged = [...currentRoles];
  for (const role of importedRoles) {
    const index = merged.findIndex((item) => item.id === role.id);
    if (index >= 0 && role.id !== "default") {
      merged[index] = role;
    } else if (index < 0) {
      merged.push(role);
    }
  }
  return merged;
}

function renderRoleDialog() {
  renderRoleTabs();
  renderRoleMarket();
  roleListEl.innerHTML = "";

  for (const role of roles) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `role-card ${role.id === editingRoleId ? "selected" : ""}`;
    button.innerHTML = `<strong></strong><span></span>`;
    button.querySelector("strong").textContent = role.name;
    button.querySelector("span").textContent = role.desc || "自定义角色";
    button.addEventListener("click", () => selectEditingRole(role.id));
    roleListEl.append(button);
  }

  fillRoleEditor(getEditingRole());
}

function renderRoleTabs() {
  for (const button of roleTabButtons) {
    button.classList.toggle("active", button.dataset.category === activeRoleCategory);
  }
}

function renderRoleMarket() {
  if (!roleMarketEl) {
    return;
  }

  roleMarketEl.innerHTML = "";
  const presets = rolePresets.filter((role) => {
    return activeRoleCategory === "all" || activeRoleCategory === "custom" || role.category === activeRoleCategory;
  });

  if (activeRoleCategory === "custom") {
    const empty = document.createElement("p");
    empty.className = "market-empty";
    empty.textContent = "自定义角色在下方编辑和保存。";
    roleMarketEl.append(empty);
    return;
  }

  for (const preset of presets) {
    const card = document.createElement("article");
    card.className = "market-card";

    const header = document.createElement("div");
    header.className = "market-card-header";

    const tag = document.createElement("span");
    tag.className = `market-tag ${preset.category}`;
    tag.textContent = preset.tag;

    const title = document.createElement("strong");
    title.textContent = preset.name;

    header.append(tag, title);

    const desc = document.createElement("p");
    desc.textContent = preset.desc;

    const actions = document.createElement("div");
    actions.className = "market-actions";

    const useButton = document.createElement("button");
    useButton.type = "button";
    useButton.className = "market-use";
    useButton.textContent = "使用";
    useButton.addEventListener("click", () => usePresetRole(preset));

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "market-copy";
    copyButton.textContent = "复制编辑";
    copyButton.addEventListener("click", () => copyPresetRole(preset));

    actions.append(useButton, copyButton);
    card.append(header, desc, actions);
    roleMarketEl.append(card);
  }
}

function usePresetRole(preset) {
  const role = ensurePresetRole(preset);
  activeRoleId = role.id;
  editingRoleId = role.id;
  saveRoles();
  saveActiveRoleId();
  renderActiveRole();
  renderRoleDialog();
  roleDialog.close();
  showVoiceToast(`已切换到「${role.name}」。`);
}

function copyPresetRole(preset) {
  const nextRole = {
    id: `role-${Date.now()}`,
    name: `${preset.name}副本`.slice(0, 24),
    desc: preset.desc,
    prompt: preset.prompt,
  };
  roles.push(nextRole);
  activeRoleId = nextRole.id;
  editingRoleId = nextRole.id;
  saveRoles();
  saveActiveRoleId();
  renderActiveRole();
  renderRoleDialog();
  roleNameInput.focus();
}

function ensurePresetRole(preset) {
  const roleId = `preset-${preset.id}`;
  const existing = roles.find((role) => role.id === roleId);
  if (existing) {
    return existing;
  }

  const role = {
    id: roleId,
    name: preset.name,
    desc: preset.desc,
    prompt: preset.prompt,
  };
  roles.push(role);
  return role;
}

function selectEditingRole(roleId) {
  editingRoleId = roleId;
  renderRoleDialog();
}

function fillRoleEditor(role) {
  roleNameInput.value = role?.name || "";
  roleDescInput.value = role?.desc || "";
  rolePromptInput.value = role?.prompt || "";
  deleteRoleButton.disabled = !role || role.id === "default";
}

function startNewRole() {
  editingRoleId = `role-${Date.now()}`;
  fillRoleEditor({
    name: "",
    desc: "",
    prompt: "",
  });
  renderRoleListSelectionOnly();
  roleNameInput.focus();
}

function renderRoleListSelectionOnly() {
  for (const card of roleListEl.querySelectorAll(".role-card")) {
    card.classList.remove("selected");
  }
}

function saveEditingRole() {
  const name = roleNameInput.value.trim();
  const desc = roleDescInput.value.trim();
  const prompt = rolePromptInput.value.trim();

  if (!name || !prompt) {
    alert("请填写角色名称和角色设定。");
    return;
  }

  const nextRole = {
    id: editingRoleId || `role-${Date.now()}`,
    name: name.slice(0, 24),
    desc: desc.slice(0, 80) || "自定义角色",
    prompt: prompt.slice(0, 2000),
  };

  const existingIndex = roles.findIndex((role) => role.id === nextRole.id);
  if (existingIndex >= 0) {
    roles[existingIndex] = nextRole;
  } else {
    roles.push(nextRole);
  }

  activeRoleId = nextRole.id;
  editingRoleId = nextRole.id;
  saveRoles();
  saveActiveRoleId();
  renderActiveRole();
  renderRoleDialog();
  roleDialog.close();
}

function deleteEditingRole() {
  if (editingRoleId === "default") {
    return;
  }

  roles = roles.filter((role) => role.id !== editingRoleId);
  if (!roles.some((role) => role.id === activeRoleId)) {
    activeRoleId = "default";
  }

  editingRoleId = activeRoleId;
  saveRoles();
  saveActiveRoleId();
  renderActiveRole();
  renderRoleDialog();
}

function getActiveRole() {
  return roles.find((role) => role.id === activeRoleId) || roles[0] || defaultRoles[0];
}

function getEditingRole() {
  return roles.find((role) => role.id === editingRoleId);
}

function setSending(value) {
  sending = value;
  sendButton.disabled = value;
  sendButton.textContent = value ? "等待" : "发送";
}

function autoResize() {
  inputEl.style.height = "auto";
  inputEl.style.height = `${inputEl.scrollHeight}px`;
}

async function handleImageSelection() {
  const file = imageInput.files?.[0];
  imageInput.value = "";
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("请选择图片文件。");
    return;
  }

  if (file.size > 4 * 1024 * 1024) {
    alert("图片建议控制在 4MB 以内。");
    return;
  }

  pendingAttachments.push({
    id: `image-${Date.now()}`,
    type: "image",
    name: file.name || "图片",
    dataUrl: await fileToDataUrl(file),
  });
  renderAttachmentPreview();
}

async function startVoiceRecording(event) {
  event.preventDefault();
  if (sending || mediaRecorder?.state === "recording") {
    return;
  }

  try {
    stopAssistantSpeech();
    voiceTranscript = "";
    speechRecognitionError = "";
    speechRecognitionSupported = startSpeechRecognition();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.addEventListener("dataavailable", (recordEvent) => {
      if (recordEvent.data.size > 0) {
        recordedChunks.push(recordEvent.data);
      }
    });
    mediaRecorder.addEventListener("stop", async () => {
      stream.getTracks().forEach((track) => track.stop());
      await addRecordedAudio();
    });
    mediaRecorder.start();
    voiceButton.classList.add("recording");
    voiceButton.textContent = "录";
    showVoiceToast("正在听你说话，松开后发送。");
  } catch (_error) {
    showVoiceToast("无法使用麦克风，请检查安卓麦克风权限后再试。");
  }
}

function stopVoiceRecording(event) {
  event?.preventDefault();
  stopSpeechRecognition();
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
  }
  voiceButton.classList.remove("recording");
  voiceButton.textContent = "话";
}

async function addRecordedAudio() {
  if (!recordedChunks.length) {
    return;
  }

  await wait(650);

  const transcript = voiceTranscript.trim();
  if (transcript) {
    await submitVoiceMessage(transcript);
    return;
  }

  if (!speechRecognitionSupported) {
    showVoiceToast("当前安卓 WebView 不支持语音转文字；麦克风可用，但需要接入单独的语音识别接口。");
    return;
  }

  if (speechRecognitionError) {
    showVoiceToast(`语音识别失败：${speechRecognitionError}。可以再试一次，或直接输入文字。`);
    return;
  }

  showVoiceToast("没有识别到语音内容，可以再按住说一遍，或直接输入文字。");
}

async function submitVoiceMessage(transcript) {
  if (sending) {
    return;
  }

  if (isDirectProvider() && !getSavedApiKey()) {
    openSettingsDialog();
    return;
  }

  const typedText = inputEl.value.trim();
  const content = [typedText, transcript].filter(Boolean).join("\n");
  inputEl.value = "";
  autoResize();

  messages.push({
    role: "user",
    content,
    createdAt: Date.now(),
    attachments: [
      ...pendingAttachments.map((attachment) => ({ ...attachment })),
      {
        id: `voice-${Date.now()}`,
        type: "audio",
        name: "语音输入",
      },
    ],
  });
  pendingAttachments = [];
  renderAttachmentPreview();
  renderMessages();
  saveMessages();
  showVoiceToast("语音已发送。");

  await sendToAssistant();
}

function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return false;
  }

  speechRecognition = new SpeechRecognition();
  speechRecognition.lang = "zh-CN";
  speechRecognition.continuous = true;
  speechRecognition.interimResults = true;
  speechRecognition.addEventListener("result", (event) => {
    let transcript = "";
    for (let index = 0; index < event.results.length; index += 1) {
      transcript += event.results[index][0]?.transcript || "";
    }
    voiceTranscript = transcript;
  });
  speechRecognition.addEventListener("error", (event) => {
    speechRecognitionError = event.error || "未知错误";
    voiceTranscript = voiceTranscript.trim();
  });

  try {
    speechRecognition.start();
    return true;
  } catch (_error) {
    speechRecognition = null;
    speechRecognitionError = "启动失败";
    return false;
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function showVoiceToast(message) {
  if (!voiceToast) {
    statusText.textContent = message;
    return;
  }

  voiceToast.textContent = message;
  voiceToast.hidden = false;
  window.clearTimeout(showVoiceToast.timeoutId);
  showVoiceToast.timeoutId = window.setTimeout(() => {
    voiceToast.hidden = true;
  }, 2600);
}

function stopSpeechRecognition() {
  if (!speechRecognition) {
    return;
  }

  try {
    speechRecognition.stop();
  } catch (_error) {
    // Ignore duplicate stop calls from touch/mouse events.
  } finally {
    speechRecognition = null;
  }
}

function toggleVoiceReply() {
  voiceReplyEnabled = !voiceReplyEnabled;
  localStorage.setItem(voiceReplyKey, String(voiceReplyEnabled));
  renderVoiceReplyButton();
  if (!voiceReplyEnabled) {
    stopAssistantSpeech();
    showVoiceToast("AI 语音回复已关闭。");
    return;
  }
  showVoiceToast("AI 语音回复已开启。");
}

function renderVoiceReplyButton() {
  voiceReplyButton.classList.toggle("active", voiceReplyEnabled);
  voiceReplyButton.setAttribute("aria-pressed", String(voiceReplyEnabled));
  voiceReplyButton.title = voiceReplyEnabled ? "关闭 AI 自动朗读回复" : "开启 AI 自动朗读回复";
}

async function speakAssistantReply(text) {
  const content = String(text || "").trim();
  if (!voiceReplyEnabled || !content) {
    return;
  }

  stopAssistantSpeech();
  const audioUrl = await requestDoubaoSpeech(content);
  if (audioUrl) {
    assistantAudio = new Audio(audioUrl);
    assistantAudio.addEventListener("error", () => {
      showVoiceToast("语音播放失败，请检查网络连接。");
    }, { once: true });
    assistantAudio.play().catch(() => {
      showVoiceToast("语音播放失败，请检查网络连接。");
    });
  }
}

async function requestDoubaoSpeech(text) {
  if (!doubaoTtsAppId || !doubaoTtsToken) {
    showVoiceToast("请先配置豆包TTS信息。");
    return "";
  }

  try {
    // 统一使用直接API调用（浏览器和Android都一样）
    const response = await fetch(doubaoTtsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer;${doubaoTtsToken}`,
      },
      body: JSON.stringify(buildDoubaoTtsPayload(text)),
    });

    // 先读取响应文本
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("TTS API响应解析错误:", responseText);
      throw new Error("TTS API返回格式错误。");
    }

    if (!response.ok || data.code !== 3000 || !data.data) {
      throw new Error(data.message || "豆包语音合成失败。");
    }
    
    // 构建data URL
    return `data:audio/mp3;base64,${data.data}`;
  } catch (error) {
    console.error("TTS请求错误:", error);
    showVoiceToast(error?.message || "豆包语音不可用，请检查网络或配置。");
    return "";
  }
}

function buildDoubaoTtsPayload(text) {
  return {
    app: {
      appid: doubaoTtsAppId,
      token: doubaoTtsToken,
      cluster: doubaoTtsCluster,
    },
    user: {
      uid: "android-chat-user",
    },
    audio: {
      voice_type: doubaoTtsVoiceType,
      encoding: "mp3",
      compression_rate: 1,
      rate: 24000,
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0,
      explicit_language: "zh-cn",
    },
    request: {
      reqid: createRequestId(),
      text: normalizeSpeechText(text),
      text_type: "plain",
      operation: "query",
      silence_duration: "125",
    },
  };
}

function normalizeSpeechText(text) {
  return String(text || "")
    .replace(/https?:\/\/\S+/g, "链接")
    .replace(/[`*_#>\[\](){}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 320);
}

function createRequestId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `tts-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function speakWithSystemVoice(text) {
  if (!("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function stopAssistantSpeech() {
  if (assistantAudio) {
    assistantAudio.pause();
    assistantAudio.src = "";
    assistantAudio = null;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function renderAttachmentPreview() {
  attachmentPreview.innerHTML = "";
  attachmentPreview.classList.toggle("has-items", pendingAttachments.length > 0);

  for (const attachment of pendingAttachments) {
    const chip = document.createElement("span");
    chip.className = "attachment-chip";
    chip.textContent = attachment.type === "image" ? `图片 ${attachment.name}` : `语音 ${attachment.name}`;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      pendingAttachments = pendingAttachments.filter((item) => item.id !== attachment.id);
      renderAttachmentPreview();
    });

    chip.append(removeButton);
    attachmentPreview.append(chip);
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(blob);
  });
}

async function audioBlobToWav(blob) {
  const audioContext = new AudioContext();
  try {
    const buffer = await audioContext.decodeAudioData(await blob.arrayBuffer());
    return new Blob([encodeWav(buffer)], { type: "audio/wav" });
  } finally {
    audioContext.close();
  }
}

function encodeWav(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const samples = interleaveChannels(audioBuffer);
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channelCount, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channelCount * 2, true);
  view.setUint16(32, channelCount * 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (const sample of samples) {
    const clamped = Math.max(-1, Math.min(1, sample));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

function interleaveChannels(audioBuffer) {
  const channelCount = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  const output = new Float32Array(length * channelCount);

  for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
    for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
      output[sampleIndex * channelCount + channelIndex] =
        audioBuffer.getChannelData(channelIndex)[sampleIndex];
    }
  }

  return output;
}

function writeAscii(view, offset, text) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index));
  }
}

function loadMessages() {
  try {
    return JSON.parse(localStorage.getItem(messagesKey)) || [];
  } catch (_error) {
    return [];
  }
}

function saveMessages() {
  localStorage.setItem(
    messagesKey,
    JSON.stringify(
      messages.slice(-30).map((message) => ({
        ...message,
        content: getMessageText(message),
        attachments: (message.attachments || []).map((attachment) => ({
          id: attachment.id,
          type: attachment.type,
          name: attachment.name,
        })),
      })),
    ),
  );
}

function createEmptyMemory() {
  return {
    summary: "",
    items: [],
    updatedAt: "",
  };
}

function loadMemory() {
  try {
    return normalizeMemory(JSON.parse(localStorage.getItem(memoryKey)));
  } catch (_error) {
    return createEmptyMemory();
  }
}

function saveMemory() {
  localStorage.setItem(memoryKey, JSON.stringify(chatMemory));
}

function normalizeMemory(value) {
  if (!value || typeof value !== "object") {
    return createEmptyMemory();
  }

  const items = Array.isArray(value.items)
    ? value.items
        .filter((item) => item && (item.detail || item.text || item.title))
        .map((item) => ({
          title: String(item.title || "记忆").trim().slice(0, 32),
          detail: String(item.detail || item.text || "").trim().slice(0, 180),
          importance: Number(item.importance || 3),
        }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 12)
    : [];

  return {
    summary: String(value.summary || "").trim().slice(0, 260),
    items,
    updatedAt: value.updatedAt || new Date().toISOString(),
  };
}

function loadMemoryPendingCount() {
  const value = Number(localStorage.getItem(memoryPendingKey));
  return Number.isFinite(value) ? value : 0;
}

function saveMemoryPendingCount() {
  localStorage.setItem(memoryPendingKey, String(memoryPendingCount));
}

function loadRoles() {
  try {
    const savedRoles = JSON.parse(localStorage.getItem(rolesKey));
    if (Array.isArray(savedRoles) && savedRoles.length > 0) {
      const merged = [...defaultRoles];
      for (const role of savedRoles) {
        if (role?.id && !merged.some((item) => item.id === role.id)) {
          merged.push(role);
        } else if (role?.id && role.id !== "default") {
          const index = merged.findIndex((item) => item.id === role.id);
          merged[index] = role;
        }
      }
      return merged;
    }
  } catch (_error) {
    // Ignore broken local storage and fall back to defaults.
  }
  return [...defaultRoles];
}

function saveRoles() {
  localStorage.setItem(rolesKey, JSON.stringify(roles));
}

function loadActiveRoleId() {
  return localStorage.getItem(activeRoleKey) || "default";
}

function saveActiveRoleId() {
  localStorage.setItem(activeRoleKey, activeRoleId);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

// 本地 LLM 相关函数
async function initializeLocalLLM() {
  try {
    // 加载 Capacitor 插件
    const { Plugins } = window.Capacitor;
    LocalLLMPlugin = Plugins.LocalLLM;
    
    if (!LocalLLMPlugin) {
      console.log("LocalLLM plugin not available");
      updateNetworkStatus(false);
      return;
    }
    
    // 检查网络状态
    const networkResult = await LocalLLMPlugin.checkNetwork();
    isOnline = networkResult.online;
    updateNetworkStatus(isOnline);
    
    // 检查本地模型是否存在
    const modelResult = await LocalLLMPlugin.checkModelExists({
      modelPath: LOCAL_MODEL_PATH
    });
    
    if (modelResult.exists) {
      console.log("Local model found, initializing...");
      const initResult = await LocalLLMPlugin.initialize({
        modelPath: LOCAL_MODEL_PATH
      });
      localLLMInitialized = initResult.success;
      console.log("Local LLM initialized:", localLLMInitialized);
    } else {
      console.log("Local model not found, size:", modelResult.size);
    }
    
    // 定期检查网络状态
    setInterval(async () => {
      try {
        const result = await LocalLLMPlugin.checkNetwork();
        if (result.online !== isOnline) {
          isOnline = result.online;
          updateNetworkStatus(isOnline);
        }
      } catch (e) {
        console.error("Network check failed:", e);
      }
    }, 30000);
    
  } catch (e) {
    console.error("Failed to initialize LocalLLM:", e);
    updateNetworkStatus(false);
  }
}

async function importLocalModel() {
  if (!isCapacitorEnv) {
    showVoiceToast("模型导入只在安卓 App 内可用。");
    return;
  }

  try {
    const plugin = LocalLLMPlugin || window.Capacitor?.Plugins?.LocalLLM;
    if (!plugin) {
      showVoiceToast("本地模型插件未加载，请完全关闭 App 后重开。");
      return;
    }

    statusText.textContent = "正在导入模型...";
    const result = await plugin.importModel();
    if (!result?.success) {
      throw new Error("模型导入失败。");
    }

    LocalLLMPlugin = plugin;
    const initResult = await LocalLLMPlugin.initialize({
      modelPath: result.modelPath || LOCAL_MODEL_PATH,
    });
    localLLMInitialized = Boolean(initResult.success);
    updateNetworkStatus(isOnline);
    showVoiceToast(localLLMInitialized ? "模型导入完成，离线 AI 已可用。" : "模型已导入，但加载失败。");
  } catch (error) {
    statusText.textContent = isOnline ? "在线模式" : "离线模式";
    showVoiceToast(error?.message || "模型导入失败。");
  }
}

function updateNetworkStatus(online) {
  isOnline = online;
  if (statusText) {
    const status = online ? "🌐 在线模式" : "📱 离线模式 (本地AI)";
    const detail = statusText.textContent.includes("|") ? statusText.textContent.split("|")[1].trim() : "";
    statusText.textContent = detail ? `${status} | ${detail}` : status;
  }
}

async function requestLocalLLM(chatMessages) {
  if (!LocalLLMPlugin || !localLLMInitialized) {
    throw new Error("本地模型未加载，请检查网络或模型文件。");
  }
  
  try {
    // 构建对话历史
    let prompt = "";
    for (const msg of chatMessages) {
      if (msg.content) {
        prompt += `${msg.role === "assistant" ? "AI" : "User"}: ${msg.content}\n`;
      }
    }
    
    const result = await LocalLLMPlugin.generate({
      prompt: prompt,
      systemPrompt: buildSystemPrompt(),
      maxTokens: 512,
      temperature: 0.7
    });
    
    return result.text || "抱歉，本地模型没有返回回复。";
  } catch (e) {
    console.error("Local LLM generation failed:", e);
    throw new Error("本地推理失败: " + (e.message || "未知错误"));
  }
}
