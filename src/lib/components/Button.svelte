<script>
  export let type = 'button'
  export let variant = 'primary'
  export let loading = false
  export let disabled = false
  export let fullWidth = false
</script>

<button
  {type}
  class="pw-btn pw-btn-{variant} {fullWidth ? 'pw-btn-full' : ''}"
  disabled={disabled || loading}
  on:click
>
  {#if loading}
    <svg class="pw-spinner" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="3"
        stroke-dasharray="60"
        stroke-dashoffset="45"
        stroke-linecap="round"
      />
    </svg>
  {/if}
  <slot />
</button>

<style>
  .pw-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.8rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    border-radius: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    letter-spacing: -0.01em;
  }

  .pw-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
  }

  .pw-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .pw-btn-primary {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    color: white;
    box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
  }

  .pw-btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%);
    box-shadow: 0 6px 20px rgba(124, 58, 237, 0.5);
    transform: translateY(-1px);
  }

  .pw-btn-secondary {
    background-color: var(--color-surface-2);
    color: var(--color-text-muted);
    border: 1.5px solid var(--color-border);
  }

  .pw-btn-secondary:hover:not(:disabled) {
    color: #7c3aed;
    border-color: #7c3aed;
  }

  .pw-btn-outline {
    background-color: transparent;
    color: #7c3aed;
    border: 1.5px solid #7c3aed;
  }

  .pw-btn-outline:hover:not(:disabled) {
    background-color: rgba(124, 58, 237, 0.08);
  }

  .pw-btn-full {
    width: 100%;
  }

  .pw-spinner {
    width: 1.125rem;
    height: 1.125rem;
    animation: btn-spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  @keyframes btn-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
