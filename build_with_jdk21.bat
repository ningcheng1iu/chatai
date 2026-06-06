@echo off
REM 使用 JDK 21 构建 Android APK

echo ========================================
echo   使用 JDK 21 构建 Android APK
echo ========================================
echo.

REM 设置 JDK 21 路径
set JAVA_HOME=e:\chatai\.tools\jdk21\jdk-21.0.11+10
set PATH=%JAVA_HOME%\bin;%PATH%

echo [1/5] 验证 JDK 21 配置...
java -version
echo.

echo [2/5] 同步 Capacitor 代码...
cd /d e:\chatai
call npx cap sync android
if %ERRORLEVEL% NEQ 0 (
    echo [错误] Capacitor 同步失败！
    pause
    exit /b 1
)
echo.

echo [3/5] 进入 Android 目录并清理构建...
cd /d e:\chatai\android
call gradlew clean
if %ERRORLEVEL% NEQ 0 (
    echo [警告] 清理可能有问题，继续构建...
)
echo.

echo [4/5] 开始构建 Debug APK...
echo 这可能需要几分钟时间，请耐心等待...
echo.
call gradlew assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 构建失败！
    pause
    exit /b 1
)

echo.
echo [5/5] 验证 APK 生成...
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    for %%A in ("app\build\outputs\apk\debug\app-debug.apk") do (
        set APK_SIZE=%%~zA
    )
    set /a APK_SIZE_MB=%APK_SIZE:~0,-3% / 1000
    echo.
    echo ========================================
    echo   ✓ 构建成功！
    echo ========================================
    echo.
    echo APK 文件位置:
    echo   e:\chatai\android\app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo APK 大小: %APK_SIZE% bytes
    echo.
    echo 下一步操作:
    echo 1. 将模型文件推送到设备（可选）
    echo    adb push e:\chatai\models\qwen3-4b-instruct-2507-q4_k_m.gguf /sdcard/Android/data/com.example.deepseekchat/files/
    echo.
    echo 2. 安装 APK 到设备
    echo    adb install app\build\outputs\apk\debug\app-debug.apk
    echo.
    echo 3. 测试离线功能
    echo    - 打开应用，连接网络，使用在线模式测试
    echo    - 断开网络，测试离线模式
    echo.
) else (
    echo [错误] APK 文件未生成！
    pause
    exit /b 1
)

pause
