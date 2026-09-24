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
  const filename = String(request.headers['x-filename'] || `ferreira-${Date.now()}.jpg`)
    .replace(/[^a-zA-Z0-9._-]/g, '-')

  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))

  if (!chunks.length) {
    response.status(400).json({ error: 'Imagem vazia' })
    return
  }

  const blob = await put(`imoveis/${filename}`, Buffer.concat(chunks), {
    access: 'public',
    contentType,
    addRandomSuffix: true,
  })

  response.status(201).json({ url: blob.url, pathname: blob.pathname })
}
