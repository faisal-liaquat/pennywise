<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import Modal from '$lib/components/Modal.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte'
  import BudgetPeriodForm from '$lib/components/BudgetPeriodForm.svelte'
  import {
    budgetPeriods,
    activePeriod,
    loadingBudget,
    loadBudgetPeriods,
    deleteBudgetPeriod,
    setActivePeriod,
    formatCurrency,
    formatDate,
    userCurrency,
    loadUserCurrency,
  } from '$lib/stores/budget.js'

  let showCreate = $state(false)
  let editingPeriod = $state(null)

  onMount(async () => {
    await Promise.all([loadBudgetPeriods(), loadUserCurrency()])
  })

  async function handleDelete(id) {
    if (!confirm('Delete this budget period? All transactions in this period will be unlinked.'))
      return
    await deleteBudgetPeriod(id)
  }

  async function handleSetActive(period) {
    await setActivePeriod(period)
  }
</script>

<AppLayout>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Budget Periods</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          Manage your custom budget periods and allocations
        </p>
      </div>
      <button class="btn-primary" onclick={() => (showCreate = true)}>
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
        New Period
      </button>
    </div>

    {#if $loadingBudget}
      <LoadingSpinner message="Loading budget periods..." />
    {:else if $budgetPeriods.length === 0}
      <EmptyState
        icon="📅"
        title="No budget periods"
        description="Create your first budget period to start tracking. You can use custom date ranges like Dec 15 – Jan 15."
        action={{ label: 'Create Budget Period', onClick: () => (showCreate = true) }}
      />
    {:else}
      <div class="space-y-4">
        {#each $budgetPeriods as period}
          <div class="card hover:shadow-card-hover transition-shadow duration-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="w-3 h-3 rounded-full flex-shrink-0 {period.is_active
                    ? 'bg-green-500 shadow-lg shadow-green-200'
                    : 'bg-gray-200'}"
                ></div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold text-gray-900">{period.name}</h3>
                    {#if period.is_active}
                      <span class="badge bg-green-100 text-green-700">Active</span>
                    {/if}
                  </div>
                  <p class="text-sm text-gray-500 mt-0.5">
                    {formatDate(period.start_date)} — {formatDate(period.end_date)}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-6">
                <div class="text-right">
                  <p class="text-xl font-bold text-gray-900">
                    {formatCurrency(period.total_budget, $userCurrency)}
                  </p>
                  <p class="text-xs text-gray-400">Total Budget</p>
                </div>
                <div class="flex gap-2">
                  {#if !period.is_active}
                    <button class="btn-secondary btn-sm" onclick={() => handleSetActive(period)}>
                      Set Active
                    </button>
                  {/if}
                  <button
                    aria-label="Edit {period.name}"
                    class="btn-ghost btn-sm text-primary-600"
                    onclick={() => (editingPeriod = period)}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    aria-label="Delete {period.name}"
                    class="btn-ghost btn-sm text-red-500 hover:bg-red-50"
                    onclick={() => handleDelete(period.id)}
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
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</AppLayout>

<Modal open={showCreate} title="New Budget Period" onclose={() => (showCreate = false)}>
  <BudgetPeriodForm
    onSuccess={() => {
      showCreate = false
      loadBudgetPeriods()
    }}
    onCancel={() => (showCreate = false)}
  />
</Modal>

<Modal open={!!editingPeriod} title="Edit Budget Period" onclose={() => (editingPeriod = null)}>
  {#if editingPeriod}
    <BudgetPeriodForm
      period={editingPeriod}
      onSuccess={() => {
        editingPeriod = null
        loadBudgetPeriods()
      }}
      onCancel={() => (editingPeriod = null)}
    />
  {/if}
</Modal>
