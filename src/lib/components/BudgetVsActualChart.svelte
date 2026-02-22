<script>
  let { items = [], currency = 'USD' } = $props()

  const maxVal = $derived(
    items.length ? Math.max(...items.map((i) => Math.max(i.actual, i.budgetShare)), 1) : 1
  )

  function fmt(n) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
  }

  let hoveredIndex = $state(-1)
</script>

<div class="w-full overflow-x-auto">
  {#if items.length === 0}
    <div
      class="flex flex-col items-center justify-center py-12"
      style="color: var(--color-text-subtle);"
    >
      <span class="text-4xl mb-2">📊</span>
      <p class="text-sm">No spending data yet</p>
    </div>
  {:else}
    <div class="space-y-3 min-w-0">
      {#each items as item, i}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div
          class="group"
          onmouseenter={() => (hoveredIndex = i)}
          onmouseleave={() => (hoveredIndex = -1)}
          role="presentation"
        >
          <div class="flex items-center gap-2 mb-1">
            <span class="text-base w-6 text-center flex-shrink-0">{item.icon}</span>
            <span class="text-xs font-medium truncate flex-1" style="color: var(--color-text);"
              >{item.name}</span
            >
            <span
              class="text-xs font-bold flex-shrink-0 transition-opacity"
              style="color: {item.color}; opacity: {hoveredIndex === i ? 1 : 0.8};"
            >
              {fmt(item.actual)}
            </span>
          </div>

          <!-- Actual bar -->
          <div
            class="relative h-3 rounded-full overflow-hidden"
            style="background: var(--color-border);"
          >
            <div
              class="h-full rounded-full transition-all duration-700"
              style="width: {Math.min(
                100,
                (item.actual / maxVal) * 100
              )}%; background: {item.color}; opacity: {hoveredIndex === -1 || hoveredIndex === i
                ? 1
                : 0.35};"
            ></div>
          </div>

          <!-- Budget share reference line (faint) -->
          <div
            class="relative h-1 mt-0.5 rounded-full overflow-hidden"
            style="background: var(--color-border);"
          >
            <div
              class="h-full rounded-full transition-all duration-700"
              style="width: {Math.min(
                100,
                (item.budgetShare / maxVal) * 100
              )}%; background: {item.color}; opacity: 0.25;"
            ></div>
          </div>
        </div>
      {/each}

      <div class="flex items-center gap-4 pt-2 border-t" style="border-color: var(--color-border);">
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-2 rounded-sm bg-purple-500"></div>
          <span class="text-xs" style="color: var(--color-text-subtle);">Actual spent</span>
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-1 rounded-sm bg-purple-200 dark:bg-purple-900"></div>
          <span class="text-xs" style="color: var(--color-text-subtle);">Budget share</span>
        </div>
      </div>
    </div>
  {/if}
</div>
