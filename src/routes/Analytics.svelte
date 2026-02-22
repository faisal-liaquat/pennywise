<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import SpendingPieChart from '$lib/components/SpendingPieChart.svelte'
  import BudgetVsActualChart from '$lib/components/BudgetVsActualChart.svelte'
  import SavingsTracker from '$lib/components/SavingsTracker.svelte'
  import PeriodComparison from '$lib/components/PeriodComparison.svelte'
  import SpendingTrendChart from '$lib/components/SpendingTrendChart.svelte'
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
  import {
    activePeriod,
    transactions,
    loadBudgetPeriods,
    loadCategories,
    loadTransactions,
    loadingBudget,
    formatCurrency,
    userCurrency,
    loadUserCurrency,
    totalSpent,
    totalIncome,
    remainingBudget,
  } from '$lib/stores/budget.js'
  import {
    activeCategoryBreakdown,
    budgetVsActual,
    savingsData,
    periodComparison,
    spendingTrend,
  } from '$lib/stores/analytics.js'

  let activeTab = $state('overview')

  onMount(async () => {
    await Promise.all([loadBudgetPeriods(), loadCategories(), loadUserCurrency()])
    const { supabase } = await import('$lib/supabaseClient')
    const { data: userData } = await supabase.auth.getUser()
    if (userData?.user) {
      const { data } = await supabase
        .from('transactions')
        .select('*, categories(id, name, icon, color, type)')
        .eq('user_id', userData.user.id)
        .order('date', { ascending: false })
      if (data) transactions.set(data)
    }
  })

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'breakdown', label: 'Spending', icon: '🥧' },
    { id: 'budget', label: 'Budget vs Actual', icon: '📏' },
    { id: 'savings', label: 'Savings', icon: '💰' },
    { id: 'comparison', label: 'Periods', icon: '📈' },
  ]

  const donutSegments = $derived(
    $activeCategoryBreakdown.map((c) => ({ value: c.amount, color: c.color, label: c.name }))
  )

  const spentPct = $derived(
    $activePeriod
      ? Math.min(120, ($totalSpent / (Number($activePeriod.total_budget) + $totalIncome)) * 100)
      : 0
  )
</script>

<AppLayout>
  <div class="page-wrap page-mobile-pad">
    <!-- Header -->
    <div class="mb-5 sm:mb-6">
      <h1 class="page-title">Analytics</h1>
      <p class="text-sm mt-0.5" style="color: var(--color-text-subtle);">
        {#if $activePeriod}{$activePeriod.name}{:else}No active period{/if}
      </p>
    </div>

    <!-- Tab nav — scrollable on small screens -->
    <div class="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 mb-5 sm:mb-6">
      <div
        class="flex gap-1 p-1 rounded-xl min-w-max sm:min-w-0"
        style="background: var(--color-border);"
      >
        {#each tabs as tab}
          <button
            class="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 touch-target"
            style="
              background: {activeTab === tab.id ? 'var(--color-surface)' : 'transparent'};
              color: {activeTab === tab.id ? 'var(--color-text)' : 'var(--color-text-subtle)'};
              box-shadow: {activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
            "
            onclick={() => (activeTab = tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        {/each}
      </div>
    </div>

    {#if $loadingBudget}
      <LoadingSpinner message="Loading analytics..." />
    {:else}
      <!-- ── OVERVIEW TAB ── -->
      {#if activeTab === 'overview'}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <!-- Summary Cards row -->
          <div class="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {#each [{ label: 'Budget', value: $activePeriod ? Number($activePeriod.total_budget) : 0, icon: '🎯', color: '#7c3aed' }, { label: 'Spent', value: $totalSpent, icon: '💸', color: spentPct > 90 ? '#ef4444' : '#7c3aed' }, { label: 'Income', value: $totalIncome, icon: '📥', color: '#10b981' }, { label: 'Remaining', value: $remainingBudget, icon: '✅', color: $remainingBudget >= 0 ? '#10b981' : '#ef4444' }] as card}
              <div
                class="rounded-2xl p-3 sm:p-4"
                style="background: var(--color-surface); border: 1px solid var(--color-border);"
              >
                <p class="text-xs mb-1" style="color: var(--color-text-subtle);">
                  <span class="mr-1">{card.icon}</span>{card.label}
                </p>
                <p class="text-base sm:text-xl font-bold" style="color: {card.color};">
                  {formatCurrency(card.value, $userCurrency)}
                </p>
              </div>
            {/each}
          </div>

          <!-- Donut chart -->
          <div
            class="rounded-2xl p-4 sm:p-5"
            style="background: var(--color-surface); border: 1px solid var(--color-border);"
          >
            <h3 class="text-sm font-semibold mb-4" style="color: var(--color-text);">
              Spending Breakdown
            </h3>
            <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div class="flex-shrink-0">
                <SpendingPieChart segments={donutSegments} size={180} innerRadius={54} />
              </div>
              <div class="flex-1 min-w-0 w-full space-y-2">
                {#each $activeCategoryBreakdown.slice(0, 6) as cat}
                  <div class="flex items-center gap-2">
                    <div
                      class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style="background: {cat.color};"
                    ></div>
                    <span class="text-xs flex-1 truncate" style="color: var(--color-text-muted);"
                      >{cat.name}</span
                    >
                    <span
                      class="text-xs font-semibold flex-shrink-0"
                      style="color: var(--color-text);">{cat.percentage.toFixed(1)}%</span
                    >
                  </div>
                {/each}
              </div>
            </div>
          </div>

          <!-- Spending trend -->
          <div
            class="rounded-2xl p-4 sm:p-5"
            style="background: var(--color-surface); border: 1px solid var(--color-border);"
          >
            <h3 class="text-sm font-semibold mb-4" style="color: var(--color-text);">
              Cumulative Spending
            </h3>
            <SpendingTrendChart data={$spendingTrend} currency={$userCurrency} />
          </div>

          <!-- Budget usage bar -->
          <div
            class="md:col-span-2 rounded-2xl p-4 sm:p-5"
            style="background: var(--color-surface); border: 1px solid var(--color-border);"
          >
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex-1">
                <p class="text-sm font-semibold mb-2" style="color: var(--color-text);">
                  Budget Usage
                </p>
                <div
                  class="h-3 rounded-full overflow-hidden"
                  style="background: var(--color-border);"
                >
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    style="
                      width: {Math.min(100, spentPct)}%;
                      background: {spentPct > 100
                      ? '#ef4444'
                      : spentPct > 85
                        ? '#f97316'
                        : '#7c3aed'};
                    "
                  ></div>
                </div>
                <p class="text-xs mt-1.5" style="color: var(--color-text-subtle);">
                  {formatCurrency($totalSpent, $userCurrency)} of {formatCurrency(
                    $activePeriod ? Number($activePeriod.total_budget) + $totalIncome : 0,
                    $userCurrency
                  )} ({spentPct.toFixed(1)}%)
                </p>
              </div>
              <div
                class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap self-start sm:self-center"
                style="background: {spentPct > 100
                  ? '#fef2f2'
                  : spentPct > 85
                    ? '#fff7ed'
                    : '#f5f3ff'}; color: {spentPct > 100
                  ? '#b91c1c'
                  : spentPct > 85
                    ? '#c2410c'
                    : '#6d28d9'};"
              >
                {spentPct > 100
                  ? '🚨 Over Budget'
                  : spentPct > 85
                    ? '⚠️ Near Limit'
                    : '✅ On Track'}
              </div>
            </div>
          </div>
        </div>

        <!-- ── SPENDING BREAKDOWN TAB ── -->
      {:else if activeTab === 'breakdown'}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div
            class="rounded-2xl p-4 sm:p-5 flex flex-col items-center"
            style="background: var(--color-surface); border: 1px solid var(--color-border);"
          >
            <h3 class="text-sm font-semibold mb-4 self-start" style="color: var(--color-text);">
              Expense Distribution
            </h3>
            <SpendingPieChart segments={donutSegments} size={200} innerRadius={60} />
            <p class="text-xs mt-3" style="color: var(--color-text-subtle);">
              Hover slices for details
            </p>
          </div>

          <div
            class="rounded-2xl p-4 sm:p-5"
            style="background: var(--color-surface); border: 1px solid var(--color-border);"
          >
            <h3 class="text-sm font-semibold mb-4" style="color: var(--color-text);">
              By Category
            </h3>
            {#if $activeCategoryBreakdown.length === 0}
              <p class="text-sm text-center py-8" style="color: var(--color-text-subtle);">
                No expense data yet
              </p>
            {:else}
              <div class="space-y-3">
                {#each $activeCategoryBreakdown as cat}
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style="background: {cat.color}18;"
                    >
                      {cat.icon}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center mb-1">
                        <span
                          class="text-xs font-medium truncate"
                          style="color: var(--color-text-muted);">{cat.name}</span
                        >
                        <span
                          class="text-xs font-bold ml-2 flex-shrink-0"
                          style="color: {cat.color};"
                          >{formatCurrency(cat.amount, $userCurrency)}</span
                        >
                      </div>
                      <div
                        class="h-1.5 rounded-full overflow-hidden"
                        style="background: var(--color-border);"
                      >
                        <div
                          class="h-full rounded-full"
                          style="width: {cat.percentage}%; background: {cat.color};"
                        ></div>
                      </div>
                    </div>
                    <span class="text-xs flex-shrink-0" style="color: var(--color-text-subtle);"
                      >{cat.percentage.toFixed(1)}%</span
                    >
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- ── BUDGET VS ACTUAL TAB ── -->
      {:else if activeTab === 'budget'}
        <div
          class="rounded-2xl p-4 sm:p-5"
          style="background: var(--color-surface); border: 1px solid var(--color-border);"
        >
          <h3 class="text-sm font-semibold mb-1" style="color: var(--color-text);">
            Budget Allocation vs Actual Spending
          </h3>
          <p class="text-xs mb-5" style="color: var(--color-text-subtle);">
            Proportional budget share vs what you actually spent per category
          </p>
          <BudgetVsActualChart data={$budgetVsActual} currency={$userCurrency} />
        </div>

        <!-- ── SAVINGS TAB ── -->
      {:else if activeTab === 'savings'}
        <div class="space-y-4 sm:space-y-6">
          <div
            class="rounded-2xl p-4 sm:p-5"
            style="background: var(--color-surface); border: 1px solid var(--color-border);"
          >
            <h3 class="text-sm font-semibold mb-1" style="color: var(--color-text);">
              Savings Tracker
            </h3>
            <p class="text-xs mb-5" style="color: var(--color-text-subtle);">
              Budget vs spending vs savings per period
            </p>
            <SavingsTracker data={$savingsData} currency={$userCurrency} />
          </div>

          {#if $savingsData.length > 0}
            <div
              class="rounded-2xl p-4 sm:p-5"
              style="background: var(--color-surface); border: 1px solid var(--color-border);"
            >
              <h3 class="text-sm font-semibold mb-4" style="color: var(--color-text);">
                Savings History
              </h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm" style="min-width: 480px;">
                  <thead>
                    <tr class="text-xs" style="color: var(--color-text-subtle);">
                      <th class="text-left pb-3 font-medium">Period</th>
                      <th class="text-right pb-3 font-medium">Budget</th>
                      <th class="text-right pb-3 font-medium">Spent</th>
                      <th class="text-right pb-3 font-medium">Net Saved</th>
                      <th class="text-right pb-3 font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y" style="border-color: var(--color-border);">
                    {#each $savingsData as row}
                      <tr>
                        <td class="py-2.5 pr-4 font-medium" style="color: var(--color-text);"
                          >{row.periodName}</td
                        >
                        <td class="py-2.5 text-right" style="color: var(--color-text-subtle);"
                          >{formatCurrency(row.budget, $userCurrency)}</td
                        >
                        <td class="py-2.5 text-right" style="color: var(--color-text-subtle);"
                          >{formatCurrency(row.totalSpent, $userCurrency)}</td
                        >
                        <td
                          class="py-2.5 text-right font-semibold"
                          style="color: {row.netSavings >= 0 ? '#10b981' : '#ef4444'};"
                        >
                          {formatCurrency(row.netSavings, $userCurrency)}
                        </td>
                        <td class="py-2.5 text-right">
                          <span
                            class="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style="background: {row.savingsRate >= 20
                              ? '#f0fdf4'
                              : row.savingsRate >= 0
                                ? '#f5f3ff'
                                : '#fef2f2'}; color: {row.savingsRate >= 20
                              ? '#15803d'
                              : row.savingsRate >= 0
                                ? '#6d28d9'
                                : '#b91c1c'};"
                          >
                            {row.savingsRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}
        </div>

        <!-- ── PERIOD COMPARISON TAB ── -->
      {:else if activeTab === 'comparison'}
        <div class="space-y-4 sm:space-y-6">
          <div
            class="rounded-2xl p-4 sm:p-5"
            style="background: var(--color-surface); border: 1px solid var(--color-border);"
          >
            <h3 class="text-sm font-semibold mb-1" style="color: var(--color-text);">
              Budget vs Spent — All Periods
            </h3>
            <p class="text-xs mb-5" style="color: var(--color-text-subtle);">
              Light bar = budget. Dark bar = spent. Red = over budget. Showing up to 5 periods.
            </p>
            <PeriodComparison data={$periodComparison} currency={$userCurrency} />
          </div>

          {#if $periodComparison.length > 0}
            <div
              class="rounded-2xl p-4 sm:p-5"
              style="background: var(--color-surface); border: 1px solid var(--color-border);"
            >
              <h3 class="text-sm font-semibold mb-4" style="color: var(--color-text);">
                Period Comparison Table
              </h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm" style="min-width: 520px;">
                  <thead>
                    <tr class="text-xs" style="color: var(--color-text-subtle);">
                      <th class="text-left pb-3 font-medium">Period</th>
                      <th class="text-right pb-3 font-medium">Budget</th>
                      <th class="text-right pb-3 font-medium">Spent</th>
                      <th class="text-right pb-3 font-medium">Income</th>
                      <th class="text-right pb-3 font-medium">Remaining</th>
                      <th class="text-right pb-3 font-medium">Used</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y" style="border-color: var(--color-border);">
                    {#each $periodComparison as row}
                      <tr>
                        <td class="py-2.5 pr-4 font-medium" style="color: var(--color-text);"
                          >{row.name}</td
                        >
                        <td class="py-2.5 text-right" style="color: var(--color-text-subtle);"
                          >{formatCurrency(row.budget, $userCurrency)}</td
                        >
                        <td
                          class="py-2.5 text-right"
                          style="color: {row.totalSpent > row.budget
                            ? '#ef4444'
                            : 'var(--color-text-subtle)'};"
                          >{formatCurrency(row.totalSpent, $userCurrency)}</td
                        >
                        <td class="py-2.5 text-right" style="color: #10b981;"
                          >{formatCurrency(row.totalIncome, $userCurrency)}</td
                        >
                        <td
                          class="py-2.5 text-right font-semibold"
                          style="color: {row.remaining >= 0 ? '#10b981' : '#ef4444'};"
                          >{formatCurrency(row.remaining, $userCurrency)}</td
                        >
                        <td class="py-2.5 text-right">
                          <span
                            class="px-2 py-0.5 rounded-full text-xs font-semibold"
                            style="background: {row.utilizationPct > 100
                              ? '#fef2f2'
                              : row.utilizationPct > 85
                                ? '#fff7ed'
                                : '#f5f3ff'}; color: {row.utilizationPct > 100
                              ? '#b91c1c'
                              : row.utilizationPct > 85
                                ? '#c2410c'
                                : '#6d28d9'};"
                          >
                            {row.utilizationPct.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</AppLayout>
