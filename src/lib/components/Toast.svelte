<script>
  import { toast } from '$lib/stores/toast.js'

  const iconMap = {
    success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
    error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    warning: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  }

  const styleMap = {
    success: {
      bg: '#f0fdf4',
      border: '#86efac',
      text: '#166534',
      icon: '#16a34a',
      darkBg: '#14532d',
      darkBorder: '#166534',
      darkText: '#bbf7d0',
    },
    error: {
      bg: '#fef2f2',
      border: '#fca5a5',
      text: '#991b1b',
      icon: '#dc2626',
      darkBg: '#7f1d1d',
      darkBorder: '#991b1b',
      darkText: '#fecaca',
    },
    warning: {
      bg: '#fffbeb',
      border: '#fcd34d',
      text: '#92400e',
      icon: '#d97706',
      darkBg: '#78350f',
      darkBorder: '#92400e',
      darkText: '#fde68a',
    },
    info: {
      bg: '#eff6ff',
      border: '#93c5fd',
      text: '#1e40af',
      icon: '#3b82f6',
      darkBg: '#1e3a8a',
      darkBorder: '#1e40af',
      darkText: '#bfdbfe',
    },
  }
</script>

<!-- Toast container — fixed top-right -->
<div
  class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
  style="max-width: 380px; width: calc(100vw - 32px);"
  aria-live="polite"
  aria-label="Notifications"
>
  {#each $toast as t (t.id)}
    {@const s = styleMap[t.type]}
    <div
      class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg toast-enter"
      style="
        background-color: {s.bg};
        border-color: {s.border};
        color: {s.text};
      "
      role="alert"
    >
      <!-- Icon -->
      <span style="color: {s.icon}; flex-shrink: 0; margin-top: 1px;">
        {@html iconMap[t.type]}
      </span>

      <!-- Message -->
      <p class="flex-1 text-sm font-medium leading-snug">{t.message}</p>

      <!-- Dismiss button -->
      <button
        class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        onclick={() => toast.remove(t.id)}
        aria-label="Dismiss notification"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-enter {
    animation: toastSlideIn 0.25s ease forwards;
  }

  @keyframes toastSlideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
