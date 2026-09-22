import { describe, expect, it } from 'vitest'
import { emptyFilters, fallbackProperties, filterProperties, formatCurrency, getPropertyRoute } from './propertyCatalog'

describe('property catalog utilities', () => {
  it('filters by city, purpose and price', () => {
    const result = filterProperties(fallbackProperties, {
      ...emptyFilters,
      city: 'Jacareí',
      purpose: 'Venda',
      maxPrice: '900000',
    })
    expect(result.map((property) => property.code)).toEqual(['FI-001'])
  })

  it('formats currency and builds the property route', () => {
    expect(formatCurrency(850000)).toContain('850.000')
    expect(getPropertyRoute(fallbackProperties[0])).toBe('/imovel/FI-001')
  })
})
