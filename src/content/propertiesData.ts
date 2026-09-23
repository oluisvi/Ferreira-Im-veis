import { propertyConcepts, type PropertyCategory, type PropertyListing } from './siteContent'

export const SHEET_CSV_URL = '/api/properties'

type PropertyRow = Record<string, string>

const categoryFallback: PropertyCategory = 'Casa'

const categoryMap: Record<string, PropertyCategory> = {
  casa: 'Casa',
  apartamento: 'Apartamento',
  apto: 'Apartamento',
  refugio: 'Refúgio',
  refúgio: 'Refúgio',
}

export function parseCsv(text: string) {
  const rows: string[][] = []
  let cell = ''
  let row: string[] = []
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  row.push(cell)
  if (row.some((value) => value.trim())) rows.push(row)
  return rows
}

export function rowsToProperties(csv: string): PropertyListing[] {
  const rows = parseCsv(csv)
  const headers = rows.shift()?.map(normalizeHeader) ?? []

  return rows
    .map((columns) => toRow(headers, columns))
    .filter((row) => get(row, 'ativo') !== 'não' && get(row, 'active') !== 'false')
    .map((row, index) => toProperty(row, index))
    .filter((property) => property.title && property.image)
}

export async function getProperties() {
  if (!SHEET_CSV_URL) return propertyConcepts

  try {
    const response = await fetch(SHEET_CSV_URL)
    if (!response.ok) throw new Error(`CSV request failed: ${response.status}`)
    const payload = await response.json() as { properties?: Array<Record<string, unknown>> }
    const properties = (payload.properties ?? []).map((item, index) => ({
      id: String(item.code || `property-${index}`),
      category: normalizeCategory(String(item.type || 'Casa')),
      eyebrow: [item.purpose, item.city].filter(Boolean).join(' · '),
      title: String(item.title || ''),
      description: String(item.description || ''),
      image: String(item.mainImage || ''),
      imageAlt: `Imagem do imóvel ${String(item.title || index + 1)}`,
      price: item.price ? String(item.price) : undefined,
      location: [item.address, item.neighborhood, item.city].filter(Boolean).join(', '),
      area: item.area ? String(item.area) : undefined,
      bedrooms: item.bedrooms ? String(item.bedrooms) : undefined,
      bathrooms: item.bathrooms ? String(item.bathrooms) : undefined,
      parking: item.parkingSpaces ? String(item.parkingSpaces) : undefined,
      sourceUrl: undefined,
      isConcept: false as const,
    })).filter((item) => item.title && item.image)

    // Nunca mistura os dois catálogos: havendo imóveis reais, usa apenas eles.
    return properties.length > 0 ? properties : propertyConcepts
  } catch (error) {
    console.warn('Could not load properties from Google Sheets.', error)
    return propertyConcepts
  }
}

function toRow(headers: string[], columns: string[]): PropertyRow {
  return headers.reduce<PropertyRow>((record, header, index) => {
    record[header] = (columns[index] ?? '').trim()
    return record
  }, {})
}

function toProperty(row: PropertyRow, index: number): PropertyListing {
  const category = normalizeCategory(get(row, 'categoria') || get(row, 'category') || get(row, 'tipo') || get(row, 'type'))
  const price = get(row, 'preco') || get(row, 'preço') || get(row, 'price')
  const location = [get(row, 'endereco'), get(row, 'endereço'), get(row, 'bairro'), get(row, 'cidade')].filter(Boolean).join(', ')
  const specs = [get(row, 'area') || get(row, 'área'), get(row, 'quartos'), get(row, 'banheiros'), get(row, 'vagas')]
    .filter(Boolean)
    .join(' · ')

  return {
    id: get(row, 'id') || slugify(`${get(row, 'titulo') || get(row, 'title')}-${index}`),
    category,
    eyebrow: get(row, 'chamada') || get(row, 'eyebrow') || get(row, 'finalidade') || [category, location].filter(Boolean).join(' · '),
    title: get(row, 'titulo') || get(row, 'título') || get(row, 'title'),
    description: get(row, 'descricao') || get(row, 'descrição') || get(row, 'description') || specs,
    image: get(row, 'imagem') || get(row, 'image') || get(row, 'foto') || get(row, 'foto principal') || get(row, 'imageurl'),
    imageAlt: get(row, 'alt') || `Imagem do imóvel ${get(row, 'titulo') || index + 1}`,
    price,
    location,
    area: get(row, 'area') || get(row, 'área'),
    bedrooms: get(row, 'quartos'),
    bathrooms: get(row, 'banheiros'),
    parking: get(row, 'vagas'),
    sourceUrl: get(row, 'link') || get(row, 'sourceurl') || get(row, 'facebook'),
    isConcept: false,
  }
}

function get(row: PropertyRow, key: string) {
  return row[normalizeHeader(key)] ?? ''
}

function normalizeCategory(value: string): PropertyCategory {
  return categoryMap[value.trim().toLowerCase()] ?? categoryFallback
}

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
