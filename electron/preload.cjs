const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("kioskDesktop", {
  isDesktop: true,
  apiOrigin: process.env.KIOSK_API_ORIGIN || "http://127.0.0.1:3333",
});
