<script>
  let { segments = [], size = 220, innerRadius = 65 } = $props()

  // Compute arc paths from segment values
  const arcs = $derived(
    (() => {
      const total = segments.reduce((s, seg) => s + seg.value, 0)
      if (total === 0) return []

      const cx = size / 2
      const cy = size / 2
      const outerR = size / 2 - 8
      const innerR = innerRadius

      let startAngle = -Math.PI / 2
      return segments.map((seg) => {
        const fraction = seg.value / total
        const angle = fraction * 2 * Math.PI
        const endAngle = startAngle + angle

        const x1 = cx + outerR * Math.cos(startAngle)
        const y1 = cy + outerR * Math.sin(startAngle)
        const x2 = cx + outerR * Math.cos(endAngle)
        const y2 = cy + outerR * Math.sin(endAngle)
        const ix1 = cx + innerR * Math.cos(endAngle)
        const iy1 = cy + innerR * Math.sin(endAngle)
        const ix2 = cx + innerR * Math.cos(startAngle)
        const iy2 = cy + innerR * Math.sin(startAngle)

        const largeArc = angle > Math.PI ? 1 : 0

        const d = [
          `M ${x1} ${y1}`,
          `A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2}`,
          `L ${ix1} ${iy1}`,
          `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
          'Z',
        ].join(' ')

        // Label position (midpoint of arc)
        const midAngle = startAngle + angle / 2
        const labelR = (outerR + innerR) / 2

        const result = {
          d,
          color: seg.color,
          label: seg.label,
          value: seg.value,
          pct: fraction * 100,
          midAngle,
          labelR,
          cx,
          cy,
        }

        startAngle = endAngle
        return result
      })
    })()
  )

  let hoveredIndex = $state(-1)
</script>

<div class="relative flex items-center justify-center" style="width:{size}px;height:{size}px;">
  <svg
    width={size}
    height={size}
    viewBox="0 0 {size} {size}"
    role="img"
    aria-label="Spending breakdown donut chart"
  >
    {#if arcs.length === 0}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={size / 2 - 8}
        fill="none"
        stroke="var(--color-border)"
        stroke-width="24"
      />
    {:else}
      {#each arcs as arc, i}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <path
          d={arc.d}
          fill={arc.color}
          opacity={hoveredIndex === -1 || hoveredIndex === i ? 1 : 0.4}
          style="transition: opacity 0.2s, transform 0.2s; transform-origin: {arc.cx}px {arc.cy}px; transform: scale({hoveredIndex ===
          i
            ? 1.04
            : 1});"
          onmouseenter={() => (hoveredIndex = i)}
          onmouseleave={() => (hoveredIndex = -1)}
          role="presentation"
        />
      {/each}
    {/if}
  </svg>

  <!-- Center text -->
  <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    {#if hoveredIndex >= 0 && arcs[hoveredIndex]}
      <span class="text-xs font-medium" style="color: var(--color-text-subtle);">
        {arcs[hoveredIndex].label}
      </span>
      <span class="text-lg font-bold" style="color: var(--color-text);">
        {arcs[hoveredIndex].pct.toFixed(1)}%
      </span>
    {:else}
      <span class="text-xs" style="color: var(--color-text-subtle);">Spending</span>
      <span class="text-sm font-bold" style="color: var(--color-text);">Breakdown</span>
    {/if}
  </div>
</div>
