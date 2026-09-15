import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { PropertyDiscovery } from './components/PropertyDiscovery'
import { About } from './components/About'
import { Process } from './components/Process'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'

export default function App() {
  return <><Header /><main id="conteudo"><Hero /><PropertyDiscovery /><About /><Process /><Contact /></main><Footer /></>
}
