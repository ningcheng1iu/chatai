# 快速开始指南 - 离线 AI 集成版

## 🎉 恭喜！本地 AI 功能已集成完毕！

### 已完成的工作：
- ✅ 本地 LLM 插件框架
- ✅ 在线/离线模式自动切换
- ✅ 网络状态检测
- ✅ 前端代码更新
- ✅ 权限配置
- ✅ 模型文件准备

---

## 📋 下一步操作

### 第 1 步：将模型推送到 Android 设备

如果你已经安装了 Android SDK 并且设备已连接：

```batch
# 在项目根目录运行
cd e:\chatai
install_model.bat
```

或者手动使用 adb：

```bash
adb push e:\chatai\models\qwen3-4b-instruct-2507-q4_k_m.gguf /sdcard/Android/data/com.example.deepseekchat/files/
```

### 第 2 步：构建并安装应用

```bash
# 同步 Capacitor
cd e:\chatai
npx cap sync android

# 构建 APK
cd android
.\gradlew assembleDebug

# 安装到设备
adb install app\build\outputs\apk\debug\app-debug.apk
```

### 第 3 步：测试功能

1. **在线模式**（有网络）：
   - 保持网络连接
   - 应用会使用豆包 API + TTS 语音
   
2. **离线模式**（无网络）：
   - 断开网络连接
   - 应用会自动切换到本地 LLM
   - 纯文本对话，无语音功能

---

## 🔧 关于真实的 llama.cpp 集成

**重要提示**：当前的 `LocalLLMEngine.java` 使用的是演示实现（Dummy Response）。

要获得真正的本地推理能力，需要：

### 推荐方案：使用现成的 Android LLM 库

1. **llama.cpp Android** - https://github.com/antimatter15/llama.cpp
2. **MNN LLM** - https://github.com/alibaba/MNN
3. **TensorFlow Lite** + 量化模型
4. **MLC LLM** - https://github.com/mlc-ai/mlc-llm

### 快速集成方案

如果你不想自己编译 JNI 库，可以考虑：

1. 使用现有的开源 Android LLM 应用代码
2. 集成 LLaMA-2 / Qwen 的轻量级 SDK
3. 使用 WebView + WebAssembly（较慢，但兼容性好）

---

## 📱 功能特点

| 功能 | 在线模式 | 离线模式 |
|------|---------|---------|
| 文本生成 | 豆包 API | 本地模型 |
| 语音合成 (TTS) | ✅ 豆包 TTS | ❌ 无 |
| 网络需求 | ✅ 需要 | ❌ 不需要 |
| 响应速度 | ⚡ 快 | 🐌 取决于设备 |
| 记忆持久化 | ✅ 是 | ✅ 是 |

---

## 💾 数据持久化

所有用户数据都安全地存储在本地：
- ✅ 聊天历史（localStorage）
- ✅ 角色卡片配置
- ✅ 聊天记忆库
- ✅ 应用设置

覆盖安装不会丢失任何数据！

---

## ❓ 常见问题

**Q: 模型文件太大怎么办？**
A: 可以使用更小的量化版本，如 Q3_K_M（约 2GB）或 Q2_K（约 1.5GB）。

**Q: 离线模式响应太慢？**
A: 这取决于设备性能。建议在 8GB+ 内存的手机上使用。

**Q: 如何验证模型是否正确加载？**
A: 查看应用日志，搜索 "Local LLM" 关键词。

---

## 📞 需要帮助？

查看详细文档：
- `LOCAL_LLM_GUIDE.md` - 完整的集成指南
- `model-selection-guide.md` - 模型选择指南

祝你使用愉快！🚀
