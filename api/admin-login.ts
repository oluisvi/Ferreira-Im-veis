import { adminAuthConfigured, adminSessionCookie, createAdminSession, validAdminCredentials } from '../server/admin-auth.ts'

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  if (!adminAuthConfigured()) {
    return response.status(503).json({ error: 'Configure ADMIN_USERNAME e ADMIN_PASSWORD no ambiente.', code: 'ADMIN_NOT_CONFIGURED' })
  }

  const username = String(request.body?.username || '').trim()
  const password = String(request.body?.password || '')

  if (!validAdminCredentials(username, password)) {
    return response.status(401).json({ error: 'Usuário ou senha inválidos.', code: 'INVALID_CREDENTIALS' })
  }

  const token = createAdminSession(username)
  response.setHeader('Set-Cookie', adminSessionCookie(request, token))
  response.setHeader('Cache-Control', 'no-store')
  return response.status(200).json({ authenticated: true, username })
}
