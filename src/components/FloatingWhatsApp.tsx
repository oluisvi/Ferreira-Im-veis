import { useEffect, useState } from 'react'
import { buildWhatsAppUrl } from '../content/siteContent'

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('inicio')
    const contact = document.getElementById('contato')
    if (!hero || !contact || !('IntersectionObserver' in window)) { setVisible(true); return }
    let heroVisible = true
    let contactVisible = false
    const sync = () => setVisible(!heroVisible && !contactVisible)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === hero) heroVisible = entry.isIntersecting
        if (entry.target === contact) contactVisible = entry.isIntersecting
      })
      sync()
    }, { threshold: 0.12 })
    observer.observe(hero); observer.observe(contact)
    return () => observer.disconnect()
  }, [])

  return (
    <a className={`floating-whatsapp${visible ? ' is-visible' : ''}`} href={buildWhatsAppUrl('Olá, Ferreira! Gostaria de conversar sobre um imóvel.')} target="_blank" rel="noreferrer" aria-label="Conversar com Ferreira pelo WhatsApp">
      <span className="floating-whatsapp__signal" aria-hidden="true"><i /></span>
      <span className="floating-whatsapp__copy"><small>Atendimento direto</small><strong>Falar no WhatsApp</strong></span>
      <span className="floating-whatsapp__arrow" aria-hidden="true">↗</span>
    </a>
  )
}
