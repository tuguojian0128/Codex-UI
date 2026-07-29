import assert from "node:assert/strict";
import test from "node:test";
import { getUpdatePlatformInfo } from "./updater-platform";

const RELEASES_URL = "https://github.com/tuguojian0128/Codex-UI/releases/latest";

test("macOS manual downloads open this fork's releases page", () => {
  assert.deepEqual(getUpdatePlatformInfo("darwin", "arm64"), {
    platform: "mac",
    packageLabel: "DMG",
    manualDownloadUrl: RELEASES_URL,
  });
});

test("Windows manual downloads open this fork's releases page", () => {
  assert.deepEqual(getUpdatePlatformInfo("win32", "x64"), {
    platform: "win",
    packageLabel: "EXE",
    manualDownloadUrl: RELEASES_URL,
  });
});

test("Linux x64 updates use the AppImage release", () => {
  assert.deepEqual(getUpdatePlatformInfo("linux", "x64"), {
    platform: "linux",
    packageLabel: "AppImage",
    manualDownloadUrl: RELEASES_URL,
  });
});

test("unsupported systems fall back to this fork's releases page", () => {
  assert.deepEqual(getUpdatePlatformInfo("freebsd", "x64"), {
    platform: "unsupported",
    packageLabel: "安装包",
    manualDownloadUrl: RELEASES_URL,
  });
});
