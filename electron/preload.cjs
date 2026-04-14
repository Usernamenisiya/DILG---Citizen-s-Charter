const { contextBridge } = require("electron");

// Expose a minimal bridge for future desktop-only integrations.
contextBridge.exposeInMainWorld("desktop", {
  isElectron: true,
  apiBaseUrl: "http://127.0.0.1:3333",
});
