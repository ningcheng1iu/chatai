# Llama.cpp Android 库集成工具

## 简介

这个脚本帮助你下载并集成 llama.cpp Android 库到你的项目中。

## 使用方法

### 步骤 1：下载预编译的 llama.cpp Android AAR

从以下地址下载最新的 llama.cpp Android 库：

**GitHub Releases**: https://github.com/PlayVoice/llama-android/releases

下载 `llama-android-*.aar` 文件

### 步骤 2：放置 AAR 文件

将下载的 AAR 文件复制到项目的 `libs` 目录：

```
e:\chatai\android\app\libs\
```

### 步骤 3：更新 build.gradle

确保添加以下配置：

```gradle
dependencies {
    implementation fileTree(dir: 'libs', include: ['*.aar'])
    implementation 'io.github.kidoju:llama.java:0.0.2'
}
```

### 步骤 4：重新编译

```bash
cd e:\chatai
build_with_jdk21.bat
```

## 或者：自己编译 llama.cpp Android

如果你需要自己编译，可以：

### 1. 安装 Android NDK

确保安装了 Android NDK（用于编译 C/C++ 代码）

### 2. 克隆 llama.cpp

```bash
git clone https://github.com/ggerganov/llama.cpp
cd llama.cpp
```

### 3. 编译 Android 版本

```bash
mkdir build-android
cd build-android
cmake -DGGML_NATIVE=ON -DGGML_OPENMP=OFF -DCMAKE_TOOLCHAIN_FILE=$ANDROID_NDK/build/cmake/android.toolchain.cmake ..
make -j4
```

### 4. 生成 JNI 绑定

使用 SWIG 或手动编写 JNI 代码

## 推荐的预编译库

### 方案 1：PlayVoice/llama-android
- GitHub: https://github.com/PlayVoice/llama-android
- 特点：开箱即用，维护活跃

### 方案 2：koboldai/llama.java
- GitHub: https://github.com/koboldai/llama.java
- 特点：纯 Java 实现，无需 JNI

### 方案 3：LM Studio
- 下载: https://lmstudio.ai/
- 特点：提供 Android 版本

## 验证集成

集成完成后，重新构建 APK 并在设备上测试：

1. 安装 APK
2. 查看 Logcat 日志，过滤 "LocalLLMEngine"
3. 应该看到：
   - "llama-android JNI loaded successfully" 或
   - "Using Java fallback implementation"

## 故障排查

### 问题 1：AAR 无法解析
**解决方案**：
1. 检查 AAR 文件是否损坏
2. 确保 gradle sync 成功
3. Clean 后重新 build

### 问题 2：JNI 方法找不到
**解决方案**：
1. 确认 native 方法签名正确
2. 检查库名称是否匹配
3. 查看 gradle 的 CMake 配置

### 问题 3：模型加载失败
**解决方案**：
1. 检查模型文件是否存在
2. 确认文件路径正确
3. 检查存储权限

## 下一步

集成完成后：

1. 运行 `build_with_jdk21.bat` 编译 APK
2. 安装到设备测试
3. 查看日志验证是否加载成功
4. 测试离线对话功能

## 资源链接

- llama.cpp 官方: https://github.com/ggerganov/llama.cpp
- llama.cpp Android: https://github.com/PlayVoice/llama-android
- Apache MNN: https://github.com/alibaba/MNN
- Qwen GGUF 模型: https://modelscope.cn/models/unsloth/Qwen3-4B-Instruct-2507-GGUF

祝集成顺利！🚀
