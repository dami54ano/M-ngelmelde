import React from 'react'
import '@swisscom/sdx/css'
import { defineCustomElements } from '@swisscom/sdx'
// The SDX documentation notes that setAssetPath may require a TS override.
// @ts-ignore - SDX asset API typing varies by published version
import { setAssetPath } from '@swisscom/sdx'

void defineCustomElements().then(() => {
  setAssetPath(window.location.origin + '/assets/')
})
import ReactDOM from 'react-dom/client'
import App from './ui/App'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
