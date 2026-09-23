import { useEffect, useRef, useState } from 'react'
import { CRECI } from '../content/siteContent'
import { BrandMark } from './BrandMark'

export const INTRO_SESSION_KEY = 'ferreira-intro-v1'
export const INTRO_MIN_HOLD_MS = 1050
export const INTRO_MAX_WAIT_MS = 3600
export const INTRO_EXIT_MS = 760

type IntroPhase = 'waiting' | 'revealing'
type IntroPortalProps = { waitForReady?: () => Promise<void> }

function hasReducedMotion() { return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) }
function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  try { if (window.sessionStorage.getItem(INTRO_SESSION_KEY) === 'seen') return false } catch { /* non-blocking */ }
  return !hasReducedMotion()
}
function decodeImage(image: HTMLImageElement) { return typeof image.decode === 'function' ? image.decode().catch(() => undefined) : Promise.resolve() }
function waitForImage(image: HTMLImageElement | null) {
  if (!image) return Promise.resolve()
  if (image.complete) return decodeImage(image)
  return new Promise<void>((resolve) => {
    const finish = () => { image.removeEventListener('load', finish); image.removeEventListener('error', finish); void decodeImage(image).finally(resolve) }
    image.addEventListener('load', finish, { once: true }); image.addEventListener('error', finish, { once: true })
  })
}
function waitForFonts() { const fonts = document.fonts; return fonts?.ready ? Promise.resolve(fonts.ready).then(() => undefined, () => undefined) : Promise.resolve() }
export async function waitForCriticalContent() {
  if (typeof document === 'undefined') return
  const heroImage = document.querySelector<HTMLImageElement>('[data-hero-image="critical"]')
  await Promise.allSettled([waitForImage(heroImage), waitForFonts()])
}
function waitForStablePaint() {
  if (typeof window.requestAnimationFrame !== 'function') return Promise.resolve()
  return new Promise<void>((resolve) => {
    let settled = false
    const fallback = window.setTimeout(() => { if (!settled) { settled = true; resolve() } }, 120)
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => { if (!settled) { settled = true; window.clearTimeout(fallback); resolve() } }))
  })
}
function markIntroAsSeen() {
  document.body.classList.add('intro-completed')
  try { window.sessionStorage.setItem(INTRO_SESSION_KEY, 'seen') } catch { /* non-blocking */ }
}

export function IntroPortal({ waitForReady = waitForCriticalContent }: IntroPortalProps = {}) {
  const [visible, setVisible] = useState(shouldPlayIntro)
  const [phase, setPhase] = useState<IntroPhase>('waiting')
  const readinessRef = useRef(waitForReady)
  useEffect(() => { readinessRef.current = waitForReady }, [waitForReady])
  useEffect(() => {
    if (!visible) return
    let cancelled = false
    const timers = new Set<number>()
    const delay = (ms: number) => new Promise<void>((resolve) => { const timer = window.setTimeout(() => { timers.delete(timer); resolve() }, ms); timers.add(timer) })
    document.body.classList.add('intro-active')
    const minimumHold = delay(INTRO_MIN_HOLD_MS)
    const safeTimeout = delay(INTRO_MAX_WAIT_MS)
    const ready = Promise.resolve().then(() => readinessRef.current()).catch(() => undefined)
    void Promise.race([Promise.all([minimumHold, ready]), safeTimeout]).then(async () => {
      if (cancelled) return
      await waitForStablePaint()
      if (cancelled) return
      setPhase('revealing')
      const timer = window.setTimeout(() => { timers.delete(timer); if (!cancelled) { markIntroAsSeen(); setVisible(false) } }, INTRO_EXIT_MS)
      timers.add(timer)
    })
    return () => { cancelled = true; timers.forEach((timer) => window.clearTimeout(timer)); timers.clear(); document.body.classList.remove('intro-active') }
  }, [visible])
  if (!visible) return null
  return (
    <div className={`intro-portal intro-portal--${phase}`} data-state={phase} data-testid="intro-portal" aria-hidden="true">
      <div className="intro-portal__panel intro-portal__panel--left"><span /></div>
      <div className="intro-portal__panel intro-portal__panel--right"><span /></div>
      <div className="intro-portal__threshold"><BrandMark /><span className="intro-portal__creci">CRECI {CRECI}</span></div>
      <div className="intro-portal__roof"><i /><i /><span /></div><span className="intro-portal__light" />
    </div>
  )
}
