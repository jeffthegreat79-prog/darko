
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DinkoOverlay from './DinkoOverlay.jsx'
import PlinkoPage from './PlinkoPage.jsx'

const path = window.location.pathname

const isDinkoOverlay = path.startsWith('/dinko-overlay')
const isPlinkoPage = path === '/plinko' || path === '/plinko/'

createRoot(document.getElementById('root')).render(
  isDinkoOverlay ? (
    <DinkoOverlay />
  ) : isPlinkoPage ? (
    <PlinkoPage />
  ) : (
    <StrictMode>
      <App />
    </StrictMode>
  )
)
