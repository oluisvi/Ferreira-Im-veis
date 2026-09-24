import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { initializeClarity } from './clarity'

export function AnalyticsProvider() {
  const isAdmin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

  useEffect(() => {
    if (!isAdmin) initializeClarity()
  }, [isAdmin])

  if (isAdmin) return null
  return <Analytics mode="auto" />
}
