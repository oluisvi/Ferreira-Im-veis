import { PropertyCard } from './PropertyCard'
import { useProperties } from '../hooks/useProperties'

export function PropertyDiscovery() {
  const { properties, source } = useProperties()
  const highlighted = [...properties].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4)

  return (
    <section className="properties" id="imoveis">
      <header className="section-heading" data-reveal="rise">
        <div><span className="section-kicker">Destaques</span><h2>Imóveis em <em>destaque.</em></h2></div>
        <a className="outline-link" href="/imoveis">Ver todos os imóveis <span>→</span></a>
      </header>
      <div className="property-grid">{highlighted.map((property, index) => <PropertyCard property={property} index={index} key={property.code} />)}</div>
      {source === 'fallback' && <div className="demo-note" data-reveal="line"><strong>Prévia demonstrativa</strong><span>O catálogo oficial pode ser conectado ao Google Sheets sem alterar esta experiência.</span></div>}
    </section>
  )
}
