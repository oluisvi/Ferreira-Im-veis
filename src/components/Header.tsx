import { useState } from 'react'
import { navigation, WHATSAPP_URL } from '../content/siteContent'
import { BrandMark } from './BrandMark'

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="header">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <a className="header__brand" href="#inicio" aria-label="Ferreira Imóveis — início"><BrandMark compact /></a>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(!open)}>
        <span>{open ? 'Fechar' : 'Menu'}</span><i aria-hidden="true" />
      </button>
      <nav id="main-nav" className={`nav ${open ? 'nav--open' : ''}`} aria-label="Navegação principal">
        {navigation.map((item, index) => <a href={item.href} key={item.href} onClick={() => setOpen(false)}><sup>0{index + 1}</sup>{item.label}</a>)}
      </nav>
      <a className="header__contact" href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp <span>↗</span></a>
    </header>
  )
}
