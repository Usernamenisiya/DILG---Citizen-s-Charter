import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style/index.css'
import KioskApp from './KioskApp.jsx'

const isElectronApp = Boolean(window.desktop?.isElectron);
const API_BASE = isElectronApp
  ? String(window.desktop?.apiBaseUrl || 'http://127.0.0.1:3333').replace(/\/+$/, '')
  : '';

if (API_BASE) {
  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith('/api/')) {
      return nativeFetch(`${API_BASE}${input}`, init);
    }
    if (input instanceof URL && input.pathname.startsWith('/api/')) {
      return nativeFetch(`${API_BASE}${input.pathname}${input.search}`, init);
    }
    return nativeFetch(input, init);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KioskApp />
  </StrictMode>,
)
