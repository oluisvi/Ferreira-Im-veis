import { useEffect } from 'react'

const REVEAL_SELECTOR = '[data-reveal]'

export function ScrollMotion() {
  useEffect(() => {
    const root = document.documentElement
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const targets = () => Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets().forEach((element) => element.classList.add('is-revealed'))
      return
    }

    root.classList.add('reveal-enabled')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const element = entry.target as HTMLElement
          element.classList.add('is-revealed')
          observer.unobserve(element)
        })
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      },
    )

    const observed = new WeakSet<Element>()
    const observePendingTargets = () => {
      targets().forEach((element) => {
        if (observed.has(element) || element.classList.contains('is-revealed')) return
        observed.add(element)
        observer.observe(element)
      })
    }

    observePendingTargets()

    const mutationObserver = new MutationObserver(observePendingTargets)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
      root.classList.remove('reveal-enabled')
    }
  }, [])

  return null
}
