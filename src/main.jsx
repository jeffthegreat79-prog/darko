import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import DinkoOverlay from './DinkoOverlay.jsx'
const isDinkoOverlay =
  window.location.pathname.startsWith('/dinko-overlay')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isDinkoOverlay ? <DinkoOverlay /> : <App />}
  </StrictMode>,
)

