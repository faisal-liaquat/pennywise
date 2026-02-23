import { derived } from 'svelte/store'
import { transactions, categories, budgetPeriods, activePeriod } from '$lib/stores/budget.js'
import { incomeInBudget } from '$lib/stores/incomeToggle.js'

// ─── Helper: spending by category for a specific period ───────────────────────
export function getSpendingByCategory(txs, periodId) {
  const spending = {}
  txs.forEach((t) => {
    if (t.budget_period_id === periodId && t.type === 'expense') {
      spending[t.category_id] = (spending[t.category_id] || 0) + Number(t.amount)
    }
  })
  return spending
}

// ─── Full category breakdown for active period (pie chart) ────────────────────
export const activeCategoryBreakdown = derived(
  [transactions, activePeriod, categories],
  ([$transactions, $activePeriod, $categories]) => {
    if (!$activePeriod || !$categories.length) return []
    const spending = getSpendingByCategory($transactions, $activePeriod.id)
    const total = Object.values(spending).reduce((a, b) => a + b, 0)
    return $categories
      .filter((c) => c.type === 'expense' && spending[c.id])
      .map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '💰',
        color: c.color || '#7c3aed',
        amount: spending[c.id],
        percentage: total > 0 ? (spending[c.id] / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }
)

// ─── Budget vs Actual per category for active period ─────────────────────────
export const budgetVsActual = derived(
  [transactions, activePeriod, categories],
  ([$transactions, $activePeriod, $categories]) => {
    if (!$activePeriod || !$categories.length) return []

    const spending = getSpendingByCategory($transactions, $activePeriod.id)
    const totalBudget = Number($activePeriod.total_budget)
    const expenseCategories = $categories.filter((c) => c.type === 'expense' && spending[c.id])
    const totalActual = Object.values(spending).reduce((a, b) => a + b, 1)

    return expenseCategories
      .map((c) => ({
        id: c.id,
        name: c.name,
        icon: c.icon || '💰',
        color: c.color || '#7c3aed',
        actual: spending[c.id] || 0,
        budgetShare: totalBudget * ((spending[c.id] || 0) / totalActual),
      }))
      .sort((a, b) => b.actual - a.actual)
      .slice(0, 8)
  }
)

// ─── Savings data across all periods — respects income toggle ─────────────────
export const savingsData = derived(
  [transactions, budgetPeriods, categories, incomeInBudget],
  ([$transactions, $budgetPeriods, $categories, $incomeInBudget]) => {
    const savingsCategories = $categories.filter((c) => c.name?.toLowerCase().includes('saving'))
    const savingsCategoryIds = new Set(savingsCategories.map((c) => c.id))

    return $budgetPeriods
      .slice(0, 6)
      .reverse()
      .map((period) => {
        const periodTxs = $transactions.filter((t) => t.budget_period_id === period.id)

        const totalSpent = periodTxs
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalIncome = periodTxs
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const savedToSavingsCategory = periodTxs
          .filter((t) => t.type === 'expense' && savingsCategoryIds.has(t.category_id))
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const budget = Number(period.total_budget)
        // Respect the toggle: only add income to net savings calc if toggle is ON
        const incomeBoost = $incomeInBudget ? totalIncome : 0
        const netSavings = budget + incomeBoost - totalSpent
        const savingsRate =
          budget + incomeBoost > 0 ? (netSavings / (budget + incomeBoost)) * 100 : 0

        return {
          periodId: period.id,
          periodName: period.name,
          budget,
          totalSpent,
          totalIncome,
          netSavings,
          savingsRate,
          savedToSavingsCategory,
          hasSavingsCategory: savingsCategoryIds.size > 0,
        }
      })
  }
)

// ─── Period comparison: last N periods — respects income toggle ───────────────
export const periodComparison = derived(
  [transactions, budgetPeriods, incomeInBudget],
  ([$transactions, $budgetPeriods, $incomeInBudget]) => {
    return $budgetPeriods
      .slice(0, 5)
      .reverse()
      .map((period) => {
        const periodTxs = $transactions.filter((t) => t.budget_period_id === period.id)

        const totalSpent = periodTxs
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalIncome = periodTxs
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const budget = Number(period.total_budget)
        const incomeBoost = $incomeInBudget ? totalIncome : 0
        const remaining = budget + incomeBoost - totalSpent
        const utilizationPct = budget > 0 ? Math.min(120, (totalSpent / budget) * 100) : 0

        return {
          periodId: period.id,
          name: period.name,
          budget,
          totalSpent,
          totalIncome,
          remaining,
          utilizationPct,
        }
      })
  }
)

// ─── Spending trend: daily cumulative for active period ───────────────────────
export const spendingTrend = derived(
  [transactions, activePeriod],
  ([$transactions, $activePeriod]) => {
    if (!$activePeriod) return []

    const periodTxs = $transactions.filter(
      (t) => t.budget_period_id === $activePeriod.id && t.type === 'expense'
    )

    if (!periodTxs.length) return []

    const dailyMap = {}
    periodTxs.forEach((t) => {
      dailyMap[t.date] = (dailyMap[t.date] || 0) + Number(t.amount)
    })

    const sorted = Object.entries(dailyMap).sort(([a], [b]) => new Date(a) - new Date(b))

    let cumulative = 0
    return sorted.map(([date, amount]) => {
      cumulative += amount
      return { date, amount, cumulative }
    })
  }
)
