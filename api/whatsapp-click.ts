type AnalyticsPayload = {
  source?: unknown
  path?: unknown
  occurredAt?: unknown
  propertyId?: unknown
  propertyType?: unknown
  city?: unknown
  neighborhood?: unknown
}

function cleanText(value: unknown, maxLength = 160) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  const scriptUrl = process.env.PROPERTIES_SCRIPT_URL || process.env.VITE_PROPERTIES_SCRIPT_URL
  if (!scriptUrl) {
    return response.status(503).json({ error: 'Rastreamento de WhatsApp não configurado.', code: 'SCRIPT_NOT_CONFIGURED' })
  }

  const body = (request.body || {}) as AnalyticsPayload
  const source = cleanText(body.source, 80)
  const path = cleanText(body.path, 240)

  if (!source) {
    return response.status(400).json({ error: 'Origem do clique não informada.', code: 'INVALID_WHATSAPP_EVENT' })
  }

  const payload = {
    action: 'whatsapp_click',
    occurredAt: cleanText(body.occurredAt, 64) || new Date().toISOString(),
    source,
    path,
    propertyId: cleanText(body.propertyId, 80),
    propertyType: cleanText(body.propertyType, 80),
    city: cleanText(body.city, 100),
    neighborhood: cleanText(body.neighborhood, 100),
  }

  try {
    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    })

    if (!upstream.ok) throw new Error(`Google Apps Script respondeu ${upstream.status}`)
    return response.status(202).json({ ok: true })
  } catch (error) {
    console.error('Falha ao registrar clique de WhatsApp:', error)
    return response.status(502).json({ error: 'Não foi possível registrar o clique agora.', code: 'WHATSAPP_TRACK_FAILED' })
  }
}
