import React, { useState, useMemo, Suspense } from 'react';
import { StatCard } from './StatCard';
import { Orbit2DFallback } from '../../three/fallback/Orbit2DFallback';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { IncomeExpenseBarChart } from '../../components/charts/IncomeExpenseBarChart';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PeriodFilterBar } from '../../components/ui/PeriodFilterBar';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { FilterPeriod, Transaction } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useSettings } from '../../hooks/useSettings';
import { useBudgets } from '../../hooks/useBudgets';
import {
  calculateFinancialSummary,
  calculateBudgetStatus,
  calculateMonthComparison,
  calculateFinancialInsights,
  calculateSafeDailyAllowance,
} from '../../services/calculations/financialCalculations';
import { formatINR, formatSignedINR } from '../../utils/currency';
import { formatDisplayDate, formatMonthLabel, getMonthKey } from '../../utils/date';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  ArrowRight,
  AlertTriangle,
  Receipt,
  Sparkles,
  PiggyBank,
  BarChart3,
} from 'lucide-react';

const LazyFinancialOrbitScene = React.lazy(() =>
  import('../../three/scenes/FinancialOrbitScene').then((m) => ({
    default: m.FinancialOrbitScene,
  }))
);

interface DashboardPageProps {
  onOpenAddModal: () => void;
  onNavigateToTransactions: (categoryFilter?: string) => void;
  onNavigateToBudgets: () => void;
  onNavigateToReports: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddModal,
  onNavigateToTransactions,
  onNavigateToBudgets,
  onNavigateToReports,
  onEditTransaction,
}) => {
  const [period, setPeriod] = useState<FilterPeriod>('this-month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { transactions, allTransactions } = useTransactions({
    period,
    customStartDate: customStart,
    customEndDate: customEnd,
  });

  const { categoriesMap } = useCategories();
  const { settings } = useSettings();
  const currentMonthKey = getMonthKey();
  const { budgets } = useBudgets(currentMonthKey);

  // Filtered period summary
  const summary = useMemo(
    () => calculateFinancialSummary(transactions, categoriesMap),
    [transactions, categoriesMap]
  );

  // Full history summary for monthly comparison & current-month budget pacing
  const allMonthlySummary = useMemo(
    () => calculateFinancialSummary(allTransactions, categoriesMap),
    [allTransactions, categoriesMap]
  );

  const monthComparison = useMemo(
    () => calculateMonthComparison(allTransactions),
    [allTransactions]
  );

  const incomeTxCount = useMemo(
    () => transactions.filter((t) => t.type === 'income').length,
    [transactions]
  );
  const expenseTxCount = useMemo(
    () => transactions.filter((t) => t.type === 'expense').length,
    [transactions]
  );

  // Current month overall budget
  const overallBudgetRecord = budgets.find((b) => b.category === 'TOTAL');
  const overallBudgetLimit = overallBudgetRecord
    ? overallBudgetRecord.limit
    : settings.monthlyOverallBudget || 2500000;

  const overallBudgetStatus = calculateBudgetStatus(
    overallBudgetLimit,
    allMonthlySummary.currentMonthExpenses
  );

  const safeRunway = useMemo(
    () =>
      calculateSafeDailyAllowance(
        overallBudgetLimit,
        allMonthlySummary.currentMonthExpenses
      ),
    [overallBudgetLimit, allMonthlySummary.currentMonthExpenses]
  );

  // Current month category spending for budget progress preview
  const currentMonthCategorySpend = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of allTransactions) {
      if (tx.type === 'expense' && tx.date.startsWith(currentMonthKey)) {
        map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
      }
    }
    return map;
  }, [allTransactions, currentMonthKey]);

  const categoryBudgets = useMemo(
    () => budgets.filter((b) => b.category !== 'TOTAL'),
    [budgets]
  );

  const insights = useMemo(
    () =>
      calculateFinancialInsights({
        filteredTransactions: transactions,
        allTransactions,
        budgets,
        overallBudgetLimitPaise: overallBudgetLimit,
        categoriesMap,
      }),
    [transactions, allTransactions, budgets, overallBudgetLimit, categoriesMap]
  );

  // Show multi-month history when viewing single-period slices so bar chart always offers context
  const cashFlowChartData =
    period === 'this-month' || period === 'this-week' || period === 'last-month'
      ? allMonthlySummary.monthlyTrend.slice(-6)
      : summary.monthlyTrend;

  const expenseMoMTrend =
    period === 'this-month' && monthComparison.expenseDeltaPct !== null
      ? `${monthComparison.expenseDeltaPct > 0 ? '+' : ''}${monthComparison.expenseDeltaPct}% MoM`
      : undefined;

  const expenseMoMTone =
    monthComparison.expenseDeltaPct === null
      ? 'neutral'
      : monthComparison.expenseDeltaPct > 0
      ? 'negative'
      : 'positive';

  const orbitFallback = (
    <Orbit2DFallback
      netBalance={summary.netBalance}
      totalExpenses={summary.totalExpenses}
      categoryBreakdown={summary.categoryBreakdown}
    />
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Period Selector Bar */}
      <PeriodFilterBar
        period={period}
        onPeriodChange={setPeriod}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        rightSlot={
          <Badge variant="slate" size="sm" dot>
            {transactions.length} tx{transactions.length === 1 ? '' : 's'} in view
          </Badge>
        }
      />

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Net Cash Flow"
          amountPaise={summary.netBalance}
          subtitle={summary.netBalance >= 0 ? 'Period surplus' : 'Period deficit'}
          trend={`${transactions.length} entries`}
          icon={<Wallet className="w-5 h-5" />}
          variant={summary.netBalance >= 0 ? 'cyan' : 'rose'}
        />

        <StatCard
          title="Total Income"
          amountPaise={summary.totalIncome}
          subtitle={`${incomeTxCount} credit${incomeTxCount === 1 ? '' : 's'} recorded`}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="emerald"
        />

        <StatCard
          title="Total Expenses"
          amountPaise={summary.totalExpenses}
          subtitle={`${expenseTxCount} debit${expenseTxCount === 1 ? '' : 's'} in period`}
          trend={expenseMoMTrend}
          trendTone={expenseMoMTone}
          icon={<TrendingDown className="w-5 h-5" />}
          variant="rose"
        />

        <StatCard
          title="Savings Rate"
          amountPaise={summary.savingsRate}
          isCurrency={false}
          valueSuffix="%"
          subtitle={
            summary.savingsAmount > 0
              ? `Saved ${formatINR(summary.savingsAmount)}`
              : 'No net savings in period'
          }
          progressPercent={summary.savingsRate}
          icon={<Percent className="w-5 h-5" />}
          variant="violet"
        />
      </div>

      {/* Proactive Budget Alert Banner */}
      {overallBudgetStatus.isOverBudget ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/35 text-rose-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Monthly Budget Limit Exceeded</p>
              <p className="text-xs text-rose-200/80 mt-0.5 tabular-nums">
                {formatMonthLabel(currentMonthKey)} spending has exceeded your{' '}
                {formatINR(overallBudgetLimit)} cap by{' '}
                {formatINR(Math.abs(overallBudgetStatus.remaining))}.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={onNavigateToBudgets} className="shrink-0">
            Review Budgets
          </Button>
        </div>
      ) : overallBudgetStatus.isNearLimit ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/35 text-amber-100">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Approaching Monthly Budget Cap</p>
              <p className="text-xs text-amber-200/80 mt-0.5 tabular-nums">
                Used {overallBudgetStatus.percentage}% ({formatINR(allMonthlySummary.currentMonthExpenses)} of{' '}
                {formatINR(overallBudgetLimit)}) in {formatMonthLabel(currentMonthKey)}.
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={onNavigateToBudgets} className="shrink-0">
            Manage Limits
          </Button>
        </div>
      ) : null}

      {/* 3D Financial Orbit & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Financial Orbit</span>
                  <Badge variant="cyan" size="sm">
                    {settings.enable3D ? '3D WebGL' : '2D View'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Spatial topology mapping expense categories around your net capital core.
                </CardDescription>
              </div>
            </CardHeader>

            <div className="flex-1 min-h-[310px]">
              <Suspense fallback={orbitFallback}>
                <LazyFinancialOrbitScene
                  netBalance={summary.netBalance}
                  totalExpenses={summary.totalExpenses}
                  categoryBreakdown={summary.categoryBreakdown}
                  enable3D={settings.enable3D}
                  performanceMode={settings.performanceMode}
                />
              </Suspense>
            </div>
          </Card>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Click a category to inspect its transactions</CardDescription>
              </div>
              <Badge variant="slate" size="sm">
                {summary.categoryBreakdown.length} active
              </Badge>
            </CardHeader>

            <CategoryPieChart
              data={summary.categoryBreakdown}
              totalExpenses={summary.totalExpenses}
            />

            {summary.categoryBreakdown.length > 0 && (
              <div className="space-y-2 mt-3 pt-3 border-t border-white/[0.06] max-h-48 overflow-y-auto pr-1">
                {summary.categoryBreakdown.slice(0, 5).map((cat) => {
                  const catObj = categoriesMap.get(cat.category);
                  return (
                    <button
                      type="button"
                      key={cat.category}
                      onClick={() => onNavigateToTransactions(cat.category)}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-800/50 transition group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5 gap-2">
                        <span className="font-medium text-slate-200 flex items-center gap-2 min-w-0">
                          <CategoryIcon
                            name={catObj?.icon}
                            color={cat.color}
                            size="sm"
                            className="w-6 h-6 rounded-md"
                          />
                          <span className="truncate group-hover:text-cyan-300 transition">
                            {cat.category}
                          </span>
                        </span>
                        <span className="font-mono text-slate-200 shrink-0 tabular-nums">
                          {formatINR(cat.amount)}{' '}
                          <span className="text-slate-400 font-sans">({cat.percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/90 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Monthly Overview, Budget Progress & Real-Data Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Monthly Budget & Cash Flow Overview */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-cyan-400" />
                  <span>Monthly Budget Progress</span>
                </CardTitle>
                <CardDescription>{formatMonthLabel(currentMonthKey)} spending caps</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToBudgets}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="text-xs text-cyan-300 hover:text-cyan-200"
              >
                Manage
              </Button>
            </CardHeader>

            {/* Overall Month Progress */}
            <div className="p-3.5 rounded-xl bg-[#090E18] border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  Overall Monthly Cap
                </span>
                <Badge
                  variant={
                    overallBudgetStatus.status === 'danger'
                      ? 'rose'
                      : overallBudgetStatus.status === 'warning'
                      ? 'amber'
                      : 'emerald'
                  }
                  size="sm"
                >
                  {overallBudgetStatus.percentage}% used
                </Badge>
              </div>

              <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    overallBudgetStatus.status === 'danger'
                      ? 'bg-rose-500'
                      : overallBudgetStatus.status === 'warning'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, overallBudgetStatus.percentage)}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-slate-400">
                <span>
                  {formatINR(allMonthlySummary.currentMonthExpenses)} of{' '}
                  {formatINR(overallBudgetLimit)}
                </span>
                <span>
                  {overallBudgetStatus.remaining >= 0
                    ? `${formatINR(safeRunway.safeDailyPaise)}/day (${safeRunway.daysRemaining}d left)`
                    : `Over by ${formatINR(Math.abs(overallBudgetStatus.remaining))}`}
                </span>
              </div>
            </div>

            {/* Top Category Budgets */}
            <div className="mt-4 space-y-3 flex-1">
              {categoryBudgets.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-slate-700/80 text-center">
                  <p className="text-xs text-slate-300 font-medium">No category caps configured</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Set category-level limits in Budgets to track Food, Travel, or Education spend.
                  </p>
                </div>
              ) : (
                categoryBudgets.slice(0, 3).map((b) => {
                  const spent = currentMonthCategorySpend.get(b.category) || 0;
                  const status = calculateBudgetStatus(b.limit, spent);
                  const catObj = categoriesMap.get(b.category);

                  return (
                    <div key={b.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs gap-2">
                        <span className="flex items-center gap-2 font-medium text-slate-200 min-w-0">
                          <CategoryIcon
                            name={catObj?.icon}
                            color={catObj?.color || '#06B6D4'}
                            size="sm"
                            className="w-6 h-6 rounded-md"
                          />
                          <span className="truncate">{b.category}</span>
                        </span>
                        <span className="font-mono text-slate-300 tabular-nums shrink-0">
                          {formatINR(spent)}{' '}
                          <span className="text-slate-500">/ {formatINR(b.limit)}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            status.status === 'danger'
                              ? 'bg-rose-500'
                              : status.status === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-cyan-400'
                          }`}
                          style={{ width: `${Math.min(100, status.percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Actionable Real-Data Financial Insights */}
        <div className="lg:col-span-6">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Financial Insights</span>
                </CardTitle>
                <CardDescription>
                  Live patterns calculated directly from your recorded transactions
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToReports}
                rightIcon={<BarChart3 className="w-3.5 h-3.5" />}
                className="text-xs text-cyan-300 hover:text-cyan-200"
              >
                Full Report
              </Button>
            </CardHeader>

            {insights.length === 0 ? (
              <EmptyState
                compact
                icon={<Sparkles className="w-5 h-5" />}
                title="Insights Unlock With Activity"
                description="Add income or expense entries to generate category shares, spending velocity, and monthly comparisons."
                actionLabel="Add Transaction"
                onAction={onOpenAddModal}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {insights.map((item) => {
                  const badgeVariant =
                    item.tone === 'positive'
                      ? 'emerald'
                      : item.tone === 'warning'
                      ? 'amber'
                      : item.tone === 'danger'
                      ? 'rose'
                      : item.tone === 'info'
                      ? 'cyan'
                      : 'slate';

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-[#090E18] border border-white/[0.06] flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-100">{item.title}</span>
                        {item.metric && (
                          <Badge variant={badgeVariant} size="sm">
                            {item.metric}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.detail}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Cash Flow History & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Income vs. Expenses</CardTitle>
                <CardDescription>
                  {period === 'this-month' || period === 'this-week' || period === 'last-month'
                    ? 'Recent monthly cash flow comparison across recorded months'
                    : 'Monthly inflows vs. outflows in the selected period'}
                </CardDescription>
              </div>
            </CardHeader>
            <IncomeExpenseBarChart data={cashFlowChartData} />
          </Card>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-5">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Click any entry to edit details</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-cyan-300 hover:text-cyan-200"
                onClick={() => onNavigateToTransactions()}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View All
              </Button>
            </CardHeader>

            <div className="flex-1 space-y-2">
              {transactions.length === 0 ? (
                <EmptyState
                  compact
                  icon={<Receipt className="w-5 h-5" />}
                  title="No Transactions in Period"
                  description="Try selecting a broader period or record a new income or expense entry."
                  actionLabel="Add Transaction"
                  onAction={onOpenAddModal}
                />
              ) : (
                transactions.slice(0, 5).map((tx) => {
                  const catObj = categoriesMap.get(tx.category);
                  const isIncome = tx.type === 'income';
                  return (
                    <button
                      type="button"
                      key={tx.id}
                      onClick={() => onEditTransaction(tx)}
                      className="w-full text-left flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#090E18] hover:bg-slate-800/70 border border-white/[0.06] hover:border-cyan-500/25 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CategoryIcon
                          name={catObj?.icon}
                          color={catObj?.color || (isIncome ? '#10B981' : '#F43F5E')}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition">
                            {tx.category}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {tx.description || formatDisplayDate(tx.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-xs font-bold font-mono tabular-nums ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatSignedINR(tx.amount, tx.type)}
                        </p>
                        <p className="text-[10px] text-slate-500 tabular-nums">
                          {formatDisplayDate(tx.date)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
