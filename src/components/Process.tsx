import type { CSSProperties } from 'react'
import { processSteps } from '../content/siteContent'

export function Process() {
  return (
    <section className="process" id="servicos">
      <header data-reveal="rise"><div><span className="section-kicker">Como funciona</span><h2>Da primeira conversa à <em>negociação.</em></h2></div><p>Um processo simples para transformar uma lista de anúncios em uma decisão mais clara.</p></header>
      <div className="process__grid">{processSteps.map(([number, title, description], index) => <article data-reveal="rise" style={{ '--reveal-delay': `${index * 80}ms` } as CSSProperties} key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p><i aria-hidden="true">↘</i></article>)}</div>
    </section>
  )
}
