// ─── PennyWise Input Sanitization ─────────────────────────────────────────────
// Protects against XSS and injection attacks

/**
 * Strip all HTML tags from a string.
 * Dangerous tag CONTENT (script, style, iframe) is removed entirely —
 * not just the tags themselves — so inner payloads like alert(1) cannot leak.
 */
export function stripHtml(str) {
  if (!str) return ''
  let result = String(str)
  // Step 1: remove content INSIDE dangerous tags entirely
  result = result.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  result = result.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  result = result.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  // Step 2: strip all remaining HTML tags
  result = result.replace(/<[^>]*>/g, '')
  return result.trim()
}

/**
 * Escape HTML special characters for safe display
 */
export function escapeHtml(str) {
  if (!str) return ''
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  }
  return String(str).replace(/[&<>"'/]/g, (char) => map[char])
}

/**
 * Sanitize a text input: strip HTML, trim whitespace, truncate to maxLength
 */
export function sanitizeText(str, maxLength = 500) {
  if (!str) return ''
  return stripHtml(String(str)).trim().slice(0, maxLength)
}

/**
 * Sanitize a name field (category name, period name, etc.)
 */
export function sanitizeName(str, maxLength = 100) {
  if (!str) return ''
  return stripHtml(String(str)).trim().slice(0, maxLength)
}

/**
 * Sanitize a monetary amount — returns a number or null
 */
export function sanitizeAmount(value) {
  if (value === null || value === undefined || value === '') return null
  const num = parseFloat(String(value).replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return null
  // Round to 2 decimal places
  return Math.round(num * 100) / 100
}

/**
 * Sanitize a date string — returns ISO date string or null
 */
export function sanitizeDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (isNaN(date.getTime())) return null
  return date.toISOString().split('T')[0]
}

/**
 * Sanitize a hex color — returns valid color or default
 */
export function sanitizeColor(value, defaultColor = '#7c3aed') {
  if (!value) return defaultColor
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) return value
  return defaultColor
}

/**
 * Sanitize a full transaction object before DB insert
 */
export function sanitizeTransaction({
  amount,
  description,
  date,
  category_id,
  type,
  budget_period_id,
}) {
  return {
    amount: sanitizeAmount(amount),
    description: sanitizeText(description, 500),
    date: sanitizeDate(date),
    category_id: category_id ? String(category_id).trim() : null,
    type: ['income', 'expense'].includes(type) ? type : 'expense',
    budget_period_id: budget_period_id ? String(budget_period_id).trim() : null,
  }
}

/**
 * Sanitize a budget period object before DB insert
 */
export function sanitizeBudgetPeriod({ name, start_date, end_date, total_budget }) {
  return {
    name: sanitizeName(name, 100),
    start_date: sanitizeDate(start_date),
    end_date: sanitizeDate(end_date),
    total_budget: sanitizeAmount(total_budget),
  }
}

/**
 * Sanitize a category object before DB insert
 */
export function sanitizeCategory({ name, type, color, icon }) {
  return {
    name: sanitizeName(name, 50),
    type: ['income', 'expense'].includes(type) ? type : 'expense',
    color: sanitizeColor(color),
    icon: icon ? sanitizeText(icon, 10) : '📦',
  }
}
