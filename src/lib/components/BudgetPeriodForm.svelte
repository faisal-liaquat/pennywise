<script>
  import { createBudgetPeriod, updateBudgetPeriod } from '$lib/stores/budget.js'
  import { validateBudgetPeriodForm } from '$lib/utils/validators.js'
  import { toast } from '$lib/stores/toast.js'
  import { format, addMonths } from 'date-fns'

  let { period = null, onSuccess, onCancel } = $props()

  const today = new Date()
  const nextMonth = addMonths(today, 1)

  let name = $state('')
  let start_date = $state('')
  let end_date = $state('')
  let total_budget = $state('')

  let initialized = false
  $effect(() => {
    if (!initialized) {
      initialized = true
      name = period?.name ?? `${format(today, 'MMM yyyy')} Budget`
      start_date = period?.start_date ?? format(today, 'yyyy-MM-dd')
      end_date = period?.end_date ?? format(nextMonth, 'yyyy-MM-dd')
      total_budget = period?.total_budget ?? ''
    }
  })

  let loading = $state(false)
  let errors = $state({})

  async function handleSubmit(event) {
    event.preventDefault()

    const { errors: validationErrors, isValid } = validateBudgetPeriodForm({
      name,
      start_date,
      end_date,
      total_budget,
    })

    if (!isValid) {
      errors = validationErrors
      return
    }

    errors = {}
    loading = true

    try {
      if (period) {
        await updateBudgetPeriod(period.id, {
          name,
          start_date,
          end_date,
          total_budget: Number(total_budget),
        })
        toast.success('Budget period updated successfully')
      } else {
        await createBudgetPeriod({ name, start_date, end_date, total_budget })
        toast.success('Budget period created successfully')
      }
      onSuccess?.()
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      loading = false
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4" novalidate>
  <div>
    <label class="label" for="period-name">Period Name</label>
    <input
      id="period-name"
      class="input {errors.name ? 'input-error' : ''}"
      type="text"
      bind:value={name}
      placeholder="e.g. December 2024 Budget"
      maxlength="100"
      autocomplete="off"
    />
    {#if errors.name}<p class="field-error">{errors.name}</p>{/if}
  </div>

  <div class="grid grid-cols-2 gap-4">
    <div>
      <label class="label" for="start-date">Start Date</label>
      <input
        id="start-date"
        class="input {errors.start_date ? 'input-error' : ''}"
        type="date"
        bind:value={start_date}
        min="2000-01-01"
        max="2100-12-31"
      />
      {#if errors.start_date}<p class="field-error">{errors.start_date}</p>{/if}
    </div>
    <div>
      <label class="label" for="end-date">End Date</label>
      <input
        id="end-date"
        class="input {errors.end_date ? 'input-error' : ''}"
        type="date"
        bind:value={end_date}
        min="2000-01-01"
        max="2100-12-31"
      />
      {#if errors.end_date}<p class="field-error">{errors.end_date}</p>{/if}
    </div>
  </div>

  <div>
    <label class="label" for="total-budget">Total Budget</label>
    <div class="relative">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
      <input
        id="total-budget"
        class="input pl-8 {errors.total_budget ? 'input-error' : ''}"
        type="number"
        min="0.01"
        max="999999999"
        step="0.01"
        bind:value={total_budget}
        placeholder="0.00"
      />
    </div>
    {#if errors.total_budget}<p class="field-error">{errors.total_budget}</p>{/if}
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
        {period ? 'Updating...' : 'Creating...'}
      {:else}
        {period ? 'Update Period' : 'Create Period'}
      {/if}
    </button>
  </div>
</form>
