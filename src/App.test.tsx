import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('Ferreira Imóveis experience', () => {
  it('keeps the presentation and exposes the real-estate catalog entry point', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/espaços para a próxima parte/i)
    expect(screen.getByRole('link', { name: /ver imóveis disponíveis/i })).toHaveAttribute('href', '/imoveis')
    expect(screen.getAllByTestId('property-card')).toHaveLength(3)
  })

  it('renders the catalog route with filters', () => {
    window.history.replaceState({}, '', '/imoveis')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/imóveis ativos/i)
    expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/finalidade/i)).toBeInTheDocument()
  })

  it('renders an individual property route from the fallback catalog', () => {
    window.history.replaceState({}, '', '/imovel/FI-001')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/casa contemporânea/i)
    expect(screen.getByText(/FI-001/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /chamar no whatsapp/i })).toHaveAttribute('href', expect.stringContaining('FI-001'))
  })
})
