import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { BudgetModal } from '../../components/forms/BudgetModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Budget } from '../../types';
import { useBudgets } from '../../hooks/useBudgets';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import {
  calculateBudgetStatus,
  calculateSafeDailyAllowance,
} from '../../services/calculations/financialCalculations';
import { formatINR } from '../../utils/currency';
import { getMonthKey, formatMonthLabel } from '../../utils/date';
import {
  PiggyBank,
  Plus,
  Trash2,
  Edit2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map((v) => parseInt(v, 10));
  const date = new Date(y, m - 1 + delta, 1);
  return getMonthKey(date);
}

export const BudgetsPage: React.FC = () => {
  const currentMonthKey = getMonthKey();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const { budgets, setBudget, deleteBudget } = useBudgets(selectedMonth);
  const { allTransactions } = useTransactions();
  const { categoriesMap } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [presetCategory, setPresetCategory] = useState<string | undefined>(undefined);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const monthTransactions = useMemo(
    () =>
      allTransactions.filter(
        (tx) => tx.type === 'expense' && tx.date.startsWith(selectedMonth)
      ),
    [allTransactions, selectedMonth]
  );

  const totalMonthExpense = useMemo(
    () => monthTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    [monthTransactions]
  );

  const categoryExpenseMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of monthTransactions) {
      map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
    }
    return map;
  }, [monthTransactions]);

  const totalBudget = budgets.find((b) => b.category === 'TOTAL');
  const totalBudgetStatus = totalBudget
    ? calculateBudgetStatus(totalBudget.limit, totalMonthExpense)
    : null;

  const categoryBudgets = budgets.filter((b) => b.category !== 'TOTAL');
  const totalCategoryAllocated = useMemo(
    () => categoryBudgets.reduce((sum, b) => sum + b.limit, 0),
    [categoryBudgets]
  );

  const budgetsAtRiskCount = useMemo(() => {
    return categoryBudgets.filter((b) => {
      const status = calculateBudgetStatus(b.limit, categoryExpenseMap.get(b.category) || 0);
      return status.isOverBudget || status.isNearLimit;
    }).length;
  }, [categoryBudgets, categoryExpenseMap]);

  // Categories that had spending in selectedMonth without a configured budget cap
  const unbudgetedCategories = useMemo(() => {
    const budgetedNames = new Set(categoryBudgets.map((b) => b.category));
    return Array.from(categoryExpenseMap.entries())
      .filter(([cat]) => !budgetedNames.has(cat))
      .sort((a, b) => b[1] - a[1]);
  }, [categoryExpenseMap, categoryBudgets]);

  const safeRunway = useMemo(() => {
    if (!totalBudget || selectedMonth !== currentMonthKey) return null;
    return calculateSafeDailyAllowance(totalBudget.limit, totalMonthExpense);
  }, [totalBudget, selectedMonth, currentMonthKey, totalMonthExpense]);

  const handleEdit = (b: Budget) => {
    setPresetCategory(undefined);
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleAdd = (categoryPreset?: string) => {
    setEditingBudget(null);
    setPresetCategory(categoryPreset);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    await deleteBudget(budgetToDelete.id);
    setBudgetToDelete(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Month Navigator & Add Action */}
      <Card className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="text-xs text-slate-400">
              Monthly spending caps and real-time threshold tracking
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-[#090E18] border border-slate-700/80 rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
              aria-label="Previous month"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="month"
              aria-label="Select budget month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) setSelectedMonth(e.target.value);
              }}
              className="bg-transparent px-2 py-1 text-xs text-slate-100 font-medium focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
              aria-label="Next month"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {selectedMonth !== currentMonthKey && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMonth(currentMonthKey)}
            >
              Current Month
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => handleAdd()}
          >
            Set Budget
          </Button>
        </div>
      </Card>

      {/* Monthly Budget KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Overall Monthly Cap
          </p>
          <p className="text-lg font-bold font-mono text-white tabular-nums mt-1">
            {totalBudget ? formatINR(totalBudget.limit) : 'Not Set'}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Month Total Spend
          </p>
          <p className="text-lg font-bold font-mono text-rose-400 tabular-nums mt-1">
            {formatINR(totalMonthExpense)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Category Caps Sum
          </p>
          <p className="text-lg font-bold font-mono text-cyan-300 tabular-nums mt-1">
            {formatINR(totalCategoryAllocated)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Caps At Risk
          </p>
          <p
            className={`text-lg font-bold font-mono tabular-nums mt-1 ${
              budgetsAtRiskCount > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {budgetsAtRiskCount} / {categoryBudgets.length}
          </p>
        </Card>
      </div>

      {/* Overall Total Monthly Spending Card */}
      {totalBudget && totalBudgetStatus ? (
        <Card className="p-5 border border-cyan-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-white">Overall Monthly Limit</span>
                <Badge
                  variant={
                    totalBudgetStatus.status === 'danger'
                      ? 'rose'
                      : totalBudgetStatus.status === 'warning'
                      ? 'amber'
                      : 'emerald'
                  }
                  size="sm"
                  dot
                >
                  {totalBudgetStatus.status === 'danger'
                    ? 'Over Budget'
                    : totalBudgetStatus.status === 'warning'
                    ? 'Near Limit (80%+)'
                    : 'On Track'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Target cap across all expense categories in {formatMonthLabel(selectedMonth)}.
              </p>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4">
              <div className="md:text-right">
                <p className="text-[11px] text-slate-400">Spent / Limit</p>
                <p className="text-sm font-mono font-bold text-white tabular-nums">
                  {formatINR(totalBudgetStatus.spent)} / {formatINR(totalBudget.limit)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleEdit(totalBudget)}
                  aria-label="Edit Total Monthly Budget"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                  title="Edit Total Budget"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setBudgetToDelete(totalBudget)}
                  aria-label="Remove Total Monthly Budget"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Remove Total Budget"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-[#090E18] rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalBudgetStatus.status === 'danger'
                    ? 'bg-rose-500'
                    : totalBudgetStatus.status === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, totalBudgetStatus.percentage)}%` }}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 tabular-nums">
              <span>{totalBudgetStatus.percentage}% consumed</span>
              <span>
                {totalBudgetStatus.remaining >= 0
                  ? `${formatINR(totalBudgetStatus.remaining)} remaining`
                  : `${formatINR(Math.abs(totalBudgetStatus.remaining))} exceeded`}
                {safeRunway && totalBudgetStatus.remaining >= 0 && (
                  <span className="text-cyan-300 ml-2">
                    ({formatINR(safeRunway.safeDailyPaise)}/day for {safeRunway.daysRemaining}d)
                  </span>
                )}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 border border-dashed border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-200">
              No Overall Monthly Budget Set for {formatMonthLabel(selectedMonth)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Set an overall monthly limit to track remaining daily runway and proactive alerts.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAdd('TOTAL')}
            className="shrink-0"
          >
            Set Overall Cap
          </Button>
        </Card>
      )}

      {/* Category Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Category Spending Caps</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {categoryBudgets.length} configured
          </span>
        </div>

        {categoryBudgets.length === 0 ? (
          <Card>
            <EmptyState
              icon={<PiggyBank className="w-5 h-5" />}
              title="No Category Budgets Configured"
              description="Define spending caps for individual categories such as Food, Travel, or Education to prevent overspending."
              actionLabel="Create Category Budget"
              onAction={() => handleAdd()}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => {
              const spent = categoryExpenseMap.get(b.category) || 0;
              const status = calculateBudgetStatus(b.limit, spent);
              const cat = categoriesMap.get(b.category);

              return (
                <Card key={b.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CategoryIcon
                        name={cat?.icon}
                        color={cat?.color || '#06B6D4'}
                        size="md"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">{b.category}</h4>
                        <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                          Cap: {formatINR(b.limit)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(b)}
                        aria-label={`Edit ${b.category} budget`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBudgetToDelete(b)}
                        aria-label={`Delete ${b.category} budget`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-[#090E18] rounded-full h-2 overflow-hidden border border-slate-800">
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
                    <div className="flex items-center justify-between text-[11px] font-mono tabular-nums">
                      <span
                        className={
                          status.status === 'danger'
                            ? 'text-rose-400 font-semibold'
                            : 'text-slate-300'
                        }
                      >
                        {status.percentage}% ({formatINR(spent)})
                      </span>
                      <span className="text-slate-400">
                        {status.remaining >= 0
                          ? `${formatINR(status.remaining)} left`
                          : `-${formatINR(Math.abs(status.remaining))}`}
                      </span>
                    </div>
                  </div>

                  {/* Status Footer */}
                  <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Status</span>
                    <Badge
                      variant={
                        status.status === 'danger'
                          ? 'rose'
                          : status.status === 'warning'
                          ? 'amber'
                          : 'emerald'
                      }
                      size="sm"
                      dot
                    >
                      {status.status === 'danger'
                        ? 'Over Limit'
                        : status.status === 'warning'
                        ? 'Near Limit'
                        : 'On Track'}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Unbudgeted Active Categories Helper */}
      {unbudgetedCategories.length > 0 && (
        <Card className="p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Unbudgeted Spending This Month</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Categories with recorded spending in {formatMonthLabel(selectedMonth)} without a cap yet.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {unbudgetedCategories.map(([catName, spentPaise]) => {
              const cat = categoriesMap.get(catName);
              return (
                <div
                  key={catName}
                  className="p-3 rounded-xl bg-[#090E18] border border-white/[0.06] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CategoryIcon
                      name={cat?.icon}
                      color={cat?.color || '#64748B'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{catName}</p>
                      <p className="text-[11px] font-mono text-slate-400 tabular-nums">
                        Spent {formatINR(spentPaise)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdd(catName)}
                    className="text-[11px] h-7 px-2.5"
                  >
                    Set Cap
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Budget Create/Edit Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await setBudget(data);
        }}
        initialData={editingBudget}
        defaultMonth={selectedMonth}
        initialCategory={presetCategory}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Budget"
        message={`Are you sure you want to delete the budget limit for "${
          budgetToDelete?.category === 'TOTAL'
            ? 'Overall Monthly Limit'
            : budgetToDelete?.category
        }"?`}
        confirmText="Remove"
      />
    </div>
  );
};
