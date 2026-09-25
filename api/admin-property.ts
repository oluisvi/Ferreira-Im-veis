import { requireAdmin } from '../server/admin-auth.ts'
import { del } from '@vercel/blob'

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    response.setHeader('Allow', 'POST, DELETE')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  if (!requireAdmin(request, response)) return

  const scriptUrl = process.env.PROPERTIES_SCRIPT_URL || process.env.VITE_PROPERTIES_SCRIPT_URL
  if (!scriptUrl) {
    return response.status(503).json({ error: 'Configure PROPERTIES_SCRIPT_URL para salvar imóveis.', code: 'SCRIPT_NOT_CONFIGURED' })
  }

  try {
    const payload = request.body || {}
    const media = Array.isArray(payload.media)
      ? payload.media.filter((value: unknown): value is string => {
          if (typeof value !== 'string' || !value.startsWith('https://')) return false
          try { return new URL(value).hostname.endsWith('blob.vercel-storage.com') }
          catch { return false }
        })
      : []

    if (request.method === 'DELETE') {
      if (!payload.code || payload.confirmation !== true) {
        return response.status(400).json({ error: 'Confirmação de exclusão necessária.' })
      }
      if (media.length) await del(media)
    }

    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(request.method === 'DELETE' ? { ...payload, action: 'delete_property' } : payload),
    })

    if (!upstream.ok) throw new Error(`Google Apps Script respondeu ${upstream.status}`)
    return response.status(201).json({ ok: true })
  } catch (error) {
    console.error('Falha ao salvar imóvel:', error)
    return response.status(502).json({ error: 'Não foi possível salvar o imóvel agora.', code: 'PROPERTY_SAVE_FAILED' })
  }
}
