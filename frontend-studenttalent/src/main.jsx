import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style/globals.css'

const storedTheme = localStorage.getItem('ums-theme')
const prefersDark =
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const shouldUseDark = storedTheme === 'dark' || (!storedTheme && prefersDark)
if (shouldUseDark) {
  document.documentElement.classList.add('dark')
  document.body.classList.add('dark')
  document.documentElement.setAttribute('data-theme', 'dark')
} else {
  document.documentElement.setAttribute('data-theme', 'light')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
