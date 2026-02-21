<script>
  import { authStore } from '$lib/stores/authStore'
  import { darkMode } from '$lib/stores/theme.js'

  let { children } = $props()

  let currentPath = $state(window.location.hash.slice(1) || '/')
  let sidebarCollapsed = $state(false)

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

  const navItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    },
    {
      path: '/budget',
      label: 'Budget Periods',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    },
    {
      path: '/expenses',
      label: 'Transactions',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h8m-8 6h16"/></svg>`,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    },
  ]
</script>

<div class="min-h-screen flex" style="background-color: var(--color-bg);">
  <!-- Sidebar -->
  <aside
    class="flex flex-col fixed top-0 left-0 h-screen z-30 transition-all duration-300"
    style="width: {sidebarCollapsed
      ? '72px'
      : '248px'}; background-color: var(--color-surface); border-right: 1px solid var(--color-border);"
  >
    <!-- Logo -->

    <div
      class="px-4 py-5 flex items-center gap-3 border-b"
      style="border-color: var(--color-border);"
    >
      <div class="flex-shrink-0 pulse-glow" style="width:36px;height:36px;">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="10" fill="#7c3aed" />
          <path
            d="M18 9C13.029 9 9 13.029 9 18s4.029 9 9 9 9-4.029 9-9-4.029-9-9-9z"
            fill="none"
            stroke="white"
            stroke-width="1.75"
          />
          <path
            d="M18 13.5v4.5l3 1.75"
            stroke="white"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <circle cx="18" cy="18" r="1.5" fill="white" />
          <path
            d="M11 18h2M23 18h2M18 11v2M18 23v2"
            stroke="rgba(255,255,255,0.35)"
            stroke-width="1.25"
            stroke-linecap="round"
          />
        </svg>
      </div>
      {#if !sidebarCollapsed}
        <div class="fade-slide-in">
          <span class="text-base font-bold" style="color: var(--color-text);">PennyWise</span>
          <p
            class="text-[10px] font-medium tracking-widest uppercase"
            style="color: var(--color-text-subtle);"
          >
            Finance
          </p>
        </div>
      {/if}
    </div>

    <!-- User info -->
    {#if !sidebarCollapsed}
      <div class="px-4 py-4 border-b fade-slide-in" style="border-color: var(--color-border);">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0"
          >
            <span class="text-primary-700 dark:text-primary-300 font-bold text-sm">{initials}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate" style="color: var(--color-text);">
              {displayName}
            </p>
            <p class="text-xs truncate" style="color: var(--color-text-subtle);">
              {$authStore.user?.email || ''}
            </p>
          </div>
        </div>
      </div>
    {:else}
      <div
        class="px-3 py-4 border-b flex justify-center"
        style="border-color: var(--color-border);"
      >
        <div
          class="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center"
        >
          <span class="text-primary-700 dark:text-primary-300 font-bold text-sm">{initials}</span>
        </div>
      </div>
    {/if}

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {#each navItems as item}
        <button
          class="sidebar-link w-full {isActive(item.path) ? 'active' : ''} {sidebarCollapsed
            ? 'justify-center px-0'
            : ''}"
          onclick={() => goTo(item.path)}
          title={sidebarCollapsed ? item.label : ''}
        >
          {@html item.icon}
          {#if !sidebarCollapsed}
            <span>{item.label}</span>
          {/if}
        </button>
      {/each}
    </nav>

    <!-- Bottom controls -->
    <div class="px-3 py-4 border-t space-y-1" style="border-color: var(--color-border);">
      <!-- Dark mode toggle -->
      <button
        class="sidebar-link w-full {sidebarCollapsed ? 'justify-center px-0' : ''}"
        onclick={() => darkMode.toggle()}
        title="Toggle dark mode"
      >
        {#if $darkMode}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line
              x1="12"
              y1="21"
              x2="12"
              y2="23"
            />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line
              x1="18.36"
              y1="18.36"
              x2="19.78"
              y2="19.78"
            />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line
              x1="18.36"
              y1="5.64"
              x2="19.78"
              y2="4.22"
            />
          </svg>
          {#if !sidebarCollapsed}<span>Light Mode</span>{/if}
        {:else}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          {#if !sidebarCollapsed}<span>Dark Mode</span>{/if}
        {/if}
      </button>

      <!-- Collapse toggle -->
      <button
        class="sidebar-link w-full {sidebarCollapsed ? 'justify-center px-0' : ''}"
        onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          style="transform: rotate({sidebarCollapsed
            ? '180deg'
            : '0deg'}); transition: transform 0.3s ease;"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {#if !sidebarCollapsed}<span>Collapse</span>{/if}
      </button>

      <!-- Sign out -->
      <button
        class="sidebar-link w-full text-red-500 hover:text-red-500 {sidebarCollapsed
          ? 'justify-center px-0'
          : ''}"
        onclick={handleSignOut}
        title="Sign out"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline
            points="16 17 21 12 16 7"
          /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {#if !sidebarCollapsed}<span>Sign Out</span>{/if}
      </button>
    </div>
  </aside>

  <!-- Main Content -->
  <main
    class="flex-1 min-h-screen transition-all duration-300"
    style="margin-left: {sidebarCollapsed ? '72px' : '248px'};"
  >
    {@render children()}
  </main>
</div>
