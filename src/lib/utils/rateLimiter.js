// ─── Client-Side Rate Limiter ──────────────────────────────────────────────────
// Prevents accidental or malicious rapid-fire submissions

const attempts = new Map()

/**
 * Check if an action is rate limited.
 * @param {string} key - Unique key for this action (e.g. 'login', 'add-transaction')
 * @param {number} maxAttempts - Max attempts allowed in the window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ allowed: boolean, remainingMs: number, attemptsLeft: number }}
 */
export function checkRateLimit(key, maxAttempts = 5, windowMs = 60_000) {
  const now = Date.now()
  const record = attempts.get(key) || { count: 0, windowStart: now }

  // Reset window if expired
  if (now - record.windowStart > windowMs) {
    record.count = 0
    record.windowStart = now
  }

  if (record.count >= maxAttempts) {
    const remainingMs = windowMs - (now - record.windowStart)
    return { allowed: false, remainingMs, attemptsLeft: 0 }
  }

  record.count++
  attempts.set(key, record)

  return {
    allowed: true,
    remainingMs: 0,
    attemptsLeft: maxAttempts - record.count,
  }
}

/**
 * Reset the rate limiter for a key (e.g. after successful login)
 */
export function resetRateLimit(key) {
  attempts.delete(key)
}

/**
 * Format remaining time in a human-readable string
 */
export function formatRemainingTime(ms) {
  if (ms <= 0) return ''
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}
