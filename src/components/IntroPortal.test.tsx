import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IntroPortal, INTRO_EXIT_MS, INTRO_MAX_WAIT_MS, INTRO_MIN_HOLD_MS, INTRO_SESSION_KEY } from './IntroPortal'

async function advance(milliseconds: number) {
  await act(async () => { vi.advanceTimersByTime(milliseconds); await Promise.resolve() })
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
    await advance(INTRO_MIN_HOLD_MS + 40)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'revealing')
    await advance(INTRO_EXIT_MS)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
    expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe('seen')
  })

  it('waits for critical content and keeps a safe timeout', async () => {
    vi.useFakeTimers()
    render(<IntroPortal waitForReady={() => new Promise<void>(() => undefined)} />)
    await advance(INTRO_MAX_WAIT_MS - 1)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'waiting')
    await advance(41)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'revealing')
  })

  it('skips when already seen or reduced motion is requested', () => {
    sessionStorage.setItem(INTRO_SESSION_KEY, 'seen')
    const { unmount } = render(<IntroPortal />)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
    unmount()
    sessionStorage.clear()
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    render(<IntroPortal />)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
  })
})
