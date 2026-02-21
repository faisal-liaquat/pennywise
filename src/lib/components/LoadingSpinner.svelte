<script>
  let { size = 'md', message = '' } = $props()
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
</script>

<div class="flex flex-col items-center justify-center gap-3 py-8">
  <div
    class="animate-spin rounded-full border-3 border-gray-200 border-t-primary-600 {sizes[size]}"
    style="border-width: 3px;"
  ></div>
  {#if message}
    <p class="text-sm text-gray-500">{message}</p>
  {/if}
</div>
