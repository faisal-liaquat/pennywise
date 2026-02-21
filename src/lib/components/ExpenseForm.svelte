<script>
  import { addTransaction, loadTransactions, categories, activePeriod } from '$lib/stores/budget.js'
  import { format } from 'date-fns'

  let { onSuccess, onCancel, type: initialType = 'expense' } = $props()

  let txType = $state('expense')
  let category_id = $state('')
  let amount = $state('')
  let description = $state('')
  let date = $state(format(new Date(), 'yyyy-MM-dd'))
  let loading = $state(false)
  let error = $state('')
  let errors = $state({})

  let initialized = false
  $effect(() => {
    if (!initialized) {
      initialized = true
      txType = initialType
    }
  })

  const filteredCategories = $derived($categories.filter((c) => c.type === txType))

  function validate() {
    errors = {}
    if (!category_id) errors.category_id = 'Please select a category'
    if (!amount || Number(amount) <= 0) errors.amount = 'Amount must be greater than 0'
    if (!date) errors.date = 'Date is required'
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    loading = true
    error = ''
    try {
      await addTransaction({
        budget_period_id: $activePeriod?.id || null,
        category_id,
        amount,
        type: txType,
        description,
        date,
      })
      if ($activePeriod) await loadTransactions($activePeriod.id)
      onSuccess?.()
    } catch (err) {
      error = err.message
    } finally {
      loading = false
    }
  }

  function switchType(newType) {
    txType = newType
    category_id = ''
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  {#if error}
    <div class="alert alert-error">{error}</div>
  {/if}

  <!-- Type Toggle -->
  <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
    <button
      type="button"
      class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all {txType === 'expense'
        ? 'bg-white text-red-600 shadow-sm'
        : 'text-gray-500'}"
      onclick={() => switchType('expense')}
    >
      💸 Expense
    </button>
    <button
      type="button"
      class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all {txType === 'income'
        ? 'bg-white text-green-600 shadow-sm'
        : 'text-gray-500'}"
      onclick={() => switchType('income')}
    >
      💰 Income
    </button>
  </div>

  <!-- Amount -->
  <div>
    <label class="label" for="tx-amount">Amount</label>
    <input
      id="tx-amount"
      class="input text-lg font-semibold {errors.amount ? 'input-error' : ''}"
      type="number"
      min="0.01"
      step="0.01"
      bind:value={amount}
      placeholder="0.00"
    />
    {#if errors.amount}<p class="field-error">{errors.amount}</p>{/if}
  </div>

  <!-- Category -->
  <div>
    <label class="label" for="tx-category">Category</label>
    {#if filteredCategories.length === 0}
      <p class="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
        No categories yet.
        <button type="button" class="text-primary-600 font-medium" onclick={() => onCancel?.()}
          >Go to Categories →</button
        >
      </p>
    {:else}
      <div id="tx-category" class="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
        {#each filteredCategories as cat}
          <button
            type="button"
            aria-label="Select category {cat.name}"
            class="flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-center transition-all {category_id ===
            cat.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-100 bg-gray-50 hover:border-gray-200'}"
            onclick={() => (category_id = cat.id)}
          >
            <span class="text-xl">{cat.icon}</span>
            <span class="text-xs text-gray-700 font-medium leading-tight line-clamp-1"
              >{cat.name}</span
            >
          </button>
        {/each}
      </div>
      {#if errors.category_id}<p class="field-error">{errors.category_id}</p>{/if}
    {/if}
  </div>

  <!-- Description -->
  <div>
    <label class="label" for="tx-desc">
      Description <span class="text-gray-400 font-normal">(optional)</span>
    </label>
    <input
      id="tx-desc"
      class="input"
      type="text"
      bind:value={description}
      placeholder="What was this for?"
    />
  </div>

  <!-- Date -->
  <div>
    <label class="label" for="tx-date">Date</label>
    <input
      id="tx-date"
      class="input {errors.date ? 'input-error' : ''}"
      type="date"
      bind:value={date}
    />
    {#if errors.date}<p class="field-error">{errors.date}</p>{/if}
  </div>

  <div class="flex gap-3 pt-2">
    <button type="button" class="btn-ghost flex-1" onclick={onCancel} disabled={loading}>
      Cancel
    </button>
    <button type="submit" class="btn-primary flex-1" disabled={loading}>
      {#if loading}
        <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      {/if}
      {txType === 'expense' ? 'Add Expense' : 'Add Income'}
    </button>
  </div>
</form>
