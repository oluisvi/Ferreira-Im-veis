import { CRECI } from '../content/siteContent'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand ${compact ? 'brand--compact' : ''}`}>
      <span className="brand__symbol" aria-hidden="true">
        <img src="/ferreira-logo-mark.svg" alt="" />
      </span>
      <span className="brand__type">
        <strong>Ferreira</strong>
        <small>Corretor de Imóveis · CRECI {CRECI}</small>
      </span>
    </span>
  )
}
