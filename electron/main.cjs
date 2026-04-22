const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const http = require("node:http");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;
let backendProcess = null;
let backendLogPath = null;

function appendBackendLog(message) {
  try {
    if (!backendLogPath) {
      const logDir = path.join(app.getPath("userData"), "logs");
      fs.mkdirSync(logDir, { recursive: true });
      backendLogPath = path.join(logDir, "backend-startup.log");
    }
    fs.appendFileSync(backendLogPath, `${new Date().toISOString()} ${message}\n`, "utf8");
  } catch (error) {
    console.warn("[Electron] Failed to write backend log:", error);
  }
}

function waitForBackendReady({
  host = "127.0.0.1",
  port = 3333,
  pathName = "/api/settings",
  timeoutMs = 20000,
  intervalMs = 400,
} = {}) {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const probe = () => {
      const req = http.request(
        {
          host,
          port,
          path: pathName,
          method: "GET",
          timeout: 1500,
        },
        (res) => {
          if (res.statusCode && res.statusCode < 500) {
            res.resume();
            resolve(true);
            return;
          }
          res.resume();
          scheduleRetry();
        }
      );

      req.on("error", scheduleRetry);
      req.on("timeout", () => {
        req.destroy();
        scheduleRetry();
      });
      req.end();
    };

    const scheduleRetry = () => {
      if (Date.now() - startedAt >= timeoutMs) {
        resolve(false);
        return;
      }
      setTimeout(probe, intervalMs);
    };

    probe();
  });
}

function startBackendServer() {
  let backendDir;
  if (isDev) {
    backendDir = path.join(__dirname, "..", "my-custom-backend");
  } else {
    backendDir = path.join(process.resourcesPath, "my-custom-backend");
  }

  const backendPath = path.join(backendDir, "server.js");
  const backendDataDir = path.join(app.getPath("userData"), "backend-data");

  try {
    fs.mkdirSync(backendDataDir, { recursive: true });
  } catch (error) {
    console.warn("[Electron] Failed to ensure backend data directory:", error);
  }

  console.log("[Electron] Starting backend server at", backendPath);
  appendBackendLog(`starting backend path=${backendPath} dataDir=${backendDataDir} isDev=${isDev}`);

  const nodeExecutable = isDev
    ? "node"
    : path.join(process.resourcesPath, "node", "node.exe");

  backendProcess = spawn(nodeExecutable, [backendPath], {
    cwd: backendDir,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    env: {
      ...process.env,
      BACKEND_DATA_DIR: backendDataDir,
    },
  });

  backendProcess.stdout?.on("data", (data) => {
    const msg = data.toString().trim();
    console.log("[Backend]", msg);
    appendBackendLog(`stdout: ${msg}`);
  });

  backendProcess.stderr?.on("data", (data) => {
    const msg = data.toString().trim();
    console.error("[Backend stderr]", msg);
    appendBackendLog(`stderr: ${msg}`);
  });

  backendProcess.on("error", (err) => {
    console.error("[Electron] Backend start error:", err);
    appendBackendLog(`spawn error: ${err?.stack || err}`);
  });

  backendProcess.on("exit", (code, signal) => {
    console.warn(`[Electron] Backend exited: code=${code} signal=${signal}`);
    appendBackendLog(`backend exited code=${code} signal=${signal}`);
  });

  return waitForBackendReady().then((ready) => {
    if (ready) {
      console.log("[Electron] Backend server is ready.");
      appendBackendLog("backend ready");
    } else {
      console.warn("[Electron] Backend readiness timeout. API calls may fail.");
      appendBackendLog("backend readiness timeout");
    }
  });
}

function createMainWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 760,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  win.once("ready-to-show", () => {
    win.setFullScreen(true);
    win.maximize();
    win.show();
  });
}

app.whenReady().then(async () => {
  await startBackendServer();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
  if (process.platform !== "darwin") app.quit();
});