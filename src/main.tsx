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

const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      // Remove o antigo service worker global: o site público deve permanecer um site normal.
      await Promise.all(registrations.filter((registration) => new URL(registration.scope).pathname === '/').map((registration) => registration.unregister()))

      if (!isAdminRoute) return

      const manifest = document.createElement('link')
      manifest.rel = 'manifest'
      manifest.href = '/admin-manifest.json'
      document.head.appendChild(manifest)

      for (const [name, content] of [['mobile-web-app-capable', 'yes'], ['apple-mobile-web-app-capable', 'yes']]) {
        const meta = document.createElement('meta')
        meta.name = name
        meta.content = content
        document.head.appendChild(meta)
      }

      await navigator.serviceWorker.register('/sw.js', { scope: '/admin' })
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <><AnalyticsProvider /><App /></>
  </StrictMode>,
)
