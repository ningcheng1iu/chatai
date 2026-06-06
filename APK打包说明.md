# Android APK 打包说明

这个项目已经接入 Capacitor，`android/` 目录就是 Android 工程。

## 重要原则

APK 里不要放 DeepSeek API Key。正确结构是：

```text
安卓 APK
  -> 请求你的后端地址
  -> 后端读取 .env 里的 DEEPSEEK_API_KEY
  -> 后端调用 DeepSeek
```

所以打包 APK 前，你需要先确定后端地址。

本地测试可以用：

```text
http://你的电脑局域网IP:3000
```

正式发布建议用：

```text
https://你的后端域名
```

## 1. 修改 APK 里的后端地址

打开：

```text
public/config.js
```

把 `apiBaseUrl` 改成你的后端地址，例如：

```js
window.APP_CONFIG = {
  apiBaseUrl: "http://172.20.10.4:3000",
};
```

如果你部署到了云服务器，建议改成 HTTPS：

```js
window.APP_CONFIG = {
  apiBaseUrl: "https://api.example.com",
};
```

## 2. 同步到 Android 工程

每次修改 `public/` 里的前端文件后，都运行：

```bash
npm run android:sync
```

## 3. 安装打包环境

需要安装：

- Android Studio
- Android SDK
- JDK 17 或 Android Studio 自带的 JBR

当前这台机器检测到的是 Java 8，直接命令行打包会失败。安装 Android Studio 后，用 Android Studio 打开 `android/` 目录最省事。

## 4. 用 Android Studio 打包

1. 打开 Android Studio
2. 选择 `Open`
3. 打开本项目里的 `android` 目录
4. 等 Gradle 同步完成
5. 菜单选择 `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`
6. 生成的 APK 通常在：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

把这个 APK 发到安卓手机安装即可。

## 5. 命令行打包

如果已经配置好 JDK 17 和 Android SDK，也可以运行：

```bash
npm run android:apk
```

生成位置：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 6. 手机无法聊天时检查

- 电脑后端是否正在运行：`npm run dev`
- 手机能否访问后端：`http://你的电脑IP:3000/api/health`
- 手机和电脑是否在同一网络
- Windows 防火墙是否放行 3000 端口
- `public/config.js` 里的 `apiBaseUrl` 是否写对

正式给别人使用时，不要依赖你自己的电脑做后端，建议把后端部署到云服务器。
