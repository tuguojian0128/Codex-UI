# Codex-UI

[中文说明](#中文说明) · [English](#english)

## 中文说明

Codex-UI 是一个面向 OpenAI Codex 桌面端的开源 UI 主题管理器。它通过本机 Chrome DevTools Protocol 连接应用主题，不修改 Codex 的安装文件。

> 本项目基于 [freestylefly/codex-themes](https://github.com/freestylefly/codex-themes) 继续开发，是独立开源项目，并非 OpenAI 官方产品。上游署名和许可证保留在 `NOTICE.md` 与 `UPSTREAM-LICENSE` 中。

### 主要功能

- 支持 Windows、macOS 和 Linux x64 版 Codex-UI
- 支持标准安装版及 Windows AppX/MSIX 版 Codex
- Linux 可连接兼容的 Electron Codex / ChatGPT 客户端或手动选择的 AppImage
- 主题预览、安装、应用、暂停和恢复
- 导入 `.codextheme` 主题包
- 61 套内置主题和多种布局结构
- 全部主题均包含大型人物、角色主体或完整特色场景
- 35 套扩展 UI，其中包含 8 套液态玻璃主题
- 官方主题搜索和风格分类筛选
- 可选的自部署 Supabase 登录
- 可选的自部署付费主题与支付宝后端
- GitHub Releases 自动更新

### 液态玻璃主题

- 流光水镜 Aqua Lens
- 兰紫棱镜 Orchid Prism
- 晨曦凝胶 Sunrise Gel
- 石墨光环 Graphite Orbit
- 薄荷胶囊 Mint Capsule
- 珊瑚光谱 Coral Spectrum
- 极地珍珠 Arctic Pearl
- 午夜流波 Midnight Wave

全部内置主题源文件位于 `assets/presets/`。

重新生成扩展主题资源：

```bash
npm run gen:characters
```

### 下载与系统支持

GitHub Release 会提供以下版本：

- Windows x64：`Codex-UI-0.4.0-win-x64.exe`
- macOS Apple 芯片：`Codex-UI-0.4.0-mac-arm64.dmg`
- macOS Intel：`Codex-UI-0.4.0-mac-x64.dmg`
- Linux x64 AppImage：`Codex-UI-0.4.0-linux-x64.AppImage`
- Debian / Ubuntu x64：`Codex-UI-0.4.0-linux-x64.deb`


#### Linux 兼容说明

OpenAI 官方 Codex 桌面应用当前主要提供 macOS 和 Windows 版。Codex-UI 的 Linux 版是一个兼容层，需要可开启 Chrome DevTools Protocol 的 Electron Codex / ChatGPT 社区客户端，或在设置中手动选择兼容的可执行文件 / AppImage。`codex` CLI 没有桌面 UI，因此不能换肤。

AppImage 使用方式：

```bash
chmod +x Codex-UI-0.4.0-linux-x64.AppImage
./Codex-UI-0.4.0-linux-x64.AppImage
```

启动后进入“设置 → Codex 桌面端”，选择兼容客户端的可执行文件或 AppImage，再返回主题画廊应用主题。调试端口只绑定 `127.0.0.1`，并会校验端口监听进程是否属于已选客户端的进程树。

如果仓库没有配置 Apple Developer 签名与公证密钥，GitHub Actions 仍会生成 macOS 预览版。首次打开未签名预览版时，需要在 Finder 中右键应用并选择“打开”，或在“系统设置 → 隐私与安全性”中允许打开。正式分发建议配置 Apple Developer ID 签名和公证。

### 开发

环境要求：Node.js 22 或更高版本、npm，以及 macOS / Windows Codex 桌面端或 Linux 兼容 Electron 客户端。

```bash
npm install
npm run dev
```

验证：

```bash
npm run typecheck
npm test
npm run build:web
```

Windows 打包：

```bash
npm run dist:win:x64
```

macOS Apple 芯片打包：

```bash
npm run dist:mac:arm64
```

macOS Intel 打包：

```bash
npm run dist:mac:x64
```

Linux x64 打包（需在 Linux 上运行）：

```bash
npm run dist:linux:x64
```

### 登录和支付配置

本分支不会连接上游项目的生产 Supabase 或支付部署。需要自行配置环境变量后才能启用登录与商业功能。

将 `.env.example` 复制为 `.env`：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_COMMERCE_API_URL=https://your-commerce-api.example.com
```

桌面端回调：

```text
codexui://auth/callback
codexui://payment/result
```

请勿提交 `.env`、service-role 密钥、支付私钥或其他敏感信息。

### 项目标识

- 仓库：`tuguojian0128/Codex-UI`
- 产品名称：`Codex-UI`
- 深层链接协议：`codexui://`
- Windows App ID：`com.tuguojian0128.codexui`

### Windows 模式切换安全

Codex-UI 通过经过验证的 OpenAI 可执行程序打开 Codex 深层链接，不使用 Windows 全局 `codex://` 关联，避免其他编辑器注册该协议后错误打开。

### 许可证

MIT。重新分发时请保留 `NOTICE.md`、`UPSTREAM-LICENSE` 和相关第三方声明。

---

## English

Codex-UI is an open-source desktop UI theme manager for the OpenAI Codex desktop application. It applies themes through a local Chrome DevTools Protocol connection and does not patch the Codex installation files.

> This is an independent open-source project derived from [freestylefly/codex-themes](https://github.com/freestylefly/codex-themes). It is not an official OpenAI product. Upstream attribution and licenses are preserved in `NOTICE.md` and `UPSTREAM-LICENSE`.

### Features

- Codex-UI applications for Windows, macOS, and Linux x64
- Standard and Windows AppX/MSIX Codex detection
- Compatible Electron Codex / ChatGPT clients and explicitly selected AppImages on Linux
- Theme preview, install, apply, pause, and restore
- `.codextheme` package import
- 61 bundled themes and multiple layout systems
- Every theme includes a full-size character, a character-led subject, or a complete signature scene
- 35 expanded UI themes, including eight liquid-glass designs
- Search and collection filters for bundled themes
- Optional self-hosted Supabase login
- Optional self-hosted paid-theme and Alipay backend
- GitHub Releases update support

### Downloads and platforms

GitHub Releases provide:

- Windows x64: `Codex-UI-0.4.0-win-x64.exe`
- macOS Apple Silicon: `Codex-UI-0.4.0-mac-arm64.dmg`
- macOS Intel: `Codex-UI-0.4.0-mac-x64.dmg`
- Linux x64 AppImage: `Codex-UI-0.4.0-linux-x64.AppImage`
- Debian / Ubuntu x64: `Codex-UI-0.4.0-linux-x64.deb`


#### Linux compatibility

The official OpenAI Codex desktop application is currently distributed primarily for macOS and Windows. The Linux build of Codex-UI is a compatibility layer for Electron-based community Codex / ChatGPT clients that can enable Chrome DevTools Protocol, or for a compatible executable / AppImage selected explicitly in Settings. The `codex` CLI has no desktop UI and cannot be skinned.

Run the AppImage with:

```bash
chmod +x Codex-UI-0.4.0-linux-x64.AppImage
./Codex-UI-0.4.0-linux-x64.AppImage
```

Then open **Settings → Codex Desktop**, select the compatible client executable or AppImage, and apply a theme from the gallery. The debug port is bound to `127.0.0.1` only, and Codex-UI verifies that listeners belong to the selected client's process tree.

When Apple Developer signing and notarization secrets are unavailable, GitHub Actions still creates unsigned macOS preview packages. To open an unsigned preview for the first time, right-click the app in Finder and choose **Open**, or allow it under **System Settings → Privacy & Security**. Signed and notarized builds are recommended for general distribution.

### Development

Requirements: Node.js 22 or later, npm, and either the macOS / Windows Codex desktop app or a Linux-compatible Electron client.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run typecheck
npm test
npm run build:web
```

Packaging:

```bash
npm run dist:win:x64
npm run dist:mac:arm64
npm run dist:mac:x64
npm run dist:linux:x64 # run on Linux
```

### Login and payment configuration

This fork does not connect to the upstream project's production Supabase or payment deployment. Login and commerce remain disabled until you provide your own environment variables.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
VITE_COMMERCE_API_URL=https://your-commerce-api.example.com
```

Desktop callbacks:

```text
codexui://auth/callback
codexui://payment/result
```

Never commit `.env`, service-role keys, payment private keys, or other secrets.

### Repository identifiers

- Repository: `tuguojian0128/Codex-UI`
- Product name: `Codex-UI`
- Deep-link scheme: `codexui://`
- Windows App ID: `com.tuguojian0128.codexui`

### License

MIT. Preserve `NOTICE.md`, `UPSTREAM-LICENSE`, and all applicable third-party notices when redistributing the project.
