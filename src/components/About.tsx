import type { CSSProperties } from 'react'
import { CRECI } from '../content/siteContent'

export function About() {
  return (
    <section className="about" id="sobre">
      <div className="about__image" data-reveal="from-left">
        <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=88" alt="Interior residencial contemporâneo" loading="lazy" />
        <span>Imóveis que combinam com os seus planos.</span>
      </div>
      <div className="about__copy">
        <span className="section-kicker" data-reveal="rise">Sobre a Ferreira Corretor de Imóveis</span>
        <h2 data-reveal="rise" style={{ '--reveal-delay': '70ms' } as CSSProperties}>Atendimento próximo para decisões que pedem <em>confiança.</em></h2>
        <p className="about__lead" data-reveal="rise" style={{ '--reveal-delay': '130ms' } as CSSProperties}>Cada busca começa entendendo o momento, as prioridades e o que realmente faz sentido para você. A partir disso, a seleção fica mais objetiva e a negociação mais clara.</p>
        <div className="about__proof-grid" data-reveal="line" style={{ '--reveal-delay': '190ms' } as CSSProperties}>
          <div><strong>CRECI {CRECI}</strong><span>Registro profissional</span></div>
          <div><strong>Atendimento direto</strong><span>Conversa com o corretor</span></div>
          <div><strong>Curadoria pessoal</strong><span>Busca guiada pelo seu perfil</span></div>
        </div>
      </div>
    </section>
  )
}
