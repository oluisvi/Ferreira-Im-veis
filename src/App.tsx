import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { PropertyDiscovery } from './components/PropertyDiscovery'
import { About } from './components/About'
import { Process } from './components/Process'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { IntroPortal } from './components/IntroPortal'

export default function App() {
  return <><IntroPortal /><Header /><main id="conteudo"><Hero /><PropertyDiscovery /><About /><Process /><Contact /></main><Footer /></>
}
