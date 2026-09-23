import { CSSProperties, useEffect, useRef, useState } from 'react'
import { CRECI } from '../content/siteContent'

export const INTRO_MIN_HOLD_MS = 3000
export const INTRO_MAX_WAIT_MS = 5000
export const INTRO_EXIT_MS = 760
export const INTRO_FAST_MIN_HOLD_MS = 900
export const INTRO_FAST_MAX_WAIT_MS = 1600
export const INTRO_FAST_EXIT_MS = 360
export const INTRO_SEEN_STORAGE_KEY = 'ferreira:intro-seen:v1'

type IntroPhase = 'waiting' | 'revealing'
type IntroPace = 'normal' | 'fast'
type IntroPortalProps = { waitForReady?: () => Promise<void> }

type TimedPathProps = {
  d: string
  className: string
  delay?: number
}

function hasReducedMotion() { return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) }
function shouldPlayIntro() {
  if (typeof window === 'undefined') return false
  return !hasReducedMotion()
}
function getIntroPace(): IntroPace {
  if (typeof window === 'undefined') return 'normal'
  try {
    return window.localStorage.getItem(INTRO_SEEN_STORAGE_KEY) === '1' ? 'fast' : 'normal'
  } catch {
    return 'normal'
  }
}
function rememberIntroVisit() {
  try { window.localStorage.setItem(INTRO_SEEN_STORAGE_KEY, '1') } catch { /* storage can be unavailable in private/restricted contexts */ }
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
}

const FOUNDATION = 'M 600,505 L 597,501 L 584,489 L 579,486 L 575,482 L 566,476 L 563,475 L 561,473 L 554,470 L 552,468 L 546,465 L 544,465 L 530,458 L 528,458 L 522,455 L 520,455 L 510,451 L 507,451 L 500,448 L 497,448 L 496,447 L 493,447 L 489,445 L 485,445 L 484,444 L 481,444 L 476,442 L 472,442 L 471,441 L 457,439 L 456,438 L 444,437 L 443,436 L 437,436 L 436,435 L 430,435 L 429,434 L 422,434 L 421,433 L 411,433 L 410,432 L 400,432 L 399,431 L 385,431 L 384,430 L 354,430 L 353,429 L 336,429 L 335,430 L 305,430 L 304,431 L 290,431 L 289,432 L 278,432 L 277,433 L 268,433 L 267,434 L 251,435 L 250,436 L 244,436 L 243,437 L 237,437 L 236,438 L 225,439 L 224,440 L 210,442 L 209,443 L 201,444 L 200,445 L 193,446 L 189,448 L 186,448 L 179,451 L 176,451 L 175,452 L 158,457 L 155,459 L 147,461 L 144,463 L 142,463 L 139,465 L 132,467 L 127,470 L 125,470 L 101,482 L 99,484 L 91,488 L 77,498 L 68,506 L 71,506 L 72,505 L 75,505 L 76,504 L 79,504 L 80,503 L 83,503 L 84,502 L 87,502 L 88,501 L 91,501 L 96,499 L 100,499 L 101,498 L 105,498 L 110,496 L 119,495 L 124,493 L 138,491 L 143,489 L 147,489 L 148,488 L 152,488 L 153,487 L 158,487 L 159,486 L 163,486 L 164,485 L 168,485 L 169,484 L 174,484 L 175,483 L 180,483 L 181,482 L 186,482 L 187,481 L 192,481 L 193,480 L 198,480 L 199,479 L 205,479 L 206,478 L 212,478 L 213,477 L 219,477 L 220,476 L 226,476 L 227,475 L 234,475 L 235,474 L 242,474 L 243,473 L 250,473 L 251,472 L 271,471 L 272,470 L 283,470 L 284,469 L 299,469 L 300,468 L 371,468 L 372,469 L 387,469 L 388,470 L 400,470 L 401,471 L 410,471 L 411,472 L 420,472 L 421,473 L 438,474 L 439,475 L 446,475 L 447,476 L 461,477 L 462,478 L 468,478 L 469,479 L 475,479 L 476,480 L 482,480 L 483,481 L 500,483 L 501,484 L 505,484 L 506,485 L 510,485 L 511,486 L 515,486 L 516,487 L 530,489 L 535,491 L 539,491 L 540,492 L 543,492 L 544,493 L 547,493 L 548,494 L 551,494 L 556,496 L 560,496 L 561,497 L 564,497 L 565,498 L 568,498 L 569,499 L 572,499 L 573,500 L 576,500 L 577,501 L 580,501 L 585,503 L 589,503 L 590,504 L 593,504 L 598,506 L 600,506 Z'
const FACADE = 'M 160,310 L 160,377 L 276,377 L 281,379 L 285,385 L 285,388 L 286,389 L 286,415 L 302,415 L 303,414 L 312,414 L 312,409 L 313,408 L 312,363 L 313,362 L 313,360 L 317,356 L 367,356 L 369,357 L 372,360 L 372,411 L 373,412 L 373,414 L 378,414 L 379,415 L 397,415 L 398,416 L 401,416 L 401,388 L 402,387 L 403,382 L 409,377 L 415,377 L 416,376 L 421,376 L 422,377 L 526,377 L 526,310 Z'
const DOOR_DETAIL = 'M 325,377 L 325,388 L 329,388 L 330,389 L 360,389 L 360,377 L 361,376 L 357,376 L 356,375 L 347,375 L 346,376 L 330,375 L 335,375 L 336,376 L 335,377 Z'
const ROOF_RIGHT = 'M 392,184 L 392,185 L 401,194 L 402,194 L 414,206 L 415,206 L 494,282 L 495,282 L 511,297 L 513,298 L 542,298 L 543,297 L 545,297 L 545,294 L 544,293 L 542,285 L 534,269 L 534,267 L 514,227 L 514,225 L 508,214 L 508,212 L 504,205 L 504,203 L 501,198 L 501,196 L 498,190 L 493,185 L 491,185 L 490,184 Z'
const ROOF_LEFT = 'M 294,184 L 193,184 L 188,186 L 183,192 L 182,196 L 178,203 L 178,205 L 171,218 L 171,220 L 150,261 L 150,263 L 138,287 L 135,297 L 137,298 L 171,298 L 178,294 L 199,273 L 200,273 L 277,200 L 278,200 L 292,186 L 293,186 Z'
const ROOF_CENTER = 'M 484,296 L 483,294 L 472,283 L 471,283 L 465,276 L 464,276 L 444,256 L 443,256 L 352,167 L 348,164 L 343,162 L 339,164 L 323,180 L 322,180 L 297,204 L 296,204 L 276,224 L 275,224 L 265,234 L 264,234 L 235,262 L 234,262 L 227,269 L 226,269 L 198,296 L 198,298 L 484,298 Z'

const RAILS = [
  'M 267,386 L 267,417 L 274,417 L 276,415 L 276,387 L 269,387 Z',
  'M 412,386 L 410,389 L 410,414 L 411,415 L 411,417 L 419,417 L 419,397 L 420,396 L 420,387 L 418,386 Z',
  'M 258,386 L 245,386 L 245,412 L 246,413 L 246,419 L 245,420 L 247,419 L 251,419 L 252,418 L 256,418 L 257,416 L 258,417 L 258,411 L 257,410 L 257,394 L 258,393 Z',
  'M 430,386 L 430,389 L 429,390 L 429,418 L 441,419 L 441,386 Z',
  'M 235,387 L 224,387 L 223,386 L 223,391 L 222,392 L 222,418 L 224,423 L 223,424 L 236,421 L 236,417 L 235,416 Z',
  'M 451,387 L 451,421 L 452,422 L 462,423 L 463,424 L 463,387 Z',
  'M 214,387 L 202,387 L 202,427 L 206,427 L 214,424 Z',
  'M 473,387 L 473,425 L 476,425 L 481,427 L 485,427 L 485,389 L 484,388 L 484,386 Z',
  'M 192,387 L 180,387 L 180,433 L 181,432 L 186,432 L 192,429 Z',
  'M 495,387 L 495,430 L 498,430 L 499,431 L 507,433 L 507,386 L 506,387 Z',
  'M 161,386 L 160,387 L 160,433 L 161,434 L 170,434 L 170,387 L 163,387 Z',
  'M 516,386 L 517,387 L 517,389 L 515,393 L 515,429 L 516,430 L 516,433 L 523,433 L 524,434 L 523,435 L 517,435 L 525,435 L 527,432 L 527,388 L 524,386 Z',
]

function TimedPath({ d, className, delay = 0 }: TimedPathProps) {
  return <path d={d} className={className} style={{ '--piece-delay': `${delay}ms` } as CSSProperties} />
}

function AnimatedLogo({ pace }: { pace: IntroPace }) {
  const delayFor = (milliseconds: number) => pace === 'fast' ? Math.round(milliseconds * 0.28) : milliseconds
  return (
    <svg
      className="intro-logo-svg"
      viewBox="60 145 550 380"
      role="img"
      aria-label="Logo Ferreira Corretor de Imóveis"
      data-intro-logo="critical"
    >
      <defs>
        <linearGradient id="introGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f1d79a" />
          <stop offset="38%" stopColor="#d1a85c" />
          <stop offset="72%" stopColor="#b7863d" />
          <stop offset="100%" stopColor="#f0cc7f" />
        </linearGradient>
        <linearGradient id="introGoldShine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff0b7" stopOpacity="0" />
          <stop offset="45%" stopColor="#fff0b7" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff6cf" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#fff0b7" stopOpacity="0" />
          <stop offset="100%" stopColor="#fff0b7" stopOpacity="0" />
        </linearGradient>
        <filter id="introGoldGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0.76  0 1 0 0 0.56  0 0 1 0 0.24  0 0 0 .42 0" />
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="introHouseClip">
          <path d={FOUNDATION} />
          <path d={FACADE} />
          <path d={DOOR_DETAIL} />
          {RAILS.map((d) => <path d={d} key={d} />)}
          <path d={ROOF_LEFT} /><path d={ROOF_RIGHT} /><path d={ROOF_CENTER} />
        </clipPath>
      </defs>

      <g className="intro-logo-parts" filter="url(#introGoldGlow)">
        <TimedPath d={FOUNDATION} className="intro-logo-part intro-logo-part--foundation" delay={delayFor(100)} />
        <TimedPath d={FACADE} className="intro-logo-part intro-logo-part--facade" delay={delayFor(430)} />
        {RAILS.map((d, index) => (
          <TimedPath
            d={d}
            className="intro-logo-part intro-logo-part--rail"
            delay={delayFor(820 + index * 62)}
            key={d}
          />
        ))}
        <TimedPath d={DOOR_DETAIL} className="intro-logo-part intro-logo-part--door" delay={delayFor(1180)} />
        <TimedPath d={ROOF_LEFT} className="intro-logo-part intro-logo-part--roof-left" delay={delayFor(1600)} />
        <TimedPath d={ROOF_RIGHT} className="intro-logo-part intro-logo-part--roof-right" delay={delayFor(1600)} />
        <TimedPath d={ROOF_CENTER} className="intro-logo-part intro-logo-part--roof-center" delay={delayFor(1980)} />
      </g>

      <rect
        className="intro-logo-shimmer"
        x="25"
        y="130"
        width="190"
        height="420"
        fill="url(#introGoldShine)"
        clipPath="url(#introHouseClip)"
      />
    </svg>
  )
}

export function IntroPortal({ waitForReady = waitForCriticalContent }: IntroPortalProps = {}) {
  const [visible, setVisible] = useState(shouldPlayIntro)
  const [pace] = useState<IntroPace>(getIntroPace)
  const [phase, setPhase] = useState<IntroPhase>('waiting')
  const readinessRef = useRef(waitForReady)
  useEffect(() => { readinessRef.current = waitForReady }, [waitForReady])
  useEffect(() => {
    if (!visible) return
    let cancelled = false
    const timers = new Set<number>()
    const delay = (ms: number) => new Promise<void>((resolve) => { const timer = window.setTimeout(() => { timers.delete(timer); resolve() }, ms); timers.add(timer) })
    document.body.classList.add('intro-active')
    rememberIntroVisit()
    const isFast = pace === 'fast'
    const minimumHold = delay(isFast ? INTRO_FAST_MIN_HOLD_MS : INTRO_MIN_HOLD_MS)
    const safeTimeout = delay(isFast ? INTRO_FAST_MAX_WAIT_MS : INTRO_MAX_WAIT_MS)
    const ready = Promise.resolve().then(() => readinessRef.current()).catch(() => undefined)
    void Promise.race([Promise.all([minimumHold, ready]), safeTimeout]).then(async () => {
      if (cancelled) return
      await waitForStablePaint()
      if (cancelled) return
      setPhase('revealing')
      const exitMs = pace === 'fast' ? INTRO_FAST_EXIT_MS : INTRO_EXIT_MS
      const timer = window.setTimeout(() => { timers.delete(timer); if (!cancelled) { markIntroAsSeen(); setVisible(false) } }, exitMs)
      timers.add(timer)
    })
    return () => { cancelled = true; timers.forEach((timer) => window.clearTimeout(timer)); timers.clear(); document.body.classList.remove('intro-active') }
  }, [visible, pace])
  if (!visible) return null
  return (
    <div className={`intro-portal intro-portal--${phase}${pace === 'fast' ? ' intro-portal--fast' : ''}`} data-state={phase} data-pace={pace} data-testid="intro-portal" aria-hidden="true">
      <div className="intro-build">
        <div className="intro-build__draft" aria-hidden="true">
          <i /><i /><i /><i />
          <span className="intro-build__draft-line intro-build__draft-line--base" />
          <span className="intro-build__draft-line intro-build__draft-line--roof" />
        </div>
        <div className="intro-build__logo" aria-hidden="true">
          <AnimatedLogo pace={pace} />
          <span className="intro-build__sweep" />
        </div>
        <div className="intro-build__wordmark">
          <strong>Ferreira</strong>
          <span>Corretor de Imóveis · CRECI {CRECI}</span>
        </div>
        <span className="intro-build__signature" />
      </div>
    </div>
  )
}
