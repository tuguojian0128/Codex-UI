export interface UpdatePlatformInfo {
  platform: "mac" | "win" | "linux" | "unsupported";
  packageLabel: "DMG" | "EXE" | "AppImage" | "安装包";
  manualDownloadUrl: string;
}

const RELEASES_URL = "https://github.com/tuguojian0128/Codex-UI/releases/latest";

export function getUpdatePlatformInfo(
  platform: NodeJS.Platform = process.platform,
  arch: string = process.arch,
): UpdatePlatformInfo {
  if (platform === "darwin") {
    return {
      platform: "mac",
      packageLabel: "DMG",
      manualDownloadUrl: RELEASES_URL,
    };
  }
  if (platform === "win32") {
    return {
      platform: "win",
      packageLabel: "EXE",
      manualDownloadUrl: RELEASES_URL,
    };
  }
  if (platform === "linux" && arch === "x64") {
    return {
      platform: "linux",
      packageLabel: "AppImage",
      manualDownloadUrl: RELEASES_URL,
    };
  }
  return {
    platform: "unsupported",
    packageLabel: "安装包",
    manualDownloadUrl: RELEASES_URL,
  };
}
