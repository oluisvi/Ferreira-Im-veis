import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import adminLoginHandler from './api/admin-login.ts'
import adminLogoutHandler from './api/admin-logout.ts'
import adminSessionHandler from './api/admin-session.ts'
import adminPropertyHandler from './api/admin-property.ts'
import adminClarityHandler from './api/admin-clarity.ts'
import uploadImageHandler from './api/upload-image.ts'
import uploadTokenHandler from './api/upload-token.ts'
import whatsappClickHandler from './api/whatsapp-click.ts'
import propertiesHandler from './api/properties.js'

const apiHandlers: Record<string, (request: any, response: any) => Promise<any>> = {
  '/api/admin-login': adminLoginHandler,
  '/api/admin-logout': adminLogoutHandler,
  '/api/admin-session': adminSessionHandler,
  '/api/admin-property': adminPropertyHandler,
  '/api/admin-clarity': adminClarityHandler,
  '/api/upload-image': uploadImageHandler,
  '/api/upload-token': uploadTokenHandler,
  '/api/whatsapp-click': whatsappClickHandler,
  '/api/properties': propertiesHandler,
}

const jsonBodyRoutes = new Set(['/api/admin-login', '/api/admin-property', '/api/whatsapp-click', '/api/upload-token'])

function readJsonBody(request: any) {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    let raw = ''
    request.setEncoding('utf8')
    request.on('data', (chunk: string) => { raw += chunk })
    request.on('end', () => {
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })
}

function createVercelLikeResponse(response: any) {
  const apiResponse: any = response

  apiResponse.status = (statusCode: number) => {
    response.statusCode = statusCode
    return apiResponse
  }

  apiResponse.json = (payload: unknown) => {
    if (!response.headersSent) response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.end(JSON.stringify(payload))
    return apiResponse
  }

  return apiResponse
}

function localApiPlugin() {
  return {
    name: 'ferreira-local-api',
    configureServer(server: any) {
      server.middlewares.use(async (request: any, response: any, next: () => void) => {
        const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)
        const handler = apiHandlers[url.pathname]
        if (!handler) return next()

        try {
          request.query = Object.fromEntries(url.searchParams.entries())

          if (jsonBodyRoutes.has(url.pathname)) {
            try {
              request.body = await readJsonBody(request)
            } catch {
              const apiResponse = createVercelLikeResponse(response)
              return apiResponse.status(400).json({ error: 'JSON inválido.' })
            }
          }

          await handler(request, createVercelLikeResponse(response))
        } catch (error) {
          console.error(`[local-api] ${request.method} ${url.pathname}`, error)
          if (!response.headersSent) {
            const apiResponse = createVercelLikeResponse(response)
            apiResponse.status(500).json({ error: 'Erro interno na API local.' })
          } else if (!response.writableEnded) {
            response.end()
          }
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Vite exposes VITE_* to the browser, but the admin API deliberately uses
  // server-only variables. Loading every key here makes npm run dev behave
  // like the Vercel runtime without exposing ADMIN_* in the client bundle.
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value
  }

  return {
    plugins: [react(), localApiPlugin()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
