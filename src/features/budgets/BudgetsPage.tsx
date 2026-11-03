import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BudgetModal } from '../../components/forms/BudgetModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Budget } from '../../types';
import { useBudgets } from '../../hooks/useBudgets';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { calculateBudgetStatus } from '../../services/calculations/financialCalculations';
import { formatINR } from '../../utils/currency';
import { getMonthKey, formatMonthLabel } from '../../utils/date';
import {
  PiggyBank,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Calendar,
  Layers,
} from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonthKey());
  const { budgets, setBudget, deleteBudget } = useBudgets(selectedMonth);
  const { allTransactions } = useTransactions();
  const { expenseCategories, categoriesMap } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  // Filter transactions for the selected month
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(
      (tx) => tx.type === 'expense' && tx.date.startsWith(selectedMonth)
    );
  }, [allTransactions, selectedMonth]);

  // Total expenses in the selected month
  const totalMonthExpense = useMemo(() => {
    return monthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  // Category expense map in paise
  const categoryExpenseMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of monthTransactions) {
      const cur = map.get(tx.category) || 0;
      map.set(tx.category, cur + tx.amount);
    }
    return map;
  }, [monthTransactions]);

  // Overall budget if configured
  const totalBudget = budgets.find((b) => b.category === 'TOTAL');
  const totalBudgetStatus = totalBudget
    ? calculateBudgetStatus(totalBudget.limit, totalMonthExpense)
    : null;

  // Category-specific budgets
  const categoryBudgets = budgets.filter((b) => b.category !== 'TOTAL');

  const handleEdit = (b: Budget) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!budgetToDelete) return;
    await deleteBudget(budgetToDelete.id);
    setBudgetToDelete(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card: Month selector and Add Button */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <PiggyBank className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{formatMonthLabel(selectedMonth)}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Monthly spending targets and category expenditure caps
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleAdd}
          >
            Set Budget
          </Button>
        </div>
      </Card>

      {/* Overall Total Monthly Spending Card */}
      {totalBudget && totalBudgetStatus ? (
        <Card className="p-5 border border-cyan-500/20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
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
                >
                  {totalBudgetStatus.status === 'danger'
                    ? 'Over Budget'
                    : totalBudgetStatus.status === 'warning'
                    ? 'Near Limit'
                    : 'On Track'}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target cap across all expense categories for this month.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-slate-400">Spent / Limit</p>
                <p className="text-sm font-mono font-bold text-white">
                  {formatINR(totalBudgetStatus.spent)} / {formatINR(totalBudget.limit)}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(totalBudget)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                  title="Edit Total Budget"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setBudgetToDelete(totalBudget)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  title="Remove Total Budget"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  totalBudgetStatus.status === 'danger'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                    : totalBudgetStatus.status === 'warning'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                    : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, totalBudgetStatus.percentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{totalBudgetStatus.percentage}% used</span>
              <span>
                {totalBudgetStatus.remaining >= 0
                  ? `${formatINR(totalBudgetStatus.remaining)} remaining`
                  : `${formatINR(Math.abs(totalBudgetStatus.remaining))} exceeded`}
              </span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 border border-dashed border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-300">No Overall Monthly Budget Set</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Set a monthly limit to monitor overall expenses and receive proactive alerts.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          >
            Set Limit
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
          <span className="text-xs text-slate-500">
            {categoryBudgets.length} configured
          </span>
        </div>

        {categoryBudgets.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center">
            <PiggyBank className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No Category Budgets Yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Define spending limits for individual categories such as Food, Travel, or Education to keep expenses under control.
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={handleAdd}>
              Create Category Budget
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBudgets.map((b) => {
              const spent = categoryExpenseMap.get(b.category) || 0;
              const status = calculateBudgetStatus(b.limit, spent);
              const cat = categoriesMap.get(b.category);

              return (
                <Card key={b.id} className="p-4 border border-white/5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: cat?.color || '#06B6D4' }}
                        />
                        <h4 className="text-sm font-bold text-white">{b.category}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Budget Limit: {formatINR(b.limit)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(b)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setBudgetToDelete(b)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
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
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span
                        className={
                          status.status === 'danger'
                            ? 'text-rose-400 font-bold'
                            : 'text-slate-400'
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

                  {/* Status Tag */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
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
                    >
                      {status.status === 'danger'
                        ? 'Over Limit'
                        : status.status === 'warning'
                        ? 'Approaching (80%+)'
                        : 'Safe'}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Create/Edit Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await setBudget(data);
        }}
        initialData={editingBudget}
        defaultMonth={selectedMonth}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Budget"
        message={`Are you sure you want to delete the budget limit for "${
          budgetToDelete?.category === 'TOTAL' ? 'Total Monthly Expenses' : budgetToDelete?.category
        }"?`}
        confirmText="Remove"
      />
    </div>
  );
};
