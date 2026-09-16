import type { CSSProperties } from 'react'
import { buildWhatsAppUrl, WHATSAPP_NUMBER_DISPLAY } from '../content/siteContent'

export function Contact() {
  return (
    <section className="contact" id="contato">
      <div className="contact__roof" aria-hidden="true" data-reveal="scale"><i /><i /></div>
      <span className="section-kicker" data-reveal="rise">05 · Vamos conversar</span>
      <h2 data-reveal="rise" style={{ '--reveal-delay': '70ms' } as CSSProperties}>Qual é o lugar que<br />você quer <em>chamar de seu?</em></h2>
      <p data-reveal="rise" style={{ '--reveal-delay': '140ms' } as CSSProperties}>Conte o que você está buscando. A conversa é direta, pessoal e começa sem compromisso.</p>
      <a className="button button--light contact__cta" data-reveal="rise" style={{ '--reveal-delay': '210ms' } as CSSProperties} href={buildWhatsAppUrl('Olá, Ferreira! Quero começar uma busca por imóvel.')} target="_blank" rel="noreferrer">Chamar no WhatsApp <span>↗</span></a>
      <a className="contact__phone" data-reveal="rise" style={{ '--reveal-delay': '270ms' } as CSSProperties} href={buildWhatsAppUrl('Olá, Ferreira! Quero começar uma busca por imóvel.')} target="_blank" rel="noreferrer">{WHATSAPP_NUMBER_DISPLAY}</a>
    </section>
  )
}
