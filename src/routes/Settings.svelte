<script>
  import { onMount } from 'svelte'
  import AppLayout from '$lib/components/AppLayout.svelte'
  import CurrencySelector from '$lib/components/CurrencySelector.svelte'
  import { loadUserCurrency } from '$lib/stores/budget.js'

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

    <div class="max-w-xl">
      <CurrencySelector />
    </div>
  </div>
</AppLayout>
