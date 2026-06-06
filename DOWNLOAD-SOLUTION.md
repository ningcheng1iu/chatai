# Qwen3-4B 模型下载方案

## 问题说明

HuggingFace访问超时，需要使用国内镜像。

---

## 方案一：ModelScope 下载（推荐国内用户）

### 1. 访问 ModelScope

打开浏览器访问：
```
https://modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507-GGUF
```

### 2. 搜索并下载

1. 在ModelScope页面搜索：`Qwen3-4B-Instruct-2507-GGUF`
2. 找到Qwen系列
3. 选择 **GGUF** 格式
4. 下载 **Q4_K_M** 版本（qwen3-4b-instruct-2507-Q4_K_M.gguf）

### 3. 保存位置

下载后，将文件移动到：
```
e:\chatai\models\
```

---

## 方案二：Modelscope CLI下载

### 1. 安装 modelscope

```powershell
pip install modelscope
```

### 2. Python脚本下载

创建一个下载脚本 `download_modelscope.py`：

```python
from modelscope.hub.snapshot_download import snapshot_download

# 下载模型
model_dir = snapshot_download(
    'Qwen/Qwen3-4B-Instruct-2507-GGUF',
    cache_dir='e:/chatai/models',
    file_name='qwen3-4b-instruct-2507-Q4_K_M.gguf'
)

print(f"Model saved to: {model_dir}")
```

运行：
```powershell
cd e:\chatai
python download_modelscope.py
```

---

## 方案三：使用Wget/curl国内CDN

### 使用阿里云OSS镜像（如果有）

有些社区会提供国内镜像下载，可以关注：
- QQ群：AI模型分享群
- 百度网盘：AI爱好者分享
- 各AI论坛

---

## 方案四：浏览器+IDM下载器

### 1. 安装IDM

下载Internet Download Manager (IDM)

### 2. 添加下载任务

打开IDM，新建下载，粘贴以下链接：

```
https://modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507-GGUF/files
```

然后手动找到Q4_K_M版本的下载链接。

---

## 方案五：分段下载（如果浏览器支持）

### 1. 打开Chrome/Edge开发者工具

按 F12

### 2. Network标签

找到下载请求，右键 → Copy → Copy link address

### 3. 使用浏览器多线程下载

Chrome支持断点续传，可以直接下载。

---

## 快速操作建议

### 最快的方法（推荐）

1. **打开 ModelScope**
   ```
   https://modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507-GGUF
   ```

2. **登录账号**（可以用微信登录）

3. **下载Q4_K_M版本**

4. **保存到** `e:\chatai\models\`

---

## 检查下载进度

### 方法1：查看文件大小

```powershell
ls -Path e:\chatai\models\ -Filter *.gguf | Select-Object Name, Length
```

### 方法2：查看下载进度

如果下载中断，重新访问ModelScope下载页面，会自动提示续传。

---

## 验证下载完成

### 检查文件

```powershell
# 查看文件是否存在
Get-ChildItem e:\chatai\models\

# 检查文件大小（应该是约4GB = 4294967296 bytes）
$file = Get-Item e:\chatai\models\qwen3-4b-instruct-2507-Q4_K_M.gguf
$fileSizeGB = [math]::Round($file.Length / 1GB, 2)
Write-Host "File size: $fileSizeGB GB"
```

### 预期文件信息

```
Name: qwen3-4b-instruct-2507-Q4_K_M.gguf
Size: ~4 GB
Location: e:\chatai\models\
```

---

## 如果ModelScope也没有？

### 检查其他镜像

- HuggingFace官方：https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507-GGUF
- ModelScope：https://modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507-GGUF
- 智源AI：https://openxlab.org.cn/models/Qwen/Qwen3-4B-Instruct-2507-GGUF

### 或者使用代理

如果你有VPN/代理，可以：
1. 配置系统代理
2. 然后运行下载脚本

```powershell
# 设置代理（如果有）
$env:HTTP_PROXY = "http://127.0.0.1:7890"
$env:HTTPS_PROXY = "http://127.0.0.1:7890"

# 然后运行下载脚本
.\download-model.ps1
```

---

## 下一步

下载完成后，告诉我，我会帮你：
1. 验证模型文件
2. 测试模型运行
3. 开始集成到你的APP
