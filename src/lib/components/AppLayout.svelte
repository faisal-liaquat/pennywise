<script>
  import { authStore } from '$lib/stores/authStore'

  let { children } = $props()

  let currentPath = $state(window.location.hash.slice(1) || '/')

  $effect(() => {
    const updatePath = () => {
      currentPath = window.location.hash.slice(1) || '/'
    }
    window.addEventListener('hashchange', updatePath)
    return () => window.removeEventListener('hashchange', updatePath)
  })

  function goTo(path) {
    window.location.hash = path
    currentPath = path
  }

  function isActive(path) {
    return currentPath.startsWith(path)
  }

  async function handleSignOut() {
    await authStore.signOut()
    window.location.hash = '/login'
  }

  const displayName = $derived(
    $authStore.user?.user_metadata?.full_name || $authStore.user?.email?.split('@')[0] || 'User'
  )

  const initials = $derived(
    displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  )
</script>

<div class="min-h-screen bg-surface flex">
  <!-- Sidebar -->
  <aside class="w-64 bg-white shadow-card flex flex-col fixed top-0 left-0 h-screen z-30">
    <!-- Logo -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
          <span class="text-white text-lg">💰</span>
        </div>
        <span class="text-lg font-bold text-gray-900">PennyWise</span>
      </div>
    </div>

    <!-- User info -->
    <div class="p-4 border-b border-gray-100">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0"
        >
          <span class="text-primary-700 font-semibold text-sm">{initials}</span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
          <p class="text-xs text-gray-500 truncate">{$authStore.user?.email || ''}</p>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-1">
      <button
        class="sidebar-link w-full {isActive('/dashboard') ? 'active' : ''}"
        onclick={() => goTo('/dashboard')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        Dashboard
      </button>

      <button
        class="sidebar-link w-full {isActive('/budget') ? 'active' : ''}"
        onclick={() => goTo('/budget')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        Budget Periods
      </button>

      <button
        class="sidebar-link w-full {isActive('/expenses') ? 'active' : ''}"
        onclick={() => goTo('/expenses')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
        Transactions
      </button>

      <button
        class="sidebar-link w-full {isActive('/categories') ? 'active' : ''}"
        onclick={() => goTo('/categories')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
        Categories
      </button>

      <button
        class="sidebar-link w-full {isActive('/settings') ? 'active' : ''}"
        onclick={() => goTo('/settings')}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </svg>
        Settings
      </button>
    </nav>

    <!-- Sign Out -->
    <div class="p-4 border-t border-gray-100">
      <button
        class="sidebar-link w-full hover:bg-red-50 hover:text-red-600 text-gray-500"
        onclick={handleSignOut}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </div>
  </aside>

  <!-- Main content -->
  <main class="flex-1 ml-64 min-h-screen">
    {@render children()}
  </main>
</div>
