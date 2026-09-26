import fallbackCatalogCsv from '../../docs/google-sheets/ferreira-imoveis-template.csv?raw'
import { CRECI, WHATSAPP_NUMBER } from '../content/siteContent'

export type Property = {
  code: string
  title: string
  type: string
  purpose: string
  city: string
  neighborhood: string
  address: string
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  parkingSpaces: number | null
  area: number | null
  builtArea: number | null
  lotArea: number | null
  description: string
  mainImage: string
  photos: string[]
  video: string
  broker: string
  creci: string
  whatsapp: string
  status: string
  featured: boolean
  features: string[]
  palette: string[]
  condominiumFee: number | null
  propertyTax: number | null
  latitude: number | null
  longitude: number | null
}

export type CatalogSource = 'google-sheets' | 'fallback'
export type CatalogResponse = { source: CatalogSource; updatedAt?: string; properties: Property[] }
export type PropertyFilters = {
  search: string
  city: string
  neighborhood: string
  type: string
  purpose: string
  minPrice: string
  maxPrice: string
}

export const emptyFilters: PropertyFilters = {
  search: '', city: '', neighborhood: '', type: '', purpose: '', minPrice: '', maxPrice: '',
}

const ACTIVE_STATUS = new Set(['ativo', 'active'])

type CsvRecord = Record<string, string>

function normalizeKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"') {
      if (quoted && next === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
      continue
    }

    if (char === ',' && !quoted) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(field)
      field = ''
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

function parseLocaleNumber(value: string) {
  if (!value) return null
  const raw = value.trim().replace(/[^0-9,.-]/g, '')
  if (!raw) return null

  let normalized = raw
  if (raw.includes(',')) normalized = raw.replace(/\./g, '').replace(',', '.')
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) normalized = raw.replace(/\./g, '')

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function parseInteger(value: string) {
  const parsed = parseLocaleNumber(value)
  return parsed === null ? null : Math.round(parsed)
}

function parseBoolean(value: string) {
  return new Set(['sim', 's', 'yes', 'true', '1', 'destaque']).has(normalizeKey(value))
}

function splitList(value: string) {
  if (!value) return []
  return value.split(/\s*\|\s*|\r?\n/).map((item) => item.trim()).filter(Boolean)
}

function normalizeImageUrl(value: string) {
  if (!value) return ''
  const url = value.trim()
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  const idMatch = url.match(/[?&]id=([^&]+)/)
  const driveId = fileMatch?.[1] || idMatch?.[1]
  return driveId ? `https://drive.google.com/uc?export=view&id=${driveId}` : url
}

function createRecord(headers: string[], row: string[]) {
  return headers.reduce<CsvRecord>((record, header, index) => {
    record[normalizeKey(header)] = String(row[index] ?? '').trim()
    return record
  }, {})
}

function pick(record: CsvRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[normalizeKey(key)]
    if (value !== undefined && value !== '') return value
  }
  return ''
}

function normalizeFallbackProperty(record: CsvRecord): Property | null {
  const code = pick(record, 'Código', 'Codigo', 'Code', 'ID', 'Referência', 'Referencia')
  const title = pick(record, 'Título', 'Titulo', 'Nome')
  const status = pick(record, 'Status')

  // O CSV de docs/google-sheets é a única fonte dos imóveis demonstrativos.
  // Linhas inativas continuam no exemplo da planilha, mas não aparecem no site.
  if (!code || !title || !ACTIVE_STATUS.has(normalizeKey(status))) return null

  const photos = splitList(pick(record, 'Fotos', 'Galeria')).map(normalizeImageUrl)
  const mainImage = normalizeImageUrl(pick(record, 'Foto principal', 'FotoPrincipal', 'Capa')) || photos[0] || ''
  const uniquePhotos = [...new Set([mainImage, ...photos].filter(Boolean))]

  return {
    code,
    title,
    type: pick(record, 'Tipo'),
    purpose: pick(record, 'Finalidade'),
    city: pick(record, 'Cidade'),
    neighborhood: pick(record, 'Bairro'),
    address: pick(record, 'Endereço', 'Endereco'),
    price: parseLocaleNumber(pick(record, 'Preço', 'Preco', 'Valor')),
    bedrooms: parseInteger(pick(record, 'Quartos', 'Dormitórios', 'Dormitorios')),
    bathrooms: parseInteger(pick(record, 'Banheiros')),
    parkingSpaces: parseInteger(pick(record, 'Vagas', 'Garagens')),
    area: parseLocaleNumber(pick(record, 'Área', 'Area', 'Metragem')),
    builtArea: parseLocaleNumber(pick(record, 'Área construída', 'AreaConstruida')),
    lotArea: parseLocaleNumber(pick(record, 'Área terreno', 'AreaTerreno')),
    description: pick(record, 'Descrição', 'Descricao'),
    mainImage, video: pick(record, 'Vídeo', 'Video', 'Tour em vídeo', 'Tour em video'),
    photos: uniquePhotos,
    broker: pick(record, 'Corretor') || 'Ferreira',
    creci: pick(record, 'CRECI') || CRECI,
    whatsapp: pick(record, 'WhatsApp').replace(/\D/g, '') || WHATSAPP_NUMBER,
    status,
    featured: parseBoolean(pick(record, 'Destaque')),
    features: splitList(pick(record, 'Diferenciais', 'Comodidades')),
    palette: splitList(pick(record, 'Paleta')),
    condominiumFee: parseLocaleNumber(pick(record, 'Condomínio', 'Condominio')),
    propertyTax: parseLocaleNumber(pick(record, 'IPTU')),
    latitude: parseLocaleNumber(pick(record, 'Latitude')),
    longitude: parseLocaleNumber(pick(record, 'Longitude')),
  }
}

export function parseFallbackProperties(csv: string): Property[] {
  const rows = parseCsv(csv.replace(/^\uFEFF/, ''))
  const [headers = [], ...dataRows] = rows
  return dataRows
    .map((row) => normalizeFallbackProperty(createRecord(headers, row)))
    .filter((property): property is Property => property !== null)
}

export const fallbackProperties: Property[] = parseFallbackProperties(fallbackCatalogCsv)

export function formatCurrency(value: number | null) {
  if (value === null) return 'Preço sob consulta'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
}

export function formatArea(value: number | null) {
  if (value === null) return null
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} m²`
}

export function getPropertyLocation(property: Property) {
  return [property.neighborhood, property.city].filter(Boolean).join(' · ')
}

export function getPropertyRoute(property: Property) {
  return `/imoveis/${encodeURIComponent(property.code)}`
}

export function buildPropertyWhatsAppUrl(property: Property) {
  const number = (property.whatsapp || WHATSAPP_NUMBER).replace(/\D/g, '')
  const message = `Olá! Tenho interesse no imóvel ${property.code} — ${property.title}. Gostaria de mais informações.`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function getMapUrl(property: Property) {
  const query = [property.address, property.neighborhood, property.city].filter(Boolean).join(', ')
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null
}

function includesText(value: string, query: string) {
  return value.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
}

export function filterProperties(properties: Property[], filters: PropertyFilters) {
  const minPrice = Number(filters.minPrice) || 0
  const maxPrice = Number(filters.maxPrice) || Number.POSITIVE_INFINITY
  const query = filters.search.trim()
  return properties.filter((property) => {
    const matchesSearch = !query || [property.code, property.title, property.city, property.neighborhood].some((value) => includesText(value, query))
    const matchesCity = !filters.city || property.city === filters.city
    const matchesNeighborhood = !filters.neighborhood || property.neighborhood === filters.neighborhood
    const matchesType = !filters.type || property.type === filters.type
    const matchesPurpose = !filters.purpose || property.purpose === filters.purpose
    const price = property.price ?? 0
    const matchesPrice = (!filters.minPrice || price >= minPrice) && (!filters.maxPrice || price <= maxPrice)
    return matchesSearch && matchesCity && matchesNeighborhood && matchesType && matchesPurpose && matchesPrice
  })
}

export function uniquePropertyValues(properties: Property[], key: 'city' | 'neighborhood' | 'type' | 'purpose') {
  return [...new Set(properties.map((property) => property[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}

export function filtersFromSearchParams(search: string): PropertyFilters {
  const params = new URLSearchParams(search)
  return {
    search: params.get('search') || '',
    city: params.get('city') || '',
    neighborhood: params.get('neighborhood') || '',
    type: params.get('type') || '',
    purpose: params.get('purpose') || '',
    minPrice: params.get('minPrice') || '',
    maxPrice: params.get('maxPrice') || '',
  }
}

function isCatalogResponse(value: unknown): value is CatalogResponse {
  if (!value || typeof value !== 'object') return false
  return Array.isArray((value as Partial<CatalogResponse>).properties)
}

export async function loadProperties(): Promise<CatalogResponse> {
  try {
    const response = await fetch('/api/properties', { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`Catálogo respondeu ${response.status}`)
    const data: unknown = await response.json()
    if (!isCatalogResponse(data)) throw new Error('Resposta do catálogo inválida')

    // Uma planilha vazia deve continuar vazia após a exclusão do último imóvel.
    return { ...data, source: 'google-sheets' }
  } catch {
    // Sheets/API indisponível ou ainda não configurado: usa somente os mocks.
    return { source: 'fallback', properties: fallbackProperties }
  }
}
