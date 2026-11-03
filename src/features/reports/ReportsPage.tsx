import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { IncomeExpenseBarChart } from '../../components/charts/IncomeExpenseBarChart';
import { TrendAreaChart } from '../../components/charts/TrendAreaChart';
import { FilterPeriod } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import {
  calculateFinancialSummary,
  calculateDailySpending,
} from '../../services/calculations/financialCalculations';
import { formatINR, formatSignedINR } from '../../utils/currency';
import { generateTransactionsCsv, downloadCsvFile } from '../../services/export/csvExport';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingDown,
  TrendingUp,
  Award,
  Layers,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<FilterPeriod>('this-month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const { transactions, allTransactions } = useTransactions({
    period,
    customStartDate: customStart,
    customEndDate: customEnd,
  });

  const { categoriesMap } = useCategories();

  const summary = useMemo(() => {
    return calculateFinancialSummary(transactions, categoriesMap);
  }, [transactions, categoriesMap]);

  const dailySpending = useMemo(() => {
    return calculateDailySpending(transactions);
  }, [transactions]);

  const allSummary = useMemo(() => {
    return calculateFinancialSummary(allTransactions, categoriesMap);
  }, [allTransactions, categoriesMap]);

  const periods: Array<{ id: FilterPeriod; label: string }> = [
    { id: 'this-week', label: 'Weekly' },
    { id: 'this-month', label: 'Monthly' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'this-year', label: 'Yearly' },
    { id: 'all', label: 'All Time' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const handleExportReport = () => {
    const csv = generateTransactionsCsv(transactions);
    downloadCsvFile(csv, `financial-report-${period}.csv`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Filter and Export Bar */}
      <Card className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <span>Financial Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Comprehensive cash flow distributions and categorical trend models
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  period === p.id
                    ? 'bg-cyan-500 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleExportReport}
          >
            Export Report CSV
          </Button>
        </div>
      </Card>

      {/* High-level Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border border-emerald-500/20">
          <p className="text-xs text-slate-400">Total Inflow (Period)</p>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {formatINR(summary.totalIncome)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">From all income streams</p>
        </Card>

        <Card className="p-4 border border-rose-500/20">
          <p className="text-xs text-slate-400">Total Outflow (Period)</p>
          <p className="text-xl font-bold font-mono text-rose-400 mt-1">
            {formatINR(summary.totalExpenses)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Total expenditures incurred</p>
        </Card>

        <Card className="p-4 border border-cyan-500/20">
          <p className="text-xs text-slate-400">Net Surplus / Savings</p>
          <p
            className={`text-xl font-bold font-mono mt-1 ${
              summary.netBalance >= 0 ? 'text-cyan-400' : 'text-rose-400'
            }`}
          >
            {formatINR(summary.netBalance)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Savings rate: {summary.savingsRate}%
          </p>
        </Card>
      </div>

      {/* Daily Spending Trend Chart */}
      <Card className="p-5">
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Daily Expense Velocity</CardTitle>
            <p className="text-xs text-slate-400 mt-0.5">
              Day-by-day expenditure pattern across the selected reporting period
            </p>
          </div>
          <Badge variant="cyan" size="sm">
            {dailySpending.length} Days Active
          </Badge>
        </CardHeader>

        <div className="mt-3">
          <TrendAreaChart data={dailySpending} />
        </div>
      </Card>

      {/* Monthly Comparative Trends & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <Card className="p-5 h-full">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Income vs. Expense Progression</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-month cash flow balance and expenditure trajectories
                </p>
              </div>
            </CardHeader>
            <div className="mt-2">
              <IncomeExpenseBarChart data={allSummary.monthlyTrend} />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="p-5 h-full flex flex-col justify-between">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Category Breakdown</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proportional share of total expenditures
                </p>
              </div>
            </CardHeader>
            <div className="mt-2 flex-1">
              <CategoryPieChart
                data={summary.categoryBreakdown}
                totalExpenses={summary.totalExpenses}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Highest Spending Categories Ranking Table */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Expense Category Ranking</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Sorted by total spending
          </span>
        </div>

        {summary.categoryBreakdown.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No expense records found for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono text-[10px] uppercase border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Transaction Count</th>
                  <th className="py-3 px-4 text-right">Total Amount (INR)</th>
                  <th className="py-3 px-4 text-right">Spending Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summary.categoryBreakdown.map((item, idx) => (
                  <tr key={item.category} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-500 font-bold">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.category}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {item.count} transaction{item.count !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {formatINR(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-400">
                      {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
