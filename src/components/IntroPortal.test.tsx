import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IntroPortal, INTRO_EXIT_MS, INTRO_FAST_EXIT_MS, INTRO_FAST_MIN_HOLD_MS, INTRO_MAX_WAIT_MS, INTRO_MIN_HOLD_MS, INTRO_SEEN_STORAGE_KEY } from './IntroPortal'

async function advance(milliseconds: number) {
  await act(async () => { vi.advanceTimersByTime(milliseconds); await Promise.resolve() })
}

afterEach(() => {
  document.body.classList.remove('intro-active')
  document.body.classList.remove('intro-completed')
  vi.useRealTimers()
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('IntroPortal', () => {
  it('plays the assembly animation and reveals the page', async () => {
    vi.useFakeTimers()
    render(<IntroPortal waitForReady={() => Promise.resolve()} />)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'waiting')
    await advance(INTRO_MIN_HOLD_MS + 40)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'revealing')
    await advance(INTRO_EXIT_MS)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
    expect(document.body).toHaveClass('intro-completed')
  })

  it('waits for critical content and keeps a safe timeout', async () => {
    vi.useFakeTimers()
    render(<IntroPortal waitForReady={() => new Promise<void>(() => undefined)} />)
    await advance(INTRO_MAX_WAIT_MS - 1)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'waiting')
    await advance(41)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'revealing')
  })


  it('keeps the first visit at normal speed and accelerates later page loads', async () => {
    vi.useFakeTimers()
    const first = render(<IntroPortal waitForReady={() => Promise.resolve()} />)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-pace', 'normal')
    expect(window.localStorage.getItem(INTRO_SEEN_STORAGE_KEY)).toBe('1')

    first.unmount()
    render(<IntroPortal waitForReady={() => Promise.resolve()} />)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-pace', 'fast')
    await advance(INTRO_FAST_MIN_HOLD_MS + 40)
    expect(screen.getByTestId('intro-portal')).toHaveAttribute('data-state', 'revealing')
    await advance(INTRO_FAST_EXIT_MS)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
  })

  it('skips when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    render(<IntroPortal />)
    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
  })
})
