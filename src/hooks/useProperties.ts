import { useEffect, useState } from 'react'
import { fallbackProperties, loadProperties, type CatalogSource, type Property } from '../data/propertyCatalog'

type PropertyState = { properties: Property[]; source: CatalogSource; loading: boolean }

export function useProperties() {
  const [state, setState] = useState<PropertyState>({ properties: fallbackProperties, source: 'fallback', loading: true })
  useEffect(() => {
    let cancelled = false
    void loadProperties().then((result) => {
      if (!cancelled) setState({ properties: result.properties, source: result.source, loading: false })
    })
    return () => { cancelled = true }
  }, [])
  return state
}
