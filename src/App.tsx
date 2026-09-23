import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { PropertyDiscovery } from './components/PropertyDiscovery'
import { About } from './components/About'
import { Process } from './components/Process'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { IntroPortal } from './components/IntroPortal'
import { Admin } from './components/Admin'

export default function App() {
  if (window.location.pathname === '/admin') return <Admin />

  return <><IntroPortal /><Header /><main id="conteudo"><Hero /><PropertyDiscovery /><About /><Process /><Contact /></main><Footer /></>
}
