<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import Modal from '$lib/components/Modal.svelte'
  import EmptyState from '$lib/components/EmptyState.svelte'
  import CategoryForm from '$lib/components/CategoryForm.svelte'
  import { categories, loadCategories, deleteCategory } from '$lib/stores/budget.js'

  let showCreate = $state(false)
  let activeTab = $state('expense')

  onMount(loadCategories)

  const filteredCategories = $derived($categories.filter((c) => c.type === activeTab))

  const systemCats = $derived(filteredCategories.filter((c) => c.is_system))
  const customCats = $derived(filteredCategories.filter((c) => !c.is_system))

  async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"? Existing transactions will be unaffected.`)) return
    await deleteCategory(id)
  }
</script>

<AppLayout>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
        <p class="text-sm text-gray-500 mt-0.5">Manage your expense and income categories</p>
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
        New Category
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
      <button
        class="px-5 py-2 rounded-lg text-sm font-medium transition {activeTab === 'expense'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500'}"
        onclick={() => (activeTab = 'expense')}>Expenses</button
      >
      <button
        class="px-5 py-2 rounded-lg text-sm font-medium transition {activeTab === 'income'
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-500'}"
        onclick={() => (activeTab = 'income')}>Income</button
      >
    </div>

    <!-- Custom Categories -->
    {#if customCats.length > 0}
      <div class="mb-6">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          My Categories
        </h2>
        <div class="grid grid-cols-4 gap-4">
          {#each customCats as cat}
            <div class="card-sm flex items-center gap-3 group relative">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style="background-color: {cat.color}20"
              >
                {cat.icon}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                <p class="text-xs text-gray-400">Custom</p>
              </div>
              <button
                aria-label="Delete {cat.name}"
                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
                onclick={() => handleDelete(cat.id, cat.name)}
              >
                <svg
                  width="13"
                  height="13"
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
          {/each}
        </div>
      </div>
    {/if}

    <!-- System Categories -->
    <div>
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        System Categories
      </h2>
      {#if systemCats.length === 0}
        <EmptyState
          icon="📂"
          title="No categories"
          description="No system categories in this type."
        />
      {:else}
        <div class="grid grid-cols-4 gap-4">
          {#each systemCats as cat}
            <div class="card-sm flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style="background-color: {cat.color}20"
              >
                {cat.icon}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                <p class="text-xs text-gray-400">System</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</AppLayout>

<!-- Create Modal -->
<Modal open={showCreate} title="New Category" onclose={() => (showCreate = false)}>
  <CategoryForm
    onSuccess={() => {
      showCreate = false
      loadCategories()
    }}
    onCancel={() => (showCreate = false)}
  />
</Modal>
