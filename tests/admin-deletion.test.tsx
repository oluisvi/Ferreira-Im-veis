import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { Admin } from '../src/components/Admin'
import { loadProperties } from '../src/data/propertyCatalog'
import { getProperties } from '../src/content/propertiesData'
vi.mock('@vercel/blob/client', () => ({ upload: vi.fn() }))
let deleteRequest: ReturnType<typeof vi.fn>
beforeEach(() => {
  deleteRequest = vi.fn()
  vi.stubGlobal('alert', vi.fn())
  vi.stubGlobal('fetch', vi.fn(async (url, options) => {
    if (options?.method === 'DELETE') return deleteRequest(url, options)
    return { ok: true, json: async () => String(url).includes('admin-session')
      ? { authenticated: true }
      : { properties: [{ code: 'A', title: 'Casa teste', city: 'Taubaté', mainImage: 'image.jpg', photos: [], video: '' }] } }
  }))
})
async function confirm() {
  render(<Admin />)
  fireEvent.click(await screen.findByRole('button', { name: /Excluir imóvel/ }))
  fireEvent.click(await screen.findByRole('button', { name: 'Excluir', exact: true }))
  fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }))
}
it('mantém o card quando a rede falha e permite tentar novamente', async () => {
  deleteRequest.mockRejectedValueOnce(new Error('Sem conexão'))
  await confirm()
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Sem conexão'))
  expect(screen.getByRole('button', { name: 'Sim, excluir' })).toBeEnabled()
  deleteRequest.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, exists: false }) })
  fireEvent.click(screen.getByRole('button', { name: 'Sim, excluir' }))
  await waitFor(() => expect(screen.queryByText('Excluir imóvel definitivamente?')).not.toBeInTheDocument())
  expect(deleteRequest).toHaveBeenCalledTimes(2)
  expect(JSON.parse(deleteRequest.mock.calls[0][1].body)).toEqual({ code: 'A', confirmation: true })
})
it('não esconde o imóvel ao receber HTTP 200 sem confirmação completa', async () => {
  deleteRequest.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: false, error: 'Falha' }) })
  await confirm()
  await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Falha'))
  expect(screen.getByText('Excluir imóvel definitivamente?')).toBeInTheDocument()
})
it('bloqueia cliques repetidos enquanto a exclusão aguarda resposta', async () => {
  let finish: (result: any) => void = () => {}
  deleteRequest.mockReturnValue(new Promise(resolve => { finish = resolve }))
  await confirm()
  const button = screen.getByRole('button', { name: 'Excluindo…' })
  expect(button).toBeDisabled()
  fireEvent.click(button)
  expect(deleteRequest).toHaveBeenCalledTimes(1)
  finish({ ok: true, json: async () => ({ ok: true, exists: false }) })
  await waitFor(() => expect(screen.queryByText('Excluir imóvel definitivamente?')).not.toBeInTheDocument())
})
it('catálogo e página inicial permanecem vazios após excluir o último imóvel', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ properties: [] }) })))
  expect((await loadProperties()).properties).toEqual([])
  expect(await getProperties()).toEqual([])
})
