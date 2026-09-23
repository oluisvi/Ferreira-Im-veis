import { buildWhatsAppUrl } from '../content/siteContent'

export function FloatingWhatsApp() {
  return (
    <a className="floating-whatsapp is-visible" href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer" aria-label="Conversar com Ferreira pelo WhatsApp">
      <span className="floating-whatsapp__signal" aria-hidden="true"><i /></span>
      <span className="floating-whatsapp__copy"><small>Atendimento direto</small><strong>Falar no WhatsApp</strong></span>
      <span className="floating-whatsapp__arrow" aria-hidden="true">↗</span>
    </a>
  )
}
