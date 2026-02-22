<script>
  import { authStore } from '$lib/stores/authStore'
  import Input from '$lib/components/Input.svelte'
  import Button from '$lib/components/Button.svelte'
  import { navigate } from '$lib/utils/navigation'
  import { validateLoginForm } from '$lib/utils/validators.js'
  import { checkRateLimit, resetRateLimit, formatRemainingTime } from '$lib/utils/rateLimiter.js'
  import { toast } from '$lib/stores/toast.js'

  let email = ''
  let password = ''
  let errors = {}
  let loading = false
  let generalError = ''
  let rateLimitError = ''

  function validateForm() {
    const { errors: validationErrors, isValid } = validateLoginForm({ email, password })
    errors = validationErrors
    return isValid
  }

  async function handleSubmit() {
    generalError = ''
    rateLimitError = ''

    // Rate limit login attempts — 5 per 5 minutes
    const rateCheck = checkRateLimit('login', 5, 5 * 60_000)
    if (!rateCheck.allowed) {
      rateLimitError = `Too many login attempts. Please wait ${formatRemainingTime(rateCheck.remainingMs)}.`
      return
    }

    if (!validateForm()) return

    loading = true
    const result = await authStore.signIn(email, password)
    loading = false

    if (result.success) {
      resetRateLimit('login')
      navigate('/dashboard')
    } else {
      generalError = result.error || 'Failed to sign in. Please try again.'
    }
  }
</script>

<div class="auth-bg">
  <!-- Left decorative panel (desktop only) -->
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
          <circle cx="24" cy="24" r="2" fill="white" />
        </svg>
      </div>
      <h2 class="panel-title">Track every penny,<br />own your future.</h2>
      <p class="panel-subtitle">
        PennyWise helps you build budget periods, track spending, and stay in control — beautifully.
      </p>
      <div class="panel-features">
        <div class="panel-feature">
          <span class="feature-dot"></span>
          Custom budget periods (e.g. Dec 15 – Jan 15)
        </div>
        <div class="panel-feature">
          <span class="feature-dot"></span>
          Real-time spending breakdown by category
        </div>
        <div class="panel-feature">
          <span class="feature-dot"></span>
          Dark mode, 154 currencies, zero clutter
        </div>
      </div>
    </div>
  </div>

  <!-- Right: auth card -->
  <div class="auth-right">
    <div class="auth-card">
      <!-- Logo -->
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
        <h1 class="auth-title">Welcome back</h1>
        <p class="auth-subtitle">Sign in to your account to continue</p>
      </div>

      {#if rateLimitError}
        <div class="auth-alert auth-alert-warning">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {rateLimitError}
        </div>
      {/if}

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
          >
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          {generalError}
        </div>
      {/if}

      <form on:submit|preventDefault={handleSubmit} class="auth-form" novalidate>
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

        <Input
          type="password"
          label="Password"
          id="password"
          placeholder="Enter your password"
          bind:value={password}
          error={errors.password}
          required
          autocomplete="current-password"
        />

        <div class="forgot-row">
          <button type="button" class="auth-link" on:click={() => navigate('/forgot-password')}>
            Forgot password?
          </button>
        </div>

        <Button type="submit" variant="primary" fullWidth {loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div class="auth-footer">
        <p class="auth-footer-text">
          Don't have an account?
          <button
            type="button"
            class="auth-link auth-link-bold"
            on:click={() => navigate('/register')}
          >
            Create one
          </button>
        </p>
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

  /* Left decorative panel */
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

  .auth-panel::after {
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 50%;
    bottom: -50px;
    left: -50px;
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
    margin-bottom: 2.5rem;
  }

  .panel-features {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  .panel-feature {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
  }

  .feature-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
  }

  /* Right side */
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
      padding: 3rem 3rem;
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

  .auth-logo-icon {
    flex-shrink: 0;
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
    font-weight: 400;
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

  .auth-alert-warning {
    background-color: rgba(245, 158, 11, 0.08);
    color: #d97706;
    border-color: rgba(245, 158, 11, 0.25);
  }

  .auth-form {
    margin-bottom: 1.5rem;
  }

  .forgot-row {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.5rem;
    margin-bottom: 1rem;
  }

  .auth-link {
    background: none;
    border: none;
    color: #7c3aed;
    font-size: 0.875rem;
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

  .auth-link-bold {
    font-weight: 700;
    margin-left: 0.25rem;
  }

  .auth-footer {
    text-align: center;
    padding-top: 1.25rem;
    border-top: 1px solid var(--color-border);
  }

  .auth-footer-text {
    font-size: 0.9rem;
    color: var(--color-text-muted);
  }
</style>
