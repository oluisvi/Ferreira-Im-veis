import { useEffect, useState } from 'react'
import { CRECI } from '../content/siteContent'
import { BrandMark } from './BrandMark'

export const INTRO_SESSION_KEY = 'ferreira-intro-v1'

function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'seen') return false
  return !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

export function IntroPortal() {
  const [visible, setVisible] = useState(shouldPlayIntro)

  useEffect(() => {
    if (!visible) return
    document.body.classList.add('intro-active')
    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(INTRO_SESSION_KEY, 'seen')
      setVisible(false)
    }, 1800)
    return () => {
      window.clearTimeout(timer)
      document.body.classList.remove('intro-active')
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="intro-portal" data-testid="intro-portal" aria-hidden="true">
      <div className="intro-portal__panel intro-portal__panel--left"><span /></div>
      <div className="intro-portal__panel intro-portal__panel--right"><span /></div>
      <div className="intro-portal__threshold">
        <BrandMark />
        <span className="intro-portal__creci">CRECI {CRECI}</span>
      </div>
      <div className="intro-portal__roof"><i /><i /><span /></div>
      <span className="intro-portal__light" />
    </div>
  )
}
