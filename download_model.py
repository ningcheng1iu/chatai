from modelscope.hub.snapshot_download import snapshot_download
import os

# 创建保存目录
output_dir = r"e:\chatai\models"
os.makedirs(output_dir, exist_ok=True)

print("=" * 50)
print("开始下载 Qwen3-4B-Instruct-2507-GGUF (unsloth优化版)")
print("=" * 50)
print(f"保存目录: {output_dir}")
print()

try:
    # 下载模型
    model_dir = snapshot_download(
        "unsloth/Qwen3-4B-Instruct-2507-GGUF",
        cache_dir=output_dir,
        revision="master"
    )
    
    print()
    print("=" * 50)
    print("下载完成!")
    print(f"模型保存位置: {model_dir}")
    print("=" * 50)
    
    # 列出下载的文件
    print()
    print("下载的文件列表:")
    print("-" * 50)
    for file in os.listdir(model_dir):
        file_path = os.path.join(model_dir, file)
        size_mb = os.path.getsize(file_path) / (1024 * 1024)
        print(f"{file} - {size_mb:.2f} MB")
    
except Exception as e:
    print(f"下载失败: {e}")
    import traceback
    traceback.print_exc()
