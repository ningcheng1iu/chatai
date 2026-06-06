# 安卓APP离线AI方案设计

## 需求分析

### 核心功能
- **在线模式**：豆包语音合成（TTS）+ 云端文本生成
- **离线模式**：本地文本生成（无语音）
- **数据持久化**：覆盖安装保留记忆库和角色设定
- **使用场景**：角色扮演应用

### 约束条件
- 性能中等平衡
- 支持覆盖安装
- 数据不丢失

---

## 技术方案

### 方案一：混合云边架构（推荐）

#### 架构设计
```
┌─────────────────────────────────┐
│        Android App              │
├─────────────────────────────────┤
│  前端层 (WebView/Capacitor)      │
├─────────────────────────────────┤
│  业务逻辑层 (JavaScript)         │
│  ├─ AI路由 (在线/离线检测)       │
│  ├─ 对话管理                     │
│  └─ 记忆库管理                   │
├─────────────────────────────────┤
│  本地AI层 (集成在APP中)          │
│  └─ Ollama/TFLite 本地模型       │
├─────────────────────────────────┤
│  网络层                         │
│  ├─ 在线：豆包API               │
│  └─ 离线：本地模型               │
└─────────────────────────────────┘
```

#### 本地模型选型

**推荐方案：Phi-2/Mistral 轻量模型**
- 模型大小：70MB - 500MB
- 量化后：100-300MB
- 适合角色扮演场景
- 支持中文

**备选方案：**
- TinyLlama (1.1B) - 最小可用
- Phi-2 (2.7B) - 性能较好
- Mistral 7B 4-bit量化 - 性能最佳

#### 离线推理框架

1. **Ollama Android** (⭐推荐)
   - 优点：易于集成，支持多种模型
   - 缺点：APP体积增加约50-100MB
   - 集成方式：作为Android Service运行

2. **TensorFlow Lite**
   - 优点：APP体积增加小（10-30MB）
   - 缺点：需要特定格式模型
   - 适用：小型专用模型

3. **MLC-LLM**
   - 优点：性能好
   - 缺点：集成复杂
   - 适用：高级用户

### 方案二：纯离线轻量方案

**使用小型对话模型**
- 模型：ChatGLM2-6B INT4 / Qwen-1.8B
- 大小：约100-200MB
- 推理：使用llama.cpp
- 优点：安装包小
- 缺点：对话质量较低

---

## 实现步骤

### 第一阶段：环境准备（1-2天）

1. **Android开发环境**
   - ✅ 已配置：Android SDK
   - ✅ 已配置：JDK 17/21
   - 需要：NDK（用于编译本地库）

2. **模型准备**
   - 下载量化模型
   - 测试模型效果
   - 准备模型文件（assets/目录）

3. **依赖库选择**
   - llmkit / llama.cpp Android
   - Capacitor Preferences（数据存储）
   - 网络状态监测库

### 第二阶段：核心功能开发（3-5天）

1. **本地模型集成**
   ```java
   // Android原生层集成
   public class LLMEngine {
       // 加载模型
       public void loadModel(String modelPath);
       // 推理
       public String generate(String prompt);
       // 释放
       public void release();
   }
   ```

2. **在线/离线检测**
   ```javascript
   const NetworkService = {
       isOnline: async () => {
           if (!navigator.onLine) return false;
           try {
               const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/ping', {
                   method: 'HEAD',
                   timeout: 3000
               });
               return response.ok;
           } catch {
               return false;
           }
       }
   };
   ```

3. **AI路由逻辑**
   ```javascript
   class AIRouter {
       async generate(prompt, context) {
           const online = await NetworkService.isOnline();

           if (online) {
               // 在线模式：使用豆包API
               return await DoubaoAPI.generate(prompt, context);
           } else {
               // 离线模式：使用本地模型
               return await LocalLLM.generate(prompt, context);
           }
       }
   }
   ```

4. **记忆库管理（支持覆盖安装）**
   ```javascript
   class MemoryManager {
       // 使用SQLite存储对话历史
       // 配置AndroidManifest.xml支持数据保留
       async saveConversation(roleId, messages) {
           // 保存到应用私有目录
       }

       async loadConversation(roleId) {
           // 加载历史对话
       }
   }
   ```

### 第三阶段：豆包API集成（2-3天）

1. **豆包语音合成 (TTS)**
   ```javascript
   class DoubaoTTS {
       async synthesize(text) {
           // 调用豆包API
           const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/audio/tts', {
               method: 'POST',
               headers: {
                   'Authorization': `Bearer ${API_KEY}`,
                   'Content-Type': 'application/json'
               },
               body: JSON.stringify({
                   model: 'ep-xxxxxxxx',
                   input: text,
                   voice_id: 'female-shaonv-1'
               })
           });

           const audioData = await response.arrayBuffer();
           return new Blob([audioData], { type: 'audio/mp3' });
       }
   }
   ```

2. **豆包文本生成（可选）**
   - 在线时可以使用豆包文本模型
   - 离线时使用本地模型

### 第四阶段：数据持久化（1-2天）

**Android数据保留配置**

```xml
<!-- AndroidManifest.xml -->
<application
    android:allowBackup="true"
    android:fullBackupContent="@xml/backup_rules"
    android:dataExtractionRules="@xml/data_extraction_rules">
</application>
```

**backup_rules.xml**
```xml
<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <include domain="sharedpref" path="." />
    <include domain="database" path="." />
    <include domain="file" path="databases/" />
    <exclude domain="cache" path="." />
    <exclude domain="no_backup" path="." />
</full-backup-content>
```

**data_extraction_rules.xml** (Android 12+)
```xml
<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="sharedpref" path="." />
        <include domain="database" path="." />
        <exclude domain="cache" path="." />
    </cloud-backup>
    <device-transfer>
        <include domain="sharedpref" path="." />
        <include domain="database" path="." />
    </device-transfer>
</data-extraction-rules>
```

**Capacitor数据存储**
```javascript
// 使用Preferences插件
import { Preferences } from '@capacitor/preferences';

class MemoryStorage {
    async save(roleId, data) {
        await Preferences.set({
            key: `memory_${roleId}`,
            value: JSON.stringify(data)
        });
    }

    async load(roleId) {
        const result = await Preferences.get({
            key: `memory_${roleId}`
        });
        return result.value ? JSON.parse(result.value) : null;
    }
}
```

---

## 模型部署策略

### 模型选择建议

| 模型 | 参数量 | 量化后大小 | 内存需求 | 适合场景 |
|------|--------|-----------|---------|---------|
| TinyLlama | 1.1B | 700MB | 1GB | 基础对话 |
| Phi-2 | 2.7B | 1.5GB | 2GB | 较好质量 |
| Qwen-1.8B | 1.8B | 1GB | 1.5GB | 中文优化 |
| ChatGLM2-6B | 6B | 3GB | 4GB | 高质量 |

**针对角色扮演推荐：Qwen-1.8B 或 Phi-2**
- 平衡性能和体积
- 中文支持好
- 内存需求适中

### 模型集成方式

1. **方式一：内置到APK（简单）**
   - 模型文件放在 `assets/models/` 目录
   - 首次启动复制到内部存储
   - 缺点：APK体积大（+500MB）

2. **方式二：首次下载（推荐）**
   - 首次启动下载模型
   - 存储在应用私有目录
   - 提供轻量版APK

3. **方式三：按需下载**
   - 提供多个模型选择
   - 用户按需下载
   - 最佳用户体验

---

## 代码示例

### 完整的AI服务类

```javascript
// ai-service.js
class AIService {
    constructor() {
        this.localLLM = new LocalLLMEngine();
        this.doubaoAPI = new DoubaoAPI();
        this.networkMonitor = new NetworkMonitor();
    }

    async initialize() {
        await this.networkMonitor.start();
        if (this.networkMonitor.isOnline()) {
            // 在线模式
            await this.doubaoAPI.initialize();
        } else {
            // 离线模式 - 加载本地模型
            await this.localLLM.load();
        }
    }

    async chat(roleId, userMessage, context) {
        const memory = await MemoryManager.load(roleId);

        const prompt = this.buildPrompt(roleId, userMessage, memory);

        if (this.networkMonitor.isOnline()) {
            // 在线：使用豆包
            const response = await this.doubaoAPI.generate(prompt);
            await this.speakWithDoubao(response.text);
            return response;
        } else {
            // 离线：使用本地模型
            const response = await this.localLLM.generate(prompt);
            return { text: response, hasVoice: false };
        }
    }

    buildPrompt(roleId, userMessage, memory) {
        const role = MemoryManager.getRole(roleId);
        return `
角色设定：${role.systemPrompt}
对话历史：${memory.history.join('\n')}
用户：${userMessage}
角色：
        `.trim();
    }

    async speakWithDoubao(text) {
        if (!this.networkMonitor.isOnline()) return;

        try {
            const audioBlob = await this.doubaoAPI.synthesize(text);
            await this.playAudio(audioBlob);
        } catch (error) {
            console.warn('语音合成失败:', error);
        }
    }

    async playAudio(blob) {
        const audio = new Audio(URL.createObjectURL(blob));
        await audio.play();
    }
}
```

### Android Native层（llama.cpp集成）

```java
// LLMEngine.java
package com.app.llm;

public class LLMEngine {
    static {
        System.loadLibrary("llama");
    }

    private long modelPointer;
    private long contextPointer;

    public native boolean loadModel(String modelPath);
    public native String generate(String prompt, int maxTokens);
    public native void unload();

    public void load() {
        String modelPath = getModelPath();
        loadModel(modelPath);
    }

    public String generate(String prompt) {
        return generate(prompt, 512);
    }

    public void release() {
        if (contextPointer != 0) {
            unload();
        }
    }
}
```

---

## 测试计划

### 测试用例

1. **覆盖安装测试**
   - 卸载旧版本
   - 安装带记忆库的新版本
   - 验证数据保留

2. **离线功能测试**
   - 开启飞行模式
   - 测试本地模型推理
   - 验证响应质量

3. **在线/离线切换测试**
   - 在线生成 → 切换离线 → 离线生成
   - 验证无缝切换

4. **性能测试**
   - 测试响应时间
   - 测试内存占用
   - 测试CPU使用率

---

## 预期效果

### APP体积增加
- 基础APP：约20MB
- +本地模型：+500MB（可选下载）
- 合计：约30-550MB

### 性能指标
- 在线TTS响应：1-3秒
- 离线文本生成：5-30秒（取决于模型和设备）
- 内存占用：1-3GB

### 用户体验
- ✅ 无网络时自动切换离线模式
- ✅ 覆盖安装保留所有记忆
- ✅ 在线时享受高质量语音
- ✅ 离线时基础对话可用

---

## 下一步行动

1. **确认豆包API配置**
   - 获取API Key
   - 测试TTS功能

2. **选择本地模型**
   - 测试几个候选模型
   - 确定最终方案

3. **开始集成开发**
   - 搭建开发环境
   - 实现核心功能

需要我帮你开始实现吗？我可以：
1. 帮你配置开发环境
2. 提供详细的代码实现
3. 集成豆包API
4. 实现本地模型加载
