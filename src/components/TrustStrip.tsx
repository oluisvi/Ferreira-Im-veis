const items = [
  ['⌂', 'Imóveis selecionados', 'Oportunidades organizadas para facilitar sua busca.'],
  ['◎', 'Atendimento direto', 'Conversa próxima com quem acompanha a negociação.'],
  ['◇', 'Busca orientada', 'Prioridades claras para reduzir ruído e ganhar tempo.'],
  ['⌖', 'Negociação acompanhada', 'Suporte do interesse até os próximos passos.'],
] as const

export function TrustStrip() {
  return <section className="trust-strip" aria-label="Diferenciais" data-reveal="line">{items.map(([icon, title, text]) => <article key={title}><i aria-hidden="true">{icon}</i><div><strong>{title}</strong><p>{text}</p></div></article>)}</section>
}
