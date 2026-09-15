import { CRECI } from '../content/siteContent'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? 'brand--compact' : ''}`}>
      <span className="brand__roof" aria-hidden="true"><i /><i /></span>
      <span className="brand__type"><strong>Ferreira</strong><small>Imóveis · CRECI {CRECI}</small></span>
    </span>
  )
}
