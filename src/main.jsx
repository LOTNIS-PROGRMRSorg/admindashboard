import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'

async function start() {
  // Dev-only preview of signed-in screens (?mock). Not included in production builds.
  if (import.meta.env.DEV && location.search.includes('mock')) await import('./devMock.js')
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

start()
