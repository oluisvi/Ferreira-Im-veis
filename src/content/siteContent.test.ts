import { describe, expect, it } from 'vitest'
import { CRECI, propertyConcepts, WHATSAPP_URL } from './siteContent'

describe('site content contract', () => {
  it('uses the confirmed professional contact details', () => {
    expect(CRECI).toBe('133794-F')
    expect(WHATSAPP_URL).toBe('https://wa.me/5512997665886')
  })

  it('never presents prototype properties as real inventory', () => {
    expect(propertyConcepts.length).toBeGreaterThan(0)
    expect(propertyConcepts.every((property) => property.isConcept)).toBe(true)
  })
})
