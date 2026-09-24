import { requireAdmin } from '../server/admin-auth.ts'

type ClarityRow = Record<string, string | number | null | undefined>
type ClarityMetric = { metricName?: string; information?: ClarityRow[] }


type WhatsAppBreakdown = {
  label: string
  count: number
  share: number
}

type WhatsAppStats = {
  available: boolean
  total: number
  sources: WhatsAppBreakdown[]
  pages: WhatsAppBreakdown[]
  properties: WhatsAppBreakdown[]
  message?: string
}

type PageAccumulator = {
  url: string
  pageSessions: number
  scrollWeighted: number
  scrollWeight: number
  totalTime: number
  activeTime: number
  engagementWeight: number
  friction: Record<string, { weightedRate: number; weight: number }>
}

const FRICTION_METRICS = ['DeadClickCount', 'RageClickCount', 'QuickbackClick', 'ExcessiveScroll', 'ScriptErrorCount', 'ErrorClickCount'] as const

function numberValue(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function metricKey(value: unknown) {
  return String(value || '').replace(/\s+/g, '')
}

function rowUrl(row: ClarityRow) {
  return String(row.URL || row.Url || row.url || '')
}

function dimensionValue(row: ClarityRow, key: 'Device' | 'Source') {
  return String(row[key] || row[key.toLowerCase()] || 'Não identificado') || 'Não identificado'
}

function trafficSessionCount(row: ClarityRow) {
  const total = numberValue(row.totalSessionCount ?? row.sessionsCount)
  const bots = numberValue(row.totalBotSessionCount)
  return Math.max(0, total - bots)
}

function combinationKey(row: ClarityRow) {
  return [rowUrl(row), dimensionValue(row, 'Device'), dimensionValue(row, 'Source')].join('||')
}

function pathFromUrl(value: string) {
  if (!value) return 'Página não identificada'
  try {
    const parsed = new URL(value)
    return `${parsed.pathname}${parsed.search}` || '/'
  } catch {
    return value
  }
}

function isPropertyIntentPage(value: string) {
  const path = pathFromUrl(value).toLowerCase()
  return path === '/imoveis' || path.startsWith('/imoveis/') || path === '/imovel' || path.startsWith('/imovel/')
}

function percentage(value: number) {
  return Math.round(value * 10) / 10
}

function seconds(value: number) {
  return Math.round(value)
}


function normalizeWhatsAppBreakdown(value: unknown): WhatsAppBreakdown[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      const row = item && typeof item === 'object' ? item as Record<string, unknown> : {}
      return {
        label: String(row.label || 'Não identificado'),
        count: Math.max(0, Math.round(numberValue(row.count))),
        share: percentage(numberValue(row.share)),
      }
    })
    .filter((item) => item.count > 0)
    .slice(0, 10)
}

async function fetchWhatsAppStats(days: number): Promise<WhatsAppStats> {
  const scriptUrl = process.env.PROPERTIES_SCRIPT_URL || process.env.VITE_PROPERTIES_SCRIPT_URL
  const unavailable: WhatsAppStats = {
    available: false,
    total: 0,
    sources: [],
    pages: [],
    properties: [],
    message: 'Atualize e publique o Google Apps Script para habilitar a contagem de cliques no painel.',
  }

  if (!scriptUrl) return { ...unavailable, message: 'Configure PROPERTIES_SCRIPT_URL para habilitar a contagem de cliques no WhatsApp.' }

  try {
    const url = new URL(scriptUrl)
    url.searchParams.set('action', 'whatsapp-report')
    url.searchParams.set('days', String(days))

    const upstream = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { Accept: 'application/json' },
    })

    if (!upstream.ok) return unavailable

    const payload = await upstream.json() as Record<string, unknown>
    if (payload.available !== true) return unavailable

    return {
      available: true,
      total: Math.max(0, Math.round(numberValue(payload.total))),
      sources: normalizeWhatsAppBreakdown(payload.sources),
      pages: normalizeWhatsAppBreakdown(payload.pages),
      properties: normalizeWhatsAppBreakdown(payload.properties),
    }
  } catch (error) {
    console.error('Falha ao carregar cliques do WhatsApp:', error)
    return unavailable
  }
}

function buildReport(metrics: ClarityMetric[], days: number) {
  const byMetric = new Map(metrics.map((metric) => [metricKey(metric.metricName), metric.information || []]))
  const trafficRows = byMetric.get('Traffic') || []
  const sessionWeightByCombination = new Map<string, number>()
  const pages = new Map<string, PageAccumulator>()
  const devices = new Map<string, number>()
  const sources = new Map<string, number>()

  const ensurePage = (url: string) => {
    const normalized = url || 'Página não identificada'
    const existing = pages.get(normalized)
    if (existing) return existing
    const created: PageAccumulator = {
      url: normalized,
      pageSessions: 0,
      scrollWeighted: 0,
      scrollWeight: 0,
      totalTime: 0,
      activeTime: 0,
      engagementWeight: 0,
      friction: {},
    }
    pages.set(normalized, created)
    return created
  }

  for (const row of trafficRows) {
    const sessions = trafficSessionCount(row)
    const url = rowUrl(row)
    sessionWeightByCombination.set(combinationKey(row), sessions)
    if (url) ensurePage(url).pageSessions += sessions
    devices.set(dimensionValue(row, 'Device'), (devices.get(dimensionValue(row, 'Device')) || 0) + sessions)
    sources.set(dimensionValue(row, 'Source'), (sources.get(dimensionValue(row, 'Source')) || 0) + sessions)
  }

  for (const row of byMetric.get('ScrollDepth') || []) {
    const url = rowUrl(row)
    if (!url) continue
    const weight = sessionWeightByCombination.get(combinationKey(row)) || numberValue(row.sessionsCount) || 1
    const page = ensurePage(url)
    page.scrollWeighted += numberValue(row.averageScrollDepth) * weight
    page.scrollWeight += weight
  }

  for (const row of byMetric.get('EngagementTime') || []) {
    const url = rowUrl(row)
    if (!url) continue
    const weight = sessionWeightByCombination.get(combinationKey(row)) || numberValue(row.sessionsCount) || 1
    const page = ensurePage(url)
    page.totalTime += numberValue(row.totalTime)
    page.activeTime += numberValue(row.activeTime)
    page.engagementWeight += weight
  }

  for (const name of FRICTION_METRICS) {
    for (const row of byMetric.get(name) || []) {
      const url = rowUrl(row)
      if (!url) continue
      const weight = numberValue(row.sessionsCount) || sessionWeightByCombination.get(combinationKey(row)) || 1
      const rate = numberValue(row.sessionsWithMetricPercentage)
      const page = ensurePage(url)
      const current = page.friction[name] || { weightedRate: 0, weight: 0 }
      current.weightedRate += rate * weight
      current.weight += weight
      page.friction[name] = current
    }
  }

  const normalizedPages = [...pages.values()]
    .map((page) => {
      const frictionRate = (name: string) => {
        const metric = page.friction[name]
        return metric?.weight ? metric.weightedRate / metric.weight : 0
      }
      return {
        url: page.url,
        path: pathFromUrl(page.url),
        pageSessions: page.pageSessions,
        scrollDepth: page.scrollWeight ? percentage(page.scrollWeighted / page.scrollWeight) : 0,
        engagementSeconds: page.engagementWeight ? seconds(page.activeTime / page.engagementWeight) : 0,
        activeSeconds: page.engagementWeight ? seconds(page.activeTime / page.engagementWeight) : 0,
        deadClickRate: percentage(frictionRate('DeadClickCount')),
        rageClickRate: percentage(frictionRate('RageClickCount')),
        quickbackRate: percentage(frictionRate('QuickbackClick')),
        excessiveScrollRate: percentage(frictionRate('ExcessiveScroll')),
        scriptErrorRate: percentage(frictionRate('ScriptErrorCount')),
        errorClickRate: percentage(frictionRate('ErrorClickCount')),
        propertyIntent: isPropertyIntentPage(page.url),
      }
    })
    .sort((a, b) => b.pageSessions - a.pageSessions)

  const totalPageSessions = normalizedPages.reduce((sum, page) => sum + page.pageSessions, 0)
  const propertyIntentSessions = normalizedPages.filter((page) => page.propertyIntent).reduce((sum, page) => sum + page.pageSessions, 0)
  const weighted = (field: keyof (typeof normalizedPages)[number]) => {
    if (!totalPageSessions) return 0
    return normalizedPages.reduce((sum, page) => sum + numberValue(page[field]) * page.pageSessions, 0) / totalPageSessions
  }

  const toBreakdown = (map: Map<string, number>) => {
    const total = [...map.values()].reduce((sum, value) => sum + value, 0)
    return [...map.entries()]
      .map(([label, value]) => ({ label, pageSessions: value, share: total ? percentage((value / total) * 100) : 0 }))
      .sort((a, b) => b.pageSessions - a.pageSessions)
      .slice(0, 8)
  }

  return {
    periodDays: days,
    generatedAt: new Date().toISOString(),
    summary: {
      pageSessions: totalPageSessions,
      propertyIntentSessions,
      propertyIntentRate: totalPageSessions ? percentage((propertyIntentSessions / totalPageSessions) * 100) : 0,
      averageScrollDepth: percentage(weighted('scrollDepth')),
      averageEngagementSeconds: seconds(weighted('engagementSeconds')),
      deadClickRate: percentage(weighted('deadClickRate')),
      rageClickRate: percentage(weighted('rageClickRate')),
      quickbackRate: percentage(weighted('quickbackRate')),
      excessiveScrollRate: percentage(weighted('excessiveScrollRate')),
    },
    pages: normalizedPages.slice(0, 12),
    devices: toBreakdown(devices),
    sources: toBreakdown(sources),
    notes: {
      sessionDefinition: 'Os totais desta tela são sessões por página. Uma mesma sessão pode aparecer em mais de uma URL.',
      conversionDefinition: 'Interesse em imóveis é um proxy baseado em visitas a /imoveis e páginas de imóvel; não representa uma venda concluída.',
      customEvents: 'Os cliques de WhatsApp continuam sendo enviados ao Clarity como whatsapp_click e agora também são registrados na planilha para aparecerem neste painel.',
    },
  }
}

const memoryCache = new Map<number, { expiresAt: number; report: ReturnType<typeof buildReport> & { whatsapp: WhatsAppStats } }>()

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  if (!requireAdmin(request, response)) return

  const token = process.env.CLARITY_API_TOKEN
  if (!token) {
    return response.status(503).json({ error: 'Configure CLARITY_API_TOKEN para habilitar o relatório.', code: 'CLARITY_NOT_CONFIGURED' })
  }

  const requestedDays = Number(request.query?.days || 3)
  const days = [1, 2, 3].includes(requestedDays) ? requestedDays : 3
  const forceRefresh = String(request.query?.refresh || '') === '1'
  const cached = memoryCache.get(days)

  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    response.setHeader('Cache-Control', 'private, max-age=900')
    return response.status(200).json(cached.report)
  }

  const url = new URL('https://www.clarity.ms/export-data/api/v1/project-live-insights')
  url.searchParams.set('numOfDays', String(days))
  url.searchParams.set('dimension1', 'URL')
  url.searchParams.set('dimension2', 'Device')
  url.searchParams.set('dimension3', 'Source')

  try {
    const clarityResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!clarityResponse.ok) {
      const code = clarityResponse.status === 429 ? 'CLARITY_RATE_LIMIT' : 'CLARITY_FETCH_FAILED'
      return response.status(clarityResponse.status === 429 ? 429 : 502).json({
        error: clarityResponse.status === 429
          ? 'O limite diário da API do Clarity foi atingido. Tente novamente mais tarde.'
          : 'Não foi possível carregar os dados do Clarity agora.',
        code,
      })
    }

    const payload = await clarityResponse.json() as ClarityMetric[]
    const baseReport = buildReport(Array.isArray(payload) ? payload : [], days)
    const whatsapp = await fetchWhatsAppStats(days)
    const report = { ...baseReport, whatsapp }
    memoryCache.set(days, { expiresAt: Date.now() + 15 * 60 * 1000, report })
    response.setHeader('Cache-Control', 'private, max-age=900')
    return response.status(200).json(report)
  } catch (error) {
    console.error('Falha ao carregar relatório do Clarity:', error)
    return response.status(502).json({ error: 'Não foi possível carregar os dados do Clarity agora.', code: 'CLARITY_FETCH_FAILED' })
  }
}
