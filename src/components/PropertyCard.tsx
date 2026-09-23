import type { CSSProperties } from 'react'
import { buildPropertyWhatsAppUrl, formatArea, formatCurrency, getPropertyLocation, getPropertyRoute, type Property } from '../data/propertyCatalog'

export function PropertyCard({ property, index }: { property: Property; index: number }) {
  return (
    <article className="property-card" data-reveal="property" data-testid="property-card" style={{ '--reveal-delay': `${Math.min(index, 3) * 90}ms` } as CSSProperties}>
      <a className="property-card__media" href={getPropertyRoute(property)} aria-label={`Ver ${property.title}`}>
        <img src={property.mainImage} alt={property.title} loading="lazy" decoding="async" />
        <span className="property-card__purpose">{property.purpose}</span>
        {property.featured && <span className="property-card__featured">Destaque</span>}
      </a>
      <div className="property-card__body">
        <p className="property-card__location">⌖ {getPropertyLocation(property)}</p>
        <h3><a href={getPropertyRoute(property)}>{property.title}</a></h3>
        <div className="property-card__facts">
          {property.bedrooms !== null && <span>{property.bedrooms} quartos</span>}
          {property.bathrooms !== null && <span>{property.bathrooms} banheiros</span>}
          {formatArea(property.area) && <span>{formatArea(property.area)}</span>}
        </div>
        <strong className="property-card__price">{formatCurrency(property.price)}</strong>
        <div className="property-card__actions"><a href={getPropertyRoute(property)}>Ver detalhes <span>→</span></a><a href={buildPropertyWhatsAppUrl(property)} target="_blank" rel="noreferrer">WhatsApp ↗</a></div>
      </div>
    </article>
  )
}
