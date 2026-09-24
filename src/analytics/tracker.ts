import { track } from '@vercel/analytics'
import { identifyClarityEvent } from './clarity'
import type { AnalyticsEvent, AnalyticsProperties } from './types'

const clean = (properties: AnalyticsProperties = {}) => Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== ''))

function persistWhatsAppClick(source: string, properties?: AnalyticsProperties) {
  const safe = clean(properties)
  const payload = JSON.stringify({
    source,
    path: `${window.location.pathname}${window.location.search}`,
    occurredAt: new Date().toISOString(),
    propertyId: safe.propertyId,
    propertyType: safe.propertyType,
    city: safe.city,
    neighborhood: safe.neighborhood,
  })

  try {
    void fetch('/api/whatsapp-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => undefined)
  } catch {
    // First-party persistence is best effort and must never block navigation.
  }
}

export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  const safe = clean(properties)
  try { track(event, safe) } catch { /* tracking never blocks the site */ }
  try { identifyClarityEvent(event, safe as Record<string, string | number | boolean>) } catch { /* Clarity is optional */ }
}

export function trackWhatsAppClick(source: string, properties?: AnalyticsProperties) {
  trackEvent('whatsapp_click', { ...properties, source })
  persistWhatsAppClick(source, properties)
}
