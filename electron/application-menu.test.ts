import assert from "node:assert/strict";
import test from "node:test";
import { buildApplicationMenuTemplate } from "./application-menu-template";

const actions = {
  showAbout: () => {},
  openRepository: () => {},
  openReleases: () => {},
};

function labels(platform: "darwin" | "win32") {
  return buildApplicationMenuTemplate(platform, "Codex-UI", actions).map((item) => item.label);
}

test("Windows application menu uses Chinese labels", () => {
  assert.deepEqual(labels("win32"), ["文件", "编辑", "视图", "窗口", "帮助"]);
});

test("macOS application menu keeps the product menu and localizes the rest", () => {
  assert.deepEqual(labels("darwin"), ["Codex-UI", "文件", "编辑", "视图", "窗口", "帮助"]);
});

test("localized edit menu exposes standard editing roles", () => {
  const edit = buildApplicationMenuTemplate("win32", "Codex-UI", actions)[1];
  const submenu = Array.isArray(edit.submenu) ? edit.submenu : [];
  const editLabels = submenu.map((item) => item.label).filter(Boolean);
  assert.deepEqual(editLabels, ["撤销", "重做", "剪切", "复制", "粘贴", "删除", "全选"]);
});
