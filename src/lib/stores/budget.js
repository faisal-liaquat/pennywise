import { writable, derived, get } from 'svelte/store'
import { supabase } from '$lib/supabaseClient'
import { sanitizeTransaction, sanitizeBudgetPeriod, sanitizeCategory } from '$lib/utils/sanitize.js'
import { incomeInBudget } from '$lib/stores/incomeToggle.js'

// ─── Currency store ───────────────────────────────────────────────────────────
export const userCurrency = writable('USD')

export async function loadUserCurrency() {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) return

  const { data, error } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', userData.user.id)
    .single()

  if (!error && data?.currency) {
    userCurrency.set(data.currency)
  }
}

export async function saveUserCurrency(currency) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('Not authenticated')

  const { error } = await supabase.from('profiles').update({ currency }).eq('id', userData.user.id)

  if (error) throw error
  userCurrency.set(currency)
}

// ─── State stores ─────────────────────────────────────────────────────────────
export const budgetPeriods = writable([])
export const activePeriod = writable(null)
export const categories = writable([])
export const transactions = writable([])
export const loadingBudget = writable(false)
export const budgetError = writable(null)

// ─── Derived: spending per category in active period ──────────────────────────
export const categorySpending = derived(
  [transactions, activePeriod],
  ([$transactions, $activePeriod]) => {
    if (!$activePeriod) return {}
    const spending = {}
    $transactions.forEach((t) => {
      if (t.budget_period_id === $activePeriod.id && t.type === 'expense') {
        spending[t.category_id] = (spending[t.category_id] || 0) + Number(t.amount)
      }
    })
    return spending
  }
)

// ─── Derived: total spent in active period (expenses only) ────────────────────
export const totalSpent = derived(
  [transactions, activePeriod],
  ([$transactions, $activePeriod]) => {
    if (!$activePeriod) return 0
    return $transactions
      .filter((t) => t.budget_period_id === $activePeriod.id && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }
)

// ─── Derived: total income in active period ───────────────────────────────────
export const totalIncome = derived(
  [transactions, activePeriod],
  ([$transactions, $activePeriod]) => {
    if (!$activePeriod) return 0
    return $transactions
      .filter((t) => t.budget_period_id === $activePeriod.id && t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  }
)

// ─── Derived: remaining budget — respects income toggle ───────────────────────
// When incomeInBudget is ON:  Budget + Income − Expenses = Remaining
// When incomeInBudget is OFF: Budget − Expenses = Remaining (income tracked only)
export const remainingBudget = derived(
  [activePeriod, totalSpent, totalIncome, incomeInBudget],
  ([$activePeriod, $totalSpent, $totalIncome, $incomeInBudget]) => {
    if (!$activePeriod) return 0
    const incomeBoost = $incomeInBudget ? $totalIncome : 0
    return Number($activePeriod.total_budget) + incomeBoost - $totalSpent
  }
)

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ─── Budget Period Actions ─────────────────────────────────────────────────────

export async function loadBudgetPeriods() {
  loadingBudget.set(true)
  budgetError.set(null)
  try {
    const { data, error } = await supabase
      .from('budget_periods')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) throw error
    budgetPeriods.set(data || [])

    const active = data?.find((p) => p.is_active) || data?.[0] || null
    activePeriod.set(active)
  } catch (err) {
    budgetError.set(err.message)
  } finally {
    loadingBudget.set(false)
  }
}

export async function createBudgetPeriod({ name, start_date, end_date, total_budget }) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('You must be signed in to create a budget period')

  const sanitized = sanitizeBudgetPeriod({ name, start_date, end_date, total_budget })

  if (!sanitized.name) throw new Error('Period name is required')
  if (!sanitized.start_date || !sanitized.end_date) throw new Error('Valid dates are required')
  if (!sanitized.total_budget || sanitized.total_budget <= 0)
    throw new Error('Budget must be greater than 0')

  await supabase.from('budget_periods').update({ is_active: false }).eq('is_active', true)

  const { data, error } = await supabase
    .from('budget_periods')
    .insert({
      user_id: userData.user.id,
      ...sanitized,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('A budget period with this name already exists')
    if (error.code === '23514')
      throw new Error('Invalid date range — end date must be after start date')
    throw new Error(error.message || 'Failed to create budget period')
  }

  budgetPeriods.update((periods) => [data, ...periods])
  activePeriod.set(data)
  return data
}

export async function updateBudgetPeriod(id, { name, start_date, end_date, total_budget }) {
  const sanitized = sanitizeBudgetPeriod({ name, start_date, end_date, total_budget })

  const { data, error } = await supabase
    .from('budget_periods')
    .update({ ...sanitized, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23514')
      throw new Error('Invalid date range — end date must be after start date')
    throw new Error(error.message || 'Failed to update budget period')
  }

  budgetPeriods.update((periods) => periods.map((p) => (p.id === id ? data : p)))

  const current = get(activePeriod)
  if (current?.id === id) activePeriod.set(data)

  return data
}

export async function deleteBudgetPeriod(id) {
  const { error } = await supabase.from('budget_periods').delete().eq('id', id)
  if (error) throw new Error(error.message || 'Failed to delete budget period')

  budgetPeriods.update((periods) => periods.filter((p) => p.id !== id))

  const current = get(activePeriod)
  if (current?.id === id) {
    const remaining = get(budgetPeriods)
    activePeriod.set(remaining[0] || null)
  }
}

export async function setActivePeriod(period) {
  await supabase.from('budget_periods').update({ is_active: false }).eq('is_active', true)
  await supabase.from('budget_periods').update({ is_active: true }).eq('id', period.id)

  budgetPeriods.update((periods) => periods.map((p) => ({ ...p, is_active: p.id === period.id })))
  activePeriod.set({ ...period, is_active: true })
  await loadTransactions(period.id)
}

// ─── Category Actions ──────────────────────────────────────────────────────────

export async function loadCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('is_system', { ascending: false })
    .order('name')

  if (error) throw error
  categories.set(data || [])
  return data
}

export async function createCategory({ name, type, color, icon }) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('You must be signed in to create a category')

  const sanitized = sanitizeCategory({ name, type, color, icon })

  if (!sanitized.name) throw new Error('Category name is required')

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userData.user.id,
      ...sanitized,
      is_system: false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505')
      throw new Error(`A "${type}" category named "${name}" already exists`)
    throw new Error(error.message || 'Failed to create category')
  }

  categories.update((cats) => [...cats, data])
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id).eq('is_system', false)

  if (error) throw new Error(error.message || 'Failed to delete category')

  categories.update((cats) => cats.filter((c) => c.id !== id))
}

// ─── Transaction Actions ───────────────────────────────────────────────────────

export async function loadTransactions(periodId) {
  if (!periodId) return

  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories(id, name, icon, color, type)')
    .eq('budget_period_id', periodId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  transactions.set(data || [])
  return data
}

export async function addTransaction({
  budget_period_id,
  category_id,
  amount,
  type,
  description,
  date,
}) {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData?.user) throw new Error('You must be signed in to add a transaction')

  const sanitized = sanitizeTransaction({
    category_id,
    amount,
    description,
    date,
    type,
    budget_period_id,
  })

  if (!sanitized.category_id) throw new Error('Category is required')
  if (!sanitized.amount || sanitized.amount <= 0) throw new Error('Amount must be greater than 0')
  if (!sanitized.date) throw new Error('Date is required')

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userData.user.id,
      ...sanitized,
    })
    .select('*, categories(id, name, icon, color, type)')
    .single()

  if (error) {
    if (error.code === '23514') throw new Error('Invalid transaction data')
    throw new Error(error.message || 'Failed to add transaction')
  }

  transactions.update((txs) => [data, ...txs])
  return data
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw new Error(error.message || 'Failed to delete transaction')
  transactions.update((txs) => txs.filter((t) => t.id !== id))
}

export async function updateTransaction(id, updates) {
  const sanitized = sanitizeTransaction(updates)

  const { data, error } = await supabase
    .from('transactions')
    .update({ ...sanitized, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, categories(id, name, icon, color, type)')
    .single()

  if (error) throw new Error(error.message || 'Failed to update transaction')

  transactions.update((txs) => txs.map((t) => (t.id === id ? data : t)))
  return data
}
