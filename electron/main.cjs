const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const net = require("net");

let mainWindow = null;
let backendLoaded = false;
let backendPort = 3333;

function getLoopbackApiOrigin(port = backendPort) {
  return `http://127.0.0.1:${port}`;
}

function getApiOrigin() {
  return process.env.KIOSK_API_ORIGIN || getLoopbackApiOrigin();
}

function getBackendScriptPath() {
  return path.join(app.getAppPath(), "my-custom-backend", "server.js");
}

function getWebRootPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "dist");
  }
  return path.join(app.getAppPath(), "dist");
}

function findAvailablePort(startPort = 3333, maxAttempts = 50) {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;

    const tryNext = () => {
      if (currentPort >= startPort + maxAttempts) {
        reject(new Error("Unable to find an available backend port."));
        return;
      }

      const tester = net.createServer();
      tester.unref();

      tester.once("error", () => {
        currentPort += 1;
        tryNext();
      });

      tester.once("listening", () => {
        const address = tester.address();
        tester.close(() => resolve(Number(address && typeof address === "object" ? address.port : currentPort)));
      });

      tester.listen(currentPort, "127.0.0.1");
    };

    tryNext();
  });
}

function waitForBackendReady(timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      const req = http.get(`${getApiOrigin()}/api/settings`, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          resolve();
        } else if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Backend did not become ready in time."));
        } else {
          setTimeout(check, 500);
        }
      });

      req.on("error", () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error("Backend did not become ready in time."));
          return;
        }
        setTimeout(check, 500);
      });
    };

    check();
  });
}

async function startBackendServer() {
  if (backendLoaded) return;

  const preferredPort = Number(process.env.KIOSK_PORT) || 3333;
  backendPort = await findAvailablePort(preferredPort);
  const backendScriptPath = getBackendScriptPath();
  const backendDataDir = path.join(app.getPath("userData"), "backend-data");
  const isDev = !app.isPackaged;
  const backendHost = String(process.env.KIOSK_HOST || "0.0.0.0").trim() || "0.0.0.0";

  process.env.KIOSK_PORT = String(backendPort);
  process.env.KIOSK_HOST = backendHost;
  process.env.KIOSK_API_ORIGIN = process.env.KIOSK_API_ORIGIN || getLoopbackApiOrigin(backendPort);
  process.env.KIOSK_DATA_DIR = backendDataDir;
  process.env.KIOSK_WEB_DIR = isDev ? "" : getWebRootPath();

  // Load the backend inside the Electron main process to avoid spawn path issues in packaged mode.
  require(backendScriptPath);
  backendLoaded = true;
}

async function createWindow() {
  const isDevMode = !!process.env.ELECTRON_DEV_SERVER_URL;
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    autoHideMenuBar: true,
    backgroundColor: "#0a1628",
    show: false,
    fullscreen: !isDevMode,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.ELECTRON_DEV_SERVER_URL;
  if (devServerUrl) {
    await mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
    mainWindow.show();
    return;
  }

  await mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>DILG Citizens Charter Kiosk</title>
        <style>
          html, body {
            width: 100%;
            height: 100%;
            margin: 0;
            background: radial-gradient(circle at top, #14396d 0%, #0a1628 60%, #050b16 100%);
            color: #ffffff;
            font-family: Arial, sans-serif;
          }

          body {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .splash {
            text-align: center;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .splash h1 {
            font-size: 22px;
            margin: 0 0 12px;
          }

          .splash p {
            margin: 0;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="splash">
          <h1>Loading kiosk...</h1>
          <p>Please wait while the system starts.</p>
        </div>
      </body>
    </html>
  `)}`);
  mainWindow.show();
  if (!isDevMode) {
    mainWindow.setFullScreen(true);
  }
}

async function loadAppWindow() {
  if (!mainWindow) return;
  await mainWindow.loadFile(path.join(getWebRootPath(), "index.html"));
  if (!process.env.ELECTRON_DEV_SERVER_URL) {
    mainWindow.setFullScreen(true);
  }
}

app.whenReady().then(async () => {
  const backendStartup = startBackendServer();

  await createWindow();

  try {
    await backendStartup;
    await waitForBackendReady();
    await loadAppWindow();
  } catch (error) {
    console.error(error);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  backendLoaded = false;
});
