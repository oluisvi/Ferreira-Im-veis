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
    }

    const upstream = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(request.method === 'DELETE' ? { ...payload, action: 'delete_property' } : payload),
    })

    const result = await upstream.json().catch(() => null)
    if (!upstream.ok) throw new Error(`Google Apps Script respondeu ${upstream.status}`)
    if (!result || result.ok !== true) {
      throw new Error(result?.error || 'Google Apps Script não confirmou a operação.')
    }

    if (request.method === 'DELETE') {
      const checkUrl = new URL(scriptUrl)
      checkUrl.searchParams.set('action', 'property-check')
      checkUrl.searchParams.set('code', String(payload.code))
      const checkResponse = await fetch(checkUrl, { redirect: 'follow' })
      const check = await checkResponse.json().catch(() => null)
      if (!checkResponse.ok || check?.ok !== true || typeof check.exists !== 'boolean') {
        throw new Error('O Apps Script publicado está desatualizado. Publique a versão nova antes de excluir imóveis.')
      }
      if (check.exists) {
        throw new Error('A planilha ainda encontrou o imóvel depois da exclusão.')
      }
    }

    if (request.method === 'DELETE' && media.length) {
      const cleanup = await Promise.allSettled(media.map((url: string) => del(url)))
      const failed = cleanup.filter((item) => item.status === 'rejected').length
      return response.status(200).json({
        ok: true,
        deleted: payload.code,
        mediaRequested: media.length,
        mediaDeleted: media.length - failed,
        mediaCleanupErrors: failed,
      })
    }

    return response.status(201).json({ ok: true, ...(result || {}) })
  } catch (error) {
    console.error('Falha ao salvar imóvel:', error)
    return response.status(502).json({ error: 'Não foi possível salvar o imóvel agora.', code: 'PROPERTY_SAVE_FAILED' })
  }
}
