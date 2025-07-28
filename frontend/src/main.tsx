/**
 * @fileoverview React application entry point
 * @layer app
 * @status stable
 * @dependencies [App]
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index-luxury.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
