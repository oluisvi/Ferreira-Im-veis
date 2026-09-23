import { useEffect, useState } from 'react'
import { BRAND_NAME, CRECI, buildWhatsAppUrl, navigation } from '../content/siteContent'
import { BrandMark } from './BrandMark'

export function Header({ variant = 'overlay' }: { variant?: 'overlay' | 'solid' }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  return (
    <header className={`header ${variant === 'solid' ? 'header--solid' : 'header--overlay'} ${open ? 'header--menu-open' : ''}`}>
      <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
      <a className="header__brand" href="/" aria-label={`${BRAND_NAME} — início`}><BrandMark compact /></a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="main-nav"
        aria-label={open ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
        onClick={() => setOpen(!open)}
      >
        <span>{open ? 'Fechar' : 'Menu'}</span>
        <span className="menu-toggle__icon" aria-hidden="true"><i /><i /></span>
      </button>
      <nav id="main-nav" className={`nav ${open ? 'nav--open' : ''}`} aria-label="Navegação principal">
        <div className="nav__mobile-head" aria-hidden="true">
          <span>Navegação</span>
          <small>Encontre seu próximo endereço.</small>
        </div>
        <div className="nav__links">
          {navigation.map((item, index) => (
            <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
              <span className="nav__number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.label}</strong>
              <span className="nav__arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <div className="nav__mobile-footer">
          <a className="nav__whatsapp" href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer">
            <span>Atendimento direto</span>
            <strong>Falar no WhatsApp</strong>
            <i aria-hidden="true">↗</i>
          </a>
          <div><span>Ferreira Corretor de Imóveis</span><small>CRECI {CRECI}</small></div>
        </div>
      </nav>
      <a className="header__contact" href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer">
        Falar no WhatsApp <span aria-hidden="true">↗</span>
      </a>
    </header>
  )
}
