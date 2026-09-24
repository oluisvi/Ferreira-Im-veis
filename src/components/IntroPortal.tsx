import { useEffect, useState } from 'react'

export const INTRO_MIN_HOLD_MS = 850
export const INTRO_MAX_WAIT_MS = 1800
export const INTRO_EXIT_MS = 520
export const INTRO_FAST_MIN_HOLD_MS = 850
export const INTRO_FAST_MAX_WAIT_MS = 1800
export const INTRO_FAST_EXIT_MS = 520
export const INTRO_SEEN_STORAGE_KEY = 'ferreira:intro-seen:v2'

type IntroPhase = 'waiting' | 'revealing'
type IntroPortalProps = { waitForReady?: () => Promise<void> }

function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  if (window.location.pathname !== '/' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  try { return window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY) !== '1' } catch { return true }
}

function rememberIntroVisit() {
  try { window.sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, '1') } catch { /* storage can be unavailable */ }
}

export function waitForCriticalContent() { return Promise.resolve() }

export function IntroPortal({ waitForReady = waitForCriticalContent }: IntroPortalProps = {}) {
  const [visible, setVisible] = useState(shouldPlayIntro)
  const [phase, setPhase] = useState<IntroPhase>('waiting')

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    document.body.classList.add('intro-active')
    rememberIntroVisit()
    const minimumHold = new Promise<void>((resolve) => window.setTimeout(resolve, INTRO_MIN_HOLD_MS))
    const safeTimeout = new Promise<void>((resolve) => window.setTimeout(resolve, INTRO_MAX_WAIT_MS))
    const ready = Promise.resolve().then(() => waitForReady()).catch(() => undefined)
    void Promise.race([Promise.all([minimumHold, ready]), safeTimeout]).then(() => {
      if (cancelled) return
      setPhase('revealing')
      window.setTimeout(() => {
        if (cancelled) return
        document.body.classList.remove('intro-active')
        setVisible(false)
      }, INTRO_EXIT_MS)
    })
    return () => { cancelled = true; document.body.classList.remove('intro-active') }
  }, [visible, waitForReady])

  if (!visible) return null
  return (
    <div className={`intro-portal intro-portal--${phase}`} data-state={phase} data-testid="intro-portal" aria-hidden="true">
      <div className="page-loader" role="presentation">
        {[1, 2, 3, 4, 5, 6].map((bar) => <span className={`page-loader__bar page-loader__bar--${bar}`} key={bar} />)}
      </div>
    </div>
  )
}
