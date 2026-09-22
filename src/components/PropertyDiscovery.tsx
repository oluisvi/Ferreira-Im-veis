import { useMemo, useState, type CSSProperties } from 'react'
import { PropertyCard } from './PropertyCard'
import { useProperties } from '../hooks/useProperties'

export function PropertyDiscovery() {
  const { properties, source } = useProperties()
  const types = useMemo(() => [...new Set(properties.map((property) => property.type).filter(Boolean))], [properties])
  const [active, setActive] = useState('Todos')
  const filtered = active === 'Todos' ? properties : properties.filter((property) => property.type === active)
  const highlighted = [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 3)

  return (
    <section className="properties" id="imoveis">
      <header className="section-heading" data-reveal="rise">
        <div><span className="section-kicker">02 · Imóveis disponíveis</span><h2>Escolha com contexto.<br /><em>Converse sem perder tempo.</em></h2></div>
        <p>Veja os imóveis ativos, abra a ficha completa e fale diretamente pelo WhatsApp quando encontrar algo que faça sentido.</p>
      </header>
      <div className="filterbar" aria-label="Filtrar imóveis em destaque" data-reveal="line" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
        <span>Explore por tipo</span>
        <div>
          {['Todos', ...types.slice(0, 4)].map((filter) => (
            <button type="button" className={filter === active ? 'is-active' : ''} aria-pressed={filter === active} onClick={() => setActive(filter)} key={filter}>{filter}</button>
          ))}
        </div>
        <output>{String(filtered.length).padStart(2, '0')} imóveis</output>
      </div>
      <div className="property-grid">{highlighted.map((property, index) => <PropertyCard property={property} index={index} key={property.code} />)}</div>
      <div className="properties__footer" data-reveal="rise">
        <div>
          <strong>{source === 'google-sheets' ? 'Catálogo conectado' : 'Prévia demonstrativa'}</strong>
          <span>{source === 'google-sheets' ? 'Os imóveis são atualizados pela planilha da Ferreira.' : 'Conecte a Google Sheet para substituir estes exemplos pelos imóveis reais.'}</span>
        </div>
        <a className="button button--dark" href="/imoveis">Ver catálogo completo <span>→</span></a>
      </div>
    </section>
  )
}
