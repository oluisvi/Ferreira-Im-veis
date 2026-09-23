import { useEffect } from 'react'

const REVEAL_SELECTOR = '[data-reveal]'
const AUTO_REVEAL_SELECTOR = [
  '.catalog-hero > *', '.catalog-filters', '.catalog-card', '.catalog-empty',
  '.property-detail__topbar', '.property-detail__gallery', '.property-detail__intro > *',
  '.property-detail__facts', '.property-detail__content > *', '.property-detail__extras > *',
  '.property-detail__secondary > *', '.property-not-found > *', '.footer > *',
].join(',')

export function ScrollMotion() {
  useEffect(() => {
    const root = document.documentElement
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const decorate = () => document.querySelectorAll<HTMLElement>(AUTO_REVEAL_SELECTOR).forEach((element, index) => {
      if (!element.dataset.reveal) element.dataset.reveal = 'rise'
      if (!element.style.getPropertyValue('--reveal-delay')) element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 55}ms`)
    })
    const targets = () => Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR))
    decorate()
    if (reducedMotion || !('IntersectionObserver' in window)) { targets().forEach((element) => element.classList.add('is-revealed')); return }
    root.classList.add('reveal-enabled')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const element = entry.target as HTMLElement
        element.classList.add('is-revealed')
        observer.unobserve(element)
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' })
    const observed = new WeakSet<Element>()
    const observePending = () => {
      decorate()
      targets().forEach((element) => {
        if (observed.has(element) || element.classList.contains('is-revealed')) return
        observed.add(element); observer.observe(element)
      })
    }
    observePending()
    const mutationObserver = new MutationObserver(observePending)
    mutationObserver.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); mutationObserver.disconnect(); root.classList.remove('reveal-enabled') }
  }, [])
  return null
}
