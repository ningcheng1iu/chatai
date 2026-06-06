# Qwen3-4B 模型下载指南

## 📦 模型信息

- **模型名称**：Qwen3-4B-Instruct-2507
- **量化版本**：Q4_K_M（推荐）
- **模型大小**：约 4 GB
- **下载地址**：HuggingFace

---

## 🚀 方法一：PowerShell脚本下载（推荐）

### 步骤

1. **打开PowerShell**
   - 按 `Win + X`，选择"Windows PowerShell (管理员)"
   - 或者在文件夹地址栏输入 `powershell` 回车

2. **运行下载脚本**
   ```powershell
   cd e:\chatai
   .\download-model.ps1
   ```

3. **等待下载完成**
   - 文件大小约4GB
   - 取决于网络速度（通常10-60分钟）

### 脚本特点
- ✅ 自动检查网络
- ✅ 支持断点续传
- ✅ 显示下载进度
- ✅ 验证文件完整性

---

## 🌐 方法二：HuggingFace CLI下载

### 1. 安装HuggingFace CLI

```powershell
pip install huggingface-cli
```

### 2. 下载模型

```powershell
# 创建目录
mkdir e:\chatai\models
cd e:\chatai\models

# 下载Qwen3-4B GGUF版本
huggingface-cli download Qwen/Qwen3-4B-Instruct-2507-GGUF qwen3-4b-instruct-2507-Q4_K_M.gguf
```

### 或使用Python脚本

```python
from huggingface_hub import hf_hub_download

# 下载Q4_K_M量化版本
model_path = hf_hub_download(
    repo_id="Qwen/Qwen3-4B-Instruct-2507-GGUF",
    filename="qwen3-4b-instruct-2507-Q4_K_M.gguf",
    local_dir="./models"
)

print(f"模型保存位置: {model_path}")
```

---

## 💾 方法三：浏览器直接下载

### 下载链接

```
https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507-GGUF/resolve/main/qwen3-4b-instruct-2507-Q4_K_M.gguf
```

### 步骤

1. 复制上述链接
2. 打开浏览器（Chrome/Edge）
3. 粘贴链接并回车
4. 选择保存位置：`e:\chatai\models\`
5. 等待下载完成

### 优点
- 简单直接
- 浏览器自带断点续传

### 缺点
- 大文件可能不稳定
- 需要手动保存到正确目录

---

## 🔄 方法四：使用国内镜像（推荐国内用户）

### 阿里云镜像
```
https://modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507-GGUF
```

### Step-by-Step

1. 打开 ModelScope
2. 搜索 `Qwen3-4B-Instruct-2507-GGUF`
3. 选择 GGUF 格式下载
4. 选择 Q4_K_M 版本
5. 下载完成后移动到 `e:\chatai\models\`

---

## 📋 验证下载

### 检查文件

```powershell
# 检查文件是否存在
ls e:\chatai\models\

# 检查文件大小（应该是约4GB）
dir e:\chatai\models\*.gguf | Select-Object Name, @{Name="Size(GB)";Expression={[math]::Round($_.Length/1GB, 2)}}
```

### 预期输出

```
    Directory: E:\chatai\models

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         2026/5/31     16:30   4294967296 qwen3-4b-instruct-2507-Q4_K_M.gguf
```

---

## 🎯 其他量化版本（可选）

如果4GB对你来说太大，可以选择更小的版本：

| 版本 | 大小 | 质量 | 适用场景 |
|------|------|------|----------|
| **Q4_K_M** | ~4GB | ⭐⭐⭐⭐ | ✅ 推荐，平衡之选 |
| Q5_K_M | ~5GB | ⭐⭐⭐⭐⭐ | 高质量需求 |
| Q3_K_M | ~2.5GB | ⭐⭐⭐ | 存储受限 |

### 下载其他版本

```powershell
# Q5_K_M（更高质量，更大）
https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507-GGUF/resolve/main/qwen3-4b-instruct-2507-Q5_K_M.gguf

# Q3_K_M（更小，更快）
https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507-GGUF/resolve/main/qwen3-4b-instruct-2507-Q3_K_M.gguf
```

---

## 🐛 常见问题

### 1. 下载太慢？

**解决方案**：
- 使用国内镜像（ModelScope）
- 在网络闲时下载（深夜）
- 使用IDM等下载工具

### 2. 下载中断？

**PowerShell脚本**：
- 支持断点续传
- 重运行会自动跳过已下载文件

**浏览器下载**：
- 大部分浏览器支持断点续传
- 重新点击下载链接即可

### 3. 存储空间不足？

**检查空间**：
```powershell
# 查看剩余空间
Get-PSDrive C

# 清理空间
# - 清理回收站
# - 卸载不用的应用
# - 清理临时文件
```

### 4. 磁盘格式问题？

**NTFS格式**：
- Windows默认NTFS
- 单文件最大16EB（足够）

**FAT32格式**：
- ⚠️ 不支持超过4GB文件
- ⚠️ 不推荐

---

## ✅ 下一步

下载完成后，你可以：

### 1. 本地测试模型

```powershell
# 安装Ollama
winget install Ollama.Ollama

# 运行模型
ollama run qwen3:4b-instruct-2507
```

### 2. 集成到APP

参考项目中的 `offline-ai-plan.md` 文档

---

## 📞 技术支持

如果下载遇到问题：

1. 检查网络连接
2. 确认磁盘空间充足（至少10GB）
3. 尝试不同的下载方法
4. 查看HuggingFace状态

---

祝你下载顺利！ 🎉
