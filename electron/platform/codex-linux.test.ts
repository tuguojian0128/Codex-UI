import assert from "node:assert/strict";
import test from "node:test";
import {
  linuxCdpArguments,
  linuxExecutableNameLooksCompatible,
  linuxProcessTreeOwnsListeners,
  parseLinuxProcessTable,
  parseProcNetTcp,
  parseSsListenerPids,
} from "./codex-linux";

const EXECUTABLE = "/home/alice/Applications/Codex Desktop.AppImage";

test("Linux candidate names exclude the Codex CLI but accept desktop builds", () => {
  assert.equal(linuxExecutableNameLooksCompatible("/usr/bin/codex"), false);
  assert.equal(linuxExecutableNameLooksCompatible("/opt/Codex/codex-desktop"), true);
  assert.equal(linuxExecutableNameLooksCompatible(EXECUTABLE), true);
});

test("Linux process rows preserve commands containing spaces", () => {
  assert.deepEqual(
    parseLinuxProcessTable(`
  120 1 "${EXECUTABLE}" --remote-debugging-port=9222
  121 120 /tmp/.mount_codex/codex --type=renderer
invalid
`),
    [
      { pid: 120, parentPid: 1, commandLine: `"${EXECUTABLE}" --remote-debugging-port=9222` },
      { pid: 121, parentPid: 120, commandLine: "/tmp/.mount_codex/codex --type=renderer" },
    ],
  );
});

test("Linux debug port ownership requires the selected executable process tree", () => {
  const rows = parseLinuxProcessTable(`
120 1 "${EXECUTABLE}" --remote-debugging-port=9222
121 120 /tmp/.mount_codex/codex --type=gpu-process
122 121 /tmp/.mount_codex/codex --type=renderer
999 1 /usr/bin/python3 server.py
`);
  assert.equal(linuxProcessTreeOwnsListeners([121], rows, EXECUTABLE), true);
  assert.equal(linuxProcessTreeOwnsListeners([122], rows, EXECUTABLE), true);
  assert.equal(linuxProcessTreeOwnsListeners([122, 999], rows, EXECUTABLE), false);
  assert.equal(linuxProcessTreeOwnsListeners([], rows, EXECUTABLE), false);
});

test("Linux listener parsers recognize ss and proc socket data", () => {
  const ss = 'LISTEN 0 128 127.0.0.1:9222 0.0.0.0:* users:(("codex",pid=121,fd=42))';
  assert.deepEqual(parseSsListenerPids(ss, 9222), [121]);
  const tcp = `  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode
   0: 0100007F:2406 00000000:0000 0A 00000000:00000000 00:00000000 00000000 1000 0 55555 1 0000000000000000 100 0 0 10 0
`;
  assert.deepEqual([...parseProcNetTcp(tcp, 9222)], ["55555"]);
});

test("Linux CDP arguments bind only to loopback", () => {
  assert.deepEqual(linuxCdpArguments(9222), [
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=9222",
  ]);
});