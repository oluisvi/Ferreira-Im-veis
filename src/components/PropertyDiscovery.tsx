import { useState, type CSSProperties } from 'react'
import { propertyConcepts, type PropertyCategory } from '../content/siteContent'
import { PropertyCard } from './PropertyCard'

type Filter = 'Todos' | PropertyCategory
const filters: Filter[] = ['Todos', 'Casa', 'Apartamento', 'Refúgio']

export function PropertyDiscovery() {
  const [active, setActive] = useState<Filter>('Todos')
  const visible = active === 'Todos' ? propertyConcepts : propertyConcepts.filter((item) => item.category === active)
  return (
    <section className="properties" id="imoveis">
      <header className="section-heading" data-reveal="rise">
        <div><span className="section-kicker">02 · Possibilidades</span><h2>Não é sobre procurar mais.<br /><em>É sobre encontrar melhor.</em></h2></div>
        <p>Enquanto o catálogo real é preparado, estes cenários mostram os perfis de imóveis que podem orientar uma busca personalizada.</p>
      </header>
      <div className="filterbar" aria-label="Filtrar conceitos de imóveis" data-reveal="line" style={{ '--reveal-delay': '90ms' } as CSSProperties}>
        <span>Explore por perfil</span>
        <div>{filters.map((filter) => <button type="button" className={filter === active ? 'is-active' : ''} aria-pressed={filter === active} onClick={() => setActive(filter)} key={filter}>{filter}</button>)}</div>
        <output>{String(visible.length).padStart(2, '0')} cenários</output>
      </div>
      <div className="property-grid">{visible.map((property, index) => <PropertyCard property={property} index={index} key={property.id} />)}</div>
    </section>
  )
}
