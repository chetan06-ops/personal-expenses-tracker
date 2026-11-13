import {
  Transaction,
  Category,
  Budget,
  FinancialSummary,
  CategoryBreakdownItem,
  MonthlyTrendItem,
  DailySpendingItem,
} from '../../types';
import { getMonthKey, formatMonthLabel } from '../../utils/date';
import { formatINR } from '../../utils/currency';

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
      const catObj = categoriesMap?.get(catName);
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

export interface MonthComparisonMetrics {
  currentMonthKey: string;
  previousMonthKey: string;
  currentExpenses: number;
  previousExpenses: number;
  currentIncome: number;
  previousIncome: number;
  expenseDeltaPct: number | null;
  incomeDeltaPct: number | null;
}

/**
 * Compares current month income and expenses against the immediately preceding month.
 */
export function calculateMonthComparison(
  transactions: Transaction[],
  referenceDate: Date = new Date()
): MonthComparisonMetrics {
  const currentMonthKey = getMonthKey(referenceDate);
  const prevDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1);
  const previousMonthKey = getMonthKey(prevDate);

  let currentExpenses = 0;
  let previousExpenses = 0;
  let currentIncome = 0;
  let previousIncome = 0;

  for (const tx of transactions) {
    const monthKey = tx.date.substring(0, 7);
    if (monthKey === currentMonthKey) {
      if (tx.type === 'expense') currentExpenses += tx.amount;
      else currentIncome += tx.amount;
    } else if (monthKey === previousMonthKey) {
      if (tx.type === 'expense') previousExpenses += tx.amount;
      else previousIncome += tx.amount;
    }
  }

  const expenseDeltaPct =
    previousExpenses > 0
      ? Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100)
      : null;

  const incomeDeltaPct =
    previousIncome > 0
      ? Math.round(((currentIncome - previousIncome) / previousIncome) * 100)
      : null;

  return {
    currentMonthKey,
    previousMonthKey,
    currentExpenses,
    previousExpenses,
    currentIncome,
    previousIncome,
    expenseDeltaPct,
    incomeDeltaPct,
  };
}

/**
 * Computes remaining days in the reference month and safe daily spend allowance in integer paise.
 */
export function calculateSafeDailyAllowance(
  budgetLimitPaise: number,
  spentPaise: number,
  referenceDate: Date = new Date()
): { daysRemaining: number; safeDailyPaise: number } {
  const daysInMonth = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0
  ).getDate();
  const daysRemaining = Math.max(1, daysInMonth - referenceDate.getDate() + 1);
  const remainingPaise = Math.max(0, budgetLimitPaise - spentPaise);
  return {
    daysRemaining,
    safeDailyPaise: Math.floor(remainingPaise / daysRemaining),
  };
}

export interface FinancialInsight {
  id: string;
  tone: 'positive' | 'warning' | 'danger' | 'neutral' | 'info';
  title: string;
  detail: string;
  metric?: string;
}

/**
 * Generates deterministic, real-data insights from actual transactions and budgets.
 */
export function calculateFinancialInsights(params: {
  filteredTransactions: Transaction[];
  allTransactions: Transaction[];
  budgets: Budget[];
  overallBudgetLimitPaise: number;
  categoriesMap?: Map<string, Category>;
  referenceDate?: Date;
}): FinancialInsight[] {
  const {
    filteredTransactions,
    allTransactions,
    budgets,
    overallBudgetLimitPaise,
    categoriesMap,
    referenceDate = new Date(),
  } = params;

  const insights: FinancialInsight[] = [];
  const summary = calculateFinancialSummary(filteredTransactions, categoriesMap);
  const monthComparison = calculateMonthComparison(allTransactions, referenceDate);

  // 1. Top expense category concentration
  if (summary.categoryBreakdown.length > 0 && summary.totalExpenses > 0) {
    const top = summary.categoryBreakdown[0];
    insights.push({
      id: 'top-category',
      tone: top.percentage >= 50 ? 'warning' : 'info',
      title: `Top Spend: ${top.category}`,
      detail: `${top.category} accounts for ${top.percentage}% of period outflows across ${top.count} transaction${top.count === 1 ? '' : 's'}.`,
      metric: formatINR(top.amount),
    });
  }

  // 2. Average expense per transaction & active spending days
  const expenseTxs = filteredTransactions.filter((t) => t.type === 'expense');
  if (expenseTxs.length > 0) {
    const activeDays = new Set(expenseTxs.map((t) => t.date)).size;
    const avgPerTx = Math.round(summary.totalExpenses / expenseTxs.length);
    const avgPerActiveDay = Math.round(summary.totalExpenses / Math.max(1, activeDays));
    insights.push({
      id: 'spending-pace',
      tone: 'neutral',
      title: 'Spending Velocity',
      detail: `Averaging ${formatINR(avgPerTx)} per expense across ${activeDays} active day${activeDays === 1 ? '' : 's'}.`,
      metric: `${formatINR(avgPerActiveDay)}/day`,
    });
  }

  // 3. Month-over-month spending comparison
  if (monthComparison.expenseDeltaPct !== null) {
    const delta = monthComparison.expenseDeltaPct;
    const absDelta = Math.abs(delta);
    const label = formatMonthLabel(monthComparison.previousMonthKey);
    insights.push({
      id: 'mom-comparison',
      tone: delta > 10 ? 'warning' : delta < 0 ? 'positive' : 'neutral',
      title: 'Month-over-Month Pace',
      detail:
        delta === 0
          ? `This month's spending matches ${label} (${formatINR(monthComparison.previousExpenses)}).`
          : delta > 0
          ? `Current month spending is ${absDelta}% higher than ${label} (${formatINR(monthComparison.previousExpenses)}).`
          : `Current month spending is ${absDelta}% lower than ${label} (${formatINR(monthComparison.previousExpenses)}).`,
      metric: `${delta > 0 ? '+' : ''}${delta}%`,
    });
  }

  // 4. Budget health & safe daily spend for current month
  const currentMonthExpByCat = new Map<string, number>();
  let currentMonthTotalExp = 0;
  for (const tx of allTransactions) {
    if (tx.type === 'expense' && tx.date.startsWith(monthComparison.currentMonthKey)) {
      currentMonthTotalExp += tx.amount;
      currentMonthExpByCat.set(
        tx.category,
        (currentMonthExpByCat.get(tx.category) || 0) + tx.amount
      );
    }
  }

  const categoryBudgets = budgets.filter((b) => b.category !== 'TOTAL');
  if (categoryBudgets.length > 0) {
    let atRisk = 0;
    let exceeded = 0;
    for (const b of categoryBudgets) {
      const status = calculateBudgetStatus(b.limit, currentMonthExpByCat.get(b.category) || 0);
      if (status.isOverBudget) exceeded++;
      else if (status.isNearLimit) atRisk++;
    }

    insights.push({
      id: 'budget-compliance',
      tone: exceeded > 0 ? 'danger' : atRisk > 0 ? 'warning' : 'positive',
      title: 'Category Caps Health',
      detail:
        exceeded > 0
          ? `${exceeded} category budget${exceeded === 1 ? '' : 's'} exceeded and ${atRisk} approaching limit.`
          : atRisk > 0
          ? `${atRisk} category budget${atRisk === 1 ? '' : 's'} above 80% threshold.`
          : `All ${categoryBudgets.length} configured category budgets are within safe limits.`,
      metric: `${categoryBudgets.length - exceeded - atRisk}/${categoryBudgets.length} OK`,
    });
  } else if (overallBudgetLimitPaise > 0) {
    const { daysRemaining, safeDailyPaise } = calculateSafeDailyAllowance(
      overallBudgetLimitPaise,
      currentMonthTotalExp,
      referenceDate
    );
    insights.push({
      id: 'daily-allowance',
      tone: currentMonthTotalExp > overallBudgetLimitPaise ? 'danger' : 'positive',
      title: 'Safe Daily Runway',
      detail: `Based on your monthly cap with ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining this month.`,
      metric: `${formatINR(safeDailyPaise)}/day`,
    });
  }

  return insights;
}
