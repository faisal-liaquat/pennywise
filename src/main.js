import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'
import { inject } from '@vercel/analytics'

inject()

mount(App, {
  target: document.getElementById('app'),
})
