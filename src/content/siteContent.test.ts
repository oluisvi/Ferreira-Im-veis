import { describe, expect, it } from 'vitest'
import { BRAND_NAME, CRECI, navigation, WHATSAPP_URL } from './siteContent'

describe('site content contract', () => {
  it('uses the confirmed brand and professional contact details', () => {
    expect(BRAND_NAME).toBe('Ferreira Corretor de Imóveis')
    expect(CRECI).toBe('133794-F')
    expect(WHATSAPP_URL).toBe('https://wa.me/5512997665886')
  })
  it('exposes catalog and services navigation', () => {
    expect(navigation.some((item) => item.href === '/imoveis')).toBe(true)
    expect(navigation.some((item) => item.href === '/#servicos')).toBe(true)
  })
})
