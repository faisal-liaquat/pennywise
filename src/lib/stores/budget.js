import { writable, derived, get } from 'svelte/store'
import { supabase } from '$lib/supabaseClient'

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

// ─── Derived: remaining budget (budget + income - expenses) ───────────────────
export const remainingBudget = derived(
  [activePeriod, totalSpent, totalIncome],
  ([$activePeriod, $totalSpent, $totalIncome]) => {
    if (!$activePeriod) return 0
    return Number($activePeriod.total_budget) + $totalIncome - $totalSpent
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
  if (!userData?.user) throw new Error('Not authenticated')

  await supabase.from('budget_periods').update({ is_active: false }).eq('is_active', true)

  const { data, error } = await supabase
    .from('budget_periods')
    .insert({
      user_id: userData.user.id,
      name,
      start_date,
      end_date,
      total_budget: Number(total_budget),
      is_active: true,
    })
    .select()
    .single()

  if (error) throw error

  budgetPeriods.update((periods) => [data, ...periods])
  activePeriod.set(data)
  return data
}

export async function updateBudgetPeriod(id, updates) {
  const { data, error } = await supabase
    .from('budget_periods')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  budgetPeriods.update((periods) => periods.map((p) => (p.id === id ? data : p)))

  const current = get(activePeriod)
  if (current?.id === id) activePeriod.set(data)

  return data
}

export async function deleteBudgetPeriod(id) {
  const { error } = await supabase.from('budget_periods').delete().eq('id', id)
  if (error) throw error

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
  if (!userData?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: userData.user.id,
      name,
      type,
      color: color || '#7c3aed',
      icon: icon || '📦',
      is_system: false,
    })
    .select()
    .single()

  if (error) throw error

  categories.update((cats) => [...cats, data])
  return data
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id).eq('is_system', false) // safety: never delete system categories

  if (error) throw error

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
  if (!userData?.user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userData.user.id,
      budget_period_id,
      category_id,
      amount: Number(amount),
      type,
      description,
      date,
    })
    .select('*, categories(id, name, icon, color, type)')
    .single()

  if (error) throw error

  transactions.update((txs) => [data, ...txs])
  return data
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
  transactions.update((txs) => txs.filter((t) => t.id !== id))
}
