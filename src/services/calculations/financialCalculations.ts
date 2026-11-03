import {
  Transaction,
  Category,
  FinancialSummary,
  CategoryBreakdownItem,
  MonthlyTrendItem,
  DailySpendingItem,
} from '../../types';
import { getMonthKey, formatMonthLabel } from '../../utils/date';

/**
 * Calculates complete financial metrics from an array of transactions.
 * All amount arithmetic is integer-based in paise.
 */
export function calculateFinancialSummary(
  transactions: Transaction[],
  categoriesMap?: Map<string, Category>
): FinancialSummary {
  let totalIncome = 0;
  let totalExpenses = 0;
  let currentMonthIncome = 0;
  let currentMonthExpenses = 0;

  const currentMonthKey = getMonthKey(new Date());

  // Aggregate category totals for expenses
  const categoryExpensesMap = new Map<string, { amount: number; count: number }>();
  // Aggregate monthly trends
  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  for (const tx of transactions) {
    const isCurrentMonth = tx.date.startsWith(currentMonthKey);

    if (tx.type === 'income') {
      totalIncome += tx.amount;
      if (isCurrentMonth) {
        currentMonthIncome += tx.amount;
      }
    } else if (tx.type === 'expense') {
      totalExpenses += tx.amount;
      if (isCurrentMonth) {
        currentMonthExpenses += tx.amount;
      }

      // Category breakdown aggregation
      const existing = categoryExpensesMap.get(tx.category) || { amount: 0, count: 0 };
      existing.amount += tx.amount;
      existing.count += 1;
      categoryExpensesMap.set(tx.category, existing);
    }

    // Monthly aggregation
    const txMonth = tx.date.substring(0, 7); // YYYY-MM
    const monthStats = monthlyMap.get(txMonth) || { income: 0, expenses: 0 };
    if (tx.type === 'income') {
      monthStats.income += tx.amount;
    } else {
      monthStats.expenses += tx.amount;
    }
    monthlyMap.set(txMonth, monthStats);
  }

  // Net Balance = Total Income - Total Expenses
  const netBalance = totalIncome - totalExpenses;

  // Savings Amount = Net Balance
  const savingsAmount = netBalance > 0 ? netBalance : 0;

  // Savings Rate = (Net Balance / Total Income) * 100 if income > 0
  const savingsRate =
    totalIncome > 0 && netBalance > 0
      ? Math.min(100, Math.round((netBalance / totalIncome) * 100))
      : 0;

  // Build category breakdown sorted by amount descending
  const defaultColors = [
    '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B',
    '#EC4899', '#3B82F6', '#EF4444', '#64748B',
  ];

  const categoryBreakdown: CategoryBreakdownItem[] = Array.from(categoryExpensesMap.entries())
    .map(([catName, stats], index) => {
      const catObj =
        categoriesMap?.get(`expense:${catName.toLowerCase()}`) ||
        categoriesMap?.get(catName);
      const color = catObj?.color || defaultColors[index % defaultColors.length];
      const percentage = totalExpenses > 0 ? (stats.amount / totalExpenses) * 100 : 0;

      return {
        category: catName,
        amount: stats.amount,
        percentage: Number(percentage.toFixed(1)),
        color,
        count: stats.count,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Build monthly trends sorted chronologically
  const monthlyTrend: MonthlyTrendItem[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, stats]) => {
      return {
        month: formatMonthLabel(monthKey),
        rawMonth: monthKey,
        income: stats.income,
        expenses: stats.expenses,
        savings: Math.max(0, stats.income - stats.expenses),
      };
    });

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    currentMonthExpenses,
    currentMonthIncome,
    savingsAmount,
    savingsRate,
    transactionCount: transactions.length,
    categoryBreakdown,
    monthlyTrend,
  };
}

/**
 * Calculates daily spending for line or bar charts over a date range.
 */
export function calculateDailySpending(transactions: Transaction[]): DailySpendingItem[] {
  const dailyMap = new Map<string, number>();

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      const current = dailyMap.get(tx.date) || 0;
      dailyMap.set(tx.date, current + tx.amount);
    }
  }

  return Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date,
      amount,
    }));
}

/**
 * Calculates budget status for a given month and category
 */
export function calculateBudgetStatus(
  budgetLimitPaise: number,
  spentPaise: number
): {
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean; // >= 80%
  status: 'normal' | 'warning' | 'danger';
} {
  const remaining = budgetLimitPaise - spentPaise;
  const percentage = budgetLimitPaise > 0 ? (spentPaise / budgetLimitPaise) * 100 : 0;
  const isOverBudget = spentPaise > budgetLimitPaise;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  let status: 'normal' | 'warning' | 'danger' = 'normal';
  if (isOverBudget) {
    status = 'danger';
  } else if (isNearLimit) {
    status = 'warning';
  }

  return {
    spent: spentPaise,
    remaining,
    percentage: Math.min(100, Math.round(percentage)),
    isOverBudget,
    isNearLimit,
    status,
  };
}
