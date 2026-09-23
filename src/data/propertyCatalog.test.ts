import { describe, expect, it } from 'vitest'
import { emptyFilters, fallbackProperties, filterProperties, filtersFromSearchParams, formatCurrency, getPropertyRoute } from './propertyCatalog'

describe('property catalog utilities', () => {

  it('uses only active examples from docs/google-sheets as fallback', () => {
    expect(fallbackProperties.map((property) => property.code)).toEqual(['FI-001', 'FI-002'])
    expect(fallbackProperties.some((property) => property.code === 'FI-003')).toBe(false)
  })
  it('filters by city, purpose and price', () => {
    const result = filterProperties(fallbackProperties, { ...emptyFilters, city: 'Jacareí', purpose: 'Venda', maxPrice: '900000' })
    expect(result.map((property) => property.code)).toEqual(['FI-001'])
  })
  it('reads hero search query params', () => {
    expect(filtersFromSearchParams('?purpose=Venda&type=Casa&city=Jacare%C3%AD&maxPrice=900000')).toMatchObject({ purpose: 'Venda', type: 'Casa', city: 'Jacareí', maxPrice: '900000' })
  })
  it('formats currency and builds property route', () => {
    expect(formatCurrency(850000)).toContain('850.000')
    expect(getPropertyRoute(fallbackProperties[0])).toBe('/imovel/FI-001')
  })
})
