import { useEffect, useState } from 'react'
import { propertyConcepts, type PropertyCategory, type PropertyItem } from '../content/siteContent'
import { getProperties } from '../content/propertiesData'
import { PropertyCard } from './PropertyCard'

type Filter = 'Todos' | PropertyCategory
const filters: Filter[] = ['Todos', 'Casa', 'Apartamento', 'Refúgio']

export function PropertyDiscovery() {
  const [active, setActive] = useState<Filter>('Todos')
  const [properties, setProperties] = useState<PropertyItem[]>(propertyConcepts)
  const visible = active === 'Todos' ? properties : properties.filter((item) => item.category === active)

  useEffect(() => {
    let mounted = true
    getProperties().then((items) => {
      if (mounted) setProperties(items)
    })
    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="properties" id="imoveis">
      <header className="section-heading">
        <div><span className="section-kicker">02 · Possibilidades</span><h2>Não é sobre procurar mais.<br /><em>É sobre encontrar melhor.</em></h2></div>
        <p>Uma curadoria objetiva para transformar anúncios soltos em possibilidades claras de visita e negociação.</p>
      </header>
      <div className="filterbar" aria-label="Filtrar conceitos de imóveis">
        <span>Explore por perfil</span>
        <div>{filters.map((filter) => <button type="button" className={filter === active ? 'is-active' : ''} aria-pressed={filter === active} onClick={() => setActive(filter)} key={filter}>{filter}</button>)}</div>
        <output>{String(visible.length).padStart(2, '0')} imóveis</output>
      </div>
      <div className="property-grid">{visible.map((property, index) => <PropertyCard property={property} index={index} key={property.id} />)}</div>
    </section>
  )
}
