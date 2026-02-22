<script>
  /**
   * Skeleton loading placeholder
   * @prop {'text'|'card'|'stat-card'|'transaction-row'|'chart'} type
   * @prop {number} count - How many to render
   */
  let { type = 'text', count = 1, class: extraClass = '' } = $props()
</script>

<div class="skeleton-wrapper {extraClass}" aria-busy="true" aria-label="Loading...">
  {#each Array(count) as _, i}
    {#if type === 'text'}
      <div class="skeleton-line" style="width: {85 - (i % 3) * 15}%;"></div>
    {:else if type === 'card'}
      <div class="skeleton-card">
        <div class="skeleton-line" style="width: 40%; height: 12px;"></div>
        <div class="skeleton-line" style="width: 60%; height: 28px; margin-top: 8px;"></div>
        <div class="skeleton-line" style="width: 50%; height: 10px; margin-top: 12px;"></div>
      </div>
    {:else if type === 'stat-card'}
      <div class="skeleton-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <div class="skeleton-line" style="width: 50%; height: 10px;"></div>
            <div class="skeleton-line" style="width: 70%; height: 32px; margin-top: 10px;"></div>
            <div class="skeleton-line" style="width: 40%; height: 10px; margin-top: 10px;"></div>
          </div>
          <div
            class="skeleton-circle"
            style="width: 40px; height: 40px; border-radius: 10px;"
          ></div>
        </div>
      </div>
    {:else if type === 'transaction-row'}
      <div class="skeleton-row">
        <div class="skeleton-circle" style="width: 36px; height: 36px;"></div>
        <div style="flex: 1; margin-left: 12px;">
          <div class="skeleton-line" style="width: 55%; height: 12px;"></div>
          <div class="skeleton-line" style="width: 35%; height: 10px; margin-top: 6px;"></div>
        </div>
        <div class="skeleton-line" style="width: 70px; height: 14px;"></div>
      </div>
    {:else if type === 'chart'}
      <div
        class="skeleton-card"
        style="height: 200px; display: flex; align-items: flex-end; gap: 8px; padding: 20px;"
      >
        {#each [60, 80, 45, 90, 55, 75, 40] as height}
          <div
            class="skeleton-bar"
            style="flex: 1; height: {height}%; border-radius: 4px 4px 0 0;"
          ></div>
        {/each}
      </div>
    {/if}
  {/each}
</div>

<style>
  .skeleton-wrapper {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skeleton-line {
    background: linear-gradient(
      90deg,
      var(--color-border, #e5e7eb) 25%,
      #f3f4f6 50%,
      var(--color-border, #e5e7eb) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
    height: 14px;
  }

  .skeleton-circle {
    background: linear-gradient(
      90deg,
      var(--color-border, #e5e7eb) 25%,
      #f3f4f6 50%,
      var(--color-border, #e5e7eb) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .skeleton-bar {
    background: linear-gradient(
      90deg,
      var(--color-border, #e5e7eb) 25%,
      #f3f4f6 50%,
      var(--color-border, #e5e7eb) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-card {
    background: var(--color-surface, #ffffff);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid var(--color-border, #e5e7eb);
  }

  .skeleton-row {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-border, #e5e7eb);
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
