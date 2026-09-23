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

const demoImages = {
  casa: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
  apartamento: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85',
  refugio: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1600&q=85',
  interior: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',
  cozinha: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=85',
}

export const fallbackProperties: Property[] = [
  {
    code: 'FI-001', title: 'Casa contemporânea em condomínio', type: 'Casa', purpose: 'Venda', city: 'Jacareí', neighborhood: 'Condomínio fechado', address: '',
    price: 850000, bedrooms: 3, bathrooms: 2, parkingSpaces: 2, area: 180, builtArea: 180, lotArea: 300,
    description: 'Casa moderna com ambientes integrados, iluminação natural e área externa pensada para receber.',
    mainImage: demoImages.casa, photos: [demoImages.casa, demoImages.interior, demoImages.cozinha], broker: 'Ferreira', creci: CRECI, whatsapp: WHATSAPP_NUMBER,
    status: 'Ativo', featured: true, features: ['Condomínio fechado', 'Área gourmet', 'Ambientes integrados'], palette: ['#D7C7B0', '#8A6A4A', '#2D2B27'],
    condominiumFee: 650, propertyTax: 1800, latitude: null, longitude: null,
  },
  {
    code: 'FI-002', title: 'Apartamento com horizonte aberto', type: 'Apartamento', purpose: 'Venda', city: 'São José dos Campos', neighborhood: 'Urbanova', address: '',
    price: 640000, bedrooms: 3, bathrooms: 2, parkingSpaces: 2, area: 118, builtArea: 118, lotArea: null,
    description: 'Apartamento claro, bem distribuído e conectado à rotina urbana, com vista ampla e espaços sociais generosos.',
    mainImage: demoImages.apartamento, photos: [demoImages.apartamento, demoImages.interior], broker: 'Ferreira', creci: CRECI, whatsapp: WHATSAPP_NUMBER,
    status: 'Ativo', featured: true, features: ['Varanda', '2 vagas', 'Vista aberta'], palette: ['#E6DED3', '#A88E74', '#393734'],
    condominiumFee: 780, propertyTax: 1250, latitude: null, longitude: null,
  },
  {
    code: 'FI-003', title: 'Refúgio cercado por natureza', type: 'Refúgio', purpose: 'Venda', city: 'Jacareí', neighborhood: 'Zona rural', address: '',
    price: 1250000, bedrooms: 4, bathrooms: 3, parkingSpaces: 4, area: 260, builtArea: 260, lotArea: 2400,
    description: 'Uma propriedade para desacelerar, com muito verde, privacidade e espaços amplos para viver e receber.',
    mainImage: demoImages.refugio, photos: [demoImages.refugio, demoImages.casa], broker: 'Ferreira', creci: CRECI, whatsapp: WHATSAPP_NUMBER,
    status: 'Ativo', featured: false, features: ['Área verde', 'Privacidade', 'Terreno amplo'], palette: ['#62705A', '#B69B72', '#E6E1D8'],
    condominiumFee: null, propertyTax: 2200, latitude: null, longitude: null,
  },
]

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
  return `/imovel/${encodeURIComponent(property.code)}`
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
    return { ...data, source: 'google-sheets' }
  } catch {
    return { source: 'fallback', properties: fallbackProperties }
  }
}
