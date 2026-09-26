import { requireAdmin } from '../server/admin-auth.ts'
const ACTIVE_STATUS = new Set(['ativo', 'active'])

function normalizeKey(value: unknown = '') {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function parseCsv(text: string) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]
    if (char === '"') {
      if (quoted && next === '"') { field += '"'; index += 1 } else quoted = !quoted
      continue
    }
    if (char === ',' && !quoted) { row.push(field); field = ''; continue }
    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(field); field = ''
      if (row.some((cell) => cell.trim() !== '')) rows.push(row)
      row = []
      continue
    }
    field += char
  }
  row.push(field)
  if (row.some((cell) => cell.trim() !== '')) rows.push(row)
  return rows
}

function parseLocaleNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const raw = String(value).trim().replace(/[^0-9,.-]/g, '')
  if (!raw) return null
  let normalized = raw
  if (raw.includes(',')) normalized = raw.replace(/\./g, '').replace(',', '.')
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) normalized = raw.replace(/\./g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const parseInteger = (value: unknown) => { const parsed = parseLocaleNumber(value); return parsed === null ? null : Math.round(parsed) }
const parseBoolean = (value: unknown) => new Set(['sim', 's', 'yes', 'true', '1', 'destaque']).has(normalizeKey(value))
const splitList = (value: unknown) => !value ? [] : String(value).split(/\s*\|\s*|\r?\n/).map((item) => item.trim()).filter(Boolean)

function normalizeImageUrl(value: unknown) {
  if (!value) return ''
  const url = String(value).trim()
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  const idMatch = url.match(/[?&]id=([^&]+)/)
  const driveId = fileMatch?.[1] || idMatch?.[1]
  return driveId ? `https://drive.google.com/uc?export=view&id=${driveId}` : url
}

function createRecord(headers: string[], row: unknown[]) {
  return headers.reduce((record: Record<string, string>, header, index) => { record[normalizeKey(header)] = String(row[index] ?? '').trim(); return record }, {})
}

function pick(record: Record<string, string>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[normalizeKey(key)]
    if (value !== undefined && value !== '') return value
  }
  return ''
}

function normalizeProperty(record: Record<string, string>, includeInactive = false) {
  const photos = splitList(pick(record, 'Fotos', 'Galeria', 'imagens')).map(normalizeImageUrl)
  const mainImage = normalizeImageUrl(pick(record, 'Foto principal', 'FotoPrincipal', 'Capa', 'imagem')) || photos[0] || ''
  const code = pick(record, 'Código', 'Codigo', 'Code', 'ID', 'Referência', 'Referencia')
  const title = pick(record, 'Título', 'Titulo', 'Nome')
  const status = pick(record, 'Status') || (normalizeKey(pick(record, 'ativo')) === 'nao' ? 'Oculto' : 'Ativo')
  if (!code || !title || (!includeInactive && !ACTIVE_STATUS.has(normalizeKey(status)))) return null
  const uniquePhotos = [...new Set([mainImage, ...photos].filter(Boolean))]
  return {
    code, title, type: pick(record, 'Tipo', 'categoria'), purpose: pick(record, 'Finalidade'), city: pick(record, 'Cidade', 'localizacao'), neighborhood: pick(record, 'Bairro'),
    address: pick(record, 'Endereço', 'Endereco'), price: parseLocaleNumber(pick(record, 'Preço', 'Preco', 'Valor')),
    bedrooms: parseInteger(pick(record, 'Quartos', 'Dormitórios', 'Dormitorios')), bathrooms: parseInteger(pick(record, 'Banheiros')),
    parkingSpaces: parseInteger(pick(record, 'Vagas', 'Garagens')), area: parseLocaleNumber(pick(record, 'Área', 'Area', 'Metragem')),
    builtArea: parseLocaleNumber(pick(record, 'Área construída', 'AreaConstruida')), lotArea: parseLocaleNumber(pick(record, 'Área terreno', 'AreaTerreno')),
    description: pick(record, 'Descrição', 'Descricao'), mainImage, photos: uniquePhotos, video: pick(record, 'Vídeo', 'Video', 'Tour em vídeo', 'Tour em video'), broker: pick(record, 'Corretor'), creci: pick(record, 'CRECI'),
    whatsapp: pick(record, 'WhatsApp').replace(/\D/g, ''), status, featured: parseBoolean(pick(record, 'Destaque')),
    features: splitList(pick(record, 'Diferenciais', 'Comodidades')), palette: splitList(pick(record, 'Paleta')),
    condominiumFee: parseLocaleNumber(pick(record, 'Condomínio', 'Condominio')), propertyTax: parseLocaleNumber(pick(record, 'IPTU')),
    latitude: parseLocaleNumber(pick(record, 'Latitude')), longitude: parseLocaleNumber(pick(record, 'Longitude')),
  }
}

function getSheetUrl() {
  if (process.env.GOOGLE_SHEET_CSV_URL) return process.env.GOOGLE_SHEET_CSV_URL
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!sheetId) return 'https://docs.google.com/spreadsheets/d/1EcXVnUFR6N1IPiMvEPH5-AyGrvWQXR3T517-qmhfgqY/export?format=csv&gid=1830906592'
  const sheetName = encodeURIComponent(process.env.GOOGLE_SHEET_NAME || 'Imoveis')
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`
}

export default async function handler(request: any, response: any) {
  if (request.method !== 'GET') { response.setHeader('Allow', 'GET'); return response.status(405).json({ error: 'Método não permitido.' }) }
  try {
    const admin = request.query?.admin === '1'
    if (admin && !requireAdmin(request, response)) return
    const sheetUrl = getSheetUrl()
    if (!sheetUrl) return response.status(503).json({ error: 'Catálogo ainda não conectado ao Google Sheets.', code: 'SHEET_NOT_CONFIGURED' })
    const scriptUrl = process.env.PROPERTIES_SCRIPT_URL || process.env.VITE_PROPERTIES_SCRIPT_URL
    let records: Record<string, string>[]
    if (scriptUrl) {
      const url = new URL(scriptUrl)
      url.searchParams.set('action', 'property-list')
      const upstream = await fetch(url, { redirect: 'follow', cache: 'no-store' })
      const body = await upstream.json()
      if (!upstream.ok || body.ok !== true || body.protocol !== 2 || !Array.isArray(body.sheets)) throw new Error('Atualize o Apps Script para carregar a mesma fonte usada na exclusão.')
      records = body.sheets.flatMap(({ headers, rows }: { headers: string[], rows: unknown[][] }) => rows.map((row) => createRecord(headers, row)))
    } else {
      const sheetResponse = await fetch(sheetUrl, { headers: { 'User-Agent': 'Ferreira-Corretor-Imoveis-Catalog/1.0' }, redirect: 'follow', cache: 'no-store' })
      if (!sheetResponse.ok) throw new Error('Falha ao carregar Google Sheets')
      const [headers = [], ...dataRows] = parseCsv((await sheetResponse.text()).replace(/^\uFEFF/, ''))
      records = dataRows.map((row) => createRecord(headers, row))
    }
    const byCode = new Map()
    records.map((record) => normalizeProperty(record, admin)).filter((property): property is NonNullable<typeof property> => property !== null).forEach((property) => {
      const key = property.code.trim().toLowerCase()
      if (!byCode.has(key)) byCode.set(key, property)
    })
    const properties = [...byCode.values()]
      // O catálogo muda pelo painel administrativo; não podemos servir imóveis
      // excluídos durante a janela do cache da CDN.
      response.setHeader('Cache-Control', 'no-store, max-age=0')
    return response.status(200).json({ source: 'google-sheets', updatedAt: new Date().toISOString(), properties })
  } catch (error) {
    console.error('Falha ao carregar catálogo do Google Sheets:', error)
    return response.status(502).json({ error: 'Não foi possível carregar o catálogo agora.', code: 'SHEET_FETCH_FAILED' })
  }
}

export const __test = { parseCsv, parseLocaleNumber, normalizeProperty, createRecord }
