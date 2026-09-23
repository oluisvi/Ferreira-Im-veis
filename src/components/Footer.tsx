import { BrandMark } from './BrandMark'
import { CRECI, WHATSAPP_NUMBER_DISPLAY, buildWhatsAppUrl, navigation } from '../content/siteContent'

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__brand"><BrandMark /><p>Conectando pessoas a novos começos.<br />CRECI {CRECI}</p></div>
      <div className="footer__links"><strong>Links</strong>{navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</div>
      <div className="footer__contact"><strong>Fale conosco</strong><a href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer">WhatsApp · {WHATSAPP_NUMBER_DISPLAY} ↗</a><span>Atendimento direto</span></div>
      <div className="footer__bottom"><small>© {new Date().getFullYear()} Ferreira Corretor de Imóveis. Todos os direitos reservados.</small><a href="/#inicio">Voltar ao início ↑</a></div>
    </footer>
  )
}
