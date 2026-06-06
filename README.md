# DeepSeek 聊天 AI 最简版

这是一个可以在安卓 Chrome 里安装到主屏幕的最简聊天 AI：

- 前端：手机优先 PWA 聊天页面
- 后端：Node.js + Express
- 模型：DeepSeek，兼容 OpenAI SDK
- 安全：API Key 只放在后端 `.env`，不会写进手机端

## 运行

1. 安装依赖

```bash
npm install
```

2. 配置环境变量

复制 `.env.example` 为 `.env`，填写：

```bash
DEEPSEEK_API_KEY=你的DeepSeek_API_Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

3. 启动

```bash
npm run dev
```

打开 `http://localhost:3000`。

## 在安卓手机安装

手机和电脑在同一 Wi-Fi 下时，用电脑的局域网 IP 访问：

```text
http://你的电脑局域网IP:3000
```

然后在安卓 Chrome 菜单里选择“添加到主屏幕”或“安装应用”。

## 注意

- 不要把 `DEEPSEEK_API_KEY` 写到前端代码里。
- 当前版本只做最简聊天和本地聊天记录。
- Android APK 工程已经通过 Capacitor 放在 `android/` 目录。
