import type { ReactNode } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { PropertyDiscovery } from './components/PropertyDiscovery'
import { About } from './components/About'
import { Process } from './components/Process'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { IntroPortal } from './components/IntroPortal'
import { Admin } from './components/Admin'
import { PropertiesPage } from './pages/PropertiesPage'
import { PropertyDetailPage } from './pages/PropertyDetailPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'
import { BackToTop } from './components/BackToTop'
import { ScrollMotion } from './components/ScrollMotion'

function PublicShell({ children }: { children: ReactNode }) {
  return <><IntroPortal /><ScrollMotion />{children}<FloatingWhatsApp /><BackToTop /></>
}

function HomePage() {
  return <><Header /><main id="conteudo"><Hero /><PropertyDiscovery /><About /><Process /><Contact /></main><Footer /></>
}

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/admin') return <Admin />
  if (path === '/') return <PublicShell><HomePage /></PublicShell>
  if (path === '/imoveis') return <PublicShell><PropertiesPage /></PublicShell>
  if (path.startsWith('/imoveis/') || path.startsWith('/imovel/')) {
    const prefix = path.startsWith('/imoveis/') ? '/imoveis/' : '/imovel/'
    const code = decodeURIComponent(path.slice(prefix.length))
    return <PublicShell><PropertyDetailPage code={code} /></PublicShell>
  }
  return <PublicShell><NotFoundPage /></PublicShell>
}
