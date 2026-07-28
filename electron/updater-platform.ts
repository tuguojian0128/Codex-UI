export interface UpdatePlatformInfo {
  platform: "mac" | "win" | "unsupported";
  packageLabel: "DMG" | "EXE" | "安装包";
  manualDownloadUrl: string;
}

const RELEASES_URL = "https://github.com/tuguojian0128/-/releases/latest";

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
  return {
    platform: "unsupported",
    packageLabel: "安装包",
    manualDownloadUrl: RELEASES_URL,
  };
}
