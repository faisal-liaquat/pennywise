<script>
  import { createCategory } from '$lib/stores/budget.js'

  let { onSuccess, onCancel } = $props()

  const PRESET_ICONS = [
    '🍔',
    '☕',
    '🚗',
    '🏠',
    '💊',
    '📚',
    '🎮',
    '✈️',
    '👗',
    '💡',
    '📱',
    '🎬',
    '🐾',
    '🏋️',
    '💅',
    '🛒',
    '🎁',
    '💰',
    '📦',
    '🏦',
  ]
  const PRESET_COLORS = [
    '#7c3aed',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#ec4899',
    '#06b6d4',
    '#f97316',
    '#8b5cf6',
    '#6366f1',
  ]

  let name = $state('')
  let type = $state('expense')
  let color = $state('#7c3aed')
  let icon = $state('📦')
  let loading = $state(false)
  let error = $state('')
  let errors = $state({})

  function validate() {
    errors = {}
    if (!name.trim()) errors.name = 'Category name is required'
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) return
    loading = true
    error = ''
    try {
      await createCategory({ name: name.trim(), type, color, icon })
      onSuccess?.()
    } catch (err) {
      error = err.message
    } finally {
      loading = false
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-4">
  {#if error}
    <div class="alert alert-error">{error}</div>
  {/if}

  <!-- Name -->
  <div>
    <label class="label" for="cat-name">Name</label>
    <input
      id="cat-name"
      class="input {errors.name ? 'input-error' : ''}"
      type="text"
      bind:value={name}
      placeholder="e.g. Coffee, Gym, Netflix"
    />
    {#if errors.name}<p class="field-error">{errors.name}</p>{/if}
  </div>

  <!-- Type — uses role="group" + fieldset pattern to satisfy a11y without orphan label -->
  <fieldset class="border-0 p-0 m-0">
    <legend class="label">Type</legend>
    <div class="flex gap-1 bg-gray-100 rounded-xl p-1">
      <button
        type="button"
        class="flex-1 py-2 rounded-lg text-sm font-medium transition {type === 'expense'
          ? 'bg-white text-red-600 shadow-sm'
          : 'text-gray-500'}"
        onclick={() => (type = 'expense')}>Expense</button
      >
      <button
        type="button"
        class="flex-1 py-2 rounded-lg text-sm font-medium transition {type === 'income'
          ? 'bg-white text-green-600 shadow-sm'
          : 'text-gray-500'}"
        onclick={() => (type = 'income')}>Income</button
      >
    </div>
  </fieldset>

  <!-- Icon — fieldset for group label -->
  <fieldset class="border-0 p-0 m-0">
    <legend class="label">Icon</legend>
    <div class="grid grid-cols-10 gap-1.5">
      {#each PRESET_ICONS as ic}
        <button
          type="button"
          aria-label="Select icon {ic}"
          class="w-9 h-9 flex items-center justify-center rounded-lg text-lg transition border-2 {icon ===
          ic
            ? 'border-primary-500 bg-primary-50'
            : 'border-transparent hover:bg-gray-100'}"
          onclick={() => (icon = ic)}>{ic}</button
        >
      {/each}
    </div>
    <div class="mt-2">
      <label class="label sr-only" for="cat-icon-custom">Custom icon</label>
      <input
        id="cat-icon-custom"
        class="input text-sm"
        type="text"
        bind:value={icon}
        placeholder="Or type any emoji"
        maxlength="4"
      />
    </div>
  </fieldset>

  <!-- Color — fieldset for group label -->
  <fieldset class="border-0 p-0 m-0">
    <legend class="label">Color</legend>
    <div class="flex flex-wrap gap-2">
      {#each PRESET_COLORS as c}
        <button
          type="button"
          aria-label="Select color {c}"
          class="w-8 h-8 rounded-full border-4 transition {color === c
            ? 'border-gray-800 scale-110'
            : 'border-transparent'}"
          style="background-color: {c}"
          onclick={() => (color = c)}
        ></button>
      {/each}
    </div>
  </fieldset>

  <div class="flex gap-3 pt-2">
    <button type="button" class="btn-ghost flex-1" onclick={onCancel} disabled={loading}>
      Cancel
    </button>
    <button type="submit" class="btn-primary flex-1" disabled={loading}>
      {loading ? 'Creating...' : 'Create Category'}
    </button>
  </div>
</form>
