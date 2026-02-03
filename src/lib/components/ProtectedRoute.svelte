<script>
  import { authStore } from '$lib/stores/authStore'
  import { navigate } from '$lib/utils/navigation'

  export let redirectTo = '/login'

  $: if (!$authStore.loading && !$authStore.user) {
    navigate(redirectTo)
  }
</script>

{#if $authStore.loading}
  <div class="loading-container">
    <div class="loading-spinner">
      <svg class="spinner" viewBox="0 0 24 24">
        <circle class="spinner-circle" cx="12" cy="12" r="10" />
      </svg>
      <p class="loading-text">Loading...</p>
    </div>
  </div>
{:else if $authStore.user}
  <slot />
{/if}

<style>
  .loading-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9fafb;
  }

  .loading-spinner {
    text-align: center;
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  .spinner-circle {
    fill: none;
    stroke: #16a34a;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 60;
    stroke-dashoffset: 45;
  }

  .loading-text {
    color: #6b7280;
    font-size: 1rem;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
