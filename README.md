# Codex-UI

[中文说明](#中文说明) · [English](#english)

## 中文说明

Codex-UI 是一个面向 OpenAI Codex 桌面端的开源 UI 主题管理器。它通过本机 Chrome DevTools Protocol 连接应用主题，不修改 Codex 的安装文件。

> 本项目基于 [freestylefly/codex-themes](https://github.com/freestylefly/codex-themes) 继续开发，是独立开源项目，并非 OpenAI 官方产品。上游署名和许可证保留在 `NOTICE.md` 与 `UPSTREAM-LICENSE` 中。

### 主要功能

- 支持 Windows 和 macOS 桌面端
- 支持标准安装版及 Windows AppX/MSIX 版 Codex
- 主题预览、安装、应用、暂停和恢复
- 导入 `.codextheme` 主题包
- 61 套内置主题和多种布局结构
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

全部扩展主题见 [`docs/EXPANDED-UI-COLLECTION.md`](docs/EXPANDED-UI-COLLECTION.md)。主题源文件位于 `assets/presets/`。

重新生成扩展主题资源：

```bash
npm run gen:expanded-ui
```

### 下载与系统支持

GitHub Release 会提供以下版本：

- Windows x64：`Codex-UI-0.3.1-win-x64.exe`
- macOS Apple 芯片：`Codex-UI-0.3.1-mac-arm64.dmg`
- macOS Intel：`Codex-UI-0.3.1-mac-x64.dmg`

如果仓库没有配置 Apple Developer 签名与公证密钥，GitHub Actions 仍会生成 macOS 预览版。首次打开未签名预览版时，需要在 Finder 中右键应用并选择“打开”，或在“系统设置 → 隐私与安全性”中允许打开。正式分发建议配置 Apple Developer ID 签名和公证。

### 开发

环境要求：Node.js 22 或更高版本、npm，以及 OpenAI Codex 桌面端。

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

- Windows and macOS desktop applications
- Standard and Windows AppX/MSIX Codex detection
- Theme preview, install, apply, pause, and restore
- `.codextheme` package import
- 61 bundled themes and multiple layout systems
- 35 expanded UI themes, including eight liquid-glass designs
- Search and collection filters for bundled themes
- Optional self-hosted Supabase login
- Optional self-hosted paid-theme and Alipay backend
- GitHub Releases update support

### Downloads and platforms

GitHub Releases provide:

- Windows x64: `Codex-UI-0.3.1-win-x64.exe`
- macOS Apple Silicon: `Codex-UI-0.3.1-mac-arm64.dmg`
- macOS Intel: `Codex-UI-0.3.1-mac-x64.dmg`

When Apple Developer signing and notarization secrets are unavailable, GitHub Actions still creates unsigned macOS preview packages. To open an unsigned preview for the first time, right-click the app in Finder and choose **Open**, or allow it under **System Settings → Privacy & Security**. Signed and notarized builds are recommended for general distribution.

### Development

Requirements: Node.js 22 or later, npm, and the OpenAI Codex desktop app.

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
