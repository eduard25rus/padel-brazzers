import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

function startServer(dataDir) {
  return spawn(process.execPath, ["server.mjs"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      DATA_DIR: dataDir,
      PORT: "0",
      REQUIRE_EXISTING_STORE: "true",
    },
    stdio: "ignore",
  });
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

test("production mode refuses to start without an existing store", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "pb-missing-store-"));
  const result = await waitForExit(startServer(dataDir));
  assert.notEqual(result.code, 0);
});

test("production mode refuses to start with malformed JSON", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "pb-broken-store-"));
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, "auth-store.json"), "{broken", { mode: 0o600 });
  const result = await waitForExit(startServer(dataDir));
  assert.notEqual(result.code, 0);
});
