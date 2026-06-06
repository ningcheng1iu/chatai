import os
import requests
from tqdm import tqdm

# 创建保存目录
output_dir = r"e:\chatai\models"
os.makedirs(output_dir, exist_ok=True)

# 模型文件列表
model_files = [
    "qwen3-4b-instruct-2507-q4_k_m.gguf",
    "qwen3-4b-instruct-2507-q5_k_m.gguf",
    "qwen3-4b-instruct-2507-q3_k_m.gguf",
    # 添加其他可能的文件
]

# 从ModelScope下载
model_scope_url = "https://modelscope.cn/api/v1/models/unsloth/Qwen3-4B-Instruct-2507-GGUF/repo?FilePath="

print("=" * 50)
print("开始下载 Qwen3-4B-Instruct-2507-GGUF (unsloth优化版)")
print("=" * 50)
print(f"保存目录: {output_dir}")
print()

for filename in model_files:
    file_path = os.path.join(output_dir, filename)
    
    # 检查文件是否已存在
    if os.path.exists(file_path):
        file_size = os.path.getsize(file_path)
        print(f"文件已存在: {filename} ({file_size / (1024*1024):.2f} MB)")
        print(f"跳过 {filename}")
        print()
        continue
    
    # 开始下载
    print(f"正在下载: {filename}")
    
    try:
        download_url = f"{model_scope_url}{filename}"
        
        # 先获取文件大小
        response = requests.get(download_url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        print(f"文件大小: {total_size / (1024*1024):.2f} MB")
        
        # 流式下载
        with open(file_path, 'wb') as f:
            progress_bar = tqdm(total=total_size, unit='iB', unit_scale=True, desc=filename)
            for chunk in response.iter_content(chunk_size=8192):
                size = f.write(chunk)
                progress_bar.update(size)
            progress_bar.close()
        
        print(f"下载完成: {filename}")
        print()
        
        # 下载第一个主要的Q4_K_M版本后就停止（如果成功）
        if "q4_k_m" in filename.lower():
            print("=" * 50)
            print("已下载完成！")
            print(f"模型文件: {file_path}")
            break
        
    except Exception as e:
        print(f"下载失败: {e}")
        if os.path.exists(file_path):
            os.remove(file_path)
        print()

print("=" * 50)
print("下载过程完成")
print("=" * 50)
