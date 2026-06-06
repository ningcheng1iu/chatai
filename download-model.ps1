# Qwen3-4B Model Downloader
$ErrorActionPreference = "Continue"

Write-Host "========================================"
Write-Host "  Qwen3-4B Model Downloader"
Write-Host "========================================"
Write-Host ""

$MODEL_NAME = "Qwen3-4B-Instruct-2507"
$QUANTIZATION = "Q4_K_M"
$BASE_URL = "https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507-GGUF/resolve/main"
$OUTPUT_DIR = "e:\chatai\models"

$MODEL_FILES = @(
    "qwen3-4b-instruct-2507-Q4_K_M.gguf"
)

if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR -Force | Out-Null
}

Write-Host "Output directory: $OUTPUT_DIR"
Write-Host "Model: $MODEL_NAME ($QUANTIZATION)"
Write-Host "File size: ~4GB"
Write-Host ""

Write-Host "Checking network..."
try {
    $response = Invoke-WebRequest -Uri "https://huggingface.co" -Method Head -TimeoutSec 10 -UseBasicParsing
    Write-Host "Network OK"
} catch {
    Write-Host "Network error: $_"
    exit 1
}

Write-Host ""
Write-Host "========================================"
Write-Host "  Starting download..."
Write-Host "========================================"
Write-Host ""

foreach ($file in $MODEL_FILES) {
    $url = "$BASE_URL/$file"
    $outputPath = Join-Path $OUTPUT_DIR $file

    Write-Host "Downloading: $file"

    if (Test-Path $outputPath) {
        $existingSize = (Get-Item $outputPath).Length
        Write-Host "File already exists: $outputPath ($([math]::Round($existingSize/1GB, 2)) GB)"

        $continue = Read-Host "Redownload? (y/n)"
        if ($continue -ne "y") {
            Write-Host "Skipping..."
            continue
        } else {
            Remove-Item $outputPath -Force
        }
    }

    $startTime = Get-Date

    try {
        Write-Host "URL: $url"
        Write-Host "This may take 10-60 minutes depending on your network..."
        Write-Host ""

        curl.exe -L -o $outputPath $url --progress-bar

        $endTime = Get-Date
        $duration = $endTime - $startTime

        if (Test-Path $outputPath) {
            $fileSize = (Get-Item $outputPath).Length
            $fileSizeGB = [math]::Round($fileSize / 1GB, 2)

            Write-Host ""
            Write-Host "Download complete!"
            Write-Host "File size: $fileSizeGB GB"
            Write-Host "Duration: $($duration.ToString('hh\:mm\:ss'))"
            Write-Host "Saved to: $outputPath"
        } else {
            throw "Download failed"
        }
    } catch {
        Write-Host "Error: $_"
        if (Test-Path $outputPath) {
            Remove-Item $outputPath -Force -ErrorAction SilentlyContinue
        }
    }

    Write-Host ""
}

Write-Host "========================================"
Write-Host "  Download process started"
Write-Host "========================================"
Write-Host ""
Write-Host "You can monitor the progress in this terminal."
Write-Host "Once complete, the model will be at: $OUTPUT_DIR"
