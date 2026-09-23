import { buildWhatsAppUrl, CRECI } from '../content/siteContent'
import { ArchitecturalFrame } from './ArchitecturalFrame'
import { QuickPropertySearch } from './QuickPropertySearch'

export function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="hero__visual">
        <img
          data-hero-image="critical"
          src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=2000&q=88"
          alt="Arquitetura residencial contemporânea"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <ArchitecturalFrame />
      </div>
      <div className="hero__content">
        <span className="hero__kicker">Seu próximo endereço começa aqui · CRECI {CRECI}</span>
        <h1>Encontre o <em>imóvel ideal</em> para a sua próxima fase.</h1>
        <p>Explore oportunidades selecionadas e conte com atendimento direto para encontrar o que realmente combina com você.</p>
        <div className="hero__actions">
          <a className="button button--accent" href="/imoveis">Ver imóveis <span>→</span></a>
          <a className="text-link text-link--light" href={buildWhatsAppUrl('Olá, Ferreira! Quero ajuda para encontrar um imóvel.')} target="_blank" rel="noreferrer">Falar com o corretor ↗</a>
        </div>
      </div>
      <div className="hero__message" data-reveal="rise"><span>Mais que anúncios.</span><strong>Decisões acompanhadas de perto.</strong></div>
      <div className="hero__search"><QuickPropertySearch /></div>
    </section>
  )
}
