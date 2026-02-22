// ─── PennyWise Centralized Validation Library ─────────────────────────────────
// All validation functions return { valid: boolean, error: string }

// ─── Primitives ───────────────────────────────────────────────────────────────

export function validateRequired(value, fieldName = 'This field') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { valid: false, error: `${fieldName} is required` }
  }
  return { valid: true, error: '' }
}

export function validateMinLength(value, min, fieldName = 'This field') {
  if (!value || String(value).trim().length < min) {
    return { valid: false, error: `${fieldName} must be at least ${min} characters` }
  }
  return { valid: true, error: '' }
}

export function validateMaxLength(value, max, fieldName = 'This field') {
  if (value && String(value).trim().length > max) {
    return { valid: false, error: `${fieldName} must be no more than ${max} characters` }
  }
  return { valid: true, error: '' }
}

// ─── Email ────────────────────────────────────────────────────────────────────

export function validateEmail(email) {
  const req = validateRequired(email, 'Email')
  if (!req.valid) return req
  // RFC 5322 simplified
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(String(email).toLowerCase())) {
    return { valid: false, error: 'Please enter a valid email address' }
  }
  return { valid: true, error: '' }
}

// ─── Password ─────────────────────────────────────────────────────────────────

export function validatePassword(password) {
  const req = validateRequired(password, 'Password')
  if (!req.valid) return req
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' }
  }
  return { valid: true, error: '' }
}

export function validatePasswordMatch(password, confirm) {
  const req = validateRequired(confirm, 'Confirm password')
  if (!req.valid) return req
  if (password !== confirm) {
    return { valid: false, error: 'Passwords do not match' }
  }
  return { valid: true, error: '' }
}

// ─── Amount / Money ───────────────────────────────────────────────────────────

export function validateAmount(value, fieldName = 'Amount') {
  const req = validateRequired(value, fieldName)
  if (!req.valid) return req

  const num = Number(value)
  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` }
  }
  if (num <= 0) {
    return { valid: false, error: `${fieldName} must be greater than 0` }
  }
  if (num > 999_999_999) {
    return { valid: false, error: `${fieldName} is unrealistically large` }
  }
  // Max 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
    return { valid: false, error: `${fieldName} can have at most 2 decimal places` }
  }
  return { valid: true, error: '' }
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function validateDate(value, fieldName = 'Date') {
  const req = validateRequired(value, fieldName)
  if (!req.valid) return req

  const date = new Date(value)
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} is not a valid date` }
  }
  // Sanity check — not before year 2000 or after 2100
  const year = date.getFullYear()
  if (year < 2000 || year > 2100) {
    return { valid: false, error: `${fieldName} must be between 2000 and 2100` }
  }
  return { valid: true, error: '' }
}

export function validateDateRange(startDate, endDate) {
  const startVal = validateDate(startDate, 'Start date')
  if (!startVal.valid) return { start: startVal.error, end: '' }

  const endVal = validateDate(endDate, 'End date')
  if (!endVal.valid) return { start: '', end: endVal.error }

  if (new Date(startDate) >= new Date(endDate)) {
    return { start: '', end: 'End date must be after start date' }
  }
  return { start: '', end: '' }
}

// ─── Name / Text ──────────────────────────────────────────────────────────────

export function validateName(value, fieldName = 'Name', { min = 1, max = 100 } = {}) {
  const req = validateRequired(value, fieldName)
  if (!req.valid) return req

  const minCheck = validateMinLength(value, min, fieldName)
  if (!minCheck.valid) return minCheck

  const maxCheck = validateMaxLength(value, max, fieldName)
  if (!maxCheck.valid) return maxCheck

  // No HTML tags allowed
  if (/<[^>]*>/.test(value)) {
    return { valid: false, error: `${fieldName} must not contain HTML` }
  }
  return { valid: true, error: '' }
}

// ─── Budget Period Form ───────────────────────────────────────────────────────

export function validateBudgetPeriodForm({ name, start_date, end_date, total_budget }) {
  const errors = {}

  const nameVal = validateName(name, 'Period name', { min: 1, max: 100 })
  if (!nameVal.valid) errors.name = nameVal.error

  const dateRangeErrors = validateDateRange(start_date, end_date)
  if (dateRangeErrors.start) errors.start_date = dateRangeErrors.start
  if (dateRangeErrors.end) errors.end_date = dateRangeErrors.end

  const budgetVal = validateAmount(total_budget, 'Budget')
  if (!budgetVal.valid) errors.total_budget = budgetVal.error

  return { errors, isValid: Object.keys(errors).length === 0 }
}

// ─── Transaction Form ─────────────────────────────────────────────────────────

export function validateTransactionForm({ category_id, amount, date, description }) {
  const errors = {}

  const catVal = validateRequired(category_id, 'Category')
  if (!catVal.valid) errors.category_id = catVal.error

  const amountVal = validateAmount(amount, 'Amount')
  if (!amountVal.valid) errors.amount = amountVal.error

  const dateVal = validateDate(date, 'Date')
  if (!dateVal.valid) errors.date = dateVal.error

  if (description && description.length > 500) {
    errors.description = 'Description must be no more than 500 characters'
  }

  // No script injection in description
  if (description && /<script/i.test(description)) {
    errors.description = 'Description contains invalid content'
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}

// ─── Category Form ────────────────────────────────────────────────────────────

export function validateCategoryForm({ name, type, color }) {
  const errors = {}

  const nameVal = validateName(name, 'Category name', { min: 1, max: 50 })
  if (!nameVal.valid) errors.name = nameVal.error

  if (!['income', 'expense'].includes(type)) {
    errors.type = 'Type must be income or expense'
  }

  if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    errors.color = 'Color must be a valid hex color (e.g. #7c3aed)'
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}

// ─── Login / Register Forms ───────────────────────────────────────────────────

export function validateLoginForm({ email, password }) {
  const errors = {}

  const emailVal = validateEmail(email)
  if (!emailVal.valid) errors.email = emailVal.error

  const passReq = validateRequired(password, 'Password')
  if (!passReq.valid) errors.password = passReq.error

  return { errors, isValid: Object.keys(errors).length === 0 }
}

export function validateRegisterForm({ email, password, confirmPassword, fullName }) {
  const errors = {}

  const emailVal = validateEmail(email)
  if (!emailVal.valid) errors.email = emailVal.error

  const passVal = validatePassword(password)
  if (!passVal.valid) errors.password = passVal.error

  if (password && confirmPassword) {
    const matchVal = validatePasswordMatch(password, confirmPassword)
    if (!matchVal.valid) errors.confirmPassword = matchVal.error
  } else if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  }

  if (fullName !== undefined) {
    const nameVal = validateName(fullName, 'Full name', { min: 2, max: 100 })
    if (!nameVal.valid) errors.fullName = nameVal.error
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}
