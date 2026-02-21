<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import Modal from '$lib/components/Modal.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
  import ExpenseForm from '$lib/components/ExpenseForm.svelte'
  import {
    transactions,
    activePeriod,
    loadBudgetPeriods,
    loadCategories,
    loadTransactions,
    deleteTransaction,
    formatCurrency,
    formatDate,
    loadingBudget,
    userCurrency,
    loadUserCurrency,
  } from '$lib/stores/budget.js'

  let showModal = $state(false)
  let filterType = $state('all')

  onMount(async () => {
    await Promise.all([loadBudgetPeriods(), loadCategories(), loadUserCurrency()])
    if ($activePeriod) await loadTransactions($activePeriod.id)
  })

  const filtered = $derived(
    filterType === 'all' ? $transactions : $transactions.filter((t) => t.type === filterType)
  )

  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return
    await deleteTransaction(id)
  }
</script>

<AppLayout>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Transactions</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          {#if $activePeriod}{$activePeriod.name}{:else}No active period{/if}
        </p>
      </div>
      <button class="btn-primary" onclick={() => (showModal = true)} disabled={!$activePeriod}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Transaction
      </button>
    </div>

    <!-- Filter Tabs -->
    <div class="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
      {#each [['all', 'All'], ['expense', 'Expenses'], ['income', 'Income']] as [val, label]}
        <button
          class="px-5 py-2 rounded-lg text-sm font-medium transition {filterType === val
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500'}"
          onclick={() => (filterType = val)}>{label}</button
        >
      {/each}
    </div>

    {#if $loadingBudget}
      <LoadingSpinner message="Loading transactions..." />
    {:else if !$activePeriod}
      <EmptyState
        icon="📅"
        title="No active budget period"
        description="Create a budget period first to track transactions."
      />
    {:else if filtered.length === 0}
      <EmptyState
        icon="💸"
        title="No transactions"
        description="Add your first transaction to start tracking."
        action={{ label: 'Add Transaction', onClick: () => (showModal = true) }}
      />
    {:else}
      <div class="card">
        <div class="space-y-0">
          {#each filtered as tx, i}
            <div
              class="flex items-center gap-4 py-3.5 group {i !== 0
                ? 'border-t border-gray-50'
                : ''}"
            >
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style="background-color: {tx.categories?.color || '#e5e7eb'}20"
              >
                {tx.categories?.icon || '💰'}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900">
                  {tx.description || tx.categories?.name || 'Transaction'}
                </p>
                <p class="text-xs text-gray-400">
                  {formatDate(tx.date)} · {tx.categories?.name || ''}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <span
                  class="text-base font-bold {tx.type === 'expense'
                    ? 'text-red-600'
                    : 'text-green-600'}"
                >
                  {tx.type === 'expense' ? '−' : '+'}{formatCurrency(tx.amount, $userCurrency)}
                </span>
                <button
                  aria-label="Delete transaction"
                  class="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
                  onclick={() => handleDelete(tx.id)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6m4-6v6" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</AppLayout>

<Modal open={showModal} title="Add Transaction" onclose={() => (showModal = false)}>
  <ExpenseForm onSuccess={() => (showModal = false)} onCancel={() => (showModal = false)} />
</Modal>
