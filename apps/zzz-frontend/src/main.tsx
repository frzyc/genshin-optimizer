import { isDev } from '@genshin-optimizer/common/util'
import React from 'react'
import { createRoot } from 'react-dom/client'
import ReactGA from 'react-ga4'
import App from './app/App'
ReactGA.initialize(process.env.NX_GA_TRACKINGID as any, {
  testMode: isDev,
})
const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
