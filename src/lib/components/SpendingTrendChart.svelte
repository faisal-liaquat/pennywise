<script>
  let { points = [], currency = 'USD' } = $props()

  const maxCumulative = $derived(
    points.length ? Math.max(...points.map((p) => p.cumulative), 1) : 1
  )

  const chartH = 140
  const paddingLeft = 52
  const paddingBottom = 30
  const innerH = chartH - paddingBottom

  function fmtShort(n) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      notation: 'compact',
      maximumFractionDigits: 0,
    }).format(n)
  }

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const svgPoints = $derived(
    (() => {
      if (!points.length) return ''
      const totalW = 400
      const innerW = totalW - paddingLeft - 16
      return points
        .map((p, i) => {
          const x = paddingLeft + (i / Math.max(points.length - 1, 1)) * innerW
          const y = innerH - (p.cumulative / maxCumulative) * innerH
          return `${x},${y}`
        })
        .join(' ')
    })()
  )

  const areaPath = $derived(
    (() => {
      if (!points.length) return ''
      const totalW = 400
      const innerW = totalW - paddingLeft - 16
      const pts = points.map((p, i) => {
        const x = paddingLeft + (i / Math.max(points.length - 1, 1)) * innerW
        const y = innerH - (p.cumulative / maxCumulative) * innerH
        return [x, y]
      })
      if (!pts.length) return ''
      const path = pts.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(' ')
      const lastX = pts[pts.length - 1][0]
      return `${path} L${lastX},${innerH} L${paddingLeft},${innerH} Z`
    })()
  )

  let hoveredI = $state(-1)
</script>

<div class="w-full overflow-x-auto">
  {#if points.length < 2}
    <div
      class="flex flex-col items-center justify-center py-10"
      style="color: var(--color-text-subtle);"
    >
      <span class="text-3xl mb-2">📉</span>
      <p class="text-sm">Not enough data to show trend</p>
    </div>
  {:else}
    <svg
      width="100%"
      viewBox="0 0 400 {chartH}"
      preserveAspectRatio="xMidYMid meet"
      style="min-width:280px;"
      role="img"
      aria-label="Spending trend line chart"
    >
      <!-- Y grid -->
      {#each [0, 0.5, 1] as frac}
        {@const y = innerH - frac * innerH}
        <text
          x={paddingLeft - 4}
          y={y + 4}
          text-anchor="end"
          font-size="9"
          fill="var(--color-text-subtle)"
        >
          {fmtShort(frac * maxCumulative)}
        </text>
        <line
          x1={paddingLeft}
          y1={y}
          x2={400 - 16}
          y2={y}
          stroke="var(--color-border)"
          stroke-width="0.5"
          stroke-dasharray="3,3"
        />
      {/each}

      <!-- Area fill -->
      <path d={areaPath} fill="#7c3aed" opacity="0.08" />

      <!-- Line -->
      <polyline
        points={svgPoints}
        fill="none"
        stroke="#7c3aed"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Data points -->
      {#each points as p, i}
        {@const totalW = 400}
        {@const innerW = totalW - paddingLeft - 16}
        {@const x = paddingLeft + (i / Math.max(points.length - 1, 1)) * innerW}
        {@const y = innerH - (p.cumulative / maxCumulative) * innerH}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <circle
          cx={x}
          cy={y}
          r={hoveredI === i ? 5 : 3}
          fill={hoveredI === i ? '#7c3aed' : 'white'}
          stroke="#7c3aed"
          stroke-width="2"
          style="transition: r 0.15s;"
          onmouseenter={() => (hoveredI = i)}
          onmouseleave={() => (hoveredI = -1)}
          role="presentation"
        />
        {#if hoveredI === i}
          <text {x} y={y - 10} text-anchor="middle" font-size="9" fill="#7c3aed" font-weight="600">
            {fmtShort(p.cumulative)}
          </text>
        {/if}
      {/each}

      <!-- X axis labels (only show first, middle, last) -->
      {#each points as p, i}
        {#if i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)}
          {@const totalW = 400}
          {@const innerW = totalW - paddingLeft - 16}
          {@const x = paddingLeft + (i / Math.max(points.length - 1, 1)) * innerW}
          <text
            {x}
            y={chartH - 4}
            text-anchor="middle"
            font-size="8"
            fill="var(--color-text-subtle)"
          >
            {fmtDate(p.date)}
          </text>
        {/if}
      {/each}
    </svg>
  {/if}
</div>
