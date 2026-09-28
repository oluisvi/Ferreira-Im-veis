import type { ReactNode } from 'react'
import { BackToTop } from './BackToTop'
import { FloatingWhatsApp } from './FloatingWhatsApp'
import { IntroPortal } from './IntroPortal'
import { ScrollMotion } from './ScrollMotion'
import '../styles/content.css'
import '../styles/motion.css'

export function PublicShell({ children }: { children: ReactNode }) {
  return <><IntroPortal /><ScrollMotion />{children}<FloatingWhatsApp /><BackToTop /></>
}
