import type { CSSProperties } from 'react'
import { CRECI } from '../content/siteContent'

export function About() {
  return (
    <section className="about" id="sobre">
      <div className="about__portrait" data-reveal="from-left">
        <img src="/ferreira-imoveis.jpg" alt="Marca Ferreira Corretor de Imóveis" loading="lazy" />
        <span>Identidade original Ferreira</span>
      </div>
      <div className="about__copy">
        <span className="section-kicker" data-reveal="rise">03 · Atendimento pessoal</span>
        <h2 data-reveal="rise" style={{ '--reveal-delay': '80ms' } as CSSProperties}>Uma negociação importante pede <em>presença de verdade.</em></h2>
        <p className="about__lead" data-reveal="rise" style={{ '--reveal-delay': '160ms' } as CSSProperties}>Ferreira acompanha a busca de perto: ouvindo o que importa, organizando possibilidades e ajudando cada decisão a acontecer com mais clareza.</p>
        <div className="about__proof" data-reveal="line" style={{ '--reveal-delay': '230ms' } as CSSProperties}><strong>CRECI</strong><span>{CRECI}</span><p>Registro profissional confirmado</p></div>
      </div>
    </section>
  )
}
