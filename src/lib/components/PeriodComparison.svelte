<script>
  let { data = [], currency = 'USD' } = $props()

  // ── Layout constants ────────────────────────────────────────────────────────
  const CHART_W = 560
  const CHART_H = 240
  const PAD_LEFT = 60
  const PAD_RIGHT = 16
  const PAD_TOP = 24
  const PAD_BOTTOM = 48
  const INNER_W = CHART_W - PAD_LEFT - PAD_RIGHT
  const INNER_H = CHART_H - PAD_TOP - PAD_BOTTOM

  // ── Derived geometry ────────────────────────────────────────────────────────
  const maxVal = $derived(
    data.length ? Math.max(...data.map((d) => Math.max(d.budget, d.totalSpent)), 1) : 1
  )

  const BAR_AREA_W = $derived(data.length > 0 ? INNER_W / data.length : INNER_W)
  // Two bars per group: budget + spent
  const BAR_W = $derived(Math.min(40, (BAR_AREA_W * 0.65) / 2))
  const BAR_GAP = $derived(BAR_W * 0.3)

  function groupCenterX(i) {
    return PAD_LEFT + i * BAR_AREA_W + BAR_AREA_W / 2
  }

  function budgetBarX(i) {
    return groupCenterX(i) - BAR_W - BAR_GAP / 2
  }

  function spentBarX(i) {
    return groupCenterX(i) + BAR_GAP / 2
  }

  function barH(val) {
    return Math.max(2, (val / maxVal) * INNER_H)
  }

  function barY(val) {
    return PAD_TOP + INNER_H - barH(val)
  }

  function fmt(n) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n)
  }

  function shortName(name) {
    if (!name) return ''
    const months = name.match(/[A-Z][a-z]{2}/g)
    if (months && months.length >= 2) return `${months[0]}–${months[1]}`
    if (months && months.length === 1) return months[0]
    return name.length > 10 ? name.slice(0, 9) + '…' : name
  }

  // Pre-compute all bar data
  const bars = $derived(
    data.map((d, i) => {
      const overBudget = d.totalSpent > d.budget
      const bX = budgetBarX(i)
      const sX = spentBarX(i)
      const bH = barH(d.budget)
      const sH = barH(d.totalSpent)
      const bY = barY(d.budget)
      const sY = barY(d.totalSpent)

      return {
        i,
        // budget bar
        bX,
        bY,
        bH,
        // spent bar
        sX,
        sY,
        sH,
        overBudget,
        spentColor: overBudget ? '#ef4444' : '#7c3aed',
        // utilization badge
        pct: d.utilizationPct,
        pctColor: overBudget ? '#ef4444' : d.utilizationPct > 85 ? '#f97316' : '#7c3aed',
        // x-axis label
        labelX: groupCenterX(i),
        labelY: CHART_H - PAD_BOTTOM + 16,
        pctY: CHART_H - PAD_BOTTOM + 30,
        label: shortName(d.name),
        d,
      }
    })
  )

  // Y-axis ticks
  const yTicks = $derived(
    [0, 0.25, 0.5, 0.75, 1].map((frac) => ({
      y: PAD_TOP + INNER_H - frac * INNER_H,
      label: fmt(frac * maxVal),
    }))
  )
</script>

<div class="w-full">
  {#if data.length === 0}
    <div
      class="flex flex-col items-center justify-center py-12"
      style="color: var(--color-text-subtle);"
    >
      <span class="text-4xl mb-2">📈</span>
      <p class="text-sm">No period data yet</p>
    </div>
  {:else if data.length === 1}
    <div
      class="flex flex-col items-center justify-center py-12"
      style="color: var(--color-text-subtle);"
    >
      <span class="text-4xl mb-2">📈</span>
      <p class="text-sm">Need at least 2 periods to compare</p>
    </div>
  {:else}
    <!-- SVG chart -->
    <div class="w-full overflow-x-auto">
      <svg
        viewBox="0 0 {CHART_W} {CHART_H}"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        style="min-width: 300px; max-height: 260px;"
        role="img"
        aria-label="Period comparison bar chart"
      >
        <!-- Y-axis grid + labels -->
        {#each yTicks as tick}
          <line
            x1={PAD_LEFT}
            y1={tick.y}
            x2={CHART_W - PAD_RIGHT}
            y2={tick.y}
            stroke="var(--color-border)"
            stroke-width="0.75"
            stroke-dasharray="4 4"
          />
          <text
            x={PAD_LEFT - 6}
            y={tick.y + 4}
            text-anchor="end"
            font-size="10"
            fill="var(--color-text-subtle)"
            font-family="inherit">{tick.label}</text
          >
        {/each}

        <!-- Bars -->
        {#each bars as bar}
          <!-- Budget bar -->
          <rect
            x={bar.bX}
            y={bar.bY}
            width={BAR_W}
            height={bar.bH}
            rx="4"
            fill="#a78bfa"
            opacity="0.45"
          />
          {#if bar.bH > 20}
            <text
              x={bar.bX + BAR_W / 2}
              y={bar.bY - 4}
              text-anchor="middle"
              font-size="9"
              fill="#a78bfa"
              font-family="inherit">{fmt(bar.d.budget)}</text
            >
          {/if}

          <!-- Spent bar -->
          <rect
            x={bar.sX}
            y={bar.sY}
            width={BAR_W}
            height={bar.sH}
            rx="4"
            fill={bar.spentColor}
            opacity="0.9"
          />
          {#if bar.sH > 20}
            <text
              x={bar.sX + BAR_W / 2}
              y={bar.sY - 4}
              text-anchor="middle"
              font-size="9"
              fill={bar.spentColor}
              font-weight="600"
              font-family="inherit">{fmt(bar.d.totalSpent)}</text
            >
          {/if}

          <!-- Period name label -->
          <text
            x={bar.labelX}
            y={bar.labelY}
            text-anchor="middle"
            font-size="10"
            fill="var(--color-text-subtle)"
            font-family="inherit">{bar.label}</text
          >

          <!-- Utilization % -->
          <text
            x={bar.labelX}
            y={bar.pctY}
            text-anchor="middle"
            font-size="9"
            font-weight="600"
            fill={bar.pctColor}
            font-family="inherit">{bar.pct.toFixed(0)}%</text
          >
        {/each}

        <!-- X baseline -->
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + INNER_H}
          x2={CHART_W - PAD_RIGHT}
          y2={PAD_TOP + INNER_H}
          stroke="var(--color-border)"
          stroke-width="1"
        />
      </svg>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-5 mt-2 mb-4 justify-center flex-wrap">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm" style="background: #a78bfa; opacity: 0.45;"></div>
        <span class="text-xs" style="color: var(--color-text-subtle);">Budget</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm" style="background: #7c3aed;"></div>
        <span class="text-xs" style="color: var(--color-text-subtle);">Spent</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm" style="background: #ef4444;"></div>
        <span class="text-xs" style="color: var(--color-text-subtle);">Over budget</span>
      </div>
    </div>

    <!-- Comparison table -->
    <div class="rounded-xl overflow-hidden" style="border: 1px solid var(--color-border);">
      <div
        class="px-4 py-3"
        style="border-bottom: 1px solid var(--color-border); background: var(--color-surface);"
      >
        <h4 class="text-sm font-semibold" style="color: var(--color-text);">
          Period Comparison Table
        </h4>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr style="background: var(--color-surface);">
              <th
                class="text-left px-4 py-2.5 text-xs font-medium"
                style="color: var(--color-text-subtle);">Period</th
              >
              <th
                class="text-right px-4 py-2.5 text-xs font-medium"
                style="color: var(--color-text-subtle);">Budget</th
              >
              <th
                class="text-right px-4 py-2.5 text-xs font-medium"
                style="color: var(--color-text-subtle);">Spent</th
              >
              <th
                class="text-right px-4 py-2.5 text-xs font-medium"
                style="color: var(--color-text-subtle);">Income</th
              >
              <th
                class="text-right px-4 py-2.5 text-xs font-medium"
                style="color: var(--color-text-subtle);">Remaining</th
              >
              <th
                class="text-right px-4 py-2.5 text-xs font-medium"
                style="color: var(--color-text-subtle);">Used</th
              >
            </tr>
          </thead>
          <tbody>
            {#each data as row, i}
              <tr
                style="
                  border-top: 1px solid var(--color-border);
                  background: {i % 2 === 0 ? 'var(--color-surface)' : 'var(--color-bg)'};
                "
              >
                <td class="px-4 py-2.5 font-medium" style="color: var(--color-text);">{row.name}</td
                >
                <td class="px-4 py-2.5 text-right" style="color: var(--color-text-subtle);"
                  >{fmt(row.budget)}</td
                >
                <td
                  class="px-4 py-2.5 text-right"
                  style="color: {row.totalSpent > row.budget
                    ? '#ef4444'
                    : 'var(--color-text-subtle)'};">{fmt(row.totalSpent)}</td
                >
                <td class="px-4 py-2.5 text-right" style="color: #10b981;"
                  >{fmt(row.totalIncome)}</td
                >
                <td
                  class="px-4 py-2.5 text-right font-semibold"
                  style="color: {row.remaining >= 0 ? '#10b981' : '#ef4444'};"
                  >{fmt(row.remaining)}</td
                >
                <td class="px-4 py-2.5 text-right">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style="
                      background: {row.utilizationPct > 100
                      ? '#fef2f2'
                      : row.utilizationPct > 85
                        ? '#fff7ed'
                        : '#f5f3ff'};
                      color: {row.utilizationPct > 100
                      ? '#b91c1c'
                      : row.utilizationPct > 85
                        ? '#c2410c'
                        : '#6d28d9'};
                    ">{row.utilizationPct.toFixed(0)}%</span
                  >
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
