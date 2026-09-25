import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AnalyticsProvider } from './analytics/AnalyticsProvider'
import './styles/tokens.css'
import './styles/global.css'
import './styles/hero.css'
import './styles/properties.css'
import './styles/catalog.css'
import './styles/content.css'
import './styles/motion.css'
import './styles/admin.css'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js') })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <><AnalyticsProvider /><App /></>
  </StrictMode>,
)
