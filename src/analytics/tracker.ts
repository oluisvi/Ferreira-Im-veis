import { track } from '@vercel/analytics'
import { identifyClarityEvent } from './clarity'
import type { AnalyticsEvent, AnalyticsProperties } from './types'
const clean = (properties: AnalyticsProperties = {}) => Object.fromEntries(Object.entries(properties).filter(([, value]) => value !== undefined && value !== null && value !== ''))
export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  const safe = clean(properties)
  try { track(event, safe) } catch { /* tracking never blocks the site */ }
  try { identifyClarityEvent(event, safe as Record<string, string | number | boolean>) } catch { /* Clarity is optional */ }
}
export function trackWhatsAppClick(source: string, properties?: AnalyticsProperties) { trackEvent('whatsapp_click', { ...properties, source }) }
