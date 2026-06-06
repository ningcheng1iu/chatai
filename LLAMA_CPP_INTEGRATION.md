# Llama.cpp Android 集成指南

## 为什么选择 llama.cpp？

1. **原生支持 GGUF 格式** - 你的 Qwen3-4B 模型完美兼容
2. **性能优秀** - 专为移动端优化
3. **社区活跃** - 持续更新维护
4. **体积小巧** - JNI 库仅几十 MB

## 集成方案

### 方案 1：使用预编译 AAR（推荐）

```gradle
// 在 build.gradle 中添加依赖
dependencies {
    implementation 'com.github.lmyssx:llama-android:1.0.0'
}
```

### 方案 2：使用 llama.cpp Java Binding

集成 llama.cpp 的 Java 封装库，支持：
- GGUF 模型加载
- 文本生成推理
- 流式输出

### 方案 3：自己编译 JNI（高级）

如果你需要特定优化，可以自己编译 llama.cpp Android 版本。

## 快速开始

### 1. 添加依赖到 build.gradle

```gradle
dependencies {
    // llama.cpp Android 绑定
    implementation 'io.github.kidoju:llama.java:0.0.1'
}
```

### 2. 创建 LlamaService

```java
public class LlamaService {
    static {
        System.loadLibrary("llama");
    }
    
    public native long initModel(String modelPath);
    public native String generate(long modelPtr, String prompt, int maxTokens);
    public native void freeModel(long modelPtr);
}
```

### 3. 使用示例

```java
// 初始化模型
long model = llamaService.initModel("/path/to/model.gguf");

// 生成文本
String response = llamaService.generate(model, "你好", 512);

// 释放资源
llamaService.freeModel(model);
```

## 性能优化建议

### 内存管理
- 量化模型（Q4_K_M）可减少 50% 内存占用
- 使用 batch 推理提升吞吐量

### CPU 优化
- 启用多线程支持
- 使用 ARM NEON 指令集优化

### GPU 加速
- Vulkan 计算着色器支持
- OpenCL 后端（部分设备）

## 故障排查

### 模型加载失败
- 检查文件路径是否正确
- 确认存储权限已授予
- 验证模型文件完整性

### 内存溢出 (OOM)
- 使用更小的量化版本（Q3/Q2）
- 减少上下文长度
- 增加设备可用内存

### 推理速度慢
- 使用设备原生支持的线程数
- 启用 GPU 加速（如可用）
- 关闭其他占用资源的应用

## 资源链接

- GitHub: https://github.com/ggerganov/llama.cpp
- Android 集成: https://github.com/PlayVoice/llama-android
- Java 绑定: https://github.com/koboldai/llama.java

## 下一步

1. 下载 llama.cpp Android AAR 库
2. 添加到项目依赖
3. 重新编译测试
4. 性能调优
