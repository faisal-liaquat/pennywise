<script>
  import { onMount } from 'svelte'
  import { authStore } from './lib/stores/authStore'
  import { supabase } from './lib/supabaseClient'

  import Login from './routes/Login.svelte'
  import Register from './routes/Register.svelte'
  import ForgotPassword from './routes/ForgotPassword.svelte'
  import Dashboard from './routes/Dashboard.svelte'
  import BudgetPeriods from './routes/BudgetPeriods.svelte'
  import Categories from './routes/Categories.svelte'
  import Expenses from './routes/Expenses.svelte'
  import Settings from './routes/Settings.svelte'
  import Analytics from './routes/Analytics.svelte'

  let currentRoute = 'loading'
  let showResetPassword = false
  let resetPasswordError = ''
  let newPassword = ''
  let confirmPassword = ''
  let passwordErrors = {}
  let isUpdating = false
  let updateSuccess = false
  let isInitialized = false

  onMount(async () => {
    const fullUrl = window.location.href

    if (fullUrl.includes('type=recovery') || fullUrl.includes('access_token')) {
      const hashPart = fullUrl.split('#')[1] || ''
      const params = new URLSearchParams(hashPart)

      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const type = params.get('type')

      if (type === 'recovery' && accessToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          console.error('Session error:', error)
          resetPasswordError = 'Invalid or expired reset link'
          showResetPassword = true
          currentRoute = 'reset-password'
        } else {
          window.history.replaceState({}, '', '/')
          showResetPassword = true
          currentRoute = 'reset-password'
        }
        isInitialized = true
        return
      }
    }

    await authStore.initialize()
    isInitialized = true

    const hash = window.location.hash.slice(1) || '/'
    if (
      hash === '/' ||
      hash === '' ||
      (!$authStore.user && hash !== '/login' && hash !== '/register' && hash !== '/forgot-password')
    ) {
      currentRoute = $authStore.user ? '/dashboard' : '/login'
      window.location.hash = currentRoute
    } else {
      currentRoute = hash
    }

    window.addEventListener('hashchange', () => {
      currentRoute = window.location.hash.slice(1) || '/login'
    })
  })

  function getComponent(route) {
    if (!isInitialized) return null
    if (showResetPassword) return null

    switch (route) {
      case '/login':
        return Login
      case '/register':
        return Register
      case '/forgot-password':
        return ForgotPassword
      case '/dashboard':
        return $authStore.user ? Dashboard : Login
      case '/budget':
        return $authStore.user ? BudgetPeriods : Login
      case '/expenses':
        return $authStore.user ? Expenses : Login
      case '/categories':
        return $authStore.user ? Categories : Login
      case '/analytics':
        return $authStore.user ? Analytics : Login
      case '/settings':
        return $authStore.user ? Settings : Login
      default:
        return $authStore.user ? Dashboard : Login
    }
  }

  async function handleUpdatePassword() {
    passwordErrors = {}
    if (!newPassword) {
      passwordErrors.newPassword = 'Password is required'
      return
    }
    if (newPassword.length < 6) {
      passwordErrors.newPassword = 'Password must be at least 6 characters'
      return
    }
    if (newPassword !== confirmPassword) {
      passwordErrors.confirmPassword = 'Passwords do not match'
      return
    }

    isUpdating = true
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    isUpdating = false

    if (error) {
      resetPasswordError = error.message
    } else {
      updateSuccess = true
      setTimeout(async () => {
        showResetPassword = false
        await authStore.initialize()
        currentRoute = '/dashboard'
        window.location.hash = '/dashboard'
      }, 2000)
    }
  }
</script>

{#if !isInitialized}
  <!-- Loading splash -->
  <div
    class="min-h-screen flex items-center justify-center"
    style="background: var(--color-bg, #f3f0ff);"
  >
    <div class="flex flex-col items-center gap-4">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="14" fill="#7c3aed" />
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
      <div
        class="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"
      ></div>
    </div>
  </div>
{:else if showResetPassword}
  <!-- Password reset form -->
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
            <circle cx="24" cy="24" r="2" fill="white" />
          </svg>
        </div>
        <h2 class="panel-title">Set your new password.</h2>
        <p class="panel-subtitle">Choose something strong and memorable.</p>
      </div>
    </div>

    <div class="auth-form-side">
      <div class="auth-form-container">
        <div class="auth-form-header">
          <h1 class="auth-title">Reset Password</h1>
          <p class="auth-subtitle">Enter your new password below</p>
        </div>

        {#if updateSuccess}
          <div class="success-message">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Password updated! Redirecting to dashboard…</span>
          </div>
        {:else}
          {#if resetPasswordError && !passwordErrors.newPassword}
            <div class="error-message">{resetPasswordError}</div>
          {/if}

          <div class="form-group">
            <label class="form-label" for="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              class="form-input {passwordErrors.newPassword ? 'error' : ''}"
              placeholder="At least 6 characters"
              bind:value={newPassword}
            />
            {#if passwordErrors.newPassword}
              <span class="field-error">{passwordErrors.newPassword}</span>
            {/if}
          </div>

          <div class="form-group">
            <label class="form-label" for="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              class="form-input {passwordErrors.confirmPassword ? 'error' : ''}"
              placeholder="Repeat your password"
              bind:value={confirmPassword}
            />
            {#if passwordErrors.confirmPassword}
              <span class="field-error">{passwordErrors.confirmPassword}</span>
            {/if}
          </div>

          <button
            class="btn-auth-primary w-full"
            onclick={handleUpdatePassword}
            disabled={isUpdating}
          >
            {#if isUpdating}
              <span class="btn-spinner"></span>
              Updating…
            {:else}
              Update Password
            {/if}
          </button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  {@const Component = getComponent(currentRoute)}
  {#if Component}
    <svelte:component this={Component} />
  {/if}
{/if}

<style>
  .auth-bg {
    min-height: 100vh;
    display: flex;
    background: var(--color-bg, #f3f0ff);
  }

  .auth-panel {
    width: 420px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }

  @media (max-width: 768px) {
    .auth-panel {
      display: none;
    }
  }

  .panel-content {
    color: white;
  }

  .panel-logo {
    margin-bottom: 2rem;
  }

  .panel-title {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1rem;
    color: white;
  }

  .panel-subtitle {
    font-size: 0.95rem;
    opacity: 0.8;
    line-height: 1.6;
    color: white;
  }

  .auth-form-side {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .auth-form-container {
    width: 100%;
    max-width: 400px;
  }

  .auth-form-header {
    margin-bottom: 2rem;
  }

  .auth-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-text, #1e1b4b);
    margin-bottom: 0.5rem;
  }

  .auth-subtitle {
    font-size: 0.875rem;
    color: var(--color-text-subtle, #6b7280);
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text, #374151);
    margin-bottom: 0.5rem;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1.5px solid var(--color-border, #e5e7eb);
    border-radius: 0.75rem;
    font-size: 0.875rem;
    background: var(--color-surface, white);
    color: var(--color-text, #111827);
    outline: none;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }

  .form-input:focus {
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  .form-input.error {
    border-color: #ef4444;
  }

  .field-error {
    display: block;
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.25rem;
  }

  .error-message {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .success-message {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
    border-radius: 0.75rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .btn-auth-primary {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #7c3aed, #5b21b6);
    color: white;
    border: none;
    border-radius: 0.75rem;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition:
      opacity 0.15s,
      transform 0.15s;
    margin-top: 0.5rem;
  }

  .btn-auth-primary:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .btn-auth-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
