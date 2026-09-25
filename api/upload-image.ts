import { put } from '@vercel/blob'
import { requireAdmin } from '../server/admin-auth.ts'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Método não permitido' })
    return
  }

  if (!requireAdmin(request, response)) return

  const contentType = request.headers['content-type'] || 'image/jpeg'
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'])
  if (!allowedTypes.has(contentType)) {
    response.status(415).json({ error: 'Formato não suportado. Use JPG, PNG, WEBP, MP4 ou WEBM.' })
    return
  }
  const filename = String(request.headers['x-filename'] || `ferreira-${Date.now()}.jpg`)
    .replace(/[^a-zA-Z0-9._-]/g, '-')

  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))

  if (!chunks.length) {
    response.status(400).json({ error: 'Imagem vazia' })
    return
  }
  const file = Buffer.concat(chunks)
  const maxBytes = contentType.startsWith('video/') ? 100 * 1024 * 1024 : 15 * 1024 * 1024
  if (file.length > maxBytes) {
    response.status(413).json({ error: `Arquivo muito grande. Limite: ${contentType.startsWith('video/') ? '100 MB' : '15 MB'}.` })
    return
  }

  const blob = await put(`imoveis/${filename}`, file, {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  })

  response.status(201).json({ url: blob.url, pathname: blob.pathname })
}
