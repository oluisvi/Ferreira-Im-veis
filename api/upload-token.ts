import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { requireAdmin } from '../server/admin-auth.ts'

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  const body = (request.body || {}) as HandleUploadBody
  if (body.type !== 'blob.upload-completed' && !requireAdmin(request, response)) return

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
        addRandomSuffix: true,
        maximumSizeInBytes: 100 * 1024 * 1024,
      }),
      onUploadCompleted: async () => undefined,
    })
    return response.status(200).json(result)
  } catch (error) {
    console.error('Falha ao gerar token de upload:', error)
    return response.status(400).json({ error: error instanceof Error ? error.message : 'Não foi possível iniciar o upload.' })
  }
}
