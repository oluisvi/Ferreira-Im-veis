const SHEET_NAME = 'ferreira-imoveis-template.csv'
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

function doPost(event) {
  const sheet = getSheet()
  const payload = JSON.parse(event.postData.contents || '{}')
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
  const row = headers.map((header) => valueForHeader(payload, header))
  sheet.appendRow(row)

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
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

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0]

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
  }

  return sheet
}
