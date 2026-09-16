import type { CSSProperties } from 'react'
import type { PropertyConcept } from '../content/siteContent'
import { buildWhatsAppUrl } from '../content/siteContent'

export function PropertyCard({ property, index }: { property: PropertyConcept; index: number }) {
  return (
    <article
      className={`property property--${index + 1}`}
      data-reveal="property"
      style={{ '--reveal-delay': `${Math.min(index, 2) * 110}ms` } as CSSProperties}
    >
      <div className="property__image"><img src={property.image} alt={property.imageAlt} loading="lazy" /></div>
      <div className="property__meta"><span>{property.eyebrow}</span><span>0{index + 1}</span></div>
      <h3>{property.title}</h3>
      <p>{property.description}</p>
      <small>Conceito visual — conteúdo demonstrativo</small>
      <a href={buildWhatsAppUrl(`Olá, Ferreira! Quero conversar sobre um imóvel com perfil de ${property.category.toLowerCase()}.`)} target="_blank" rel="noreferrer">Conversar sobre este perfil <span>↗</span></a>
    </article>
  )
}
