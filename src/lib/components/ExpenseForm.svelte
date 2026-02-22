<script>
  import { addTransaction, loadTransactions, categories, activePeriod } from '$lib/stores/budget.js'
  import { validateTransactionForm } from '$lib/utils/validators.js'
  import { checkRateLimit, formatRemainingTime } from '$lib/utils/rateLimiter.js'
  import { toast } from '$lib/stores/toast.js'
  import { format } from 'date-fns'

  let { onSuccess, onCancel, type: initialType = 'expense' } = $props()

  let txType = $state('expense')
  let category_id = $state('')
  let amount = $state('')
  let description = $state('')
  let date = $state(format(new Date(), 'yyyy-MM-dd'))
  let loading = $state(false)
  let errors = $state({})
  let rateLimitMessage = $state('')

  let initialized = false
  $effect(() => {
    if (!initialized) {
      initialized = true
      txType = initialType
    }
  })

  const filteredCategories = $derived($categories.filter((c) => c.type === txType))

  async function handleSubmit(event) {
    event.preventDefault()

    // Rate limiting — max 20 transactions per minute
    const rateCheck = checkRateLimit('add-transaction', 20, 60_000)
    if (!rateCheck.allowed) {
      rateLimitMessage = `Too many submissions. Please wait ${formatRemainingTime(rateCheck.remainingMs)}.`
      return
    }
    rateLimitMessage = ''

    const { errors: validationErrors, isValid } = validateTransactionForm({
      category_id,
      amount,
      date,
      description,
    })

    if (!isValid) {
      errors = validationErrors
      return
    }

    errors = {}
    loading = true

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
      toast.success(`${txType === 'income' ? 'Income' : 'Expense'} added successfully`)
      onSuccess?.()
    } catch (err) {
      toast.error(err.message || 'Failed to add transaction. Please try again.')
    } finally {
      loading = false
    }
  }

  function switchType(newType) {
    txType = newType
    category_id = ''
    errors = {}
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4" novalidate>
  {#if rateLimitMessage}
    <div class="alert alert-warning">{rateLimitMessage}</div>
  {/if}

  <!-- Type Toggle -->
  <div class="flex gap-1 bg-gray-100 rounded-xl p-1" role="group" aria-label="Transaction type">
    <button
      type="button"
      class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all {txType === 'expense'
        ? 'bg-white text-red-600 shadow-sm'
        : 'text-gray-500'}"
      onclick={() => switchType('expense')}
      aria-pressed={txType === 'expense'}
    >
      💸 Expense
    </button>
    <button
      type="button"
      class="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all {txType === 'income'
        ? 'bg-white text-green-600 shadow-sm'
        : 'text-gray-500'}"
      onclick={() => switchType('income')}
      aria-pressed={txType === 'income'}
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
      max="999999999"
      step="0.01"
      bind:value={amount}
      placeholder="0.00"
      inputmode="decimal"
      autocomplete="off"
    />
    {#if errors.amount}<p class="field-error">{errors.amount}</p>{/if}
  </div>

  <!-- Category -->
  <div>
    <label class="label" for="tx-category">Category</label>
    {#if filteredCategories.length === 0}
      <p class="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
        No categories yet. <a href="#/categories" class="text-primary-600 underline"
          >Add one first</a
        >.
      </p>
    {:else}
      <select
        id="tx-category"
        class="input {errors.category_id ? 'input-error' : ''}"
        bind:value={category_id}
      >
        <option value="">— Select a category —</option>
        {#each filteredCategories as cat}
          <option value={cat.id}>{cat.icon || '📦'} {cat.name}</option>
        {/each}
      </select>
    {/if}
    {#if errors.category_id}<p class="field-error">{errors.category_id}</p>{/if}
  </div>

  <!-- Date -->
  <div>
    <label class="label" for="tx-date">Date</label>
    <input
      id="tx-date"
      class="input {errors.date ? 'input-error' : ''}"
      type="date"
      bind:value={date}
      min="2000-01-01"
      max="2100-12-31"
    />
    {#if errors.date}<p class="field-error">{errors.date}</p>{/if}
  </div>

  <!-- Description (optional) -->
  <div>
    <label class="label" for="tx-description">
      Description <span class="text-gray-400 font-normal">(optional)</span>
    </label>
    <input
      id="tx-description"
      class="input {errors.description ? 'input-error' : ''}"
      type="text"
      bind:value={description}
      placeholder="What was this for?"
      maxlength="500"
      autocomplete="off"
    />
    {#if errors.description}<p class="field-error">{errors.description}</p>{/if}
    <p class="text-xs mt-1" style="color: var(--color-text-subtle);">
      {description?.length || 0}/500
    </p>
  </div>

  <div class="flex gap-3 pt-2">
    <button type="button" class="btn-ghost flex-1" onclick={onCancel} disabled={loading}>
      Cancel
    </button>
    <button type="submit" class="btn-primary flex-1" disabled={loading}>
      {#if loading}
        <svg class="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none">
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
        Adding...
      {:else}
        Add {txType === 'income' ? 'Income' : 'Expense'}
      {/if}
    </button>
  </div>
</form>
