import React from 'react'
import '@swisscom/sdx/css'
import { defineCustomElements, setAssetPath } from '@swisscom/sdx'

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
