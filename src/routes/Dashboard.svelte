<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import Modal from '$lib/components/Modal.svelte'
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import ExpenseForm from '$lib/components/ExpenseForm.svelte'
  import BudgetPeriodForm from '$lib/components/BudgetPeriodForm.svelte'
  import {
    activePeriod,
    transactions,
    categories,
    totalSpent,
    remainingBudget,
    categorySpending,
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

  let showExpenseModal = $state(false)
  let showPeriodModal = $state(false)

  onMount(async () => {
    await Promise.all([loadBudgetPeriods(), loadCategories(), loadUserCurrency()])
    if ($activePeriod) await loadTransactions($activePeriod.id)
  })

  const spentPercent = $derived(
    $activePeriod ? Math.min(100, ($totalSpent / Number($activePeriod.total_budget)) * 100) : 0
  )

  const progressColor = $derived(
    spentPercent > 90 ? 'bg-red-500' : spentPercent > 70 ? 'bg-amber-500' : 'bg-primary-600'
  )

  const recentTransactions = $derived($transactions.slice(0, 10))

  const categoryBreakdown = $derived(() => {
    if (!$activePeriod || !$categories.length) return []
    const spending = $categorySpending
    return $categories
      .filter((c) => c.type === 'expense' && spending[c.id])
      .map((c) => ({ ...c, spent: spending[c.id] || 0 }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 6)
  })

  async function handleDeleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
  }
</script>

<AppLayout>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {#if $activePeriod}
            {formatDate($activePeriod.start_date)} — {formatDate($activePeriod.end_date)}
          {:else}
            No active budget period
          {/if}
        </p>
      </div>
      <div class="flex gap-3">
        {#if $activePeriod}
          <button class="btn-primary" onclick={() => (showExpenseModal = true)}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Expense
          </button>
        {/if}
        <button
          class="btn-secondary"
          onclick={() => {
            window.location.hash = '/budget'
          }}
        >
          Manage Periods
        </button>
      </div>
    </div>

    {#if $loadingBudget}
      <LoadingSpinner message="Loading your budget..." />
    {:else if !$activePeriod}
      <EmptyState
        icon="📅"
        title="No budget period yet"
        description="Create your first budget period to start tracking your expenses."
        action={{ label: 'Create Budget Period', onClick: () => (showPeriodModal = true) }}
      />
    {:else}
      <!-- Stat Cards -->
      <div class="grid grid-cols-3 gap-6 mb-8">
        <div class="stat-card">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Budget</p>
          <p class="text-3xl font-bold text-gray-900">
            {formatCurrency($activePeriod.total_budget, $userCurrency)}
          </p>
          <p class="text-xs text-gray-400 mt-1">{$activePeriod.name}</p>
        </div>

        <div class="stat-card">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Spent</p>
          <p class="text-3xl font-bold {spentPercent > 90 ? 'text-red-600' : 'text-gray-900'}">
            {formatCurrency($totalSpent, $userCurrency)}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <div class="progress-bar flex-1">
              <div class="progress-fill {progressColor}" style="width: {spentPercent}%"></div>
            </div>
            <span class="text-xs text-gray-400 flex-shrink-0">{spentPercent.toFixed(0)}%</span>
          </div>
        </div>

        <div class="stat-card">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Remaining</p>
          <p class="text-3xl font-bold {$remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}">
            {formatCurrency($remainingBudget, $userCurrency)}
          </p>
          <p class="text-xs mt-1 {$remainingBudget < 0 ? 'text-red-400' : 'text-gray-400'}">
            {$remainingBudget < 0 ? '⚠️ Over budget!' : '✓ On track'}
          </p>
        </div>
      </div>

      <!-- Bottom Grid -->
      <div class="grid grid-cols-5 gap-6">
        <!-- Recent Transactions -->
        <div class="col-span-3 card">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold text-gray-900">Recent Payments</h2>
            {#if $transactions.length > 10}
              <button
                class="text-xs text-primary-600 font-medium hover:text-primary-700 transition"
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
            <div class="space-y-3">
              {#each recentTransactions as tx}
                <div class="flex items-center gap-4 group">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style="background-color: {tx.categories?.color || '#e5e7eb'}20"
                  >
                    {tx.categories?.icon || '💰'}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {tx.description || tx.categories?.name || 'Transaction'}
                    </p>
                    <p class="text-xs text-gray-400">
                      {formatDate(tx.date)} · {tx.categories?.name || ''}
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-sm font-semibold {tx.type === 'expense'
                        ? 'text-red-600'
                        : 'text-green-600'}"
                    >
                      {tx.type === 'expense' ? '−' : '+'}{formatCurrency(tx.amount, $userCurrency)}
                    </span>
                    <button
                      aria-label="Delete transaction"
                      class="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
                      onclick={() => handleDeleteTransaction(tx.id)}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6m4-6v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Category Breakdown -->
        <div class="col-span-2 card">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-base font-semibold text-gray-900">Monthly Expenses</h2>
            <button
              class="text-xs text-primary-600 font-medium hover:text-primary-700 transition"
              onclick={() => {
                window.location.hash = '/categories'
              }}>Edit</button
            >
          </div>

          {#if categoryBreakdown().length === 0}
            <EmptyState
              icon="📊"
              title="No spending data"
              description="Add expenses to see breakdown."
            />
          {:else}
            <div class="grid grid-cols-2 gap-3">
              {#each categoryBreakdown() as cat}
                <div class="rounded-xl p-3 text-center" style="background-color: {cat.color}15">
                  <p class="text-lg mb-1">{cat.icon}</p>
                  <p class="text-xs text-gray-500 mb-1 truncate">{cat.name}</p>
                  <p class="text-sm font-bold" style="color: {cat.color}">
                    {formatCurrency(cat.spent, $userCurrency)}
                  </p>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</AppLayout>

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
