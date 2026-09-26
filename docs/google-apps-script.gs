const SHEET_NAME = 'Imoveis'
const LEGACY_PROPERTY_SHEET_NAME = 'ferreira-imoveis-template.csv'
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
  'imagens',
  'video',
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
  const lock = LockService.getScriptLock()
  try {
    lock.waitLock(20000)
    const payload = JSON.parse((event.postData && event.postData.contents) || '{}')
    switch (payload.action) {
      case 'whatsapp_click': return saveWhatsAppClick(payload)
      case 'prepare_delete_property': return prepareDeleteProperty(payload)
      case 'commit_delete_property': return commitDeleteProperty(payload)
      case 'delete_property': return jsonResponse({ ok: false, error: 'Atualize o site para o protocolo de exclusão completa.' })
      case 'update_property': return updateProperty(payload)
      case 'create_property': return saveProperty(payload)
      default: return jsonResponse({ ok: false, error: 'Ação desconhecida. Atualize o site e o Apps Script.' })
    }
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error.message || error) })
  } finally {
    if (lock.hasLock()) {
      SpreadsheetApp.flush()
      lock.releaseLock()
    }
  }
}

function normalizePropertyCode(value) {
  return String(value == null ? '' : value).trim().toLowerCase()
}

function findPropertyRows(sheet, code) {
  if (sheet.getLastRow() === 0) return { headers: [], rows: [] }
  const values = sheet.getDataRange().getValues()
  const headers = (values[0] || []).map(String)
  const codeColumn = headers.findIndex((header) => ['codigo', 'code', 'id', 'referencia'].indexOf(normalizeHeader(header)) >= 0)
  if (codeColumn < 0) throw new Error('Coluna de identificação não encontrada em ' + sheet.getName())
  const normalizedCode = normalizePropertyCode(code)
  if (!normalizedCode) throw new Error('Código do imóvel obrigatório.')
  const rows = []
  for (let index = 1; index < values.length; index += 1) {
    if (normalizePropertyCode(values[index][codeColumn]) === normalizedCode) rows.push(index + 1)
  }
  return { headers, rows }
}

function findPropertyRow(sheet, code) {
  const found = findPropertyRows(sheet, code)
  return { headers: found.headers, row: found.rows[0] || -1 }
}


function updateProperty(payload) {
  assertNotDeleting(payload.id || payload.code)
  const sheet = getPropertySheets().find((item) => findPropertyRows(item, payload.id || payload.code).rows.length) || getPropertySheet()
  ensureMediaColumns(sheet)
  const found = findPropertyRow(sheet, payload.id || payload.code)
  if (found.row < 0) return jsonResponse({ ok: false, error: 'Imóvel não encontrado.' })
  const current = sheet.getRange(found.row, 1, 1, found.headers.length).getValues()[0]
  const history = collectMedia(found.headers, current).concat(payloadMedia(payload))
  const row = found.headers.map((header, index) => {
    if (header === '_midias') return uniqueMedia(history).join(' | ')
    const next = valueForHeader(payload, header)
    return next === '' && current[index] !== '' ? current[index] : next
  })
  sheet.getRange(found.row, 1, 1, row.length).setValues([row])
  return jsonResponse({ ok: true, updated: payload.id || payload.code })
}

function doGet(event) {
  const action = String((event.parameter && event.parameter.action) || '')

  if (action === 'delete-capabilities') return jsonResponse({ ok: true, protocol: 2 })

  if (action === 'property-list') {
    return jsonResponse({ ok: true, protocol: 2, sheets: getPropertySheets().map((sheet) => {
      const values = sheet.getDataRange().getValues()
      return { headers: values[0] || [], rows: values.slice(1) }
    }) })
  }

  if (action === 'property-check') {
    const matches = getPropertySheets().reduce((count, sheet) => count + findPropertyRows(sheet, event.parameter.code).rows.length, 0)
    return jsonResponse({ ok: true, exists: matches > 0, matches })
  }

  if (action === 'whatsapp-report') {
    const requestedDays = Number((event.parameter && event.parameter.days) || 3)
    const days = [1, 2, 3].indexOf(requestedDays) >= 0 ? requestedDays : 3
    return buildWhatsAppReport(days)
  }

  return jsonResponse({ ok: true })
}

function saveProperty(payload) {
  assertNotDeleting(payload.id || payload.code)
  const sheet = getPropertySheet()
  ensureMediaColumns(sheet)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const row = headers.map((header) => header === '_midias' ? uniqueMedia(payloadMedia(payload)).join(' | ') : valueForHeader(payload, header))
  sheet.appendRow(row)

  return jsonResponse({ ok: true })
}

function saveWhatsAppClick(payload) {
  if (payload.propertyId && (isDeleting(payload.propertyId) || !getPropertySheets().some((sheet) => findPropertyRows(sheet, payload.propertyId).rows.length))) return jsonResponse({ ok: true })
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
    'Vídeo': payload.video || '',
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
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheetByName(LEGACY_PROPERTY_SHEET_NAME)

  if (!sheet) {
    throw new Error('Aba de imóveis não encontrada. Crie ou renomeie a aba para "Imoveis".')
  }

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

// Exclusão em duas fases: mantém as referências até o Blob confirmar a limpeza.
function normalizeHeader(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

function getPropertySheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheets = [SHEET_NAME, LEGACY_PROPERTY_SHEET_NAME].map((name) => spreadsheet.getSheetByName(name)).filter(Boolean)
  if (!sheets.length) throw new Error('Nenhuma aba de imóveis encontrada.')
  return sheets
}

function deletionKey(code) { return 'delete:' + normalizePropertyCode(code) }
function isDeleting(code) { return PropertiesService.getScriptProperties().getProperty(deletionKey(code)) }
function assertNotDeleting(code) {
  if (!normalizePropertyCode(code)) throw new Error('Código do imóvel obrigatório.')
  if (isDeleting(code)) throw new Error('Este imóvel tem uma exclusão pendente. Conclua a exclusão no painel.')
}

function uniqueMedia(values) {
  return Array.from(new Set(values.map((value) => String(value).trim()).filter(Boolean))).sort()
}
function splitMedia(value) {
  const text = String(value || '').trim()
  if (!text) return []
  if (text[0] === '[') {
    try { const parsed = JSON.parse(text); if (Array.isArray(parsed)) return parsed.filter((item) => typeof item === 'string') } catch (_) { /* texto simples */ }
  }
  return text.split(/\s*\|\s*|\r?\n/).map((item) => item.trim()).filter(Boolean)
}
function payloadMedia(payload) {
  return ['imagem', 'imagens', 'video', 'midias'].reduce((all, key) => all.concat(splitMedia(payload[key])), [])
}
function collectMedia(headers, row) {
  const names = ['imagem', 'imagens', 'fotos', 'galeria', 'fotoprincipal', 'capa', 'video', 'videos', 'touremvideo', 'midias']
  return uniqueMedia(headers.reduce((all, header, index) => names.indexOf(normalizeHeader(header)) >= 0 ? all.concat(splitMedia(row[index])) : all, []))
}
function ensureMediaColumns(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(normalizeHeader)
  // O esquema antigo salvava somente a capa e perdia fotos adicionais e vídeos.
  const additions = []
  if (!headers.some((h) => ['fotos', 'galeria', 'imagens'].indexOf(h) >= 0)) additions.push('imagens')
  if (!headers.some((h) => ['video', 'touremvideo'].indexOf(h) >= 0)) additions.push('video')
  if (headers.indexOf('midias') < 0) additions.push('_midias')
  if (additions.length) sheet.getRange(1, sheet.getLastColumn() + 1, 1, additions.length).setValues([additions])
}

function deletionInventory(code) {
  const targets = []
  const others = []
  const sheets = getPropertySheets().map((sheet) => {
    const found = findPropertyRows(sheet, code)
    const values = sheet.getDataRange().getValues()
    values.slice(1).forEach((row, index) => {
      const destination = found.rows.indexOf(index + 2) >= 0 ? targets : others
      collectMedia(found.headers, row).forEach((url) => destination.push(url))
    })
    return { sheet, rows: found.rows }
  })
  const shared = new Set(others)
  return { sheets, media: uniqueMedia(targets).filter((url) => !shared.has(url)),
    sharedMedia: uniqueMedia(targets).filter((url) => shared.has(url)).length }
}

function prepareDeleteProperty(payload) {
  const inventory = deletionInventory(payload.code)
  const properties = PropertiesService.getScriptProperties()
  const key = deletionKey(payload.code)
  const token = properties.getProperty(key) || Utilities.getUuid()
  properties.setProperty(key, token)
  return jsonResponse({ ok: true, protocol: 2, token, media: inventory.media, sharedMedia: inventory.sharedMedia })
}

function commitDeleteProperty(payload) {
  const key = deletionKey(payload.code)
  const properties = PropertiesService.getScriptProperties()
  if (!payload.token || properties.getProperty(key) !== payload.token) throw new Error('Exclusão não preparada. Tente novamente.')
  const inventory = deletionInventory(payload.code)
  if (!Array.isArray(payload.media) || JSON.stringify(uniqueMedia(payload.media)) !== JSON.stringify(inventory.media)) {
    throw new Error('As mídias mudaram durante a exclusão. Tente novamente.')
  }
  // Valida o esquema de eventos antes de qualquer remoção.
  const clicks = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WHATSAPP_SHEET_NAME)
  const clickValues = clicks ? clicks.getDataRange().getValues() : []
  const propertyColumn = (clickValues[0] || []).findIndex((header) => normalizeHeader(header) === 'propertyid')
  if (clickValues.length > 1 && propertyColumn < 0) throw new Error('Coluna PropertyId não encontrada em WhatsAppClicks.')
  let deletedEvents = 0
  if (clicks && propertyColumn >= 0) {
    for (let i = clickValues.length - 1; i >= 1; i -= 1) {
      if (normalizePropertyCode(clickValues[i][propertyColumn]) === normalizePropertyCode(payload.code)) {
        clicks.deleteRow(i + 1)
        deletedEvents += 1
      }
    }
  }
  let deletedRows = 0
  inventory.sheets.forEach(({ sheet, rows }) => {
    rows.slice().reverse().forEach((row) => { sheet.deleteRow(row); deletedRows += 1 })
  })
  SpreadsheetApp.flush()
  if (getPropertySheets().some((sheet) => findPropertyRows(sheet, payload.code).rows.length)) throw new Error('Ainda existem linhas do imóvel. Tente novamente.')
  properties.deleteProperty(key)
  return jsonResponse({ ok: true, protocol: 2, deleted: normalizePropertyCode(payload.code), exists: false, deletedRows, deletedEvents })
}
