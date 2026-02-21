<script>
  export let type = 'text'
  export let placeholder = ''
  export let value = ''
  export let error = ''
  export let label = ''
  export let id = ''
  export let required = false
  export let autocomplete = ''
</script>

<div class="input-wrapper">
  {#if label}
    <label for={id} class="input-label">
      {label}
      {#if required}
        <span style="color: #ef4444;">*</span>
      {/if}
    </label>
  {/if}

  <input
    {id}
    {type}
    {placeholder}
    {required}
    {autocomplete}
    bind:value
    class="pw-input {error ? 'pw-input-error' : ''}"
    on:input
    on:blur
  />

  {#if error}
    <p class="error-msg">{error}</p>
  {/if}
</div>

<style>
  .input-wrapper {
    width: 100%;
    margin-bottom: 1rem;
  }

  .input-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }

  .pw-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--color-border);
    border-radius: 0.75rem;
    font-size: 0.9375rem;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-weight: 500;
    transition: all 0.2s;
    background-color: var(--color-surface-2);
    color: var(--color-text);
    outline: none;
  }

  .pw-input::placeholder {
    color: var(--color-text-subtle);
  }

  .pw-input:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
    background-color: var(--color-surface);
  }

  .pw-input-error {
    border-color: #ef4444;
  }

  .pw-input-error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .error-msg {
    margin-top: 0.375rem;
    font-size: 0.8125rem;
    color: #ef4444;
    font-weight: 500;
  }
</style>
