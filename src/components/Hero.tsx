import { buildWhatsAppUrl, CRECI } from '../content/siteContent'
import { ArchitecturalFrame } from './ArchitecturalFrame'

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero__eyebrow"><span>Curadoria imobiliária pessoal</span><span>CRECI {CRECI}</span></div>
      <div className="hero__title"><h1>Espaços para a próxima parte da <em>sua história.</em></h1></div>
      <div className="hero__visual">
        <ArchitecturalFrame />
        <img
          data-hero-image="critical"
          src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=88"
          alt="Arquitetura residencial contemporânea, imagem ilustrativa"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <span className="hero__image-note">Imagem de ambientação</span>
      </div>
      <div className="hero__aside">
        <p>Encontrar um imóvel é reconhecer o lugar onde a vida pode acontecer. A busca começa pela sua história.</p>
        <div className="hero__actions">
          <a className="button button--dark" href="#imoveis">Encontrar um imóvel <span>↓</span></a>
          <a className="text-link" href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer">Falar no WhatsApp ↗</a>
        </div>
      </div>
      <div className="hero__index" aria-hidden="true">01 <span /> 05</div>
    </section>
  )
}
