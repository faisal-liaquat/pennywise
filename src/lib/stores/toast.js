import { writable } from 'svelte/store'

// ─── Toast Notification Store ──────────────────────────────────────────────────

function createToastStore() {
  const { subscribe, update } = writable([])
  let nextId = 0

  /**
   * Add a toast notification
   * @param {{ type: 'success'|'error'|'warning'|'info', message: string, duration?: number }} toast
   */
  function add({ type = 'info', message, duration = 4000 }) {
    const id = ++nextId
    update((toasts) => [...toasts, { id, type, message, duration, createdAt: Date.now() }])

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }

    return id
  }

  function remove(id) {
    update((toasts) => toasts.filter((t) => t.id !== id))
  }

  function clear() {
    update(() => [])
  }

  return {
    subscribe,
    add,
    remove,
    clear,
    success: (message, duration) => add({ type: 'success', message, duration }),
    error: (message, duration = 6000) => add({ type: 'error', message, duration }),
    warning: (message, duration) => add({ type: 'warning', message, duration }),
    info: (message, duration) => add({ type: 'info', message, duration }),
  }
}

export const toast = createToastStore()
