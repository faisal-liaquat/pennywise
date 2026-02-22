<script>
  let { data = [], currency = 'USD' } = $props()

  // ── Layout constants ────────────────────────────────────────────────────────
  const CHART_W = 500
  const CHART_H = 220
  const PAD_LEFT = 56
  const PAD_RIGHT = 16
  const PAD_TOP = 16
  const PAD_BOTTOM = 40
  const INNER_W = CHART_W - PAD_LEFT - PAD_RIGHT
  const INNER_H = CHART_H - PAD_TOP - PAD_BOTTOM

  // Whether any period has savings category data
  const hasSavingsCat = $derived(
    data.some((d) => d.hasSavingsCategory && d.savedToSavingsCategory > 0)
  )

  // Max value across budget, spent, and savings category
  const maxVal = $derived(
    data.length
      ? Math.max(
          ...data.map((d) => Math.max(d.budget, d.totalSpent, d.savedToSavingsCategory || 0)),
          1
        )
      : 1
  )

  // Each group has up to 3 bars: budget (ghost), spent, savings category
  const GROUP_BARS = $derived(hasSavingsCat ? 3 : 2)
  const BAR_AREA_W = $derived(data.length > 0 ? INNER_W / data.length : INNER_W)
  const BAR_W = $derived(Math.min(36, (BAR_AREA_W * 0.75) / GROUP_BARS))
  const BAR_GAP = $derived(BAR_W * 0.25)

  function groupStartX(i) {
    const groupCenter = PAD_LEFT + i * BAR_AREA_W + BAR_AREA_W / 2
    const totalGroupW = GROUP_BARS * BAR_W + (GROUP_BARS - 1) * BAR_GAP
    return groupCenter - totalGroupW / 2
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

  // Pre-compute all bar geometry
  const bars = $derived(
    data.map((d, i) => {
      const gx = groupStartX(i)
      const budgetX = gx
      const spentX = gx + BAR_W + BAR_GAP
      const savingsX = gx + 2 * (BAR_W + BAR_GAP)

      const spentOver = d.totalSpent > d.budget
      const savingsAmt = d.savedToSavingsCategory || 0

      return {
        // Budget bar
        budgetX,
        budgetH: barH(d.budget),
        budgetY: barY(d.budget),
        // Spent bar
        spentX,
        spentH: barH(d.totalSpent),
        spentY: barY(d.totalSpent),
        spentColor: spentOver ? '#ef4444' : '#7c3aed',
        // Savings category bar
        savingsX,
        savingsH: barH(savingsAmt),
        savingsY: barY(savingsAmt),
        savingsAmt,
        showSavings: hasSavingsCat,
        // Net savings dot
        showDot: d.netSavings > 0,
        dotCX: gx + BAR_W + BAR_GAP + BAR_W / 2,
        dotY: barY(d.totalSpent) - 10,
        // Labels
        labelX: PAD_LEFT + i * BAR_AREA_W + BAR_AREA_W / 2,
        labelY: CHART_H - PAD_BOTTOM + 14,
        label: shortName(d.periodName),
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
      <span class="text-4xl mb-2">💰</span>
      <p class="text-sm">No period data yet — create budget periods to see savings history</p>
    </div>
  {:else}
    <!-- SVG chart -->
    <div class="w-full overflow-x-auto">
      <svg
        viewBox="0 0 {CHART_W} {CHART_H}"
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        style="min-width: 280px; max-height: 240px;"
        role="img"
        aria-label="Savings tracker bar chart"
      >
        <!-- Y-axis grid lines + labels -->
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

        <!-- Bars per period -->
        {#each bars as bar}
          <!-- 1. Budget ghost bar — matches PeriodComparison style -->
          <rect
            x={bar.budgetX}
            y={bar.budgetY}
            width={BAR_W}
            height={bar.budgetH}
            rx="4"
            fill="#a78bfa"
            opacity="0.45"
          />
          {#if bar.budgetH > 18}
            <text
              x={bar.budgetX + BAR_W / 2}
              y={bar.budgetY - 3}
              text-anchor="middle"
              font-size="8"
              fill="#a78bfa"
              font-family="inherit">{fmt(bar.d.budget)}</text
            >
          {/if}

          <!-- 2. Spent bar -->
          <rect
            x={bar.spentX}
            y={bar.spentY}
            width={BAR_W}
            height={bar.spentH}
            rx="4"
            fill={bar.spentColor}
            opacity="0.9"
          />
          {#if bar.spentH > 18}
            <text
              x={bar.spentX + BAR_W / 2}
              y={bar.spentY - 3}
              text-anchor="middle"
              font-size="8"
              fill={bar.spentColor}
              font-weight="600"
              font-family="inherit">{fmt(bar.d.totalSpent)}</text
            >
          {/if}

          <!-- Net savings dot above spent bar -->
          {#if bar.showDot}
            <circle cx={bar.dotCX} cy={bar.dotY} r="4" fill="#10b981" />
            <circle cx={bar.dotCX} cy={bar.dotY} r="7" fill="#10b981" opacity="0.2" />
          {/if}

          <!-- 3. Savings category bar (green, conditional) -->
          {#if bar.showSavings}
            <rect
              x={bar.savingsX}
              y={bar.savingsY}
              width={BAR_W}
              height={bar.savingsH}
              rx="4"
              fill="#059669"
              opacity={bar.savingsAmt > 0 ? 0.9 : 0.15}
            />
            {#if bar.savingsH > 18 && bar.savingsAmt > 0}
              <text
                x={bar.savingsX + BAR_W / 2}
                y={bar.savingsY - 3}
                text-anchor="middle"
                font-size="8"
                fill="#059669"
                font-weight="600"
                font-family="inherit">{fmt(bar.savingsAmt)}</text
              >
            {/if}
          {/if}

          <!-- X-axis period label -->
          <text
            x={bar.labelX}
            y={bar.labelY}
            text-anchor="middle"
            font-size="10"
            fill="var(--color-text-subtle)"
            font-family="inherit">{bar.label}</text
          >
        {/each}

        <!-- X axis baseline -->
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
    <div class="flex items-center gap-4 mt-2 mb-4 justify-center flex-wrap">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm" style="background: #a78bfa; opacity: 0.45;"></div>
        <span class="text-xs" style="color: var(--color-text-subtle);">Budget</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm" style="background: #7c3aed;"></div>
        <span class="text-xs" style="color: var(--color-text-subtle);">Spent</span>
      </div>
      {#if hasSavingsCat}
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-sm" style="background: #059669;"></div>
          <span class="text-xs" style="color: var(--color-text-subtle);">Savings category 🏦</span>
        </div>
      {/if}
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm" style="background: #ef4444;"></div>
        <span class="text-xs" style="color: var(--color-text-subtle);">Over budget</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rounded-full" style="background: #10b981;"></div>
        <span class="text-xs" style="color: var(--color-text-subtle);">Net savings</span>
      </div>
    </div>

    <!-- Summary cards: latest period -->
    <div
      class="grid gap-3 p-4 rounded-xl"
      style="grid-template-columns: repeat({hasSavingsCat
        ? 4
        : 3}, 1fr); background: var(--color-surface-2, var(--color-border)); border: 1px solid var(--color-border);"
    >
      {#each data.slice(-1) as latest}
        <div class="text-center">
          <p class="text-xs mb-1" style="color: var(--color-text-subtle);">Budget</p>
          <p class="text-sm font-bold" style="color: var(--color-text);">{fmt(latest.budget)}</p>
        </div>
        <div class="text-center">
          <p class="text-xs mb-1" style="color: var(--color-text-subtle);">Spent</p>
          <p
            class="text-sm font-bold"
            style="color: {latest.totalSpent > latest.budget ? '#ef4444' : 'var(--color-text)'};"
          >
            {fmt(latest.totalSpent)}
          </p>
        </div>
        {#if hasSavingsCat}
          <div class="text-center">
            <p class="text-xs mb-1" style="color: var(--color-text-subtle);">Saved 🏦</p>
            <p class="text-sm font-bold" style="color: #059669;">
              {fmt(latest.savedToSavingsCategory || 0)}
            </p>
          </div>
        {/if}
        <div class="text-center">
          <p class="text-xs mb-1" style="color: var(--color-text-subtle);">Net Saved</p>
          <p
            class="text-sm font-bold"
            style="color: {latest.netSavings >= 0 ? '#10b981' : '#ef4444'};"
          >
            {fmt(latest.netSavings)}
          </p>
        </div>
      {/each}
    </div>

    <!-- Savings history table -->
    {#if data.length > 1}
      <div class="mt-4 rounded-xl overflow-hidden" style="border: 1px solid var(--color-border);">
        <div
          class="px-4 py-3"
          style="border-bottom: 1px solid var(--color-border); background: var(--color-surface);"
        >
          <h4 class="text-sm font-semibold" style="color: var(--color-text);">Period History</h4>
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
                {#if hasSavingsCat}
                  <th class="text-right px-4 py-2.5 text-xs font-medium" style="color: #059669;"
                    >Saved 🏦</th
                  >
                {/if}
                <th
                  class="text-right px-4 py-2.5 text-xs font-medium"
                  style="color: var(--color-text-subtle);">Net Saved</th
                >
                <th
                  class="text-right px-4 py-2.5 text-xs font-medium"
                  style="color: var(--color-text-subtle);">Rate</th
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
                  <td class="px-4 py-2.5 font-medium" style="color: var(--color-text);"
                    >{row.periodName}</td
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
                  {#if hasSavingsCat}
                    <td class="px-4 py-2.5 text-right font-semibold" style="color: #059669;">
                      {row.savedToSavingsCategory > 0 ? fmt(row.savedToSavingsCategory) : '—'}
                    </td>
                  {/if}
                  <td
                    class="px-4 py-2.5 text-right font-semibold"
                    style="color: {row.netSavings >= 0 ? '#10b981' : '#ef4444'};"
                    >{fmt(row.netSavings)}</td
                  >
                  <td class="px-4 py-2.5 text-right">
                    <span
                      class="px-2 py-0.5 rounded-full text-xs font-semibold"
                      style="
                        background: {row.savingsRate >= 20
                        ? '#f0fdf4'
                        : row.savingsRate >= 0
                          ? '#f5f3ff'
                          : '#fef2f2'};
                        color: {row.savingsRate >= 20
                        ? '#15803d'
                        : row.savingsRate >= 0
                          ? '#6d28d9'
                          : '#b91c1c'};
                      ">{row.savingsRate.toFixed(1)}%</span
                    >
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  {/if}
</div>
