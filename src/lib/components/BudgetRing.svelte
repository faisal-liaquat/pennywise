<script>
  let { percent = 0, size = 80, thickness = 8 } = $props()

  const cx = $derived(size / 2)
  const cy = $derived(size / 2)
  const r = $derived((size - thickness) / 2)
  const circumference = $derived(2 * Math.PI * r)

  const clampedPct = $derived(Math.min(100, Math.max(0, percent)))
  const dashOffset = $derived(circumference - (clampedPct / 100) * circumference)

  const color = $derived(
    percent > 100 ? '#ef4444' : percent > 85 ? '#f97316' : percent > 70 ? '#eab308' : '#7c3aed'
  )
</script>

<div class="relative flex items-center justify-center" style="width: {size}px; height: {size}px;">
  <svg width={size} height={size} viewBox="0 0 {size} {size}" style="transform: rotate(-90deg);">
    <circle {cx} {cy} {r} fill="none" stroke="var(--color-border)" stroke-width={thickness} />
    <circle
      {cx}
      {cy}
      {r}
      fill="none"
      stroke={color}
      stroke-width={thickness}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      style="transition: stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease;"
    />
  </svg>
  <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <span class="font-bold text-sm leading-none" style="color: {color};"
      >{clampedPct.toFixed(0)}%</span
    >
  </div>
</div>
