<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import CurrencySelector from '$lib/components/CurrencySelector.svelte'
  import { loadUserCurrency } from '$lib/stores/budget.js'

  onMount(loadUserCurrency)
</script>

<AppLayout>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <p class="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
    </div>

    <div class="max-w-xl">
      <CurrencySelector />
    </div>
  </div>
</AppLayout>
