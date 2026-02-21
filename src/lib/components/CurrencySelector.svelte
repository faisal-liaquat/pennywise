<script>
  import { CURRENCIES } from '$lib/data/currencies.js'
  import { userCurrency, saveUserCurrency } from '$lib/stores/budget.js'

  let search = $state('')
  let saving = $state(false)
  let saved = $state(false)
  let error = $state('')

  const filtered = $derived(
    search.trim() === ''
      ? CURRENCIES
      : CURRENCIES.filter(
          (c) =>
            c.code.toLowerCase().includes(search.toLowerCase()) ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.symbol.includes(search)
        )
  )

  async function selectCurrency(code) {
    if (code === $userCurrency) return
    saving = true
    error = ''
    saved = false
    try {
      await saveUserCurrency(code)
      saved = true
      setTimeout(() => (saved = false), 2000)
    } catch (err) {
      error = err.message
    } finally {
      saving = false
    }
  }
</script>

<div class="card">
  <div class="flex items-center justify-between mb-4">
    <div>
      <h2 class="text-base font-semibold text-gray-900">Currency</h2>
      <p class="text-xs text-gray-500 mt-0.5">Choose your preferred currency for all amounts</p>
    </div>
    <div class="flex items-center gap-2">
      {#if saving}
        <span class="text-xs text-gray-400">Saving...</span>
      {:else if saved}
        <span class="text-xs text-green-600 font-medium">✓ Saved</span>
      {/if}
      <div class="badge bg-primary-100 text-primary-700 text-sm font-bold px-3 py-1">
        {$userCurrency}
      </div>
    </div>
  </div>

  {#if error}
    <div class="alert alert-error mb-4">{error}</div>
  {/if}

  <!-- Search -->
  <div class="relative mb-3">
    <svg
      class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
    <input
      class="input pl-9 text-sm"
      type="text"
      bind:value={search}
      placeholder="Search by name, code or symbol..."
    />
  </div>

  <!-- Currency list -->
  <div class="border border-gray-100 rounded-xl overflow-hidden">
    <div class="max-h-72 overflow-y-auto">
      {#if filtered.length === 0}
        <p class="text-sm text-gray-400 text-center py-8">No currencies found</p>
      {:else}
        {#each filtered as currency}
          <button
            type="button"
            class="w-full flex items-center justify-between px-4 py-3 text-left transition hover:bg-primary-50 border-b border-gray-50 last:border-0
              {$userCurrency === currency.code ? 'bg-primary-50' : ''}"
            onclick={() => selectCurrency(currency.code)}
          >
            <div class="flex items-center gap-3">
              <span
                class="w-10 text-center text-sm font-bold text-primary-600 bg-primary-50 rounded-lg py-1"
              >
                {currency.code}
              </span>
              <span class="text-sm text-gray-700">{currency.name}</span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-400">{currency.symbol}</span>
              {#if $userCurrency === currency.code}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c3aed"
                  stroke-width="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              {/if}
            </div>
          </button>
        {/each}
      {/if}
    </div>
  </div>

  <p class="text-xs text-gray-400 mt-3">
    {CURRENCIES.length} currencies available · Changes apply immediately across the app
  </p>
</div>
