@echo off
REM 模型安装脚本 - 将本地模型推送到 Android 设备

echo ========================================
echo   本地 LLM 模型安装工具
echo ========================================
echo.

REM 检查 adb 是否可用，优先使用项目内置 Android SDK
set ADB=e:\chatai\.tools\android-sdk\platform-tools\adb.exe
if not exist "%ADB%" (
    where adb >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 未找到 adb 工具！
        echo 请安装 Android SDK 并确保 adb 在 PATH 中。
        pause
        exit /b 1
    )
    set ADB=adb
)

"%ADB%" version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] adb 无法运行。
    pause
    exit /b 1
)

REM 检查设备是否连接
echo [1/5] 检查 Android 设备连接...
"%ADB%" devices
echo.

REM 检查模型文件
set MODEL_FILE=e:\chatai\models\qwen3-4b-instruct-2507-q4_k_m.gguf
if not exist "%MODEL_FILE%" (
    echo [错误] 模型文件不存在！
    echo 请确保模型文件位于: %MODEL_FILE%
    echo.
    echo 当前目录内容:
    dir e:\chatai\models\
    pause
    exit /b 1
)

echo [2/5] 找到模型文件: %MODEL_FILE%
for %%A in ("%MODEL_FILE%") do set MODEL_SIZE=%%~zA
set /a MODEL_SIZE_MB=%MODEL_SIZE%/1048576
echo 模型大小: %MODEL_SIZE_MB% MB
echo.

REM 创建目标目录
echo [3/5] 创建目标目录...
"%ADB%" shell "mkdir -p /sdcard/Android/data/com.example.deepseekchat/files/"
if %ERRORLEVEL% NEQ 0 (
    echo [警告] 目录创建可能失败，继续尝试...
)

REM 推送文件
echo [4/5] 开始推送模型文件...
echo 这可能需要几分钟时间，请耐心等待...
"%ADB%" push "%MODEL_FILE%" /sdcard/Android/data/com.example.deepseekchat/files/qwen3-4b-instruct-2507-q4_k_m.gguf
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 文件推送失败！
    pause
    exit /b 1
)

echo.
echo [5/5] 验证文件...
"%ADB%" shell "ls -lh /sdcard/Android/data/com.example.deepseekchat/files/"

echo.
echo ========================================
echo   ✓ 模型安装完成！
echo ========================================
echo.
echo 下一步操作:
echo 1. 构建并安装应用到设备
echo 2. 启动应用，它会自动检测本地模型
echo 3. 断开网络，测试离线对话功能
echo.
pause
