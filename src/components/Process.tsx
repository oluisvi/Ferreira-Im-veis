import type { CSSProperties } from 'react'
import { processSteps } from '../content/siteContent'

export function Process() {
  return (
    <section className="process">
      <header data-reveal="rise"><span className="section-kicker">04 · A jornada</span><h2>Do primeiro desejo<br />à <em>chave na mão.</em></h2></header>
      <div className="process__list">{processSteps.map(([number, title, description], index) => <article data-reveal="row" style={{ '--reveal-delay': `${index * 85}ms` } as CSSProperties} key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p><i aria-hidden="true">↘</i></article>)}</div>
    </section>
  )
}
