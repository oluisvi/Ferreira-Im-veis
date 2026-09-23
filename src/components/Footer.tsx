import { BrandMark } from './BrandMark'
import { CRECI, WHATSAPP_NUMBER_DISPLAY, buildWhatsAppUrl } from '../content/siteContent'

export function Footer() {
  return (
    <footer className="footer" data-reveal="rise">
      <div className="footer__brand">
        <BrandMark />
        <p>Curadoria e atendimento direto para compra e locação de imóveis, com acompanhamento do primeiro contato à negociação.</p>
        <span className="footer__creci">CRECI {CRECI}</span>
      </div>
      <div className="footer__social">
        <strong>Redes e contato</strong>
        <a href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a>
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" title="Adicionar o perfil oficial da Ferreira">Instagram <span>↗</span></a>
        <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" title="Adicionar o perfil oficial da Ferreira">Facebook <span>↗</span></a>
      </div>
      <div className="footer__contact">
        <strong>Atendimento</strong>
        <a href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer">{WHATSAPP_NUMBER_DISPLAY} ↗</a>
        <span>Atendimento direto pelo corretor</span>
        <a className="footer__catalog" href="/imoveis">Ver catálogo de imóveis →</a>
      </div>
      <div className="footer__bottom">
        <small>© {new Date().getFullYear()} Ferreira Corretor de Imóveis · CRECI {CRECI}. Todos os direitos reservados.</small>
        <small>Compra, venda e locação de imóveis com atendimento personalizado.</small>
      </div>
    </footer>
  )
}
