<script>
  import { authStore } from '$lib/stores/authStore'
  import Input from '$lib/components/Input.svelte'
  import Button from '$lib/components/Button.svelte'
  import { navigate } from '$lib/utils/navigation'

  let email = ''
  let errors = {}
  let loading = false
  let successMessage = ''
  let generalError = ''

  function validateForm() {
    errors = {}
    if (!email) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email'
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    generalError = ''
    successMessage = ''
    if (!validateForm()) return
    loading = true
    const result = await authStore.resetPassword(email)
    loading = false
    if (result.success) {
      successMessage = 'Reset instructions sent! Check your inbox.'
      email = ''
    } else {
      generalError = result.error || 'Failed to send reset email. Please try again.'
    }
  }
</script>

<div class="auth-bg">
  <div class="auth-panel">
    <div class="panel-content">
      <div class="panel-logo">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect width="48" height="48" rx="14" fill="rgba(255,255,255,0.15)" />
          <path
            d="M24 12C17.373 12 12 17.373 12 24s5.373 12 12 12 12-5.373 12-12S30.627 12 24 12z"
            fill="none"
            stroke="white"
            stroke-width="2"
          />
          <path
            d="M24 18v6l4 3"
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <h2 class="panel-title">Forgot your<br />password?</h2>
      <p class="panel-subtitle">
        No worries — we'll send you a reset link straight to your inbox. Back in seconds.
      </p>
    </div>
  </div>

  <div class="auth-right">
    <div class="auth-card">
      <div class="auth-logo-row">
        <div class="auth-logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#7c3aed" />
            <path
              d="M14 7C10.134 7 7 10.134 7 14s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7z"
              fill="none"
              stroke="white"
              stroke-width="1.5"
            />
            <path
              d="M14 11v3l2.5 1.5"
              stroke="white"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div>
          <span class="auth-logo-name">PennyWise</span>
          <span class="auth-logo-tag">Finance</span>
        </div>
      </div>

      <div class="auth-header">
        <h1 class="auth-title">Reset password</h1>
        <p class="auth-subtitle">Enter your email and we'll send you a reset link.</p>
      </div>

      {#if generalError}
        <div class="auth-alert auth-alert-error">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            ><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg
          >
          {generalError}
        </div>
      {/if}

      {#if successMessage}
        <div class="auth-alert auth-alert-success">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            ><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg
          >
          {successMessage}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="auth-form">
        <Input
          type="email"
          label="Email address"
          id="email"
          placeholder="you@example.com"
          bind:value={email}
          error={errors.email}
          required
          autocomplete="email"
        />

        <Button type="submit" variant="primary" fullWidth {loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div class="auth-footer">
        <button type="button" class="auth-link" on:click={() => navigate('/login')}>
          ← Back to sign in
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .auth-bg {
    min-height: 100vh;
    display: flex;
    background-color: var(--color-bg);
  }

  .auth-panel {
    display: none;
    flex: 1;
    background: linear-gradient(145deg, #4c1d95 0%, #6d28d9 40%, #7c3aed 100%);
    position: relative;
    overflow: hidden;
  }

  .auth-panel::before {
    content: '';
    position: absolute;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 50%;
    top: -100px;
    right: -100px;
  }

  @media (min-width: 900px) {
    .auth-panel {
      display: flex;
    }
  }

  .panel-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 4rem 3.5rem;
  }

  .panel-logo {
    margin-bottom: 2.5rem;
  }

  .panel-title {
    font-size: 2.25rem;
    font-weight: 800;
    color: white;
    line-height: 1.2;
    margin-bottom: 1rem;
    letter-spacing: -0.03em;
  }

  .panel-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.6;
  }

  .auth-right {
    flex: 0 0 auto;
    width: 100%;
    max-width: 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
  }

  @media (min-width: 900px) {
    .auth-right {
      padding: 3rem;
    }
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
  }

  .auth-logo-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2.5rem;
  }

  .auth-logo-name {
    display: block;
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text);
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .auth-logo-tag {
    display: block;
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .auth-header {
    margin-bottom: 1.75rem;
  }

  .auth-title {
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--color-text);
    margin-bottom: 0.375rem;
    letter-spacing: -0.03em;
    line-height: 1.15;
  }

  .auth-subtitle {
    font-size: 0.9375rem;
    color: var(--color-text-muted);
  }

  .auth-alert {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 1.25rem;
    border: 1.5px solid;
  }

  .auth-alert-error {
    background-color: rgba(239, 68, 68, 0.08);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.2);
  }

  .auth-alert-success {
    background-color: rgba(34, 197, 94, 0.08);
    color: #22c55e;
    border-color: rgba(34, 197, 94, 0.2);
  }

  .auth-form {
    margin-bottom: 1.5rem;
  }

  .auth-link {
    background: none;
    border: none;
    color: #7c3aed;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }

  .auth-link:hover {
    color: #6d28d9;
    text-decoration: underline;
  }

  .auth-footer {
    text-align: center;
    padding-top: 1.25rem;
    border-top: 1px solid var(--color-border);
  }
</style>
