<script>
  let { segments = [], size = 160, thickness = 28 } = $props()

  const cx = $derived(size / 2)
  const cy = $derived(size / 2)
  const r = $derived((size - thickness) / 2)
  const circumference = $derived(2 * Math.PI * r)

  let hoveredIndex = $state(-1)

  const total = $derived(segments.reduce((s, seg) => s + seg.value, 0))

  const arcs = $derived(
    total === 0
      ? []
      : segments.reduce((acc, seg, i) => {
          const prevDashSum = acc.reduce((s, a) => s + a.dash, 0)
          const pct = seg.value / total
          const dash = pct * circumference
          acc.push({
            label: seg.label,
            color: seg.color,
            value: seg.value,
            dash,
            gap: circumference - dash,
            offset: circumference - prevDashSum,
            pct,
            index: i,
          })
          return acc
        }, [])
  )

  // This now correctly reads pct from the computed arcs, not raw segments
  const hoveredArc = $derived(hoveredIndex >= 0 ? (arcs[hoveredIndex] ?? null) : null)
</script>

<div class="relative" style="width: {size}px; height: {size}px;">
  <svg
    width={size}
    height={size}
    viewBox="0 0 {size} {size}"
    style="transform: rotate(-90deg);"
    aria-label="Spending breakdown donut chart"
    role="img"
  >
    <!-- Background ring -->
    <circle {cx} {cy} {r} fill="none" stroke="var(--color-border)" stroke-width={thickness} />

    {#each arcs as arc (arc.index)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <circle
        {cx}
        {cy}
        {r}
        fill="none"
        stroke={arc.color}
        stroke-width={hoveredIndex === arc.index ? thickness + 4 : thickness}
        stroke-dasharray="{arc.dash} {arc.gap}"
        stroke-dashoffset={arc.offset}
        stroke-linecap="round"
        role="img"
        aria-label="{arc.label}: {(arc.pct * 100).toFixed(1)}%"
        style="transition: stroke-width 0.2s ease, opacity 0.2s ease; opacity: {hoveredIndex >= 0 &&
        hoveredIndex !== arc.index
          ? 0.3
          : 1}; cursor: pointer;"
        onmouseenter={() => {
          hoveredIndex = arc.index
        }}
        onmouseleave={() => {
          hoveredIndex = -1
        }}
      />
    {/each}
  </svg>

  <!-- Center text — not rotated -->
  <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    {#if hoveredArc}
      <span
        class="text-[11px] font-semibold text-center leading-tight px-2"
        style="color: var(--color-text-muted);">{hoveredArc.label}</span
      >
      <span class="text-sm font-extrabold mt-0.5" style="color: {hoveredArc.color};"
        >{(hoveredArc.pct * 100).toFixed(1)}%</span
      >
    {:else}
      <span class="text-[10px]" style="color: var(--color-text-subtle);">Spending</span>
      <span class="text-xs font-bold" style="color: var(--color-text);">{arcs.length} cats</span>
    {/if}
  </div>
</div>
