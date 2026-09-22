import type { CSSProperties } from 'react'
import {
  buildPropertyWhatsAppUrl,
  formatArea,
  formatCurrency,
  getPropertyLocation,
  getPropertyRoute,
  type Property,
} from '../data/propertyCatalog'

export function PropertyCard({ property, index }: { property: Property; index: number }) {
  return (
    <article
      className={`property property--${index + 1}`}
      data-reveal="property"
      data-testid="property-card"
      style={{ '--reveal-delay': `${Math.min(index, 2) * 110}ms` } as CSSProperties}
    >
      <a className="property__image" href={getPropertyRoute(property)} aria-label={`Ver ${property.title}`}>
        <img src={property.mainImage} alt={property.title} loading="lazy" decoding="async" />
        {property.featured && <span className="property__badge">Destaque</span>}
      </a>
      <div className="property__meta"><span>{property.type} · {property.purpose}</span><span>{property.code}</span></div>
      <h3><a href={getPropertyRoute(property)}>{property.title}</a></h3>
      <p className="property__location">{getPropertyLocation(property)}</p>
      <strong className="property__price">{formatCurrency(property.price)}</strong>
      <div className="property__facts" aria-label="Características do imóvel">
        {formatArea(property.area) && <span>{formatArea(property.area)}</span>}
        {property.bedrooms !== null && <span>{property.bedrooms} quartos</span>}
        {property.parkingSpaces !== null && <span>{property.parkingSpaces} vagas</span>}
      </div>
      <div className="property__actions">
        <a href={getPropertyRoute(property)}>Ver imóvel <span>→</span></a>
        <a href={buildPropertyWhatsAppUrl(property)} target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a>
      </div>
    </article>
  )
}
