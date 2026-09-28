import { About } from '../components/About'
import { Contact } from '../components/Contact'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
import { Process } from '../components/Process'
import { PropertyDiscovery } from '../components/PropertyDiscovery'
import { PublicShell } from '../components/PublicShell'
import '../styles/hero.css'
import '../styles/properties.css'

function HomePage() {
  return <><Header /><main id="conteudo"><Hero /><PropertyDiscovery /><About /><Process /><Contact /></main><Footer /></>
}

export function HomeRoute() {
  return <PublicShell><HomePage /></PublicShell>
}
