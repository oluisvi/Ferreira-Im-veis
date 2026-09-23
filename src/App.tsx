import { About } from './components/About'
import { Contact } from './components/Contact'
import { FloatingWhatsApp } from './components/FloatingWhatsApp'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { IntroPortal } from './components/IntroPortal'
import { Process } from './components/Process'
import { PropertyDiscovery } from './components/PropertyDiscovery'
import { ScrollMotion } from './components/ScrollMotion'
import { TrustStrip } from './components/TrustStrip'
import { NotFoundPage } from './pages/NotFoundPage'
import { PropertiesPage } from './pages/PropertiesPage'
import { PropertyDetailPage } from './pages/PropertyDetailPage'

function HomePage() {
  return <><IntroPortal /><Header /><main id="conteudo"><Hero /><TrustStrip /><PropertyDiscovery /><About /><Process /><Contact /></main><FloatingWhatsApp /><Footer /></>
}
function cleanPathname(pathname: string) { if (pathname === '/') return '/'; return pathname.replace(/\/+$/, '') || '/' }
export default function App() {
  const pathname = cleanPathname(window.location.pathname)
  const propertyMatch = pathname.match(/^\/imovel\/([^/]+)$/)
  return <><ScrollMotion />{pathname === '/' && <HomePage />}{pathname === '/imoveis' && <PropertiesPage />}{propertyMatch && <PropertyDetailPage code={decodeURIComponent(propertyMatch[1])} />}{pathname !== '/' && pathname !== '/imoveis' && !propertyMatch && <NotFoundPage />}</>
}
