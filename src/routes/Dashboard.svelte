<script>
  import { authStore } from '$lib/stores/authStore'
  import ProtectedRoute from '$lib/components/ProtectedRoute.svelte'
  import Button from '$lib/components/Button.svelte'
  import { navigate } from '$lib/utils/navigation'

  let loading = false

  async function handleSignOut() {
    loading = true
    const result = await authStore.signOut()
    loading = false

    if (result.success) {
      navigate('/login')
    }
  }
</script>

<ProtectedRoute>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Dashboard</h1>
        <Button variant="outline" on:click={handleSignOut} {loading}>
          {loading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="welcome-card">
        <h2 class="welcome-title">
          Welcome to PennyWise, {$authStore.user?.user_metadata?.full_name || 'User'}!
        </h2>
        <p class="welcome-text">
          Your dashboard is ready. You're now authenticated and can access all features.
        </p>
        <div class="user-info">
          <p><strong>Email:</strong> {$authStore.user?.email}</p>
          <p><strong>User ID:</strong> {$authStore.user?.id}</p>
          <p>
            <strong>Created:</strong>
            {new Date($authStore.user?.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  </div>
</ProtectedRoute>

<style>
  .dashboard-container {
    min-height: 100vh;
    background-color: #f9fafb;
  }

  .dashboard-header {
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 1.5rem 2rem;
  }

  .header-content {
    max-width: 80rem;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dashboard-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }

  .dashboard-content {
    max-width: 80rem;
    margin: 0 auto;
    padding: 2rem;
  }

  .welcome-card {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }

  .welcome-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
  }

  .welcome-text {
    color: #6b7280;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .user-info {
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .user-info p {
    margin-bottom: 0.5rem;
    color: #374151;
    font-size: 0.875rem;
  }

  .user-info p:last-child {
    margin-bottom: 0;
  }

  .user-info strong {
    font-weight: 600;
    color: #111827;
  }
</style>
