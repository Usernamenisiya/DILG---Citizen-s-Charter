import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import KioskApp from './KioskApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <KioskApp />
  </StrictMode>,
)
