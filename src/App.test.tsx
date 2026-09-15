import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Ferreira Imóveis experience', () => {
  it('presents the brand, navigation and confirmed contact', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /pular para o conteúdo/i })).toHaveAttribute('href', '#conteudo')
    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/espaços para a próxima parte/i)
    expect(screen.getAllByRole('link', { name: /whatsapp/i })[0]).toHaveAttribute('href', expect.stringContaining('wa.me/5512997665886'))
    expect(screen.getAllByText(/133794-F/).length).toBeGreaterThan(0)
  })

  it('filters the clearly-labelled visual concepts', () => {
    render(<App />)
    expect(screen.getAllByText(/conceito visual/i)).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Apartamento' }))
    expect(screen.getAllByText(/conceito visual/i)).toHaveLength(1)
    expect(screen.getByText(/cidade por perto/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getAllByText(/conceito visual/i)).toHaveLength(3)
  })

  it('explains the four-step consultative process', () => {
    render(<App />)
    expect(screen.getByText('Entender')).toBeInTheDocument()
    expect(screen.getByText('Selecionar')).toBeInTheDocument()
    expect(screen.getByText('Visitar')).toBeInTheDocument()
    expect(screen.getByText('Negociar')).toBeInTheDocument()
  })
})
