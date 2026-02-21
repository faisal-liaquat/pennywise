<script>
  let { message = 'Loading...' } = $props()
</script>

<div class="flex flex-col items-center justify-center py-20 fade-slide-in">
  <div class="relative w-12 h-12">
    <div
      class="absolute inset-0 rounded-full border-2 border-primary-200"
      style="border-color: var(--color-border);"
    ></div>
    <div
      class="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 animate-spin"
    ></div>
  </div>
  <p class="mt-4 text-sm font-medium" style="color: var(--color-text-muted);">{message}</p>
</div>
