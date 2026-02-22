import { derived } from 'svelte/store'
import { transactions, categories, budgetPeriods, activePeriod } from '$lib/stores/budget.js'

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

// ─── Savings data across all periods ─────────────────────────────────────────
// Shows: budget, totalSpent, netSavings, AND explicit savings category deposits
export const savingsData = derived(
  [transactions, budgetPeriods, categories],
  ([$transactions, $budgetPeriods, $categories]) => {
    // Find ALL categories whose name contains "saving" (case-insensitive)
    // This catches "Savings", "savings", "Saving", user custom variants, etc.
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

        // Sum all transactions in any savings-named category
        const savedToSavingsCategory = periodTxs
          .filter((t) => t.type === 'expense' && savingsCategoryIds.has(t.category_id))
          .reduce((sum, t) => sum + Number(t.amount), 0)

        const budget = Number(period.total_budget)
        const netSavings = budget + totalIncome - totalSpent
        const savingsRate =
          budget + totalIncome > 0 ? (netSavings / (budget + totalIncome)) * 100 : 0

        return {
          periodId: period.id,
          periodName: period.name,
          budget,
          totalSpent,
          totalIncome,
          netSavings,
          savingsRate,
          savedToSavingsCategory, // explicit savings category deposits
          hasSavingsCategory: savingsCategoryIds.size > 0,
        }
      })
  }
)

// ─── Period comparison: last N periods ────────────────────────────────────────
export const periodComparison = derived(
  [transactions, budgetPeriods],
  ([$transactions, $budgetPeriods]) => {
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
        const remaining = budget + totalIncome - totalSpent
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
