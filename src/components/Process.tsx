import { processSteps } from '../content/siteContent'

export function Process() {
  return (
    <section className="process">
      <header><span className="section-kicker">04 · A jornada</span><h2>Do primeiro desejo<br />à <em>chave na mão.</em></h2></header>
      <div className="process__list">{processSteps.map(([number, title, description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p><i aria-hidden="true">↘</i></article>)}</div>
    </section>
  )
}
