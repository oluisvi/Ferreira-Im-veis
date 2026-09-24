import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'ferreira_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 12

type SessionPayload = {
  username: string
  exp: number
}

function base64Url(value: string) {
  return Buffer.from(value).toString('base64url')
}

function sessionSecret() {
  const explicitSecret = process.env.ADMIN_SESSION_SECRET
  if (explicitSecret) return explicitSecret

  const username = process.env.ADMIN_USERNAME || ''
  const password = process.env.ADMIN_PASSWORD || ''
  return createHmac('sha256', 'ferreira-admin-session').update(`${username}:${password}`).digest('hex')
}

function sign(payload: string) {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function adminAuthConfigured() {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD)
}

export function validAdminCredentials(username: string, password: string) {
  if (!adminAuthConfigured()) return false
  return safeEqual(username, process.env.ADMIN_USERNAME || '') && safeEqual(password, process.env.ADMIN_PASSWORD || '')
}

export function createAdminSession(username: string) {
  const payload: SessionPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  }
  const encoded = base64Url(JSON.stringify(payload))
  return `${encoded}.${sign(encoded)}`
}

function parseCookies(header: string | undefined) {
  const cookies: Record<string, string> = {}
  for (const chunk of String(header || '').split(';')) {
    const [rawKey, ...rest] = chunk.trim().split('=')
    if (!rawKey) continue
    cookies[rawKey] = decodeURIComponent(rest.join('='))
  }
  return cookies
}

export function readAdminSession(request: any): SessionPayload | null {
  if (!adminAuthConfigured()) return null

  const token = parseCookies(request.headers?.cookie)[COOKIE_NAME]
  if (!token) return null

  const [encoded, signature] = token.split('.')
  if (!encoded || !signature || !safeEqual(sign(encoded), signature)) return null

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload
    if (!payload.username || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null
    if (!safeEqual(payload.username, process.env.ADMIN_USERNAME || '')) return null
    return payload
  } catch {
    return null
  }
}

export function isAdminAuthenticated(request: any) {
  return readAdminSession(request) !== null
}

function cookieSecurity(request: any) {
  const forwarded = String(request.headers?.['x-forwarded-proto'] || '')
  return forwarded === 'https' || process.env.NODE_ENV === 'production' ? '; Secure' : ''
}

export function adminSessionCookie(request: any, token: string) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${cookieSecurity(request)}`
}

export function clearAdminSessionCookie(request: any) {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${cookieSecurity(request)}`
}

export function requireAdmin(request: any, response: any) {
  if (!adminAuthConfigured()) {
    response.status(503).json({ error: 'Autenticação do admin ainda não foi configurada.', code: 'ADMIN_NOT_CONFIGURED' })
    return false
  }

  if (!isAdminAuthenticated(request)) {
    response.status(401).json({ error: 'Sessão administrativa inválida ou expirada.', code: 'UNAUTHORIZED' })
    return false
  }

  return true
}
