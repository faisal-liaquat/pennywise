<script>
  let { icon = '📭', title = 'Nothing here', description = '', action = null } = $props()
</script>

<div class="flex flex-col items-center justify-center py-12 text-center">
  <div
    class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
    style="background-color: var(--color-surface-2); border: 1px solid var(--color-border);"
  >
    {icon}
  </div>
  <p class="text-sm font-semibold mb-1" style="color: var(--color-text);">{title}</p>
  {#if description}
    <p class="text-xs max-w-xs leading-relaxed" style="color: var(--color-text-muted);">
      {description}
    </p>
  {/if}
  {#if action}
    <button class="btn-primary text-sm mt-5" onclick={action.onClick}>
      {action.label}
    </button>
  {/if}
</div>
