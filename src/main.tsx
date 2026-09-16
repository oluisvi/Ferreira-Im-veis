import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/hero.css'
import './styles/properties.css'
import './styles/content.css'
import './styles/motion.css'
import './styles/contact-roof-hotfix.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
