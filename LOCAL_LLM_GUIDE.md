# 本地 LLM 集成指南

## 架构概述

本项目现在支持：
- **在线模式**：使用豆包 API 进行文本生成和 TTS 语音合成
- **离线模式**：使用本地 GGUF 模型进行纯文本对话

## 模型文件放置位置

在 Android 设备上，模型文件需要放置在以下位置之一：

### 方法 1：应用私有目录（推荐，用户无法直接访问）
```
/sdcard/Android/data/com.example.deepseekchat/files/qwen3-4b-instruct-2507-q4_k_m.gguf
```

### 方法 2：应用 Assets 目录（打包到 APK 中）
将模型文件复制到 `android/app/src/main/assets/` 目录下，然后在代码中解压到私有目录。

### 方法 3：SD卡公共目录（需要存储权限）
```
/sdcard/DeepSeekChat/models/qwen3-4b-instruct-2507-q4_k_m.gguf
```

## 权限配置

在 `AndroidManifest.xml` 中添加以下权限：

```xml
<!-- 网络权限（用于在线模式和下载模型） -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- 存储权限（用于读取模型文件） -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
                 android:maxSdkVersion="32" />

<!-- Android 13+ 读取媒体文件权限 -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
```

## 当前实现状态

### 已完成：
- ✅ Capacitor 插件架构
- ✅ 网络状态检测
- ✅ 在线/离线模式切换
- ✅ 前端代码集成
- ✅ 插件代码框架

### 待完善（真实 llama.cpp 集成）：
当前的 `LocalLLMEngine` 使用的是简化实现。要获得真实的本地推理能力，需要：

1. 编译 llama.cpp 到 Android JNI 库
2. 集成 GGUF 模型加载
3. 实现真正的推理功能

## 快速开始

### 1. 准备模型文件
将 `qwen3-4b-instruct-2507-q4_k_m.gguf` 模型文件复制到你的电脑上。

### 2. 安装到 Android 设备
通过以下方法之一将模型文件推送到设备：

```bash
# 方法 1：使用 adb push
adb push qwen3-4b-instruct-2507-q4_k_m.gguf /sdcard/Android/data/com.example.deepseekchat/files/

# 方法 2：先安装应用，再通过文件管理器复制
```

### 3. 构建和运行
```bash
# 在项目根目录
cd e:\chatai

# 同步代码
npx cap sync android

# 构建 APK
cd android
./gradlew assembleDebug

# 安装到设备
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 工作原理

### 在线模式
1. 检测网络连接
2. 使用豆包 API 生成文本
3. 可选使用豆包 TTS 语音合成

### 离线模式
1. 检测无网络连接
2. 加载本地 GGUF 模型
3. 在设备本地进行推理
4. 纯文本输出（无语音）

### 数据持久化
- ✅ 聊天历史存储在 localStorage 中
- ✅ 角色卡片配置持久化
- ✅ 记忆库独立保存
- ✅ 覆盖安装不会丢失数据
