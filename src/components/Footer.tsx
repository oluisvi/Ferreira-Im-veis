import { BrandMark } from './BrandMark'
import { CRECI } from '../content/siteContent'

export function Footer() {
  return <footer><BrandMark /><p>Atendimento imobiliário pessoal<br />CRECI {CRECI}</p><a href="#inicio">Voltar ao início ↑</a><small>© {new Date().getFullYear()} Ferreira Imóveis</small></footer>
}
