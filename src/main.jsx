import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import KioskApp from './KioskApp.jsx'

const isElectronApp = Boolean(window.desktop?.isElectron);
const isPackagedDesktopRuntime = window.location.protocol === 'file:';
const API_BASE = (isElectronApp || isPackagedDesktopRuntime)
  ? String(window.desktop?.apiBaseUrl || 'http://127.0.0.1:3333').replace(/\/+$/, '')
  : '';

if (API_BASE) {
  const nativeFetch = window.fetch.bind(window);
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWithStartupRetry = async (url, init, attempts = 6) => {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await nativeFetch(url, init);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < attempts) {
          await sleep(250 * attempt);
        }
      }
    }
    throw lastError;
  };

  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return fetchWithStartupRetry(`${API_BASE}${input}`, init);
    }
    if (input instanceof URL && input.pathname.startsWith('/api/')) {
      return fetchWithStartupRetry(`${API_BASE}${input.pathname}${input.search}`, init);
    }
    return nativeFetch(input, init);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KioskApp />
  </StrictMode>,
)
