const SHEET_NAME = 'ferreira-imoveis-template.csv'
const WHATSAPP_SHEET_NAME = 'WhatsAppClicks'

const HEADERS = [
  'id',
  'ativo',
  'categoria',
  'titulo',
  'preco',
  'localizacao',
  'area',
  'quartos',
  'banheiros',
  'vagas',
  'descricao',
  'imagem',
  'link',
]

const WHATSAPP_HEADERS = [
  'Timestamp',
  'Source',
  'Page',
  'PropertyId',
  'PropertyType',
  'City',
  'Neighborhood',
]

function doPost(event) {
  const payload = JSON.parse((event.postData && event.postData.contents) || '{}')

  if (payload.action === 'whatsapp_click') {
    return saveWhatsAppClick(payload)
  }

  return saveProperty(payload)
}

function doGet(event) {
  const action = String((event.parameter && event.parameter.action) || '')

  if (action === 'whatsapp-report') {
    const requestedDays = Number((event.parameter && event.parameter.days) || 3)
    const days = [1, 2, 3].indexOf(requestedDays) >= 0 ? requestedDays : 3
    return buildWhatsAppReport(days)
  }

  return jsonResponse({ ok: true })
}

function saveProperty(payload) {
  const sheet = getPropertySheet()
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const row = headers.map((header) => valueForHeader(payload, header))
  sheet.appendRow(row)

  return jsonResponse({ ok: true })
}

function saveWhatsAppClick(payload) {
  const sheet = getWhatsAppSheet()
  const occurredAt = new Date(payload.occurredAt || new Date().toISOString())
  const timestamp = isNaN(occurredAt.getTime()) ? new Date() : occurredAt

  sheet.appendRow([
    timestamp,
    cleanCell(payload.source),
    cleanCell(payload.path),
    cleanCell(payload.propertyId),
    cleanCell(payload.propertyType),
    cleanCell(payload.city),
    cleanCell(payload.neighborhood),
  ])

  return jsonResponse({ ok: true })
}

function buildWhatsAppReport(days) {
  const sheet = getWhatsAppSheet()
  const lastRow = sheet.getLastRow()

  if (lastRow <= 1) {
    return jsonResponse({
      ok: true,
      available: true,
      total: 0,
      sources: [],
      pages: [],
      properties: [],
      generatedAt: new Date().toISOString(),
    })
  }

  const rows = sheet.getRange(2, 1, lastRow - 1, WHATSAPP_HEADERS.length).getValues()
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  const sources = {}
  const pages = {}
  const properties = {}
  let total = 0

  rows.forEach((row) => {
    const rawTimestamp = row[0]
    const timestamp = rawTimestamp instanceof Date ? rawTimestamp : new Date(rawTimestamp)
    if (isNaN(timestamp.getTime()) || timestamp.getTime() < cutoff) return

    total += 1
    increment(sources, String(row[1] || 'Não identificado'))
    increment(pages, String(row[2] || 'Página não identificada'))

    const propertyId = String(row[3] || '').trim()
    if (propertyId) increment(properties, propertyId)
  })

  return jsonResponse({
    ok: true,
    available: true,
    total,
    sources: toBreakdown(sources, total),
    pages: toBreakdown(pages, total),
    properties: toBreakdown(properties, total),
    generatedAt: new Date().toISOString(),
  })
}

function increment(target, key) {
  target[key] = (target[key] || 0) + 1
}

function toBreakdown(values, total) {
  return Object.keys(values)
    .map((label) => ({
      label,
      count: values[label],
      share: total ? Math.round((values[label] / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
}

function cleanCell(value) {
  return String(value || '').trim().slice(0, 300)
}

function valueForHeader(payload, header) {
  const aliases = {
    'Código': payload.id,
    'Título': payload.titulo,
    'Tipo': payload.categoria,
    'Finalidade': payload.finalidade || 'Venda',
    'Cidade': payload.cidade || payload.localizacao,
    'Bairro': payload.bairro || '',
    'Endereço': payload.endereco || payload.localizacao,
    'Preço': payload.preco,
    'Quartos': payload.quartos,
    'Banheiros': payload.banheiros,
    'Vagas': payload.vagas,
    'Área': payload.area,
    'Descrição': payload.descricao,
    'Foto principal': payload.imagem,
    'Fotos': payload.imagens || payload.imagem,
    'Corretor': payload.corretor || 'Ferreira',
    'CRECI': payload.creci || '133794-F',
    'WhatsApp': payload.whatsapp || '5512997665886',
    'Status': payload.ativo === 'não' ? 'Oculto' : 'Ativo',
    'Destaque': payload.destaque || 'Não',
  }
  return aliases[header] || payload[header] || ''
}

function getPropertySheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0]

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
  }

  return sheet
}

function getWhatsAppSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = spreadsheet.getSheetByName(WHATSAPP_SHEET_NAME)

  if (!sheet) {
    sheet = spreadsheet.insertSheet(WHATSAPP_SHEET_NAME)
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(WHATSAPP_HEADERS)
    sheet.setFrozenRows(1)
  }

  return sheet
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}
