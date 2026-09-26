// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import vm from 'node:vm'
import handler from '../api/admin-property'
import propertiesHandler from '../api/properties.ts'
import { del } from '@vercel/blob'
import { requireAdmin } from '../server/admin-auth'
vi.mock('@vercel/blob', () => ({ del: vi.fn() }))
vi.mock('../server/admin-auth.ts', () => ({ requireAdmin: vi.fn(() => true) }))

const photo = 'https://store.public.blob.vercel-storage.com/photo.jpg'
const video = 'https://store.public.blob.vercel-storage.com/video.mp4'
const shared = 'https://store.public.blob.vercel-storage.com/shared.jpg'
class Sheet {
  constructor(public name: string, public data: any[][]) {}
  getName() { return this.name }
  getLastRow() { return this.data.length }
  getLastColumn() { return Math.max(0, ...this.data.map(r => r.length)) }
  getDataRange() { return { getValues: () => this.data.map(r => [...r]) } }
  getRange(row: number, col: number, rows: number, cols: number) {
    return {
      getValues: () => Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => this.data[row - 1 + i]?.[col - 1 + j] ?? '')),
      setValues: (values: any[][]) => values.forEach((r, i) => r.forEach((value, j) => {
        this.data[row - 1 + i] ||= []
        this.data[row - 1 + i][col - 1 + j] = value
      })),
    }
  }
  deleteRow(index: number) { this.data.splice(index - 1, 1) }
  appendRow(row: any[]) { this.data.push(row) }
  setFrozenRows() {}
}
let sheets: Sheet[], context: any, storage: Map<string, string>
function script(payload: any) { return JSON.parse(context.doPost({ postData: { contents: JSON.stringify(payload) } }).text) }
function response() {
  return { statusCode: 200, body: null as any, setHeader: vi.fn(), status(code: number) { this.statusCode = code; return this }, json(body: any) { this.body = body; return this } }
}
async function remove(extra = {}) {
  const res = response()
  await handler({ method: 'DELETE', body: { code: ' A ', confirmation: true, ...extra } }, res)
  return res
}
beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(requireAdmin).mockReturnValue(true)
  vi.mocked(del).mockResolvedValue(undefined)
  process.env.PROPERTIES_SCRIPT_URL = 'https://script.example/exec'
  process.env.BLOB_READ_WRITE_TOKEN = 'test-token'
  sheets = [
    new Sheet('Imoveis', [[' Código ', 'Título', 'Status', 'Foto principal', 'Fotos', 'Vídeo'], [' A ', 'Casa', 'Ativo', photo, `${photo} | ${shared}`, video], ['B', 'Outra', 'Ativo', shared, '', '']]),
    new Sheet('ferreira-imoveis-template.csv', [['ID', 'imagem'], ['a', photo]]),
    new Sheet('WhatsAppClicks', [['Timestamp', 'PropertyId'], ['date', ' A '], ['date', 'B']]),
  ]
  storage = new Map()
  const spreadsheet = { getSheetByName: (name: string) => sheets.find(s => s.name === name), insertSheet: (name: string) => { const s = new Sheet(name, []); sheets.push(s); return s } }
  context = vm.createContext({
    SpreadsheetApp: { getActiveSpreadsheet: () => spreadsheet, flush() {} },
    LockService: { getScriptLock: () => ({ waitLock() {}, hasLock: () => true, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (key: string) => storage.get(key), setProperty: (key: string, value: string) => storage.set(key, value), deleteProperty: (key: string) => storage.delete(key) }) },
    Utilities: { getUuid: () => 'token' },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (text: string) => ({ text, setMimeType() { return this } }) },
  })
  vm.runInContext(fs.readFileSync('docs/google-apps-script.gs', 'utf8'), context)
  vi.stubGlobal('fetch', vi.fn(async (url, options: any) => {
    const body = options?.method === 'POST' ? script(JSON.parse(options.body)) : JSON.parse(context.doGet({ parameter: Object.fromEntries(new URL(url).searchParams) }).text)
    return { ok: true, json: async () => body }
  }))
})

describe('exclusão integrada API + Apps Script', () => {
  it('apaga mídias exclusivas, duplicatas nas duas abas e eventos, preservando outro imóvel', async () => {
    const res = await remove({ media: ['https://store.public.blob.vercel-storage.com/forged.jpg'] })
    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ ok: true, exists: false, deletedRows: 2, deletedEvents: 1, mediaDeleted: 2, sharedMedia: 1 })
    expect(vi.mocked(del).mock.calls.map(([url]) => url)).toEqual([photo, video])
    expect(vi.mocked(del).mock.calls.map(([, options]) => options?.storeId)).toEqual(['store', 'store'])
    expect(sheets[0].data.length).toBe(2)
    expect(sheets[1].data.length).toBe(1)
    expect(sheets[2].data).toEqual([['Timestamp', 'PropertyId'], ['date', 'B']])
    expect(storage.size).toBe(0)
  })
  it('retém referências ao falhar Blob e permite concluir após nova tentativa', async () => {
    vi.mocked(del).mockRejectedValueOnce(new Error('Blob unavailable'))
    expect((await remove()).statusCode).toBe(502)
    expect(sheets[0].data.length).toBe(3)
    expect(sheets[1].data.length).toBe(2)
    expect(script({ action: 'update_property', id: 'A', titulo: 'Alteração' }).ok).toBe(false)
    expect((await remove()).body.ok).toBe(true)
    expect(sheets[0].data.length).toBe(2)
  })
  it('repete com segurança quando a resposta final é perdida', async () => {
    await remove()
    vi.mocked(del).mockClear()
    expect((await remove()).body).toMatchObject({ ok: true, deletedRows: 0, mediaDeleted: 0 })
    expect(del).not.toHaveBeenCalled()
  })
  it('não recria eventos de um imóvel excluído quando chega um clique atrasado', async () => {
    await remove()
    expect(script({ action: 'whatsapp_click', propertyId: 'A', source: 'catalog' }).ok).toBe(true)
    expect(sheets[2].data.length).toBe(2)
  })
  it('aceita uma aba alternativa vazia sem impedir a exclusão', async () => {
    sheets[1].data = []
    expect((await remove()).body).toMatchObject({ ok: true, deletedRows: 1 })
  })
  it('retoma quando o commit falha após a limpeza das mídias', async () => {
    const originalDelete = sheets[0].deleteRow.bind(sheets[0])
    sheets[0].deleteRow = vi.fn().mockImplementationOnce(() => { throw new Error('Sheets indisponível') }).mockImplementation(originalDelete)
    expect((await remove()).statusCode).toBe(502)
    expect(sheets[0].data.length).toBe(3)
    expect((await remove()).body.ok).toBe(true)
    expect(storage.size).toBe(0)
  })
  it('não modifica nada quando falta confirmação ou autenticação', async () => {
    expect((await remove({ confirmation: false })).statusCode).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
    vi.mocked(requireAdmin).mockReturnValue(false)
    await remove()
    expect(fetch).not.toHaveBeenCalled()
  })
  it('recusa script antigo antes de enviar qualquer POST', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as any)
    expect((await remove()).statusCode).toBe(502)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(del).not.toHaveBeenCalled()
  })
  it('aceita a autenticação OIDC sem BLOB_READ_WRITE_TOKEN', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    expect((await remove()).statusCode).toBe(200)
    expect(vi.mocked(del).mock.calls[0][1]).toMatchObject({ storeId: 'store' })
    expect(sheets[0].data.length).toBe(2)
  })
  it('mantém as linhas se o SDK não encontrar credenciais Blob', async () => {
    delete process.env.BLOB_READ_WRITE_TOKEN
    vi.mocked(del).mockRejectedValue(new Error('No blob credentials found'))
    expect((await remove()).statusCode).toBe(502)
    expect(sheets[0].data.length).toBe(3)
    expect(del).toHaveBeenCalled()
  })
  it('recusa commit se mídias forem alteradas diretamente na planilha', () => {
    const prepared = script({ action: 'prepare_delete_property', code: 'a' })
    sheets[0].data[1][3] = 'https://store.public.blob.vercel-storage.com/new.jpg'
    expect(script({ action: 'commit_delete_property', code: 'a', ...prepared }).ok).toBe(false)
    expect(sheets[0].data.length).toBe(3)
  })
  it('informa links externos sem enviá-los ao Blob', async () => {
    sheets[0].data[1][5] = 'https://youtube.com/watch?v=example'
    expect((await remove()).body.externalMedia).toBe(1)
    expect(del).toHaveBeenCalledTimes(1)
  })
  it('não confunde domínios parecidos com Blob', async () => {
    sheets[0].data[1][5] = 'https://fakeblob.vercel-storage.com/file.mp4'
    expect((await remove()).body.externalMedia).toBe(1)
    expect(del).toHaveBeenCalledTimes(1)
  })
  it('guarda galeria, vídeo e histórico de mídias no formato antigo', () => {
    sheets = [new Sheet('Imoveis', [['id', 'titulo', 'imagem']])]
    expect(script({ action: 'create_property', id: 'X', titulo: 'Casa', imagem: photo, imagens: `${photo} | ${shared}`, video }).ok).toBe(true)
    expect(sheets[0].data[0]).toContain('imagens')
    expect(sheets[0].data[0]).toContain('video')
    expect(script({ action: 'update_property', id: 'X', imagem: shared }).ok).toBe(true)
    expect(script({ action: 'prepare_delete_property', code: 'x' }).media).toEqual([photo, shared, video])
  })
  it('catálogo lê o mesmo Apps Script e admin também lista imóveis ocultos', async () => {
    sheets[0].data[1][2] = 'Oculto'
    let res = response()
    await propertiesHandler({ method: 'GET', query: {} }, res)
    expect(res.body.properties.map((p: any) => p.code)).toEqual(['B'])
    res = response()
    await propertiesHandler({ method: 'GET', query: { admin: '1' } }, res)
    expect(res.body.properties.map((p: any) => p.code)).toEqual(['A', 'B'])
    expect(requireAdmin).toHaveBeenCalled()
  })
  it('resposta HTTP 200 com erro no Apps Script nunca vira sucesso', async () => {
    const original = fetch
    vi.stubGlobal('fetch', vi.fn(async (url, options) => options?.method === 'POST'
      ? { ok: true, json: async () => ({ ok: false, error: 'Falha da planilha' }) }
      : original(url, options)))
    expect((await remove()).statusCode).toBe(502)
    expect(del).not.toHaveBeenCalled()
  })
})
