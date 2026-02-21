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
          window.history.replaceState({}, '', '/#/reset-password')
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
    currentRoute = getRouteFromHash(hash)

    window.addEventListener('hashchange', handleHashChange)
  })

  function handleHashChange() {
    const hash = window.location.hash.slice(1) || '/'
    currentRoute = getRouteFromHash(hash)
    showResetPassword = false
    updateSuccess = false
  }

  function getRouteFromHash(hash) {
    if (hash.startsWith('/login')) return 'login'
    if (hash.startsWith('/register')) return 'register'
    if (hash.startsWith('/forgot-password')) return 'forgot-password'
    if (hash.startsWith('/reset-password')) return 'reset-password'
    if (hash.startsWith('/dashboard')) return 'dashboard'
    if (hash.startsWith('/budget')) return 'budget'
    if (hash.startsWith('/categories')) return 'categories'
    if (hash.startsWith('/expenses')) return 'expenses'
    if (hash.startsWith('/settings')) return 'settings'

    if ($authStore.user) return 'dashboard'
    return 'login'
  }

  const PROTECTED_ROUTES = ['dashboard', 'budget', 'categories', 'expenses', 'settings']

  function validatePasswordForm() {
    passwordErrors = {}
    if (!newPassword) {
      passwordErrors.newPassword = 'Password is required'
    } else if (newPassword.length < 6) {
      passwordErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (!confirmPassword) {
      passwordErrors.confirmPassword = 'Please confirm your password'
    } else if (newPassword !== confirmPassword) {
      passwordErrors.confirmPassword = 'Passwords do not match'
    }
    return Object.keys(passwordErrors).length === 0
  }

  async function handlePasswordUpdate() {
    if (!validatePasswordForm()) return
    isUpdating = true
    resetPasswordError = ''

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    isUpdating = false

    if (error) {
      resetPasswordError = error.message
    } else {
      updateSuccess = true
      newPassword = ''
      confirmPassword = ''
      setTimeout(() => {
        authStore.initialize().then(() => {
          window.location.hash = '/dashboard'
          showResetPassword = false
        })
      }, 2000)
    }
  }

  function goToForgotPassword() {
    window.location.hash = '/forgot-password'
    showResetPassword = false
  }

  function goToLogin() {
    window.location.hash = '/login'
    showResetPassword = false
  }

  $: {
    if (
      isInitialized &&
      PROTECTED_ROUTES.includes(currentRoute) &&
      !$authStore.user &&
      !$authStore.loading &&
      !showResetPassword
    ) {
      window.location.hash = '/login'
      currentRoute = 'login'
    }
  }
</script>

{#if !isInitialized || (currentRoute === 'loading' && !showResetPassword)}
  <div class="loading-screen">
    <div class="spinner"></div>
  </div>
{:else if showResetPassword || currentRoute === 'reset-password'}
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#16a34a" stroke-width="2" />
            <path d="M12 6v6l4 2" stroke="#16a34a" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <h1 class="auth-title">Set new password</h1>
        <p class="auth-subtitle">Enter your new password below</p>
      </div>

      {#if resetPasswordError && !$authStore.session}
        <div class="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" />
          </svg>
          {resetPasswordError}
        </div>
        <div class="button-group">
          <button class="btn btn-primary btn-full" on:click={goToForgotPassword}>
            Request New Reset Link
          </button>
          <button class="btn btn-outline btn-full" on:click={goToLogin}>Back to Login</button>
        </div>
      {:else if updateSuccess}
        <div class="alert alert-success">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" />
          </svg>
          Password updated successfully! Redirecting to dashboard...
        </div>
      {:else}
        <form on:submit|preventDefault={handlePasswordUpdate}>
          {#if resetPasswordError}
            <div class="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
                <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" />
              </svg>
              {resetPasswordError}
            </div>
          {/if}

          <div class="input-wrapper">
            <label for="newPassword" class="input-label">New Password *</label>
            <input
              type="password"
              id="newPassword"
              bind:value={newPassword}
              class="input {passwordErrors.newPassword ? 'input-error' : ''}"
              placeholder="Enter new password"
              autocomplete="new-password"
            />
            {#if passwordErrors.newPassword}
              <p class="error-message">{passwordErrors.newPassword}</p>
            {/if}
          </div>

          <div class="input-wrapper">
            <label for="confirmPassword" class="input-label">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              class="input {passwordErrors.confirmPassword ? 'input-error' : ''}"
              placeholder="Confirm new password"
              autocomplete="new-password"
            />
            {#if passwordErrors.confirmPassword}
              <p class="error-message">{passwordErrors.confirmPassword}</p>
            {/if}
          </div>

          <button type="submit" class="btn btn-primary btn-full" disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div class="auth-footer">
          <button type="button" class="link-button" on:click={goToLogin}>← Back to login</button>
        </div>
      {/if}
    </div>
  </div>
{:else if currentRoute === 'login'}
  <Login />
{:else if currentRoute === 'register'}
  <Register />
{:else if currentRoute === 'forgot-password'}
  <ForgotPassword />
{:else if currentRoute === 'dashboard'}
  <Dashboard />
{:else if currentRoute === 'budget'}
  <BudgetPeriods />
{:else if currentRoute === 'categories'}
  <Categories />
{:else if currentRoute === 'expenses'}
  <Expenses />
{:else if currentRoute === 'settings'}
  <Settings />
{/if}

<style>
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    padding: 1rem;
  }

  .auth-card {
    background: white;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 2.5rem;
    width: 100%;
    max-width: 28rem;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .logo {
    display: inline-flex;
    margin-bottom: 1rem;
  }

  .auth-title {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .auth-subtitle {
    color: #6b7280;
    font-size: 1rem;
  }

  .input-wrapper {
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
  }

  .input:focus {
    outline: none;
    border-color: #16a34a;
    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.1);
  }

  .input-error {
    border-color: #ef4444;
  }

  .error-message {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #ef4444;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
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

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .link-button {
    background: none;
    border: none;
    color: #16a34a;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    padding: 0;
    transition: color 0.2s;
  }

  .link-button:hover {
    color: #15803d;
    text-decoration: underline;
  }

  .auth-footer {
    text-align: center;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    margin-top: 1.5rem;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .alert-error {
    background-color: #fef2f2;
    color: #991b1b;
    border: 1px solid #fee2e2;
  }

  .alert-success {
    background-color: #f0fdf4;
    color: #166534;
    border: 1px solid #bbf7d0;
  }

  .loading-screen {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid #e5e7eb;
    border-top-color: #16a34a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
