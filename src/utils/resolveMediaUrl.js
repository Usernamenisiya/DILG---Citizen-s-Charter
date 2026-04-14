export function getElectronApiBaseUrl() {
  if (!window?.desktop?.isElectron) return "";
  return String(window.desktop.apiBaseUrl || "http://127.0.0.1:3333").replace(/\/+$/, "");
}

export function resolveMediaUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";

  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const apiBase = getElectronApiBaseUrl();

  if (value.startsWith("/uploads/") || value.startsWith("/api/")) {
    return apiBase ? `${apiBase}${value}` : value;
  }

  if (value.startsWith("uploads/") || value.startsWith("api/")) {
    return apiBase ? `${apiBase}/${value}` : `/${value}`;
  }

  return value;
}
