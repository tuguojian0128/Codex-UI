/**
 * Linux integration for compatible Electron Codex / ChatGPT desktop builds.
 *
 * OpenAI does not currently publish an official Linux Codex desktop package,
 * so automatic discovery is deliberately narrow. Users can explicitly select
 * another Electron executable or AppImage in Settings. CDP is trusted only
 * when every listening process belongs to that selected executable's process
 * tree.
 */

import { execFile, spawn } from "node:child_process";
import fs from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { CodexDesktopAdapter, CodexInstall } from "./codex-desktop";

const execFileAsync = promisify(execFile);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const CODEX_NEW_THREAD_URL = "codex://threads/new";

export interface LinuxProcessRow {
  pid: number;
  parentPid: number;
  commandLine: string;
}

export const LINUX_CODEX_CANDIDATES = [
  "/opt/Codex/Codex",
  "/opt/Codex/codex-desktop",
  "/opt/codex-desktop/codex-desktop",
  "/opt/ChatGPT/ChatGPT",
  "/opt/chatgpt-desktop/chatgpt-desktop",
  "/usr/local/bin/codex-desktop",
  "/usr/local/bin/chatgpt-desktop",
  "/usr/bin/codex-desktop",
  "/usr/bin/chatgpt-desktop",
  path.join(os.homedir(), ".local", "bin", "codex-desktop"),
  path.join(os.homedir(), ".local", "bin", "chatgpt-desktop"),
  path.join(os.homedir(), "Applications", "Codex.AppImage"),
  path.join(os.homedir(), "Applications", "ChatGPT.AppImage"),
];

async function run(file: string, args: string[]): Promise<string> {
  const { stdout } = await execFileAsync(file, args, {
    maxBuffer: 4 * 1024 * 1024,
    timeout: 8_000,
  });
  return stdout;
}

export function linuxExecutableNameLooksCompatible(filePath: string): boolean {
  const name = path.basename(filePath).toLowerCase();
  return /(codex|chatgpt)/.test(name) && !/^codex(?:\.exe)?$/.test(name);
}

function versionFromFileName(filePath: string): string {
  const match = /(?:codex|chatgpt)[-_ ]?v?(\d+\.\d+(?:\.\d+)?)/i.exec(path.basename(filePath));
  return match?.[1] ?? "unknown";
}

async function executableCandidates(candidate: string): Promise<string[]> {
  try {
    const stat = await fs.stat(candidate);
    if (stat.isFile()) return [candidate];
    if (!stat.isDirectory()) return [];
    return ["Codex", "codex-desktop", "ChatGPT", "chatgpt-desktop"]
      .map((name) => path.join(candidate, name));
  } catch {
    return [];
  }
}

async function checkCandidate(
  candidate: string,
  explicitlyConfigured: boolean,
): Promise<CodexInstall | null> {
  for (const executable of await executableCandidates(candidate)) {
    try {
      const stat = await fs.stat(executable);
      if (!stat.isFile()) continue;
      await fs.access(executable, fs.constants.X_OK);
      if (!explicitlyConfigured && !linuxExecutableNameLooksCompatible(executable)) continue;
      return {
        platform: "linux",
        installPath: path.dirname(executable),
        executable,
        version: versionFromFileName(executable),
      };
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

export async function discoverCodexApp(configured?: string | null): Promise<CodexInstall | null> {
  if (configured && path.isAbsolute(configured)) {
    const selected = await checkCandidate(configured, true);
    if (selected) return selected;
  }
  for (const candidate of LINUX_CODEX_CANDIDATES) {
    const found = await checkCandidate(candidate, false);
    if (found) return found;
  }
  return null;
}

export function parseLinuxProcessTable(output: string): LinuxProcessRow[] {
  return output
    .split("\n")
    .map((line) => /^\s*(\d+)\s+(\d+)\s+(.*)$/.exec(line))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => ({
      pid: Number(match[1]),
      parentPid: Number(match[2]),
      commandLine: match[3].trim(),
    }))
    .filter((row) => row.pid > 0 && row.parentPid >= 0 && row.commandLine.length > 0);
}

function commandStartsExecutable(commandLine: string, executable: string): boolean {
  const normalized = commandLine.trim();
  return normalized === executable ||
    normalized.startsWith(`"${executable}" `) ||
    normalized.startsWith(`${executable} `);
}

async function processTable(): Promise<LinuxProcessRow[]> {
  const output = await run("/bin/ps", ["-eo", "pid=,ppid=,args="]);
  return parseLinuxProcessTable(output);
}

export function linuxProcessTreeOwnsListeners(
  listenerPids: number[],
  rows: LinuxProcessRow[],
  executable: string,
): boolean {
  if (listenerPids.length === 0) return false;
  const byPid = new Map(rows.map((row) => [row.pid, row]));
  const mainPids = new Set(
    rows.filter((row) => commandStartsExecutable(row.commandLine, executable)).map((row) => row.pid),
  );
  if (mainPids.size === 0) return false;

  return listenerPids.every((listenerPid) => {
    let current = listenerPid;
    const seen = new Set<number>();
    for (let depth = 0; current > 0 && depth < 64; depth += 1) {
      if (mainPids.has(current)) return true;
      if (seen.has(current)) return false;
      seen.add(current);
      const row = byPid.get(current);
      if (!row || row.parentPid === current) return false;
      current = row.parentPid;
    }
    return false;
  });
}

export async function codexMainPids(executable: string): Promise<number[]> {
  return (await processTable())
    .filter((row) => commandStartsExecutable(row.commandLine, executable))
    .map((row) => row.pid);
}

export async function codexIsRunning(executable: string): Promise<boolean> {
  return (await codexMainPids(executable)).length > 0;
}

export async function stopCodex(executable: string, opts: { force: boolean }): Promise<void> {
  const pids = await codexMainPids(executable);
  if (pids.length === 0) return;
  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Already gone.
    }
  }
  let deadline = Date.now() + 15_000;
  while ((await codexIsRunning(executable)) && Date.now() < deadline) await sleep(250);
  if (!(await codexIsRunning(executable))) return;
  if (!opts.force) {
    throw new Error("Codex 未能正常退出；强制重启需要用户确认。");
  }
  for (const pid of await codexMainPids(executable)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Already gone.
    }
  }
  deadline = Date.now() + 5_000;
  while ((await codexIsRunning(executable)) && Date.now() < deadline) await sleep(250);
  if (await codexIsRunning(executable)) throw new Error("无法安全停止 Linux Codex 客户端。");
}

export function parseProcNetTcp(output: string, port: number): Set<string> {
  const inodes = new Set<string>();
  for (const line of output.split("\n").slice(1)) {
    const fields = line.trim().split(/\s+/);
    if (fields.length < 10 || fields[3] !== "0A") continue;
    const local = fields[1]?.split(":");
    if (!local || Number.parseInt(local[1] ?? "", 16) !== port) continue;
    inodes.add(fields[9]);
  }
  return inodes;
}

async function listenerPidsFromProc(port: number): Promise<number[]> {
  const inodes = new Set<string>();
  for (const file of ["/proc/net/tcp", "/proc/net/tcp6"]) {
    try {
      for (const inode of parseProcNetTcp(await fs.readFile(file, "utf8"), port)) {
        inodes.add(inode);
      }
    } catch {
      // Unavailable.
    }
  }
  if (inodes.size === 0) return [];

  const pids: number[] = [];
  for (const entry of await fs.readdir("/proc", { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;
    const fdDir = path.join("/proc", entry.name, "fd");
    let fds: string[];
    try {
      fds = await fs.readdir(fdDir);
    } catch {
      continue;
    }
    for (const fd of fds) {
      try {
        const target = await fs.readlink(path.join(fdDir, fd));
        const match = /^socket:\[(\d+)]$/.exec(target);
        if (match && inodes.has(match[1])) {
          pids.push(Number(entry.name));
          break;
        }
      } catch {
        // Process changed while scanning.
      }
    }
  }
  return [...new Set(pids)];
}

export function parseSsListenerPids(output: string, port: number): number[] {
  const pids: number[] = [];
  for (const line of output.split("\n")) {
    if (!line.includes(`:${port} `) && !line.includes(`:${port}\t`)) continue;
    for (const match of line.matchAll(/pid=(\d+)/g)) pids.push(Number(match[1]));
  }
  return [...new Set(pids.filter((pid) => pid > 0))];
}

async function listenerPids(port: number): Promise<number[]> {
  for (const lsof of ["/usr/bin/lsof", "/usr/sbin/lsof"]) {
    try {
      const output = await run(lsof, ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"]);
      const pids = output
        .split("\n")
        .map((line) => Number(line.trim()))
        .filter((pid) => pid > 0);
      if (pids.length > 0) return [...new Set(pids)];
    } catch {
      // Try ss.
    }
  }
  for (const ss of ["/usr/bin/ss", "/bin/ss"]) {
    try {
      const pids = parseSsListenerPids(await run(ss, ["-ltnp"]), port);
      if (pids.length > 0) return pids;
    } catch {
      // Try /proc.
    }
  }
  return listenerPidsFromProc(port);
}

async function canListen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => {
      server.close(() => resolve(true));
    });
  });
}

export async function selectAvailablePort(preferred: number): Promise<number> {
  const last = Math.min(preferred + 100, 65535);
  for (let candidate = preferred; candidate <= last; candidate += 1) {
    if (await canListen(candidate)) return candidate;
  }
  throw new Error(`在 ${preferred} 到 ${last} 之间没有可用的本机调试端口。`);
}

export async function portBelongsToCodex(port: number, executable: string): Promise<boolean> {
  return linuxProcessTreeOwnsListeners(await listenerPids(port), await processTable(), executable);
}

export async function cdpHttpReady(port: number): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1_000);
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

export async function verifiedCdpEndpoint(port: number, executable: string): Promise<boolean> {
  return (await portBelongsToCodex(port, executable)) && cdpHttpReady(port);
}

export async function waitForCdp(
  port: number,
  executable: string,
  timeoutMs = 45_000,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await cdpHttpReady(port)) && (await portBelongsToCodex(port, executable))) return;
    await sleep(350);
  }
  throw new Error(
    `等待 Linux Codex 调试端口 ${port} 超时。请确认选择的是 Electron 客户端，而不是 Codex CLI。`,
  );
}

export function linuxCdpArguments(port: number): string[] {
  return ["--remote-debugging-address=127.0.0.1", `--remote-debugging-port=${port}`];
}

function detachedLaunch(executable: string, args: string[]): void {
  const child = spawn(executable, args, {
    detached: true,
    stdio: "ignore",
    env: { ...process.env, ELECTRON_ENABLE_LOGGING: "0" },
  });
  child.unref();
}

export async function launchCodexWithCdp(install: CodexInstall, port: number): Promise<void> {
  detachedLaunch(install.executable, linuxCdpArguments(port));
}

export async function openCodexMode(install: CodexInstall): Promise<void> {
  detachedLaunch(install.executable, [CODEX_NEW_THREAD_URL]);
}

export async function launchCodexNormally(install: CodexInstall): Promise<void> {
  detachedLaunch(install.executable, []);
}

export const linuxCodexDesktopAdapter: CodexDesktopAdapter = {
  platform: "linux",
  displayName: "Linux Electron Codex / ChatGPT 客户端",
  discover: discoverCodexApp,
  isRunning: (install) => codexIsRunning(install.executable),
  stop: (install, opts) => stopCodex(install.executable, opts),
  selectAvailablePort,
  verifiedCdpEndpoint: (port, install) => verifiedCdpEndpoint(port, install.executable),
  waitForCdp: (port, install, timeoutMs) => waitForCdp(port, install.executable, timeoutMs),
  launchWithCdp: launchCodexWithCdp,
  openCodexMode,
  launchNormally: launchCodexNormally,
};