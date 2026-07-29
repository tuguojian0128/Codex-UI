import { app, BrowserWindow, dialog, Menu, shell } from "electron";
import { buildApplicationMenuTemplate } from "./application-menu-template";

const REPOSITORY_URL = "https://github.com/tuguojian0128/Codex-UI";
const RELEASES_URL = `${REPOSITORY_URL}/releases`;

export function installApplicationMenu(): void {
  const productName = "Codex-UI";
  const showAbout = () => {
    const options = {
      type: "info" as const,
      title: `关于 ${productName}`,
      message: productName,
      detail: `版本 ${app.getVersion()}\nCodex 桌面端 UI 主题管理器\n\n独立开源项目，非 OpenAI 官方产品。`,
      buttons: ["确定"],
      noLink: true,
    };
    const window = BrowserWindow.getFocusedWindow();
    if (window) void dialog.showMessageBox(window, options);
    else void dialog.showMessageBox(options);
  };

  const template = buildApplicationMenuTemplate(
    process.platform === "darwin" ? "darwin" : process.platform === "win32" ? "win32" : "linux",
    productName,
    {
      showAbout,
      openRepository: () => void shell.openExternal(REPOSITORY_URL),
      openReleases: () => void shell.openExternal(RELEASES_URL),
    },
  );

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
