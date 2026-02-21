import { writable } from 'svelte/store'

function createThemeStore() {
  const getInitial = () => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('pennywise-dark-mode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  const initial = getInitial()
  const { subscribe, set, update } = writable(initial)

  function apply(isDark) {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', isDark)
  }

  apply(initial)

  return {
    subscribe,
    toggle() {
      update((isDark) => {
        const next = !isDark
        localStorage.setItem('pennywise-dark-mode', String(next))
        apply(next)
        return next
      })
    },
    setMode(value) {
      set(value)
      localStorage.setItem('pennywise-dark-mode', String(value))
      apply(value)
    },
  }
}

export const darkMode = createThemeStore()
