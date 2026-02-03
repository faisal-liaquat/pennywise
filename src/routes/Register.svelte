<script>
  import { authStore } from '$lib/stores/authStore'
  import Input from '$lib/components/Input.svelte'
  import Button from '$lib/components/Button.svelte'
  import { navigate } from '$lib/utils/navigation'

  let fullName = ''
  let email = ''
  let password = ''
  let confirmPassword = ''
  let errors = {}
  let loading = false
  let generalError = ''
  let successMessage = ''

  function validateForm() {
    errors = {}

    if (!fullName) {
      errors.fullName = 'Full name is required'
    } else if (fullName.length < 2) {
      errors.fullName = 'Name must be at least 2 characters'
    }

    if (!email) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    generalError = ''
    successMessage = ''

    if (!validateForm()) {
      return
    }

    loading = true

    const result = await authStore.signUp(email, password, fullName)

    loading = false

    if (result.success) {
      successMessage =
        'Account created successfully! Please check your email to verify your account.'

      // Clear form
      fullName = ''
      email = ''
      password = ''
      confirmPassword = ''

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } else {
      generalError = result.error || 'Failed to create account. Please try again.'
    }
  }

  function handleSignIn() {
    navigate('/login')
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <!-- Logo & Title -->
    <div class="auth-header">
      <div class="logo">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="#16a34a" stroke-width="2" />
          <path d="M12 6v6l4 2" stroke="#16a34a" stroke-width="2" stroke-linecap="round" />
        </svg>
      </div>
      <h1 class="auth-title">Create your account</h1>
      <p class="auth-subtitle">Start tracking your finances with PennyWise</p>
    </div>

    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="auth-form">
      {#if generalError}
        <div class="alert alert-error">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" />
          </svg>
          {generalError}
        </div>
      {/if}

      {#if successMessage}
        <div class="alert alert-success">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" />
          </svg>
          {successMessage}
        </div>
      {/if}

      <Input
        type="text"
        label="Full Name"
        id="fullName"
        placeholder="Enter your full name"
        bind:value={fullName}
        error={errors.fullName}
        required
        autocomplete="name"
      />

      <Input
        type="email"
        label="Email"
        id="email"
        placeholder="Enter your email"
        bind:value={email}
        error={errors.email}
        required
        autocomplete="email"
      />

      <Input
        type="password"
        label="Password"
        id="password"
        placeholder="Create a password"
        bind:value={password}
        error={errors.password}
        required
        autocomplete="new-password"
      />

      <Input
        type="password"
        label="Confirm Password"
        id="confirmPassword"
        placeholder="Confirm your password"
        bind:value={confirmPassword}
        error={errors.confirmPassword}
        required
        autocomplete="new-password"
      />

      <Button type="submit" variant="primary" fullWidth {loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>

    <!-- Sign in link -->
    <div class="auth-footer">
      <p class="auth-footer-text">
        Already have an account?
        <button type="button" class="link-button" on:click={handleSignIn}> Sign in </button>
      </p>
    </div>
  </div>
</div>

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
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
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

  .auth-form {
    margin-bottom: 1.5rem;
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
  }

  .auth-footer-text {
    color: #6b7280;
    font-size: 0.875rem;
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
</style>
