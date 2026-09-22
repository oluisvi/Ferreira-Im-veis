import { describe, expect, it } from 'vitest'
import { CRECI, navigation, WHATSAPP_URL } from './siteContent'

describe('site content contract', () => {
  it('uses the confirmed professional contact details', () => {
    expect(CRECI).toBe('133794-F')
    expect(WHATSAPP_URL).toBe('https://wa.me/5512997665886')
  })

  it('exposes the catalog as a primary navigation destination', () => {
    expect(navigation.some((item) => item.href === '/imoveis')).toBe(true)
  })
})
