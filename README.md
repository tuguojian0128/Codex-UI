# Codex-UI

Codex-UI is a desktop theme manager for the OpenAI Codex desktop application. It applies themes through a local Chrome DevTools Protocol connection and does not patch the Codex installation files.

> This is an independent open-source project derived from [freestylefly/codex-themes](https://github.com/freestylefly/codex-themes). It is not an official OpenAI product. Upstream attribution and licenses are preserved in `NOTICE.md` and `UPSTREAM-LICENSE`.

## Features

- Windows and macOS desktop application
- Detects standard and Windows AppX/MSIX Codex installations
- Theme preview, install, apply, pause, and restore
- Imports `.codextheme` packages
- Built-in and custom layout themes
- Optional self-hosted Supabase login
- Optional self-hosted paid-theme and Alipay backend
- GitHub Releases update support

## Included custom themes

- Aurora Observatory
- Porcelain Circuit
- Ember Archive
- Nocturne Bloom
- Polar Signal

Theme sources are stored in `assets/presets/`.

## Development

Requirements: Node.js 22 or later, npm, and the OpenAI Codex desktop app.

```bash
npm install
npm run dev
```

Validation:

```bash
npm run typecheck
npm test
```

Windows packaging:

```bash
npm run dist:win:x64
```

Artifacts are written to `release/` using names such as:

```text
Codex-UI-0.2.14-win-x64.exe
```

## Login and payment configuration

This fork does not connect to the upstream project's production Supabase or payment deployment. Login and commerce remain disabled until you provide your own environment variables.

Copy `.env.example` to `.env` and configure as needed:

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

## Repository and application identifiers

- Repository: `tuguojian0128/Codex-UI`
- Product name: `Codex-UI`
- Deep-link scheme: `codexui://`
- Windows App ID: `com.tuguojian0128.codexui`

## Windows mode-switch safety

Codex-UI launches Codex deep links through the verified OpenAI executable. It does not use the global Windows `codex://` association, because another editor may register that protocol and open itself instead of Codex.

## License

MIT. Preserve `NOTICE.md`, `UPSTREAM-LICENSE`, and all applicable third-party notices when redistributing the project.
