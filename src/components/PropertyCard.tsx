import type { PropertyItem } from '../content/siteContent'
import { buildWhatsAppUrl } from '../content/siteContent'
import { trackWhatsAppClick } from '../analytics/tracker'

export function PropertyCard({ property, index }: { property: PropertyItem; index: number }) {
  const isConcept = property.isConcept === true
  const details = isConcept ? '' : [property.price, property.location].filter(Boolean).join(' · ')
  const specs = isConcept ? '' : [property.area, property.bedrooms && `${property.bedrooms} quartos`, property.bathrooms && `${property.bathrooms} banheiros`, property.parking && `${property.parking} vagas`].filter(Boolean).join(' · ')
  const message = property.isConcept
    ? `Olá, Ferreira! Quero conversar sobre um imóvel com perfil de ${property.category.toLowerCase()}.`
    : `Olá, Ferreira! Quero conversar sobre o imóvel: ${property.title}.`

  return (
    <article className={`property property--${index + 1}`}>
      <div className="property__image"><img src={property.image} alt={property.imageAlt} loading="lazy" /></div>
      <div className="property__meta"><span>{property.eyebrow}</span><span>0{index + 1}</span></div>
      <h3>{property.title}</h3>
      {details && <strong>{details}</strong>}
      <p>{property.description}</p>
      <small>{isConcept ? 'Conceito visual — conteúdo demonstrativo' : specs || 'Imóvel disponível para consulta'}</small>
      <a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick('home_property_card', { propertyType: property.category })}>{isConcept ? 'Conversar sobre este perfil' : 'Conversar sobre este imóvel'} <span>↗</span></a>
    </article>
  )
}
