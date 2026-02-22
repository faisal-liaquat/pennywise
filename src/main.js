import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'
import { inject } from '@vercel/analytics'

// Initialize Vercel Web Analytics
// In production mode, this will use the optimized script from /_vercel/insights/script.js
// In development mode, this will use the debug script for easier troubleshooting
inject({ mode: import.meta.env.MODE === 'development' ? 'development' : 'production' })

mount(App, {
  target: document.getElementById('app'),
})
