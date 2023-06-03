import App from './app/App'
import { createRoot } from 'react-dom/client'
import React from 'react'

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
