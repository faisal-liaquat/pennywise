<script>
  let { icon = '📭', title = 'Nothing here yet', description = '', action = null } = $props()
</script>

<div class="flex flex-col items-center justify-center py-16 px-4 text-center">
  <div class="text-5xl mb-4">{icon}</div>
  <h3 class="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
  {#if description}
    <p class="text-sm text-gray-500 max-w-xs mb-6">{description}</p>
  {/if}
  {#if action}
    <button class="btn-primary" onclick={action.onClick}>{action.label}</button>
  {/if}
</div>
