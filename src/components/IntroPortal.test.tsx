import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { IntroPortal, INTRO_SESSION_KEY } from './IntroPortal'

afterEach(() => {
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

describe('IntroPortal', () => {
  it('plays once and remembers completion for the current session', () => {
    vi.useFakeTimers()
    render(<IntroPortal />)
    const intro = screen.getByTestId('intro-portal')
    expect(intro).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(1900))

    expect(screen.queryByTestId('intro-portal')).not.toBeInTheDocument()
    expect(sessionStorage.getItem(INTRO_SESSION_KEY)).toBe('seen')
    vi.useRealTimers()
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
