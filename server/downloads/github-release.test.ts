import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchLatestReleaseDownload,
  parseDownloadFormat,
  parseDownloadTarget,
  selectReleaseDownload,
} from "./github-release";

const release = {
  tag_name: "v0.2.3",
  assets: [
    {
      name: "Codex-UI-0.2.3-mac-arm64.dmg.blockmap",
      browser_download_url:
        "https://github.com/tuguojian0128/Codex-UI/releases/download/v0.2.3/Codex-UI-0.2.3-mac-arm64.dmg.blockmap",
    },
    {
      name: "Codex-UI-0.2.3-mac-arm64.dmg",
      browser_download_url:
        "https://github.com/tuguojian0128/Codex-UI/releases/download/v0.2.3/Codex-UI-0.2.3-mac-arm64.dmg",
    },
    {
      name: "Codex-UI-0.2.3-mac-arm64.zip",
      browser_download_url:
        "https://github.com/tuguojian0128/Codex-UI/releases/download/v0.2.3/Codex-UI-0.2.3-mac-arm64.zip",
    },
    {
      name: "Codex-UI-0.2.3-mac-x64.dmg",
      browser_download_url:
        "https://github.com/tuguojian0128/Codex-UI/releases/download/v0.2.3/Codex-UI-0.2.3-mac-x64.dmg",
    },
    {
      name: "Codex-UI-0.2.3-win-x64.exe",
      browser_download_url:
        "https://github.com/tuguojian0128/Codex-UI/releases/download/v0.2.3/Codex-UI-0.2.3-win-x64.exe",
    },
    {
      name: "Codex-UI-0.2.3-linux-x64.AppImage",
      browser_download_url:
        "https://github.com/tuguojian0128/Codex-UI/releases/download/v0.2.3/Codex-UI-0.2.3-linux-x64.AppImage",
    },
    {
      name: "Codex-UI-0.2.3-linux-x64.deb",
      browser_download_url:
        "https://github.com/tuguojian0128/Codex-UI/releases/download/v0.2.3/Codex-UI-0.2.3-linux-x64.deb",
    },
  ],
};

test("download format only accepts supported package types", () => {
  assert.equal(parseDownloadFormat("dmg"), "dmg");
  assert.equal(parseDownloadFormat(["zip", "dmg"]), "zip");
  assert.equal(parseDownloadFormat("exe"), "exe");
  assert.equal(parseDownloadFormat("appimage"), "appimage");
  assert.equal(parseDownloadFormat("deb"), "deb");
  assert.equal(parseDownloadFormat(undefined), null);
});

test("download target parser keeps old Mac links and rejects invalid combinations", () => {
  assert.deepEqual(parseDownloadTarget({ format: "dmg" }), {
    platform: "mac",
    arch: "arm64",
    format: "dmg",
  });
  assert.deepEqual(
    parseDownloadTarget({ platform: "mac", arch: "x64", format: "zip" }),
    { platform: "mac", arch: "x64", format: "zip" },
  );
  assert.deepEqual(parseDownloadTarget({ format: "exe" }), {
    platform: "win",
    arch: "x64",
    format: "exe",
  });
  assert.equal(
    parseDownloadTarget({ platform: "win", arch: "arm64", format: "exe" }),
    null,
  );
  assert.equal(
    parseDownloadTarget({ platform: "win", arch: "x64", format: "dmg" }),
    null,
  );
  assert.deepEqual(
    parseDownloadTarget({ platform: "linux", arch: "x64", format: "appimage" }),
    { platform: "linux", arch: "x64", format: "appimage" },
  );
  assert.deepEqual(
    parseDownloadTarget({ platform: "linux", format: "deb" }),
    { platform: "linux", arch: "x64", format: "deb" },
  );
  assert.equal(
    parseDownloadTarget({ platform: "linux", arch: "arm64", format: "appimage" }),
    null,
  );
});

test("release resolver selects the package attached to the latest tag", () => {
  assert.deepEqual(selectReleaseDownload(release, {
    platform: "mac",
    arch: "arm64",
    format: "dmg",
  }), {
    name: "Codex-UI-0.2.3-mac-arm64.dmg",
    tagName: "v0.2.3",
    url: "https://github.com/tuguojian0128/Codex-UI/releases/download/v0.2.3/Codex-UI-0.2.3-mac-arm64.dmg",
  });
  assert.equal(selectReleaseDownload(release, {
    platform: "mac",
    arch: "arm64",
    format: "zip",
  })?.name, "Codex-UI-0.2.3-mac-arm64.zip");
  assert.equal(selectReleaseDownload(release, {
    platform: "mac",
    arch: "x64",
    format: "dmg",
  })?.name, "Codex-UI-0.2.3-mac-x64.dmg");
  assert.equal(selectReleaseDownload(release, {
    platform: "win",
    arch: "x64",
    format: "exe",
  })?.name, "Codex-UI-0.2.3-win-x64.exe");
  assert.equal(selectReleaseDownload(release, {
    platform: "linux",
    arch: "x64",
    format: "appimage",
  })?.name, "Codex-UI-0.2.3-linux-x64.AppImage");
  assert.equal(selectReleaseDownload(release, {
    platform: "linux",
    arch: "x64",
    format: "deb",
  })?.name, "Codex-UI-0.2.3-linux-x64.deb");
});

test("release resolver refuses download URLs outside the official repository", () => {
  assert.equal(
    selectReleaseDownload({
      tag_name: "v0.2.3",
      assets: [{
        name: "Codex-UI-0.2.3-mac-arm64.dmg",
        browser_download_url: "https://example.com/Codex-UI-0.2.3-mac-arm64.dmg",
      }],
    }, { platform: "mac", arch: "arm64", format: "dmg" }),
    null,
  );
});

test("latest release request returns the GitHub asset selected from the response", async () => {
  const fakeFetch: typeof fetch = async () =>
    new Response(JSON.stringify(release), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  assert.equal(
    (await fetchLatestReleaseDownload({
      platform: "mac",
      arch: "arm64",
      format: "zip",
    }, fakeFetch)).name,
    "Codex-UI-0.2.3-mac-arm64.zip",
  );
});
