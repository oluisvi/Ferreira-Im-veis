import type { PropertyItem } from '../content/siteContent'
import { buildWhatsAppUrl } from '../content/siteContent'
import { trackWhatsAppClick } from '../analytics/tracker'

function formatCardPrice(value?: string) {
  if (!value) return ''
  if (!/\d/.test(value)) return value.trim()

  const raw = value.trim().replace(/[^0-9,.-]/g, '')
  if (!raw) return `R$ ${value.trim()}`

  let normalized = raw
  if (raw.includes(',')) normalized = raw.replace(/\./g, '').replace(',', '.')
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) normalized = raw.replace(/\./g, '')

  const amount = Number(normalized)
  if (!Number.isFinite(amount)) return `R$ ${value.trim()}`
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(amount)
}

export function PropertyCard({ property, index }: { property: PropertyItem; index: number }) {
  const isConcept = property.isConcept === true
  const price = isConcept ? '' : formatCardPrice(property.price)
  const specs = isConcept ? '' : [property.area, property.bedrooms && `${property.bedrooms} quartos`, property.bathrooms && `${property.bathrooms} banheiros`, property.parking && `${property.parking} vagas`].filter(Boolean).join(' · ')
  const message = property.isConcept
    ? `Olá, Ferreira! Quero conversar sobre um imóvel com perfil de ${property.category.toLowerCase()}.`
    : `Olá, Ferreira! Quero conversar sobre o imóvel: ${property.title}.`

  return (
    <article className={`property property--${index + 1}`}>
      <div className="property__image"><img src={property.image} alt={property.imageAlt} loading="lazy" /></div>
      <div className="property__meta"><span>{property.eyebrow}</span><span>0{index + 1}</span></div>
      <h3>{property.title}</h3>
      {!isConcept && (price || property.location) && <div className="property__details">{price && <strong className="property__price">{price}</strong>}{property.location && <span className="property__location">{property.location}</span>}</div>}
      <p>{property.description}</p>
      <small>{isConcept ? 'Conceito visual — conteúdo demonstrativo' : specs || 'Imóvel disponível para consulta'}</small>
      <a href={buildWhatsAppUrl(message)} target="_blank" rel="noreferrer" onClick={() => trackWhatsAppClick('home_property_card', { propertyType: property.category })}>{isConcept ? 'Conversar sobre este perfil' : 'Conversar sobre este imóvel'} <span>↗</span></a>
    </article>
  )
}
