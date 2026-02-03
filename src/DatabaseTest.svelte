<script>
  import { onMount } from 'svelte'
  import { testDatabaseConnection, getSystemCategories } from './lib/dbTest'

  let testResults = $state(null)
  let loading = $state(true)
  let categories = $state({ income: [], expense: [] })

  onMount(async () => {
    await runTests()
  })

  async function runTests() {
    loading = true
    testResults = await testDatabaseConnection()
    categories = await getSystemCategories()
    loading = false
  }
</script>

<main class="min-h-screen bg-gray-50 py-12 px-4">
  <div class="max-w-4xl mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">Database Test Suite</h1>
      <p class="text-gray-600">PennyWise - Phase 2 Verification</p>
    </div>

    {#if loading}
      <div class="card text-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Running database tests...</p>
      </div>
    {:else if testResults}
      <!-- Connection Status -->
      <div class="card mb-6">
        <h2 class="text-2xl font-bold mb-4 flex items-center gap-2">
          {testResults.connection ? '✅' : '❌'}
          Connection Status
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-3xl mb-2">{testResults.connection ? '🟢' : '🔴'}</div>
            <div class="text-sm text-gray-600">Connection</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-3xl mb-2">{Object.keys(testResults.tables).length}</div>
            <div class="text-sm text-gray-600">Tables</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-3xl mb-2">{testResults.categories}</div>
            <div class="text-sm text-gray-600">Categories</div>
          </div>
          <div class="text-center p-4 bg-gray-50 rounded-lg">
            <div class="text-3xl mb-2">{testResults.errors.length === 0 ? '✅' : '❌'}</div>
            <div class="text-sm text-gray-600">Status</div>
          </div>
        </div>
      </div>

      <!-- Tables Status -->
      <div class="card mb-6">
        <h2 class="text-2xl font-bold mb-4">Tables Status</h2>
        <div class="space-y-2">
          {#each ['profiles', 'budget_periods', 'categories', 'transactions'] as table}
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span class="font-medium">{table}</span>
              <span class="text-2xl">{testResults.tables[table] ? '✅' : '❌'}</span>
            </div>
          {/each}
        </div>
      </div>

      <!-- System Categories -->
      <div class="card mb-6">
        <h2 class="text-2xl font-bold mb-4">System Categories</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Expense Categories -->
          <div>
            <h3 class="text-lg font-semibold mb-3 text-red-600">
              💸 Expenses ({categories.expense.length})
            </h3>
            <div class="space-y-2">
              {#each categories.expense as category}
                <div class="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span class="text-xl">{category.icon}</span>
                  <span class="flex-1">{category.name}</span>
                  <span class="w-4 h-4 rounded-full" style="background-color: {category.color}"
                  ></span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Income Categories -->
          <div>
            <h3 class="text-lg font-semibold mb-3 text-green-600">
              💰 Income ({categories.income.length})
            </h3>
            <div class="space-y-2">
              {#each categories.income as category}
                <div class="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span class="text-xl">{category.icon}</span>
                  <span class="flex-1">{category.name}</span>
                  <span class="w-4 h-4 rounded-full" style="background-color: {category.color}"
                  ></span>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Errors -->
      {#if testResults.errors.length > 0}
        <div class="card bg-red-50 border border-red-200">
          <h2 class="text-2xl font-bold mb-4 text-red-700">❌ Errors Found</h2>
          <div class="space-y-2">
            {#each testResults.errors as error}
              <div class="p-3 bg-white rounded border border-red-200 text-red-700">{error}</div>
            {/each}
          </div>
        </div>
      {:else}
        <div class="card bg-green-50 border border-green-200">
          <div class="text-center py-6">
            <div class="text-6xl mb-4">🎉</div>
            <h2 class="text-2xl font-bold text-green-700 mb-2">All Tests Passed!</h2>
            <p class="text-green-600">Database is properly configured and ready to use.</p>
          </div>
        </div>
      {/if}

      <!-- Retest Button -->
      <div class="text-center mt-6">
        <button class="btn btn-primary" onclick={runTests}>🔄 Run Tests Again</button>
      </div>
    {/if}
  </div>
</main>
