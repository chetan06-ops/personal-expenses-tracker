import React, { useState, useMemo, Suspense, lazy } from 'react';
import { StatCard } from './StatCard';
import { Orbit2DFallback } from '../../three/fallback/Orbit2DFallback';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { IncomeExpenseBarChart } from '../../components/charts/IncomeExpenseBarChart';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FilterPeriod, Transaction } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { useSettings } from '../../hooks/useSettings';
import { useBudgets } from '../../hooks/useBudgets';
import { calculateFinancialSummary, calculateBudgetStatus } from '../../services/calculations/financialCalculations';
import { formatINR, formatSignedINR } from '../../utils/currency';
import { formatDisplayDate, getMonthKey } from '../../utils/date';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Percent,
  Calendar,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
  Receipt,
  Sparkles,
  Tag,
} from 'lucide-react';

// Lazy-load the heavy 3D scene bundle for optimal performance and fast initial load
const FinancialOrbitScene = lazy(
  () => import('../../three/scenes/FinancialOrbitScene').then((m) => ({ default: m.FinancialOrbitScene }))
);

interface DashboardPageProps {
  onOpenAddModal: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToBudgets: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenAddModal,
  onNavigateToTransactions,
  onNavigateToBudgets,
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

  // Financial summary based on filtered transactions
  const summary = useMemo(() => {
    return calculateFinancialSummary(transactions, categoriesMap);
  }, [transactions, categoriesMap]);

  // Overall monthly summary across all transactions to monitor current month budget
  const allMonthlySummary = useMemo(() => {
    return calculateFinancialSummary(allTransactions, categoriesMap);
  }, [allTransactions, categoriesMap]);

  // Overall budget status
  const overallBudget = budgets.find((b) => b.category === 'TOTAL') || {
    limit: settings.monthlyOverallBudget || 2500000,
  };
  const overallBudgetStatus = calculateBudgetStatus(
    overallBudget.limit,
    allMonthlySummary.currentMonthExpenses
  );

  const periods: Array<{ id: FilterPeriod; label: string }> = [
    { id: 'this-week', label: 'This Week' },
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'this-year', label: 'This Year' },
    { id: 'all', label: 'All Time' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Time Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Calendar className="w-4 h-4 text-cyan-400 shrink-0 ml-1.5 mr-1" />
          {periods.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                period === p.id
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1 text-xs"
            />
          </div>
        )}
      </div>

      {/* Empty State Welcome Card for First-Time Users */}
      {allTransactions.length === 0 && (
        <div className="p-6 rounded-2xl glass-card border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900/50 to-blue-950/30 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Welcome to Personal Expenses Tracker</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Your local database is clean and ready. Add your first income or expense to begin tracking cash flows, budgets, and the 3D Financial Orbit.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Button variant="primary" size="sm" onClick={onOpenAddModal} leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add First Transaction
            </Button>
          </div>
        </div>
      )}

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Balance"
          amountPaise={summary.netBalance}
          subtitle={summary.netBalance >= 0 ? 'Surplus / Available' : 'Deficit / Overdrawn'}
          icon={<Wallet className="w-5 h-5 text-cyan-400" />}
          variant={summary.netBalance >= 0 ? 'cyan' : 'rose'}
        />

        <StatCard
          title="Total Inflow (Income)"
          amountPaise={summary.totalIncome}
          subtitle="All credits recorded"
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          variant="emerald"
        />

        <StatCard
          title="Total Outflow (Expenses)"
          amountPaise={summary.totalExpenses}
          subtitle="All debits in period"
          icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
          variant="rose"
        />

        <StatCard
          title="Savings Rate"
          amountPaise={summary.savingsRate}
          isCurrency={false}
          valueSuffix="%"
          subtitle={`Net saved: ${formatINR(summary.savingsAmount)}`}
          icon={<Percent className="w-5 h-5 text-violet-400" />}
          variant="violet"
        />
      </div>

      {/* Monthly Budget Warning / Alert Banner */}
      {overallBudgetStatus.isOverBudget ? (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="text-sm font-bold">Monthly Spending Alert!</p>
              <p className="text-xs text-rose-300">
                You have exceeded your monthly budget of {formatINR(overallBudget.limit)} by{' '}
                {formatINR(Math.abs(overallBudgetStatus.remaining))}.
              </p>
            </div>
          </div>
          <Button variant="danger" size="sm" onClick={onNavigateToBudgets}>
            Review Budget
          </Button>
        </div>
      ) : overallBudgetStatus.isNearLimit ? (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold">Budget Warning (80%+ Consumed)</p>
              <p className="text-xs text-amber-300">
                You have spent {overallBudgetStatus.percentage}% of your monthly limit ({formatINR(allMonthlySummary.currentMonthExpenses)} of {formatINR(overallBudget.limit)}).
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={onNavigateToBudgets}>
            Manage Limits
          </Button>
        </div>
      ) : null}

      {/* 3D Financial Orbit & Category Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3D Financial Orbit Centerpiece */}
        <div className="lg:col-span-7 flex flex-col">
          <Card className="flex-1 flex flex-col p-5">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span>Financial Orbit</span>
                  <Badge variant="cyan" size="sm">Interactive 3D</Badge>
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Live spatial topology of your category expenditures centered on your net capital.
                </p>
              </div>
            </CardHeader>

            <div className="flex-1 mt-2 min-h-[300px]">
              <Suspense
                fallback={
                  <Orbit2DFallback
                    netBalance={summary.netBalance}
                    totalExpenses={summary.totalExpenses}
                    categoryBreakdown={summary.categoryBreakdown}
                  />
                }
              >
                <FinancialOrbitScene
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

        {/* Category Breakdown & Pie Chart */}
        <div className="lg:col-span-5 flex flex-col">
          <Card className="flex-1 flex flex-col p-5">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Category Distribution</CardTitle>
              <Badge variant="slate" size="sm">
                {summary.categoryBreakdown.length} Categories
              </Badge>
            </CardHeader>

            <div className="mt-1">
              <CategoryPieChart
                data={summary.categoryBreakdown}
                totalExpenses={summary.totalExpenses}
              />
            </div>

            {/* Category Progress Bars */}
            <div className="space-y-2.5 mt-3 pt-3 border-t border-white/5 max-h-44 overflow-y-auto pr-1">
              {summary.categoryBreakdown.slice(0, 5).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.category}
                    </span>
                    <span className="font-mono text-slate-300">
                      {formatINR(cat.amount)}{' '}
                      <span className="text-slate-500 font-sans">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Monthly Trends & Cash Flow Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="p-5">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Cash Flow History</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monthly comparison of incoming credits vs outgoing expenditures
                </p>
              </div>
            </CardHeader>
            <div className="mt-2">
              <IncomeExpenseBarChart data={summary.monthlyTrend} />
            </div>
          </Card>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-5">
          <Card className="p-5 flex flex-col h-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-cyan-400 hover:text-cyan-300 p-0 h-auto"
                onClick={onNavigateToTransactions}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View All
              </Button>
            </CardHeader>

            <div className="flex-1 space-y-2 mt-2">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Receipt className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm font-medium text-slate-400">No Transactions Found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Start by recording your first income or expense transaction.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-xs"
                    onClick={onOpenAddModal}
                  >
                    Add Now
                  </Button>
                </div>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => onEditTransaction(tx)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          tx.type === 'income'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                      </div>
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
                        className={`text-xs font-bold font-mono ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatSignedINR(tx.amount, tx.type)}
                      </p>
                      <p className="text-[10px] text-slate-500">{formatDisplayDate(tx.date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
