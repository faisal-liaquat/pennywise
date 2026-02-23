<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import CurrencySelector from '$lib/components/CurrencySelector.svelte'
  import { loadUserCurrency } from '$lib/stores/budget.js'
  import { incomeInBudget } from '$lib/stores/incomeToggle.js'

  onMount(loadUserCurrency)
</script>

<AppLayout>
  <div class="page-wrap page-mobile-pad">
    <div class="page-header">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="text-sm mt-0.5" style="color: var(--color-text-subtle);">
          Manage your account preferences
        </p>
      </div>
    </div>

    <div class="max-w-xl space-y-6">
      <!-- Income Toggle Card -->
      <div
        class="rounded-2xl p-5"
        style="background: var(--color-surface); border: 1px solid var(--color-border);"
      >
        <h2 class="text-sm font-semibold mb-1" style="color: var(--color-text);">
          Budget Calculation
        </h2>
        <p class="text-xs mb-4" style="color: var(--color-text-subtle);">
          Control how income affects your available budget
        </p>

        <div class="flex items-center justify-between gap-4">
          <div class="flex-1">
            <p class="text-sm font-medium" style="color: var(--color-text);">
              Include income in budget
            </p>
            <p class="text-xs mt-0.5" style="color: var(--color-text-muted);">
              {#if $incomeInBudget}
                Income transactions <strong>add to</strong> your available budget (Budget + Income − Expenses
                = Remaining)
              {:else}
                Income transactions are <strong>tracked only</strong> — budget stays fixed (Budget − Expenses
                = Remaining)
              {/if}
            </p>
          </div>

          <!-- Toggle Switch -->
          <button
            type="button"
            role="switch"
            aria-checked={$incomeInBudget}
            onclick={() => incomeInBudget.toggle()}
            class="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            style="background-color: {$incomeInBudget ? '#7c3aed' : 'var(--color-border)'};"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
              style="transform: translateX({$incomeInBudget ? '24px' : '0px'});"
            ></span>
          </button>
        </div>

        <!-- Status Badge -->
        <div class="mt-4 flex items-center gap-2">
          <div
            class="w-2 h-2 rounded-full"
            style="background-color: {$incomeInBudget ? '#22c55e' : '#f59e0b'};"
          ></div>
          <span class="text-xs font-medium" style="color: var(--color-text-muted);">
            {$incomeInBudget ? 'Income counts toward budget' : 'Income excluded from budget'}
          </span>
        </div>
      </div>

      <!-- Currency Selector -->
      <CurrencySelector />
    </div>
  </div>
</AppLayout>
