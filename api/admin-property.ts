import { requireAdmin } from '../server/admin-auth.ts'
import { BlobAccessError, BlobNotFoundError, BlobServiceRateLimited, BlobStoreNotFoundError, del } from '@vercel/blob'

function mediaFailureHint(error: unknown): string {
  if (error instanceof BlobAccessError || error instanceof BlobStoreNotFoundError
    || (error instanceof Error && (error.message.includes('No blob credentials found') || error.message.includes('OIDC is enabled')))) {
    return 'O projeto não tem acesso ao armazenamento Blob dessas fotos. Em Storage > Blob > Projects, conecte o projeto ao armazenamento correto para Production.'
  }
  if (error instanceof BlobServiceRateLimited) return 'O Blob limitou as operações. Aguarde um minuto e tente novamente.'
  return 'Verifique o erro da função nos Logs da Vercel antes de tentar novamente.'
}

export function isBlobUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && /^[a-z0-9-]+\.(public|private)\.blob\.vercel-storage\.com$/.test(url.hostname)
  } catch { return false }
}

export function deletionStoreId(url: string, configuredStoreId = process.env.BLOB_STORE_ID): string {
  const urlStoreId = new URL(url).hostname.split('.')[0]
  if (!configuredStoreId) return urlStoreId
  const storeId = configuredStoreId.replace(/^store_/i, '')
  if (storeId.toLowerCase() !== urlStoreId) {
    throw new Error('As fotos pertencem a outro armazenamento Blob. Confira BLOB_STORE_ID em Production.')
  }
  return storeId
}

export default async function handler(request: any, response: any) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    response.setHeader('Allow', 'POST, DELETE')
    return response.status(405).json({ error: 'Método não permitido.' })
  }
  if (!requireAdmin(request, response)) return
  const deleting = request.method === 'DELETE'
  const scriptUrl = process.env.PROPERTIES_SCRIPT_URL || process.env.VITE_PROPERTIES_SCRIPT_URL
  if (!scriptUrl) return response.status(503).json({ error: 'Configure PROPERTIES_SCRIPT_URL.', code: 'SCRIPT_NOT_CONFIGURED' })

  async function callScript(payload: any) {
    const upstream = await fetch(scriptUrl!, {
      method: 'POST', redirect: 'follow', cache: 'no-store',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    })
    const result = await upstream.json().catch(() => null)
    if (!upstream.ok || result?.ok !== true) throw new Error(result?.error || 'O Apps Script não confirmou a operação.')
    return result
  }

  try {
    const payload = request.body || {}
    if (!deleting) {
      if (!['create_property', 'update_property'].includes(payload.action)) {
        return response.status(400).json({ error: 'Ação inválida.' })
      }
      return response.status(201).json(await callScript(payload))
    }
    const code = typeof payload.code === 'string' ? payload.code.trim() : ''
    if (!code || payload.confirmation !== true) {
      return response.status(400).json({ error: 'Código e confirmação de exclusão necessários.' })
    }
    // Scripts antigos tratam ações desconhecidas como cadastro: verificar antes do POST.
    const capabilityUrl = new URL(scriptUrl)
    capabilityUrl.searchParams.set('action', 'delete-capabilities')
    const capabilityResponse = await fetch(capabilityUrl, { redirect: 'follow', cache: 'no-store' })
    const capability = await capabilityResponse.json().catch(() => null)
    if (!capabilityResponse.ok || capability?.protocol !== 2) {
      throw new Error('Atualize e publique uma nova versão do Apps Script antes de excluir imóveis.')
    }
    // A planilha é a fonte das mídias; URLs do navegador nunca autorizam exclusões.
    const prepared = await callScript({ action: 'prepare_delete_property', code })
    if (prepared.protocol !== 2 || typeof prepared.token !== 'string' || !Array.isArray(prepared.media)
      || !prepared.media.every((url: unknown) => typeof url === 'string')) {
      throw new Error('Atualize e publique uma nova versão do Apps Script antes de excluir imóveis.')
    }
    const media: string[] = [...new Set<string>(prepared.media.filter(isBlobUrl))]
    const mediaStoreIds = media.map((url) => deletionStoreId(url))
    // Falhas mantêm as linhas e URLs na planilha para permitir uma nova tentativa.
    // O domínio é insensível a maiúsculas, mas o ID do Blob pode conter maiúsculas.
    // Usar o ID da conexão OIDC preserva a grafia exigida pela API do Blob.
    const cleanup = await Promise.allSettled(media.map(async (url, index) => {
      try {
        await del(url, { storeId: mediaStoreIds[index] })
      } catch (error) {
        // Uma tentativa anterior pode já ter removido este arquivo.
        if (!(error instanceof BlobNotFoundError)) throw error
      }
    }))
    const failures = cleanup.filter((item): item is PromiseRejectedResult => item.status === 'rejected')
    if (failures.length) {
      console.error('Falha ao excluir mídias no Blob:', failures.map(({ reason }) => ({
        type: reason instanceof Error ? reason.constructor.name : 'UnknownError',
        message: reason instanceof Error ? reason.message : String(reason),
      })))
      return response.status(502).json({
      ok: false, code: 'MEDIA_CLEANUP_PENDING',
        error: `${failures.length} mídia(s) não puderam ser excluídas. O registro foi mantido. ${mediaFailureHint(failures[0].reason)}`,
      })
    }
    const result = await callScript({ action: 'commit_delete_property', code, token: prepared.token, media: prepared.media })
    if (result.protocol !== 2 || result.exists !== false || result.deleted !== code.toLowerCase()) {
      throw new Error('A planilha não confirmou a exclusão completa. Tente novamente.')
    }
    return response.status(200).json({ ...result, mediaDeleted: media.length,
      externalMedia: prepared.media.filter((url: string) => !isBlobUrl(url)).length,
      sharedMedia: prepared.sharedMedia || 0,
    })
  } catch (error) {
    console.error('Falha na operação do imóvel:', error)
    return response.status(502).json({ ok: false,
      error: error instanceof Error ? error.message : 'Não foi possível concluir a operação. Tente novamente.',
      code: deleting ? 'PROPERTY_DELETE_FAILED' : 'PROPERTY_SAVE_FAILED',
    })
  }
}
