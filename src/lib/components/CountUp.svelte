<script>
  import { tweened } from 'svelte/motion'
  import { cubicOut } from 'svelte/easing'

  let { value = 0, prefix = '', suffix = '', duration = 800, decimals = 0 } = $props()

  const displayed = tweened(0, { duration: 800, easing: cubicOut })

  $effect(() => {
    displayed.set(value)
  })

  const formatted = $derived(
    prefix +
      $displayed.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) +
      suffix
  )
</script>

<span>{formatted}</span>
