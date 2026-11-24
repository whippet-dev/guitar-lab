import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App } from './ui/App'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const worker = new URL(`${import.meta.env.BASE_URL}sw.js`, window.location.href)
    void navigator.serviceWorker.register(worker).catch((error: unknown) => console.warn('Offline setup failed.', error))
  }, { once: true })
}
