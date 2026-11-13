import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { PeriodFilterBar } from '../../components/ui/PeriodFilterBar';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { IncomeExpenseBarChart } from '../../components/charts/IncomeExpenseBarChart';
import { TrendAreaChart } from '../../components/charts/TrendAreaChart';
import { FilterPeriod } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { showToast } from '../../hooks/useToast';
import {
  calculateFinancialSummary,
  calculateDailySpending,
} from '../../services/calculations/financialCalculations';
import { formatINR } from '../../utils/currency';
import { generateTransactionsCsv, downloadCsvFile } from '../../services/export/csvExport';
import { Download, Award, BarChart3 } from 'lucide-react';

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

  const summary = useMemo(
    () => calculateFinancialSummary(transactions, categoriesMap),
    [transactions, categoriesMap]
  );

  const dailySpending = useMemo(
    () => calculateDailySpending(transactions),
    [transactions]
  );

  const allSummary = useMemo(
    () => calculateFinancialSummary(allTransactions, categoriesMap),
    [allTransactions, categoriesMap]
  );

  const avgDailyOutflowPaise = useMemo(() => {
    if (dailySpending.length === 0 || summary.totalExpenses === 0) return 0;
    return Math.round(summary.totalExpenses / dailySpending.length);
  }, [dailySpending.length, summary.totalExpenses]);

  const handleExportReport = () => {
    if (transactions.length === 0) {
      showToast({
        type: 'info',
        title: 'No Records to Export',
        description: 'No transactions exist in the selected reporting period.',
      });
      return;
    }
    const csv = generateTransactionsCsv(transactions);
    downloadCsvFile(csv, `financial-report-${period}.csv`);
    showToast({
      type: 'success',
      title: 'Report Exported',
      description: `Exported ${transactions.length} record(s) to CSV.`,
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Period Selector & CSV Export */}
      <PeriodFilterBar
        period={period}
        onPeriodChange={setPeriod}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        rightSlot={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportReport}
          >
            Export Report CSV
          </Button>
        }
      />

      {/* High-level Summary Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Period Inflow
          </p>
          <p className="text-lg sm:text-xl font-bold font-mono text-emerald-400 tabular-nums mt-1.5">
            {formatINR(summary.totalIncome)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">All recorded credits</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Period Outflow
          </p>
          <p className="text-lg sm:text-xl font-bold font-mono text-rose-400 tabular-nums mt-1.5">
            {formatINR(summary.totalExpenses)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Total expenses incurred</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Net Cash Flow
          </p>
          <p
            className={`text-lg sm:text-xl font-bold font-mono tabular-nums mt-1.5 ${
              summary.netBalance >= 0 ? 'text-cyan-300' : 'text-rose-400'
            }`}
          >
            {formatINR(summary.netBalance)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
            Savings rate: {summary.savingsRate}%
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Avg / Active Day
          </p>
          <p className="text-lg sm:text-xl font-bold font-mono text-white tabular-nums mt-1.5">
            {formatINR(avgDailyOutflowPaise)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
            Across {dailySpending.length} active day{dailySpending.length === 1 ? '' : 's'}
          </p>
        </Card>
      </div>

      {/* Daily Spending Trend Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Daily Expense Velocity</CardTitle>
            <CardDescription>
              Day-by-day spending trajectory across the selected reporting period
            </CardDescription>
          </div>
          <Badge variant="cyan" size="sm">
            {dailySpending.length} Active Day{dailySpending.length === 1 ? '' : 's'}
          </Badge>
        </CardHeader>

        <TrendAreaChart data={dailySpending} />
      </Card>

      {/* Monthly Comparative Trends & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader>
              <div>
                <CardTitle>Income vs. Expense Progression</CardTitle>
                <CardDescription>
                  Multi-month cash flow balance and expenditure history
                </CardDescription>
              </div>
            </CardHeader>
            <IncomeExpenseBarChart data={allSummary.monthlyTrend} />
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle>Category Share</CardTitle>
                <CardDescription>
                  Proportional breakdown for the selected period
                </CardDescription>
              </div>
            </CardHeader>
            <div className="flex-1 flex items-center justify-center">
              <CategoryPieChart
                data={summary.categoryBreakdown}
                totalExpenses={summary.totalExpenses}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Highest Spending Categories Ranking */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Expense Category Ranking</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Sorted by total spend
          </span>
        </div>

        {summary.categoryBreakdown.length === 0 ? (
          <EmptyState
            compact
            icon={<BarChart3 className="w-5 h-5" />}
            title="No Category Expenses in Period"
            description="Select another reporting period or record expense transactions to view category rankings."
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090E18] text-slate-400 font-mono text-[10px] uppercase border-b border-white/[0.06]">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Entries</th>
                    <th className="py-3 px-4 w-48">Distribution</th>
                    <th className="py-3 px-4 text-right">Amount (INR)</th>
                    <th className="py-3 px-4 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {summary.categoryBreakdown.map((item, idx) => {
                    const cat = categoriesMap.get(item.category);
                    return (
                      <tr key={item.category} className="hover:bg-slate-800/35 transition">
                        <td className="py-3 px-4 font-mono text-slate-500 font-bold tabular-nums">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-100">
                          <div className="flex items-center gap-2.5">
                            <CategoryIcon name={cat?.icon} color={item.color} size="sm" />
                            <span>{item.category}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono tabular-nums">
                          {item.count} tx{item.count === 1 ? '' : 's'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400 tabular-nums">
                          {formatINR(item.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-cyan-300 tabular-nums">
                          {item.percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Ranking List */}
            <div className="sm:hidden divide-y divide-white/[0.05]">
              {summary.categoryBreakdown.map((item, idx) => {
                const cat = categoriesMap.get(item.category);
                return (
                  <div key={item.category} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono text-slate-500 font-bold">
                          #{idx + 1}
                        </span>
                        <CategoryIcon name={cat?.icon} color={item.color} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-100 truncate">
                            {item.category}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.count} tx{item.count === 1 ? '' : 's'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold font-mono text-rose-400 tabular-nums">
                          {formatINR(item.amount)}
                        </p>
                        <p className="text-[11px] font-mono text-cyan-300 tabular-nums">
                          {item.percentage}%
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
