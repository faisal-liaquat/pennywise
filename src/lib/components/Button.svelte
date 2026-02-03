<script>
  export let type = 'button'
  export let variant = 'primary' // primary, secondary, outline
  export let loading = false
  export let disabled = false
  export let fullWidth = false
</script>

<button
  {type}
  class="btn btn-{variant} {fullWidth ? 'btn-full' : ''}"
  disabled={disabled || loading}
  on:click
>
  {#if loading}
    <svg class="spinner" viewBox="0 0 24 24">
      <circle class="spinner-circle" cx="12" cy="12" r="10" />
    </svg>
  {/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-primary {
    background-color: #16a34a;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #15803d;
  }

  .btn-secondary {
    background-color: #f3f4f6;
    color: #374151;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #e5e7eb;
  }

  .btn-outline {
    background-color: transparent;
    color: #16a34a;
    border: 1px solid #16a34a;
  }

  .btn-outline:hover:not(:disabled) {
    background-color: #f0fdf4;
  }

  .btn-full {
    width: 100%;
  }

  .spinner {
    width: 1.25rem;
    height: 1.25rem;
    animation: spin 1s linear infinite;
  }

  .spinner-circle {
    fill: none;
    stroke: currentColor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 60;
    stroke-dashoffset: 45;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
