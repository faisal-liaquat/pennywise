import { writable } from 'svelte/store'

const STORAGE_KEY = 'pennywise-income-in-budget'

function createIncomeToggleStore() {
  const getInitial = () => {
    if (typeof window === 'undefined') return true
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === null ? true : stored === 'true'
  }

  const { subscribe, set, update } = writable(getInitial())

  return {
    subscribe,
    toggle() {
      update((val) => {
        const next = !val
        localStorage.setItem(STORAGE_KEY, String(next))
        return next
      })
    },
    setEnabled(val) {
      localStorage.setItem(STORAGE_KEY, String(val))
      set(val)
    },
  }
}

export const incomeInBudget = createIncomeToggleStore()
