export function getApiOrigin() {
  if (typeof window !== "undefined" && window.kioskDesktop?.apiOrigin) {
    return window.kioskDesktop.apiOrigin;
  }

  if (typeof window !== "undefined") {
    const protocol = String(window.location?.protocol || "").toLowerCase();
    const origin = String(window.location?.origin || "").trim();
    if ((protocol === "http:" || protocol === "https:") && origin && origin !== "null") {
      return origin;
    }
  }

  return "http://127.0.0.1:3333";
}

export function apiUrl(pathname) {
  const base = getApiOrigin();
  return base ? `${base}${pathname}` : pathname;
}

export function resolveMediaUrl(rawUrl) {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed) return "";
  if (/^(https?:)?\/\//i.test(trimmed) || /^blob:/i.test(trimmed) || /^data:/i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${getApiOrigin()}${trimmed}`;
  }
  if (/^uploads\//i.test(trimmed)) {
    return `${getApiOrigin()}/${trimmed}`;
  }
  return trimmed;
}
