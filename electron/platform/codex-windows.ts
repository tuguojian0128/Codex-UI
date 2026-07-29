import { execFile, spawn } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import type { CodexDesktopAdapter, CodexInstall } from "./codex-desktop";

const execFileAsync = promisify(execFile);
const POWERSHELL = "powershell.exe";
const CODEX_NEW_THREAD_URL = "codex://threads/new";

interface WindowsInstallCandidate {
  executable: string;
  installPath: string;
  version: string;
  signatureStatus: string;
  signerSubject: string;
  trustType?: "authenticode" | "appx";
  packageName?: string;
  packagePublisher?: string;
}

const OFFICIAL_CODEX_PACKAGE_NAME = "OpenAI.Codex";
const OFFICIAL_CODEX_PACKAGE_PUBLISHER = "CN=50BDFD77-8903-4850-9FFE-6E8522F64D5B";

export interface WindowsProcessRow {
  pid: number;
  parentPid: number;
  executable: string;
  commandLine: string;
}

export function windowsTaskkillArguments(pid: number, force: boolean): string[] {
  return ["/PID", String(pid), "/T", ...(force ? ["/F"] : [])];
}

export function windowsCdpArguments(port: number): string[] {
  return [
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${port}`,
  ];
}

/**
 * Route the Codex deep link through the verified OpenAI executable instead of
 * Windows' global codex:// association, which another editor can register.
 */
export function windowsCodexModeArguments(): string[] {
  return [CODEX_NEW_THREAD_URL];
}

function normalizeWindowsPath(value: string): string {
  return path.win32.normalize(value).toLowerCase();
}

function asArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

async function powershell(script: string, env: NodeJS.ProcessEnv = process.env): Promise<string> {
  const { stdout } = await execFileAsync(
    POWERSHELL,
    ["-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script],
    { encoding: "utf8", env, maxBuffer: 8 * 1024 * 1024 },
  );
  return stdout.trim();
}

export function isTrustedWindowsPublisher(
  signatureStatus: string,
  signerSubject: string,
): boolean {
  if (signatureStatus.toLowerCase() !== "valid") return false;
  return /(?:^|,\s*)CN=OpenAI(?:,\s*L\.?L\.?C\.?)?(?:,|$)/i.test(signerSubject);
}

export function isTrustedWindowsAppxPackage(
  signatureStatus: string,
  signerSubject: string,
  packageName: string,
  packagePublisher: string,
  executable: string,
): boolean {
  const normalizedExecutable = normalizeWindowsPath(executable);
  return signatureStatus.toLowerCase() === "valid" &&
    packageName === OFFICIAL_CODEX_PACKAGE_NAME &&
    packagePublisher === OFFICIAL_CODEX_PACKAGE_PUBLISHER &&
    signerSubject === packagePublisher &&
    normalizedExecutable.includes("\\windowsapps\\openai.codex_") &&
    normalizedExecutable.endsWith("\\app\\chatgpt.exe");
}

export function parseWindowsInstallCandidate(raw: string): CodexInstall | null {
  if (!raw.trim()) return null;
  let parsed: Partial<WindowsInstallCandidate>;
  try {
    parsed = JSON.parse(raw) as Partial<WindowsInstallCandidate>;
  } catch {
    return null;
  }
  const trusted = typeof parsed.signatureStatus === "string" &&
    typeof parsed.signerSubject === "string" &&
    typeof parsed.executable === "string" &&
    (parsed.trustType === "appx"
      ? typeof parsed.packageName === "string" &&
        typeof parsed.packagePublisher === "string" &&
        isTrustedWindowsAppxPackage(
          parsed.signatureStatus,
          parsed.signerSubject,
          parsed.packageName,
          parsed.packagePublisher,
          parsed.executable,
        )
      : isTrustedWindowsPublisher(parsed.signatureStatus, parsed.signerSubject));
  if (
    typeof parsed.executable !== "string" ||
    !path.win32.isAbsolute(parsed.executable) ||
    typeof parsed.installPath !== "string" ||
    !path.win32.isAbsolute(parsed.installPath) ||
    !trusted
  ) {
    return null;
  }
  return {
    platform: "win32",
    installPath: parsed.installPath,
    executable: parsed.executable,
    version: typeof parsed.version === "string" && parsed.version.trim()
      ? parsed.version.trim()
      : "unknown",
  };
}

const DISCOVER_SCRIPT = String.raw`
$ErrorActionPreference = "SilentlyContinue"
$result = $null
$packageRoots = [System.Collections.Generic.List[string]]::new()

# Preferred path: ask the package manager. Some Windows installations return
# HRESULT 0x80070002 here, so a protected WindowsApps scan is also used below.
Get-AppxPackage | Where-Object {
  $_.Name -eq "OpenAI.Codex" -or $_.PackageFamilyName -like "OpenAI.Codex_*"
} | ForEach-Object {
  if ($_.InstallLocation) { $packageRoots.Add([string]$_.InstallLocation) }
}

$windowsAppsRoot = Join-Path $env:ProgramFiles "WindowsApps"
if (Test-Path -LiteralPath $windowsAppsRoot -PathType Container) {
  Get-ChildItem -LiteralPath $windowsAppsRoot -Directory -Filter "OpenAI.Codex_*__2p2nqsd0c76g0" |
    Sort-Object Name -Descending |
    ForEach-Object { $packageRoots.Add($_.FullName) }
}

$seenRoots = @{}
foreach ($packageRoot in $packageRoots) {
  if (-not $packageRoot) { continue }
  $fullRoot = [System.IO.Path]::GetFullPath($packageRoot)
  if ($seenRoots[$fullRoot]) { continue }
  $seenRoots[$fullRoot] = $true

  $manifestPath = Join-Path $fullRoot "AppxManifest.xml"
  $signaturePath = Join-Path $fullRoot "AppxSignature.p7x"
  if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf) -or
      -not (Test-Path -LiteralPath $signaturePath -PathType Leaf)) { continue }

  [xml]$manifest = Get-Content -LiteralPath $manifestPath -Raw
  $identity = $manifest.Package.Identity
  $packageName = [string]$identity.Name
  $packagePublisher = [string]$identity.Publisher
  if ($packageName -ne "OpenAI.Codex" -or
      $packagePublisher -ne "CN=50BDFD77-8903-4850-9FFE-6E8522F64D5B") { continue }

  $packageSignature = Get-AuthenticodeSignature -LiteralPath $signaturePath
  $packageSigner = [string]$packageSignature.SignerCertificate.Subject
  if ([string]$packageSignature.Status -ne "Valid" -or
      $packageSigner -ne $packagePublisher) { continue }

  foreach ($application in @($manifest.Package.Applications.Application)) {
    $relative = [string]$application.Executable
    if (-not $relative -or $relative -notmatch "ChatGPT|Codex|OpenAI") { continue }
    $executable = [System.IO.Path]::GetFullPath((Join-Path $fullRoot $relative))
    if (-not (Test-Path -LiteralPath $executable -PathType Leaf)) { continue }
    $result = [pscustomobject]@{
      executable = $executable
      installPath = (Get-Item -LiteralPath $executable).Directory.FullName
      version = [string]$identity.Version
      signatureStatus = [string]$packageSignature.Status
      signerSubject = $packageSigner
      trustType = "appx"
      packageName = $packageName
      packagePublisher = $packagePublisher
    }
    break
  }
  if ($result) { break }
}

# Legacy/standalone fallback: require the executable itself to be signed by OpenAI.
if (-not $result) {
  $candidatePaths = [System.Collections.Generic.List[string]]::new()
  if ($env:CODEX_UI_DESKTOP_PATH) {
    $candidatePaths.Add($env:CODEX_UI_DESKTOP_PATH)
  }
  $candidatePaths.Add((Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps\ChatGPT.exe"))
  $seen = @{}
  foreach ($candidatePath in $candidatePaths) {
    if (-not $candidatePath) { continue }
    $fullPath = [System.IO.Path]::GetFullPath($candidatePath)
    if ($seen[$fullPath] -or -not (Test-Path -LiteralPath $fullPath -PathType Leaf)) { continue }
    $seen[$fullPath] = $true
    $signature = Get-AuthenticodeSignature -LiteralPath $fullPath
    $item = Get-Item -LiteralPath $fullPath
    $result = [pscustomobject]@{
      executable = $fullPath
      installPath = $item.Directory.FullName
      version = [string]$item.VersionInfo.ProductVersion
      signatureStatus = [string]$signature.Status
      signerSubject = [string]$signature.SignerCertificate.Subject
      trustType = "authenticode"
    }
    break
  }
}

if ($result) { $result | ConvertTo-Json -Compress }
`

export async function discoverWindowsCodexApp(
  configured?: string | null,
): Promise<CodexInstall | null> {
  const env = {
    ...process.env,
    CODEX_UI_DESKTOP_PATH:
      configured && path.win32.isAbsolute(configured) ? configured : "",
  };
  try {
    return parseWindowsInstallCandidate(await powershell(DISCOVER_SCRIPT, env));
  } catch {
    return null;
  }
}

export function parseWindowsProcessRows(raw: string): WindowsProcessRow[] {
  if (!raw.trim()) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return [];
  }
  return asArray(parsed as Record<string, unknown> | Record<string, unknown>[])
    .map((row) => ({
      pid: Number(row.ProcessId),
      parentPid: Number(row.ParentProcessId),
      executable: typeof row.ExecutablePath === "string" ? row.ExecutablePath : "",
      commandLine: typeof row.CommandLine === "string" ? row.CommandLine : "",
    }))
    .filter((row) => Number.isInteger(row.pid) && row.pid > 0);
}

async function processRows(): Promise<WindowsProcessRow[]> {
  const raw = await powershell(String.raw`
Get-CimInstance Win32_Process |
  Select-Object ProcessId, ParentProcessId, ExecutablePath, CommandLine |
  ConvertTo-Json -Compress
`);
  return parseWindowsProcessRows(raw);
}

function mainPids(rows: WindowsProcessRow[], executable: string): number[] {
  const expected = normalizeWindowsPath(executable);
  return rows
    .filter((row) => row.executable && normalizeWindowsPath(row.executable) === expected)
    .map((row) => row.pid);
}

function descendsFromInstall(
  pid: number,
  rowsByPid: Map<number, WindowsProcessRow>,
  executable: string,
): boolean {
  const expected = normalizeWindowsPath(executable);
  let current = pid;
  for (let depth = 0; current > 0 && depth < 64; depth += 1) {
    const row = rowsByPid.get(current);
    if (!row) return false;
    if (row.executable && normalizeWindowsPath(row.executable) === expected) return true;
    if (!row.parentPid || row.parentPid === current) return false;
    current = row.parentPid;
  }
  return false;
}

export function portBelongsToWindowsInstall(
  listenerPids: number[],
  rows: WindowsProcessRow[],
  executable: string,
): boolean {
  if (listenerPids.length === 0) return false;
  const rowsByPid = new Map(rows.map((row) => [row.pid, row]));
  const directPids = new Set(mainPids(rows, executable));
  let foundDirect = false;
  for (const pid of listenerPids) {
    if (directPids.has(pid)) foundDirect = true;
    else if (!descendsFromInstall(pid, rowsByPid, executable)) return false;
  }
  return foundDirect || listenerPids.every((pid) =>
    descendsFromInstall(pid, rowsByPid, executable));
}

async function listenerPids(port: number): Promise<number[]> {
  // Get-NetTCPConnection exits with code 1 when no matching listener exists,
  // even with -ErrorAction SilentlyContinue. An unused port is expected during
  // port selection, so always emit valid JSON and explicitly exit 0.
  const raw = await powershell(`
$connections = @(Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue)
if ($connections.Count -eq 0) { Write-Output "[]"; exit 0 }
$connections |
  Select-Object -ExpandProperty OwningProcess |
  Sort-Object -Unique |
  ConvertTo-Json -Compress
exit 0
`);
  if (!raw) return [];
  return asArray(JSON.parse(raw) as number | number[])
    .map(Number)
    .filter((pid) => Number.isInteger(pid) && pid > 0);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function isRunning(install: CodexInstall): Promise<boolean> {
  return mainPids(await processRows(), install.executable).length > 0;
}

async function stop(install: CodexInstall, opts: { force: boolean }): Promise<void> {
  let pids = mainPids(await processRows(), install.executable);
  if (pids.length === 0) return;
  for (const pid of pids) {
    await execFileAsync("taskkill.exe", windowsTaskkillArguments(pid, false), {
      windowsHide: true,
    }).catch(() => {});
  }
  let deadline = Date.now() + 15_000;
  while ((await isRunning(install)) && Date.now() < deadline) await sleep(250);
  if (!(await isRunning(install))) return;
  if (!opts.force) {
    throw new Error(
      "Codex did not close within 15 seconds; explicit restart authorization is required for a forced stop.",
    );
  }
  pids = mainPids(await processRows(), install.executable);
  for (const pid of pids) {
    await execFileAsync("taskkill.exe", windowsTaskkillArguments(pid, true), {
      windowsHide: true,
    }).catch(() => {});
  }
  deadline = Date.now() + 5_000;
  while ((await isRunning(install)) && Date.now() < deadline) await sleep(250);
  if (await isRunning(install)) throw new Error("Codex could not be stopped safely.");
}

async function cdpHttpReady(port: number): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1000);
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`, {
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

async function verifiedCdpEndpoint(port: number, install: CodexInstall): Promise<boolean> {
  const [pids, rows] = await Promise.all([listenerPids(port), processRows()]);
  return portBelongsToWindowsInstall(pids, rows, install.executable) &&
    await cdpHttpReady(port);
}

async function selectAvailablePort(preferred: number): Promise<number> {
  const last = Math.min(preferred + 100, 65535);
  for (let candidate = preferred; candidate <= last; candidate += 1) {
    if ((await listenerPids(candidate)).length === 0) return candidate;
  }
  throw new Error(`No free loopback port was found between ${preferred} and ${last}.`);
}

async function waitForCdp(
  port: number,
  install: CodexInstall,
  timeoutMs = 45_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await verifiedCdpEndpoint(port, install)) return;
    await sleep(350);
  }
  throw new Error(`Timed out waiting for the Codex debug port ${port}.`);
}

async function launchWithCdp(install: CodexInstall, port: number): Promise<void> {
  const child = spawn(
    install.executable,
    windowsCdpArguments(port),
    { detached: true, stdio: "ignore", windowsHide: false },
  );
  child.unref();
}

async function launchNormally(install: CodexInstall): Promise<void> {
  const child = spawn(install.executable, [], {
    detached: true,
    stdio: "ignore",
    windowsHide: false,
  });
  child.unref();
}

export const windowsCodexDesktopAdapter: CodexDesktopAdapter = {
  platform: "win32",
  displayName: "ChatGPT / Codex Windows 客户端",
  discover: discoverWindowsCodexApp,
  isRunning,
  stop,
  selectAvailablePort,
  verifiedCdpEndpoint,
  waitForCdp,
  launchWithCdp,
  openCodexMode: async (install) => {
    const child = spawn(install.executable, windowsCodexModeArguments(), {
      detached: true,
      stdio: "ignore",
      windowsHide: false,
    });
    child.unref();
  },
  launchNormally,
};
