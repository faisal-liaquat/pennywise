<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import Modal from '$lib/components/Modal.svelte'
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import ExpenseForm from '$lib/components/ExpenseForm.svelte'
  import BudgetPeriodForm from '$lib/components/BudgetPeriodForm.svelte'
  import DonutChart from '$lib/components/DonutChart.svelte'
  import BudgetRing from '$lib/components/BudgetRing.svelte'
  import {
    activePeriod,
    transactions,
    categories,
    totalSpent,
    totalIncome,
    remainingBudget,
    categorySpending,
    budgetPeriods,
    loadBudgetPeriods,
    loadCategories,
    loadTransactions,
    deleteTransaction,
    loadingBudget,
    formatCurrency,
    formatDate,
    userCurrency,
    loadUserCurrency,
  } from '$lib/stores/budget.js'
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  let showExpenseModal = $state(false)
  let showPeriodModal = $state(false)

  onMount(async () => {
    await Promise.all([loadBudgetPeriods(), loadCategories(), loadUserCurrency()])
    if ($activePeriod) await loadTransactions($activePeriod.id)
  })

  // Animated numbers
  const animatedBudget = tweened(0, { duration: 900, easing: cubicOut })
  const animatedSpent = tweened(0, { duration: 900, easing: cubicOut })
  const animatedRemaining = tweened(0, { duration: 900, easing: cubicOut })
  const animatedIncome = tweened(0, { duration: 900, easing: cubicOut })

  $effect(() => {
    if ($activePeriod) animatedBudget.set(Number($activePeriod.total_budget))
  })

  $effect(() => {
    animatedSpent.set($totalSpent)
  })

  $effect(() => {
    animatedRemaining.set($remainingBudget)
  })

  $effect(() => {
    animatedIncome.set($totalIncome)
  })

  const spentPercent = $derived(
    $activePeriod
      ? Math.min(110, ($totalSpent / (Number($activePeriod.total_budget) + $totalIncome)) * 100)
      : 0
  )

  const progressColor = $derived(
    spentPercent > 100
      ? '#ef4444'
      : spentPercent > 85
        ? '#f97316'
        : spentPercent > 70
          ? '#eab308'
          : '#7c3aed'
  )

  const recentTransactions = $derived($transactions.slice(0, 8))

  const categoryBreakdown = $derived(
    (() => {
      if (!$activePeriod || !$categories.length) return []
      const spending = $categorySpending
      return $categories
        .filter((c) => c.type === 'expense' && spending[c.id])
        .map((c) => ({ ...c, spent: spending[c.id] || 0 }))
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 8)
    })()
  )

  const donutSegments = $derived(
    categoryBreakdown.map((c) => ({
      value: c.spent,
      color: c.color || '#7c3aed',
      label: c.name,
    }))
  )

  const insightMessage = $derived(
    (() => {
      if (!$activePeriod) return null
      if (spentPercent > 100)
        return {
          icon: '🚨',
          text: "You've exceeded your budget. Time to review your spending.",
          tone: 'red',
        }
      if (spentPercent > 85)
        return { icon: '⚠️', text: 'Almost at your limit — slow down on spending.', tone: 'orange' }
      if (spentPercent > 70)
        return {
          icon: '👀',
          text: "Spending is picking up. You're using over 70% of budget.",
          tone: 'yellow',
        }
      if (spentPercent > 50)
        return {
          icon: '👍',
          text: 'Halfway through your budget — looking balanced.',
          tone: 'purple',
        }
      return { icon: '✨', text: "Great control! You're well within budget.", tone: 'green' }
    })()
  )

  const insightColorMap = {
    red: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    orange: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    yellow: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    purple: { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
    green: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  }

  const expenseCount = $derived($transactions.filter((t) => t.type === 'expense').length)

  const avgPerTransaction = $derived(expenseCount > 0 ? $totalSpent / expenseCount : 0)

  const formatNum = (n) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: $userCurrency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)
  }

  async function handleDeleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
  }
</script>

<AppLayout>
  <div class="p-6 lg:p-8 max-w-screen-xl mx-auto">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8 fade-slide-in">
      <div>
        <h1 class="text-2xl font-bold" style="color: var(--color-text);">Dashboard</h1>
        <p class="text-sm mt-1" style="color: var(--color-text-muted);">
          {#if $activePeriod}
            {$activePeriod.name} · {formatDate($activePeriod.start_date)} — {formatDate(
              $activePeriod.end_date
            )}
          {:else}
            No active budget period
          {/if}
        </p>
      </div>
      <div class="flex items-center gap-2">
        {#if $activePeriod}
          <button class="btn-primary text-sm" onclick={() => (showExpenseModal = true)}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Transaction
          </button>
        {/if}
        <button
          class="btn-secondary text-sm"
          onclick={() => {
            window.location.hash = '/budget'
          }}
        >
          Periods
        </button>
      </div>
    </div>

    {#if $loadingBudget}
      <LoadingSpinner message="Loading your dashboard..." />
    {:else if !$activePeriod}
      <EmptyState
        icon="📅"
        title="No budget period yet"
        description="Create your first budget period to start tracking expenses."
        action={{ label: 'Create Budget Period', onClick: () => (showPeriodModal = true) }}
      />
    {:else}
      <!-- Insight Banner -->
      {#if insightMessage}
        {@const c = insightColorMap[insightMessage.tone]}
        <div
          class="mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium fade-slide-in"
          style="background-color: {c.bg}; color: {c.text}; border-color: {c.border};"
        >
          <span class="text-xl">{insightMessage.icon}</span>
          <span>{insightMessage.text}</span>
        </div>
      {/if}

      <!-- Stat Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <!-- Total Budget -->
        <div class="card fade-slide-in" style="animation-delay: 0.05s;">
          <div class="flex items-start justify-between">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-widest mb-2"
                style="color: var(--color-text-subtle);"
              >
                Total Budget
              </p>
              <p class="text-3xl font-extrabold tracking-tight" style="color: var(--color-text);">
                {formatNum($animatedBudget)}
              </p>
              <p class="text-xs mt-2" style="color: var(--color-text-subtle);">
                {$activePeriod.name}
              </p>
              {#if $totalIncome > 0}
                <p class="text-xs mt-1 font-semibold" style="color: #22c55e;">
                  +{formatCurrency($totalIncome, $userCurrency)} income received
                </p>
              {/if}
            </div>
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background-color: rgba(124,58,237,0.1);"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7c3aed"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" /><path
                  d="M16 7V5a2 2 0 0 0-4 0v2"
                /><line x1="12" y1="12" x2="12" y2="16" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Spent -->
        <div class="card fade-slide-in" style="animation-delay: 0.1s;">
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0 mr-4">
              <p
                class="text-xs font-semibold uppercase tracking-widest mb-2"
                style="color: var(--color-text-subtle);"
              >
                Spent
              </p>
              <p
                class="text-3xl font-extrabold tracking-tight"
                style="color: {spentPercent > 90 ? '#ef4444' : 'var(--color-text)'};"
              >
                {formatNum($animatedSpent)}
              </p>
              <div class="flex items-center gap-2 mt-2">
                <div class="progress-bar flex-1 h-1.5">
                  <div
                    class="progress-fill h-1.5"
                    style="width: {Math.min(
                      100,
                      spentPercent
                    )}%; background-color: {progressColor};"
                  ></div>
                </div>
                <span class="text-xs font-bold flex-shrink-0" style="color: {progressColor};"
                  >{spentPercent.toFixed(0)}%</span
                >
              </div>
            </div>
            <BudgetRing percent={spentPercent} size={60} thickness={7} />
          </div>
        </div>

        <!-- Remaining -->
        <div class="card fade-slide-in" style="animation-delay: 0.15s;">
          <div class="flex items-start justify-between">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-widest mb-2"
                style="color: var(--color-text-subtle);"
              >
                Remaining
              </p>
              <p
                class="text-3xl font-extrabold tracking-tight"
                style="color: {$remainingBudget < 0 ? '#ef4444' : '#22c55e'};"
              >
                {formatNum($animatedRemaining)}
              </p>
              <p class="text-xs mt-2" style="color: var(--color-text-subtle);">
                {$remainingBudget < 0 ? '⚠️ Over budget' : '✓ Available to spend'}
              </p>
              {#if $totalIncome > 0}
                <p class="text-xs mt-1" style="color: var(--color-text-subtle);">
                  Includes {formatCurrency($totalIncome, $userCurrency)} income
                </p>
              {/if}
            </div>
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style="background-color: {$remainingBudget < 0 ? '#fee2e2' : '#dcfce7'};"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={$remainingBudget < 0 ? '#ef4444' : '#22c55e'}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                {#if $remainingBudget < 0}
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line
                    x1="12"
                    y1="16"
                    x2="12.01"
                    y2="16"
                  />
                {:else}
                  <polyline points="20 6 9 17 4 12" />
                {/if}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <!-- Recent Transactions (3 cols) -->
        <div class="lg:col-span-3 card fade-slide-in" style="animation-delay: 0.2s;">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-bold" style="color: var(--color-text);">
              Recent Transactions
            </h2>
            {#if $transactions.length > 8}
              <button
                class="text-xs font-semibold text-primary-600 hover:text-primary-500 transition"
                onclick={() => {
                  window.location.hash = '/expenses'
                }}>View all →</button
              >
            {/if}
          </div>

          {#if recentTransactions.length === 0}
            <EmptyState
              icon="💳"
              title="No transactions yet"
              description="Add your first expense to get started."
            />
          {:else}
            <div class="space-y-0.5">
              {#each recentTransactions as tx}
                <div
                  class="tx-row flex items-center gap-3 px-3 py-2.5 rounded-xl group cursor-default"
                >
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style="background-color: {tx.categories?.color || '#7c3aed'}18;"
                  >
                    {tx.categories?.icon || '💰'}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold truncate" style="color: var(--color-text);">
                      {tx.description || tx.categories?.name || 'Transaction'}
                    </p>
                    <p class="text-xs" style="color: var(--color-text-subtle);">
                      {formatDate(tx.date)} · {tx.categories?.name || ''}
                    </p>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span
                      class="text-sm font-bold"
                      style="color: {tx.type === 'expense' ? '#ef4444' : '#22c55e'};"
                    >
                      {tx.type === 'expense' ? '−' : '+'}{formatCurrency(tx.amount, $userCurrency)}
                    </span>
                    <button
                      aria-label="Delete transaction"
                      class="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg hover:text-red-500"
                      style="color: var(--color-text-subtle);"
                      onclick={() => handleDeleteTransaction(tx.id)}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                      >
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path
                          d="M10 11v6m4-6v6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Right Column (2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Spending Breakdown Chart -->
          <div class="card fade-slide-in" style="animation-delay: 0.25s;">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-bold" style="color: var(--color-text);">
                Spending Breakdown
              </h2>
              <button
                class="text-xs font-semibold text-primary-600 hover:text-primary-500 transition"
                onclick={() => {
                  window.location.hash = '/categories'
                }}>Edit</button
              >
            </div>

            {#if categoryBreakdown.length === 0}
              <EmptyState
                icon="📊"
                title="No spending yet"
                description="Add expenses to see the breakdown."
              />
            {:else}
              <div class="flex flex-col items-center gap-5">
                <DonutChart segments={donutSegments} size={160} thickness={26} />
                <div class="w-full space-y-2.5">
                  {#each categoryBreakdown.slice(0, 5) as cat, i}
                    {@const pct =
                      $totalSpent > 0 ? Math.min(100, (cat.spent / $totalSpent) * 100) : 0}
                    <div class="flex items-center gap-2.5">
                      <span class="text-sm flex-shrink-0">{cat.icon}</span>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between mb-1">
                          <span
                            class="text-xs font-medium truncate"
                            style="color: var(--color-text-muted);">{cat.name}</span
                          >
                          <span
                            class="text-xs font-bold ml-2 flex-shrink-0"
                            style="color: {cat.color};"
                            >{formatCurrency(cat.spent, $userCurrency)}</span
                          >
                        </div>
                        <div class="progress-bar h-1.5">
                          <div
                            class="progress-fill h-1.5"
                            style="width: {pct}%; background-color: {cat.color}; transition-delay: {0.1 *
                              i}s;"
                          ></div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>

          <!-- Period Quick Stats -->
          <div class="card fade-slide-in" style="animation-delay: 0.3s;">
            <h2 class="text-base font-bold mb-4" style="color: var(--color-text);">Period Info</h2>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-xs" style="color: var(--color-text-muted);"
                  >Total transactions</span
                >
                <span class="text-sm font-bold" style="color: var(--color-text);"
                  >{$transactions.length}</span
                >
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs" style="color: var(--color-text-muted);">Income received</span>
                <span class="text-sm font-bold" style="color: #22c55e;">
                  {$totalIncome > 0 ? '+' + formatCurrency($totalIncome, $userCurrency) : '—'}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs" style="color: var(--color-text-muted);">Categories used</span>
                <span class="text-sm font-bold" style="color: var(--color-text);"
                  >{categoryBreakdown.length}</span
                >
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs" style="color: var(--color-text-muted);">Avg per expense</span>
                <span class="text-sm font-bold" style="color: var(--color-text);">
                  {expenseCount > 0 ? formatCurrency(avgPerTransaction, $userCurrency) : '—'}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-xs" style="color: var(--color-text-muted);">Budget used</span>
                <span class="text-sm font-bold" style="color: {progressColor};"
                  >{spentPercent.toFixed(1)}%</span
                >
              </div>

              {#if $budgetPeriods.filter((p) => !p.is_active).length > 0}
                <div class="pt-3 border-t" style="border-color: var(--color-border);">
                  <p class="text-xs font-semibold mb-2" style="color: var(--color-text-subtle);">
                    Other Periods
                  </p>
                  <div class="flex flex-wrap gap-1.5">
                    {#each $budgetPeriods.filter((p) => !p.is_active).slice(0, 3) as period}
                      <button
                        class="text-xs px-2.5 py-1 rounded-lg border transition-all hover:border-primary-400 hover:text-primary-600"
                        style="border-color: var(--color-border); color: var(--color-text-muted); background-color: var(--color-surface-2);"
                        onclick={() => {
                          window.location.hash = '/budget'
                        }}>{period.name}</button
                      >
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</AppLayout>

<!-- Modals -->
<Modal open={showExpenseModal} title="Add Transaction" onclose={() => (showExpenseModal = false)}>
  <ExpenseForm
    onSuccess={() => (showExpenseModal = false)}
    onCancel={() => (showExpenseModal = false)}
  />
</Modal>

<Modal
  open={showPeriodModal}
  title="Create Budget Period"
  onclose={() => (showPeriodModal = false)}
>
  <BudgetPeriodForm
    onSuccess={() => (showPeriodModal = false)}
    onCancel={() => (showPeriodModal = false)}
  />
</Modal>

<style>
  .tx-row {
    transition: background-color 0.15s ease;
  }
  .tx-row:hover {
    background-color: var(--color-surface-2);
  }
</style>
