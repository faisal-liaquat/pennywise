<script>
  let { open = false, title = '', onclose, children } = $props()

  function handleKeydown(e) {
    if (e.key === 'Escape') onclose?.()
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="modal-overlay"
    role="presentation"
    onclick={(e) => {
      if (e.target === e.currentTarget) onclose?.()
    }}
  >
    <div
      class="modal w-full max-w-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-5 border-b"
        style="border-color: var(--color-border);"
      >
        <h2 id="modal-title" class="text-base font-bold" style="color: var(--color-text);">
          {title}
        </h2>
        <button
          type="button"
          onclick={onclose}
          class="w-8 h-8 rounded-lg flex items-center justify-center transition hover:scale-110"
          style="color: var(--color-text-muted); background-color: var(--color-surface-2);"
          aria-label="Close modal"
        >
          <svg
            width="16"
            height="16"
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

      <!-- Body -->
      <div class="px-6 py-5">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}
