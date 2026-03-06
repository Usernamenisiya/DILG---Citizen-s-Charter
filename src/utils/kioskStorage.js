const KIOSK_STORAGE_KEY = "dilg_kiosk_v1";

export function loadData(fallbackData) {
  try {
    const raw = localStorage.getItem(KIOSK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(fallbackData));
  } catch {
    return JSON.parse(JSON.stringify(fallbackData));
  }
}

export function saveData(data) {
  try {
    localStorage.setItem(KIOSK_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors in kiosk mode.
  }
}
