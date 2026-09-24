import { adminAuthConfigured, readAdminSession } from '../server/admin-auth.ts'

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  response.setHeader('Cache-Control', 'no-store')

  if (!adminAuthConfigured()) {
    return response.status(503).json({ authenticated: false, configured: false })
  }

  const session = readAdminSession(request)
  if (!session) return response.status(401).json({ authenticated: false, configured: true })
  return response.status(200).json({ authenticated: true, configured: true, username: session.username })
}
