const ACTIVE_STATUS = new Set(['ativo', 'active'])

function normalizeKey(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function parseCsv(text) {
  const rows = []
  let row = []
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

function parseLocaleNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const raw = String(value).trim().replace(/[^0-9,.-]/g, '')
  if (!raw) return null

  let normalized = raw
  if (raw.includes(',')) {
    normalized = raw.replace(/\./g, '').replace(',', '.')
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(raw)) {
    normalized = raw.replace(/\./g, '')
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function parseInteger(value) {
  const parsed = parseLocaleNumber(value)
  return parsed === null ? null : Math.round(parsed)
}

function parseBoolean(value) {
  return new Set(['sim', 's', 'yes', 'true', '1', 'destaque']).has(normalizeKey(value))
}

function splitList(value) {
  if (!value) return []
  return String(value)
    .split(/\s*\|\s*|\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeImageUrl(value) {
  if (!value) return ''
  const url = String(value).trim()
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  const idMatch = url.match(/[?&]id=([^&]+)/)
  const driveId = fileMatch?.[1] || idMatch?.[1]
  return driveId ? `https://drive.google.com/uc?export=view&id=${driveId}` : url
}

function createRecord(headers, row) {
  return headers.reduce((record, header, index) => {
    record[normalizeKey(header)] = String(row[index] ?? '').trim()
    return record
  }, {})
}

function pick(record, ...keys) {
  for (const key of keys) {
    const value = record[normalizeKey(key)]
    if (value !== undefined && value !== '') return value
  }
  return ''
}

function normalizeProperty(record) {
  const photos = splitList(pick(record, 'Fotos', 'Galeria')).map(normalizeImageUrl)
  const mainImage = normalizeImageUrl(pick(record, 'Foto principal', 'FotoPrincipal', 'Capa')) || photos[0] || ''
  const code = pick(record, 'Código', 'Codigo', 'Code', 'ID', 'Referência', 'Referencia')
  const title = pick(record, 'Título', 'Titulo', 'Nome')
  const status = pick(record, 'Status')

  if (!code || !title) return null
  if (!ACTIVE_STATUS.has(normalizeKey(status))) return null

  const normalizedPhotos = [mainImage, ...photos].filter(Boolean)
  const uniquePhotos = [...new Set(normalizedPhotos)]

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
    mainImage,
    photos: uniquePhotos,
    broker: pick(record, 'Corretor'),
    creci: pick(record, 'CRECI'),
    whatsapp: pick(record, 'WhatsApp').replace(/\D/g, ''),
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

function getSheetUrl() {
  if (process.env.GOOGLE_SHEET_CSV_URL) return process.env.GOOGLE_SHEET_CSV_URL

  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!sheetId) return null

  const sheetName = encodeURIComponent(process.env.GOOGLE_SHEET_NAME || 'Imoveis')
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`
}

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return response.status(405).json({ error: 'Método não permitido.' })
  }

  const sheetUrl = getSheetUrl()
  if (!sheetUrl) {
    return response.status(503).json({
      error: 'Catálogo ainda não conectado ao Google Sheets.',
      code: 'SHEET_NOT_CONFIGURED',
    })
  }

  try {
    const sheetResponse = await fetch(sheetUrl, {
      headers: { 'User-Agent': 'Ferreira-Imoveis-Catalog/1.0' },
      redirect: 'follow',
    })

    if (!sheetResponse.ok) {
      throw new Error(`Google Sheets respondeu ${sheetResponse.status}`)
    }

    const csv = await sheetResponse.text()
    const rows = parseCsv(csv.replace(/^\uFEFF/, ''))
    const [headers = [], ...dataRows] = rows
    const properties = dataRows
      .map((row) => normalizeProperty(createRecord(headers, row)))
      .filter(Boolean)

    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
    return response.status(200).json({
      source: 'google-sheets',
      updatedAt: new Date().toISOString(),
      properties,
    })
  } catch (error) {
    console.error('Falha ao carregar catálogo do Google Sheets:', error)
    return response.status(502).json({
      error: 'Não foi possível carregar o catálogo agora.',
      code: 'SHEET_FETCH_FAILED',
    })
  }
}

export const __test = { parseCsv, parseLocaleNumber, normalizeProperty, createRecord }
