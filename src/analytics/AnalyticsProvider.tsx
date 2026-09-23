import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { initializeClarity } from './clarity'
export function AnalyticsProvider() { useEffect(() => { initializeClarity() }, []); return <Analytics mode="auto" /> }
