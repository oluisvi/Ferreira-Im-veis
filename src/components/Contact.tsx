import { buildWhatsAppUrl, WHATSAPP_NUMBER_DISPLAY } from '../content/siteContent'

export function Contact() {
  return (
    <section className="contact" id="contato">
      <div className="contact__roof" aria-hidden="true"><i /><i /></div>
      <span className="section-kicker">05 · Vamos conversar</span>
      <h2>Qual é o lugar que<br />você quer <em>chamar de seu?</em></h2>
      <p>Conte o que você está buscando. A conversa é direta, pessoal e começa sem compromisso.</p>
      <a className="button button--light" href={buildWhatsAppUrl('Olá, Ferreira! Quero começar uma busca por imóvel.')} target="_blank" rel="noreferrer">Chamar no WhatsApp <span>↗</span></a>
      <a className="contact__phone" href={buildWhatsAppUrl('Olá, Ferreira! Quero começar uma busca por imóvel.')} target="_blank" rel="noreferrer">{WHATSAPP_NUMBER_DISPLAY}</a>
    </section>
  )
}
