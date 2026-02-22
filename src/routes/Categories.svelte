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
  <div class="page-wrap page-mobile-pad">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Categories</h1>
        <p class="text-sm mt-0.5" style="color: var(--color-text-subtle);">
          Manage your expense and income categories
        </p>
      </div>
      <button class="btn-primary touch-target w-full xs:w-auto" onclick={() => (showCreate = true)}>
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
    <div
      class="flex gap-1 p-1 rounded-xl w-full xs:w-fit mb-6"
      style="background-color: var(--color-border);"
    >
      <button
        class="flex-1 xs:flex-none px-5 py-2 rounded-lg text-sm font-medium transition touch-target"
        style="background: {activeTab === 'expense'
          ? 'var(--color-surface)'
          : 'transparent'}; color: {activeTab === 'expense'
          ? 'var(--color-text)'
          : 'var(--color-text-subtle)'}; box-shadow: {activeTab === 'expense'
          ? '0 1px 3px rgba(0,0,0,0.1)'
          : 'none'};"
        onclick={() => (activeTab = 'expense')}>Expenses</button
      >
      <button
        class="flex-1 xs:flex-none px-5 py-2 rounded-lg text-sm font-medium transition touch-target"
        style="background: {activeTab === 'income'
          ? 'var(--color-surface)'
          : 'transparent'}; color: {activeTab === 'income'
          ? 'var(--color-text)'
          : 'var(--color-text-subtle)'}; box-shadow: {activeTab === 'income'
          ? '0 1px 3px rgba(0,0,0,0.1)'
          : 'none'};"
        onclick={() => (activeTab = 'income')}>Income</button
      >
    </div>

    {#if filteredCategories.length === 0}
      <EmptyState
        icon={activeTab === 'expense' ? '💸' : '💰'}
        title="No {activeTab} categories"
        description="Add a custom category to organize your {activeTab === 'expense'
          ? 'expenses'
          : 'income'}."
        action={{ label: 'Add Category', onClick: () => (showCreate = true) }}
      />
    {:else}
      <div class="space-y-6">
        <!-- Custom categories -->
        {#if customCats.length > 0}
          <div>
            <h2 class="text-sm font-semibold mb-3" style="color: var(--color-text-subtle);">
              YOUR CATEGORIES
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {#each customCats as cat}
                <div class="card flex items-center justify-between gap-3 py-3 px-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style="background-color: {cat.color}18;"
                    >
                      {cat.icon || '📦'}
                    </div>
                    <div>
                      <p class="text-sm font-semibold" style="color: var(--color-text);">
                        {cat.name}
                      </p>
                      <div class="flex items-center gap-1.5 mt-0.5">
                        <div
                          class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style="background-color: {cat.color};"
                        ></div>
                        <p class="text-xs capitalize" style="color: var(--color-text-subtle);">
                          {cat.type}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    aria-label="Delete {cat.name}"
                    class="btn-ghost btn-sm text-red-400 hover:text-red-500 flex-shrink-0 touch-target"
                    onclick={() => handleDelete(cat.id, cat.name)}
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
              {/each}
            </div>
          </div>
        {/if}

        <!-- System categories -->
        {#if systemCats.length > 0}
          <div>
            <h2 class="text-sm font-semibold mb-3" style="color: var(--color-text-subtle);">
              SYSTEM CATEGORIES
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {#each systemCats as cat}
                <div class="card flex items-center gap-3 py-3 px-4" style="opacity: 0.8;">
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style="background-color: {cat.color}18;"
                  >
                    {cat.icon || '📦'}
                  </div>
                  <div>
                    <p class="text-sm font-semibold" style="color: var(--color-text);">
                      {cat.name}
                    </p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <div
                        class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style="background-color: {cat.color};"
                      ></div>
                      <p class="text-xs" style="color: var(--color-text-subtle);">System</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</AppLayout>

<Modal open={showCreate} title="New Category" onclose={() => (showCreate = false)}>
  <CategoryForm
    type={activeTab}
    onSuccess={() => (showCreate = false)}
    onCancel={() => (showCreate = false)}
  />
</Modal>
