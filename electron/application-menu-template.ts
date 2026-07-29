import type { MenuItemConstructorOptions } from "electron";

export type ApplicationMenuPlatform = "darwin" | "win32" | "linux";

export interface ApplicationMenuActions {
  showAbout: () => void;
  openRepository: () => void;
  openReleases: () => void;
}

export function buildApplicationMenuTemplate(
  platform: ApplicationMenuPlatform,
  productName: string,
  actions: ApplicationMenuActions,
): MenuItemConstructorOptions[] {
  const isMac = platform === "darwin";
  const template: MenuItemConstructorOptions[] = [];

  if (isMac) {
    template.push({
      label: productName,
      submenu: [
        { label: `关于 ${productName}`, click: actions.showAbout },
        { type: "separator" },
        { role: "services", label: "服务" },
        { type: "separator" },
        { role: "hide", label: `隐藏 ${productName}` },
        { role: "hideOthers", label: "隐藏其他应用" },
        { role: "unhide", label: "全部显示" },
        { type: "separator" },
        { role: "quit", label: `退出 ${productName}` },
      ],
    });
  }

  template.push(
    {
      label: "文件",
      submenu: [
        { role: "close", label: "关闭窗口" },
        ...(isMac
          ? []
          : [
              { type: "separator" as const },
              { role: "quit" as const, label: `退出 ${productName}` },
            ]),
      ],
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo", label: "撤销" },
        { role: "redo", label: "重做" },
        { type: "separator" },
        { role: "cut", label: "剪切" },
        { role: "copy", label: "复制" },
        { role: "paste", label: "粘贴" },
        ...(isMac
          ? [{ role: "pasteAndMatchStyle" as const, label: "粘贴并匹配样式" }]
          : []),
        { role: "delete", label: "删除" },
        { type: "separator" },
        { role: "selectAll", label: "全选" },
      ],
    },
    {
      label: "视图",
      submenu: [
        { role: "reload", label: "重新加载" },
        { role: "forceReload", label: "强制重新加载" },
        { role: "toggleDevTools", label: "开发者工具" },
        { type: "separator" },
        { role: "resetZoom", label: "实际大小" },
        { role: "zoomIn", label: "放大" },
        { role: "zoomOut", label: "缩小" },
        { type: "separator" },
        { role: "togglefullscreen", label: "切换全屏" },
      ],
    },
    {
      label: "窗口",
      submenu: [
        { role: "minimize", label: "最小化" },
        ...(isMac ? [{ role: "zoom" as const, label: "缩放" }] : []),
        { role: "close", label: "关闭窗口" },
        ...(isMac
          ? [
              { type: "separator" as const },
              { role: "front" as const, label: "全部置于前台" },
            ]
          : []),
      ],
    },
    {
      role: "help",
      label: "帮助",
      submenu: [
        { label: "打开 GitHub 仓库", click: actions.openRepository },
        { label: "查看下载与发布版本", click: actions.openReleases },
        { type: "separator" },
        { label: `关于 ${productName}`, click: actions.showAbout },
      ],
    },
  );

  return template;
}
