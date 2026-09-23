import type { CSSProperties } from 'react'
import { buildWhatsAppUrl } from '../content/siteContent'
import { trackWhatsAppClick } from '../analytics/tracker'

export function Contact() {
  return (
    <section className="contact" id="contato">
      <div className="contact__roof" aria-hidden="true" data-reveal="scale"><i /><i /><span /></div>
      <div className="contact__copy">
        <span className="section-kicker" data-reveal="rise">Atendimento personalizado</span>
        <h2 data-reveal="rise" style={{ '--reveal-delay': '60ms' } as CSSProperties}>Quer ajuda para encontrar o <em>imóvel certo?</em></h2>
        <p data-reveal="rise" style={{ '--reveal-delay': '120ms' } as CSSProperties}>Conte o que você procura e continue a conversa diretamente pelo WhatsApp.</p>
        <div className="contact__proofs" data-reveal="line" style={{ '--reveal-delay': '170ms' } as CSSProperties}><span>✓ Atendimento direto</span><span>✓ Conversa sem compromisso</span><span>✓ Busca personalizada</span></div>
      </div>
      <a className="button button--accent contact__cta" data-reveal="rise" style={{ '--reveal-delay': '210ms' } as CSSProperties} href={buildWhatsAppUrl('Olá, Ferreira! Quero ajuda para encontrar o imóvel certo.')} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick('contact')}>Falar no WhatsApp <span>↗</span></a>
    </section>
  )
}
