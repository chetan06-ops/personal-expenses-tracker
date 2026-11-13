import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { Transaction, FilterPeriod } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { formatINR, formatSignedINR } from '../../utils/currency';
import { formatDisplayDate, formatIndianDate } from '../../utils/date';
import { generateTransactionsCsv, downloadCsvFile } from '../../services/export/csvExport';
import { calculateFinancialSummary } from '../../services/calculations/financialCalculations';
import { showToast } from '../../hooks/useToast';
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit2,
  Receipt,
  RotateCcw,
} from 'lucide-react';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  initialCategoryFilter?: string;
  onClearCategoryPreset?: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onEditTransaction,
  initialCategoryFilter,
  onClearCategoryPreset,
}) => {
  const {
    transactions,
    allTransactions,
    filters,
    setFilters,
    deleteTransaction,
  } = useTransactions(
    initialCategoryFilter ? { period: 'all', category: initialCategoryFilter } : undefined
  );

  const { categories, categoriesMap } = useCategories();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync preset if navigated from Dashboard category click
  useEffect(() => {
    if (initialCategoryFilter) {
      setFilters((prev) => ({
        ...prev,
        period: 'all',
        category: initialCategoryFilter,
      }));
    }
  }, [initialCategoryFilter, setFilters]);

  const filteredSummary = useMemo(
    () => calculateFinancialSummary(transactions, categoriesMap),
    [transactions, categoriesMap]
  );

  const hasActiveFilters =
    filters.period !== 'this-month' ||
    (filters.type && filters.type !== 'all') ||
    (filters.category && filters.category !== 'all') ||
    Boolean(filters.search && filters.search.trim() !== '') ||
    (filters.sortBy && filters.sortBy !== 'date-desc');

  const handleResetFilters = () => {
    setFilters({
      period: 'this-month',
      type: 'all',
      category: 'all',
      search: '',
      sortBy: 'date-desc',
      customStartDate: undefined,
      customEndDate: undefined,
    });
    onClearCategoryPreset?.();
  };

  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    try {
      setIsDeleting(true);
      await deleteTransaction(transactionToDelete.id);
      setTransactionToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCsv = () => {
    if (transactions.length === 0) {
      showToast({
        type: 'info',
        title: 'Nothing to Export',
        description: 'No transactions match the active filters.',
      });
      return;
    }
    const csv = generateTransactionsCsv(transactions);
    downloadCsvFile(csv, `transactions-${filters.period}.csv`);
    showToast({
      type: 'success',
      title: 'CSV Exported',
      description: `Downloaded ${transactions.length} filtered transaction(s).`,
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Filtered Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5 sm:p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Matching Entries
          </p>
          <p className="text-lg font-bold font-mono text-white tabular-nums mt-1">
            {transactions.length}
            <span className="text-xs font-sans font-normal text-slate-500 ml-1.5">
              / {allTransactions.length} total
            </span>
          </p>
        </Card>
        <Card className="p-3.5 sm:p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Filtered Inflow
          </p>
          <p className="text-lg font-bold font-mono text-emerald-400 tabular-nums mt-1">
            {formatINR(filteredSummary.totalIncome)}
          </p>
        </Card>
        <Card className="p-3.5 sm:p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Filtered Outflow
          </p>
          <p className="text-lg font-bold font-mono text-rose-400 tabular-nums mt-1">
            {formatINR(filteredSummary.totalExpenses)}
          </p>
        </Card>
        <Card className="p-3.5 sm:p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Filtered Net
          </p>
          <p
            className={`text-lg font-bold font-mono tabular-nums mt-1 ${
              filteredSummary.netBalance >= 0 ? 'text-cyan-300' : 'text-rose-400'
            }`}
          >
            {formatINR(filteredSummary.netBalance)}
          </p>
        </Card>
      </div>

      {/* Search, Filters & Actions Card */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              aria-label="Search transactions"
              placeholder="Search notes or category..."
              value={filters.search || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              onClear={() => setFilters((prev) => ({ ...prev, search: '' }))}
              leftAddon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={onOpenAddModal}
            >
              New Transaction
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
          <Select
            label="Period"
            value={filters.period}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, period: e.target.value as FilterPeriod }))
            }
          >
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="this-week">This Week</option>
            <option value="this-year">This Year</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Date Range</option>
          </Select>

          <Select
            label="Type"
            value={filters.type || 'all'}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </Select>

          <Select
            label="Category"
            value={filters.category || 'all'}
            onChange={(e) => {
              onClearCategoryPreset?.();
              setFilters((prev) => ({ ...prev, category: e.target.value }));
            }}
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name} ({c.type})
              </option>
            ))}
          </Select>

          <Select
            label="Sort By"
            value={filters.sortBy || 'date-desc'}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
          >
            <option value="date-desc">Date: Newest First</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="amount-desc">Amount: Highest First</option>
            <option value="amount-asc">Amount: Lowest First</option>
          </Select>
        </div>

        {filters.period === 'custom' && (
          <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-3 border-t border-white/[0.06] text-xs">
            <span className="text-slate-400 font-medium">Custom Range:</span>
            <input
              type="date"
              aria-label="Start date"
              value={filters.customStartDate || ''}
              max={filters.customEndDate || undefined}
              onChange={(e) => setFilters((p) => ({ ...p, customStartDate: e.target.value }))}
              className="bg-[#090E18] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              aria-label="End date"
              value={filters.customEndDate || ''}
              min={filters.customStartDate || undefined}
              onChange={(e) => setFilters((p) => ({ ...p, customEndDate: e.target.value }))}
              className="bg-[#090E18] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}
      </Card>

      {/* Transactions Ledger Card */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-white">Transaction Records</h3>
            <Badge variant="cyan" size="sm">
              {transactions.length} record{transactions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <span className="text-[11px] text-slate-500 font-mono tabular-nums">
            Stored locally in IndexedDB
          </span>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-5 h-5" />}
            title={
              allTransactions.length === 0
                ? 'No Transactions Recorded Yet'
                : 'No Matching Transactions'
            }
            description={
              allTransactions.length === 0
                ? 'Add your first income or expense entry to start tracking balances, budgets, and insights.'
                : 'No records match your current search or filter settings. Try resetting filters or adding a new entry.'
            }
            actionLabel="Record Transaction"
            onAction={onOpenAddModal}
            secondaryActionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
            onSecondaryAction={hasActiveFilters ? handleResetFilters : undefined}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090E18] text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/[0.06]">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {transactions.map((tx) => {
                    const cat = categoriesMap.get(tx.category);
                    const isIncome = tx.type === 'income';

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-slate-800/35 transition-colors group"
                      >
                        <td className="py-3 px-4 font-medium text-slate-100 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <CategoryIcon
                              name={cat?.icon}
                              color={cat?.color || (isIncome ? '#10B981' : '#06B6D4')}
                              size="sm"
                            />
                            <span>{tx.category}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300 max-w-xs truncate" title={tx.description || ''}>
                          {tx.description || <span className="text-slate-600">—</span>}
                        </td>

                        <td className="py-3 px-4 text-slate-400 font-mono tabular-nums whitespace-nowrap">
                          {formatIndianDate(tx.date)}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <Badge variant={isIncome ? 'emerald' : 'rose'} size="sm" dot>
                            {isIncome ? 'Income' : 'Expense'}
                          </Badge>
                        </td>

                        <td
                          className={`py-3 px-4 text-right font-mono font-bold text-sm tabular-nums whitespace-nowrap ${
                            isIncome ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatSignedINR(tx.amount, tx.type)}
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditTransaction(tx)}
                              aria-label={`Edit ${tx.category} transaction`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setTransactionToDelete(tx)}
                              aria-label={`Delete ${tx.category} transaction`}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden divide-y divide-white/[0.06]">
              {transactions.map((tx) => {
                const cat = categoriesMap.get(tx.category);
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon
                        name={cat?.icon}
                        color={cat?.color || (isIncome ? '#10B981' : '#06B6D4')}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-100 truncate">
                            {tx.category}
                          </span>
                          <Badge variant={isIncome ? 'emerald' : 'rose'} size="sm">
                            {isIncome ? 'In' : 'Out'}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {tx.description || formatDisplayDate(tx.date)}
                        </p>
                        {tx.description && (
                          <p className="text-[10px] font-mono text-slate-500 mt-0.5 tabular-nums">
                            {formatIndianDate(tx.date)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`text-sm font-bold font-mono tabular-nums ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatSignedINR(tx.amount, tx.type)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditTransaction(tx)}
                          aria-label={`Edit ${tx.category} transaction`}
                          className="p-1.5 rounded-lg bg-slate-900 border border-white/[0.06] text-slate-400 hover:text-cyan-300"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setTransactionToDelete(tx)}
                          aria-label={`Delete ${tx.category} transaction`}
                          className="p-1.5 rounded-lg bg-slate-900 border border-white/[0.06] text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${transactionToDelete?.type} of ${
          transactionToDelete ? formatINR(transactionToDelete.amount) : ''
        } in "${transactionToDelete?.category}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
