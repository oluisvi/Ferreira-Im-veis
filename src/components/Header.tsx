import { useState } from 'react'
import { buildWhatsAppUrl, navigation } from '../content/siteContent'
import { BrandMark } from './BrandMark'

export function Header({ variant = 'overlay' }: { variant?: 'overlay' | 'solid' }) {
  const [open, setOpen] = useState(false)
  return (
    <header className={`header ${variant === 'solid' ? 'header--solid' : ''}`}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <a className="header__brand" href="/" aria-label="Ferreira Imóveis — início"><BrandMark compact /></a>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
        <span>{open ? 'Fechar' : 'Menu'}</span><i aria-hidden="true" />
      </button>
      <nav id="main-nav" className={`nav ${open ? 'nav--open' : ''}`} aria-label="Navegação principal">
        {navigation.map((item, index) => <a href={item.href} key={item.href} onClick={() => setOpen(false)}><sup>0{index + 1}</sup>{item.label}</a>)}
      </nav>
      <a className="header__contact" href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a>
    </header>
  )
}
