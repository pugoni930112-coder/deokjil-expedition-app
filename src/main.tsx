import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const redirectPath = new URLSearchParams(window.location.search).get('p')
if (redirectPath?.startsWith('/') && !redirectPath.startsWith('//')) {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  window.history.replaceState(null, '', `${basePath}${redirectPath}`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
