const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");
const { spawn } = require("child_process");

const isDev = !app.isPackaged;
let backendProcess = null;

function startBackendServer() {
  let backendDir;
  let backendDataDir = null;
  let frontendDistDir = null;
  if (isDev) {
    backendDir = path.join(__dirname, "..", "my-custom-backend");
  } else {
    // In packaged app, backend is in extraResources
    backendDir = path.join(process.resourcesPath, "my-custom-backend");
    backendDataDir = path.join(app.getPath("userData"), "my-custom-backend");
    frontendDistDir = path.join(app.getAppPath(), "dist");
  }
  const backendPath = path.join(backendDir, "server.js");
  console.log("[Electron] Starting backend server at", backendPath);

  backendProcess = spawn("node", [backendPath], {
    stdio: "inherit",
    cwd: backendDir,
    env: {
      ...process.env,
      ...(backendDataDir
        ? {
          BACKEND_DATA_DIR: backendDataDir,
          BACKEND_SEED_DIR: backendDir,
          BACKEND_FRONTEND_DIR: frontendDistDir,
        }
        : {}),
    },
  });

  backendProcess.on("error", (err) => {
    console.error("[Electron] Backend start error:", err);
  });

  backendProcess.on("exit", (code) => {
    console.log("[Electron] Backend exited with code", code);
    backendProcess = null;
  });

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("[Electron] Backend server started, waiting for it to be ready...");
      resolve();
    }, 2000);
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
  if (!isDev) {
    await startBackendServer();
  }
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    console.log("[Electron] Terminating backend server...");
    backendProcess.kill();
    backendProcess = null;
  }
  if (process.platform !== "darwin") app.quit();
});
