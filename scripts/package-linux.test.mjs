import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  assertLinuxArtifactsExist,
  assertLinuxPackagingEnvironment,
  getLinuxArtifactPaths,
  parseLinuxArch,
  verifyLinuxUpdateMetadata,
} from "./package-linux.mjs";
import { sha512File } from "./package-macos.mjs";

test("Linux target parsing and runner validation accept x64 only", () => {
  assert.equal(parseLinuxArch(["--arch", "x64"]), "x64");
  assert.throws(() => parseLinuxArch(["--arch", "arm64"]), /requires --arch x64/);
  assert.doesNotThrow(() => assertLinuxPackagingEnvironment("x64", "linux", "x64"));
  assert.throws(
    () => assertLinuxPackagingEnvironment("x64", "win32", "x64"),
    /received win32\/x64/,
  );
});

test("Linux artifact validation and metadata cover AppImage and DEB", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "codex-ui-linux-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const artifacts = getLinuxArtifactPaths(root, "0.3.3");
  fs.mkdirSync(artifacts.releaseDir);
  fs.writeFileSync(artifacts.appImage, "appimage");
  fs.writeFileSync(artifacts.deb, "deb");
  const metadata = `version: 0.3.3
files:
  - url: Codex-UI-0.3.3-linux-x64.AppImage
    sha512: ${sha512File(artifacts.appImage)}
    size: ${fs.statSync(artifacts.appImage).size}
path: Codex-UI-0.3.3-linux-x64.AppImage
sha512: ${sha512File(artifacts.appImage)}
`;
  fs.writeFileSync(artifacts.updateMetadata, metadata);

  assert.doesNotThrow(() => assertLinuxArtifactsExist(artifacts));
  assert.doesNotThrow(() => verifyLinuxUpdateMetadata(metadata, artifacts));
  fs.unlinkSync(artifacts.deb);
  assert.throws(() => assertLinuxArtifactsExist(artifacts), /\.deb/);
});