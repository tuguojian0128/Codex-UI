import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertReleaseTag,
  readUpdateEntry,
  sha512File,
} from "./package-macos.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const ROOT_DIR = path.resolve(path.dirname(SCRIPT_PATH), "..");

export function parseLinuxArch(args = process.argv.slice(2)) {
  const index = args.indexOf("--arch");
  const arch = index >= 0 ? args[index + 1] : undefined;
  if (arch !== "x64") {
    throw new Error("Linux packaging currently requires --arch x64.");
  }
  return arch;
}

export function assertLinuxPackagingEnvironment(
  targetArch,
  platform = process.platform,
  runnerArch = process.arch,
) {
  if (platform !== "linux" || targetArch !== "x64" || runnerArch !== "x64") {
    throw new Error(
      `Linux x64 packaging requires linux/x64, received ${platform}/${runnerArch} for ${targetArch}.`,
    );
  }
}

export function getLinuxArtifactPaths(rootDir, version) {
  const releaseDir = path.join(rootDir, "release");
  const baseName = `Codex-UI-${version}-linux-x64`;
  return {
    releaseDir,
    appImage: path.join(releaseDir, `${baseName}.AppImage`),
    appImageBlockmap: path.join(releaseDir, `${baseName}.AppImage.blockmap`),
    deb: path.join(releaseDir, `${baseName}.deb`),
    updateMetadata: path.join(releaseDir, "latest-linux.yml"),
  };
}

export function assertLinuxArtifactsExist(artifacts) {
  const required = [
    artifacts.appImage,
    artifacts.appImageBlockmap,
    artifacts.deb,
    artifacts.updateMetadata,
  ];
  const missing = required.filter((file) => !fs.existsSync(file) || fs.statSync(file).size === 0);
  if (missing.length > 0) {
    throw new Error(
      `Missing or empty Linux release artifacts: ${missing.map((file) => path.basename(file)).join(", ")}`,
    );
  }
}

export function verifyLinuxUpdateMetadata(metadataText, artifacts) {
  const entry = readUpdateEntry(metadataText, path.basename(artifacts.appImage));
  const stat = fs.statSync(artifacts.appImage);
  if (entry.size !== stat.size || entry.sha512 !== sha512File(artifacts.appImage)) {
    throw new Error(`Linux update metadata does not match ${path.basename(artifacts.appImage)}.`);
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${path.basename(command)} exited with status ${result.status}.`);
  }
}

export async function main(args = process.argv.slice(2)) {
  const arch = parseLinuxArch(args);
  assertLinuxPackagingEnvironment(arch);

  const packageJson = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf8"),
  );
  assertReleaseTag(process.env.RELEASE_TAG, packageJson.version);

  run(process.execPath, [
    "scripts/build-dist.mjs",
    "--platform",
    "linux",
    "--arch",
    arch,
  ]);

  const artifacts = getLinuxArtifactPaths(ROOT_DIR, packageJson.version);
  assertLinuxArtifactsExist(artifacts);
  verifyLinuxUpdateMetadata(
    fs.readFileSync(artifacts.updateMetadata, "utf8"),
    artifacts,
  );

  console.log(`Linux x64 release artifacts are ready for v${packageJson.version}.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}