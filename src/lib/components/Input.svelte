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
        <span class="text-red-500">*</span>
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
    class="input {error ? 'input-error' : ''}"
    on:input
    on:blur
  />

  {#if error}
    <p class="error-message">{error}</p>
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
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
  }

  .input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
    background-color: white;
  }

  .input:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }

  .input-error {
    border-color: #ef4444;
  }

  .input-error:focus {
    border-color: #ef4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .error-message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #ef4444;
  }
</style>
