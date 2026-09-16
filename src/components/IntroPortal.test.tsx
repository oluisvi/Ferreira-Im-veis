import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  IntroPortal,
  INTRO_EXIT_MS,
  INTRO_MAX_WAIT_MS,
  INTRO_MIN_HOLD_MS,
  INTRO_SESSION_KEY,
} from './IntroPortal'

async function advance(milliseconds: number) {
  await act(async () => {
    vi.advanceTimersByTime(milliseconds)
    await Promise.resolve()
  })
}

afterEach(() => {
  sessionStorage.clear()
  document.body.classList.remove('intro-active')
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('IntroPortal', () => {
  it('plays once and remembers completion for the current session', async () => {
    vi.useFakeTimers()
    render(<IntroPortal waitForReady={() => Promise.resolve()} />)

    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'waiting')
    expect(document.body).toHaveClass('intro-active')

    await advance(INTRO_MIN_HOLD_MS + 40)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'revealing')

    await advance(INTRO_EXIT_MS)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
    expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe('seen')
    expect(document.body).not.toHaveClass('intro-active')
  })

  it('waits for critical content instead of revealing on a blind timer', async () => {
    vi.useFakeTimers()
    let resolveReady: (() => void) | undefined
    const readiness = new Promise<void>((resolve) => { resolveReady = resolve })

    render(<IntroPortal waitForReady={() => readiness} />)
    await advance(INTRO_MIN_HOLD_MS + 500)

    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'waiting')

    await act(async () => {
      resolveReady?.()
      await Promise.resolve()
    })
    await advance(40)

    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'revealing')
  })

  it('uses a safe timeout if critical readiness never resolves', async () => {
    vi.useFakeTimers()
    render(<IntroPortal waitForReady={() => new Promise<void>(() => undefined)} />)

    await advance(INTRO_MAX_WAIT_MS - 1)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'waiting')

    await advance(1)
    await advance(40)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'revealing')

    await advance(INTRO_EXIT_MS)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
  })

  it('stays out of the way when it already played', () => {
    sessionStorage.setItem(INTRO_SESSION_KEY, 'seen')
    render(<IntroPortal />)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
  })

  it('skips the scene when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    render(<IntroPortal />)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
  })
})
