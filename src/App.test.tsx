import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
  sessionStorage.setItem('ferreira-intro-v1', 'seen')
})

describe('Ferreira Corretor de Imóveis experience', () => {
  it('renders the premium home and catalog entry point', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/imóvel ideal/i)
    expect(screen.getByRole('link', { name: /ver imóveis/i })).toHaveAttribute('href', '/imoveis')
    expect(screen.getAllByTestId('property-card')).toHaveLength(3)
    expect(screen.getByText(/Ferreira Corretor de Imóveis/i)).toBeInTheDocument()
  })

  it('renders catalog filters from query params', () => {
    window.history.replaceState({}, '', '/imoveis?city=Jacare%C3%AD&purpose=Venda')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/faça sentido/i)
    expect(screen.getByLabelText(/cidade/i)).toHaveValue('Jacareí')
    expect(screen.getByLabelText(/finalidade/i)).toHaveValue('Venda')
  })

  it('renders an individual property route from fallback catalog', () => {
    window.history.replaceState({}, '', '/imovel/FI-001')
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/casa contemporânea/i)
    expect(screen.getByText(/FI-001/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /chamar no whatsapp/i })).toHaveAttribute('href', expect.stringContaining('FI-001'))
  })
})
