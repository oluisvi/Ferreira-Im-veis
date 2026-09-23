import { Footer } from '../components/Footer'
import { Header } from '../components/Header'

export function NotFoundPage() {
  return <><Header variant="solid" /><main id="conteudo" className="property-not-found"><span>404</span><h1>Essa página não existe.</h1><p>Volte para o catálogo ou para a página inicial da Ferreira Corretor de Imóveis.</p><div><a className="button button--dark" href="/imoveis">Ver imóveis</a> <a className="text-link text-link--dark" href="/">Ir para o início</a></div></main><Footer /></>
}
