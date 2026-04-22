const http = require("node:http");
const path = require("node:path");
const { exec, spawn } = require("node:child_process");

const backendDir = path.join(__dirname, "..", "my-custom-backend");
const backendEntry = path.join(backendDir, "server.js");
const kioskUrl = "http://127.0.0.1:3333";

function ping(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });

    req.on("error", () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(maxAttempts = 60) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const ok = await ping(kioskUrl);
    if (ok) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

function openBrowser(url) {
  const command = process.platform === "win32"
    ? `start "" "${url}"`
    : process.platform === "darwin"
      ? `open "${url}"`
      : `xdg-open "${url}"`;

  exec(command, (error) => {
    if (error) {
      console.error("[Standalone] Could not auto-open browser:", error.message);
      console.log(`[Standalone] Open this manually: ${url}`);
    }
  });
}

console.log("[Standalone] Starting backend server...");
let backend = null;

(async () => {
  const alreadyRunning = await ping(kioskUrl);
  if (alreadyRunning) {
    console.log("[Standalone] Backend already running on port 3333.");
    console.log(`[Standalone] Kiosk available at ${kioskUrl}`);
    openBrowser(kioskUrl);
    return;
  }

  backend = spawn(process.execPath, [backendEntry], {
    cwd: backendDir,
    stdio: "inherit",
    env: process.env,
  });

  backend.on("error", (error) => {
    console.error("[Standalone] Failed to start backend:", error.message);
    process.exit(1);
  });

  const ready = await waitForServer();
  if (!ready) {
    console.error("[Standalone] Backend did not become ready in time.");
    if (backend && !backend.killed) backend.kill();
    process.exit(1);
    return;
  }

  console.log(`[Standalone] Kiosk available at ${kioskUrl}`);
  openBrowser(kioskUrl);

  const shutdown = () => {
    if (backend && !backend.killed) backend.kill();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  backend.on("exit", (code) => {
    process.exit(code || 0);
  });
})();
