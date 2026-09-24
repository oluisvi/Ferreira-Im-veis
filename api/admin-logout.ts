import { clearAdminSessionCookie } from '../server/admin-auth.ts'

export default async function handler(request: any, response: any) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  response.setHeader('Set-Cookie', clearAdminSessionCookie(request))
  response.setHeader('Cache-Control', 'no-store')
  return response.status(200).json({ authenticated: false })
}
