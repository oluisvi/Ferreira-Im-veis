import { buildPropertyWhatsAppUrl, formatArea, formatCurrency, getPropertyLocation, getPropertyRoute, type Property } from '../data/propertyCatalog'
import { trackWhatsAppClick } from '../analytics/tracker'

export function CatalogPropertyCard({ property }: { property: Property }) {
  return (
    <article className="catalog-card" data-reveal="rise">
      <a className="catalog-card__media" href={getPropertyRoute(property)}>
        <img src={property.mainImage} alt={property.title} loading="lazy" decoding="async" />
        <span className="catalog-card__code">{property.code}</span>
        {property.featured && <span className="catalog-card__featured">Destaque</span>}
        <span className="catalog-card__purpose">{property.purpose}</span>
      </a>
      <div className="catalog-card__body">
        <p className="catalog-card__location">⌖ {getPropertyLocation(property)}</p>
        <h2><a href={getPropertyRoute(property)}>{property.title}</a></h2>
        <div className="catalog-card__facts">{formatArea(property.area) && <span>{formatArea(property.area)}</span>}{property.bedrooms !== null && <span>{property.bedrooms} quartos</span>}{property.bathrooms !== null && <span>{property.bathrooms} banheiros</span>}{property.parkingSpaces !== null && <span>{property.parkingSpaces} vagas</span>}</div>
        <strong className="catalog-card__price">{formatCurrency(property.price)}</strong>
        <div className="catalog-card__actions"><a className="catalog-card__contact" href={buildPropertyWhatsAppUrl(property)} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick('property_card', { propertyId: property.code, propertyType: property.type, city: property.city, neighborhood: property.neighborhood })}>Conversar sobre este imóvel <span>↗</span></a></div>
      </div>
    </article>
  )
}
