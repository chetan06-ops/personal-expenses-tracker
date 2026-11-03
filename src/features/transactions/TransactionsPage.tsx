import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Transaction, FilterPeriod, TransactionType } from '../../types';
import { useTransactions } from '../../hooks/useTransactions';
import { useCategories } from '../../hooks/useCategories';
import { formatINR, formatSignedINR } from '../../utils/currency';
import { formatDisplayDate, formatIndianDate } from '../../utils/date';
import { generateTransactionsCsv, downloadCsvFile } from '../../services/export/csvExport';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit2,
  ArrowUpDown,
  Receipt,
  Calendar,
} from 'lucide-react';

interface TransactionsPageProps {
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenAddModal,
  onEditTransaction,
}) => {
  const {
    transactions,
    allTransactions,
    filters,
    setFilters,
    deleteTransaction,
  } = useTransactions();

  const { categories, categoriesMap } = useCategories();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    const csv = generateTransactionsCsv(transactions);
    downloadCsvFile(csv, `transactions-${filters.period}.csv`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Controls Card: Search, Filters, Sorting, Actions */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by notes or category..."
              value={filters.search || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              leftAddon={<Search className="w-4 h-4 text-slate-400" />}
              className="text-xs sm:text-sm"
            />
          </div>

          {/* Action Buttons: Add & Export */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportCsv}
              title="Export filtered records to safe CSV"
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

        {/* Filter Toolbar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5 text-xs">
          {/* Period Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Period</label>
            <select
              value={filters.period}
              onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value as FilterPeriod }))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-week">This Week</option>
              <option value="this-year">This Year</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Type</label>
            <select
              value={filters.type || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as any }))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Category</label>
            <select
              value={filters.category || 'all'}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Sort By</label>
            <select
              value={filters.sortBy || 'date-desc'}
              onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs focus:ring-1 focus:ring-cyan-500 focus:outline-none"
            >
              <option value="date-desc">Date: Newest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Amount: Highest First</option>
              <option value="amount-asc">Amount: Lowest First</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range if active */}
        {filters.period === 'custom' && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 text-xs">
            <span className="text-slate-400">Date Range:</span>
            <input
              type="date"
              value={filters.customStartDate || ''}
              onChange={(e) => setFilters((p) => ({ ...p, customStartDate: e.target.value }))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={filters.customEndDate || ''}
              onChange={(e) => setFilters((p) => ({ ...p, customEndDate: e.target.value }))}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
            />
          </div>
        )}
      </Card>

      {/* Transactions List / Table */}
      <Card className="p-0 overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Transaction Records</h3>
            <Badge variant="cyan" size="sm">
              {transactions.length} record{transactions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {allTransactions.length} total stored in IndexedDB
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3 border border-slate-700">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200">No Transactions Found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No transactions match your current filter settings. Try adjusting the period or adding a new record.
            </p>
            <Button variant="primary" size="sm" className="mt-4" onClick={onOpenAddModal}>
              Record Transaction
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description / Notes</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const cat = categoriesMap.get(tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Type */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={isIncome ? 'emerald' : 'rose'}
                          size="sm"
                        >
                          {isIncome ? 'Income' : 'Expense'}
                        </Badge>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-medium text-slate-200">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: cat?.color || '#06B6D4' }}
                          />
                          <span>{tx.category}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-300 font-mono">
                        {formatIndianDate(tx.date)}
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                        {tx.description || <span className="text-slate-600 italic">—</span>}
                      </td>

                      {/* Amount */}
                      <td
                        className={`py-3 px-4 text-right font-mono font-bold text-sm ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatSignedINR(tx.amount, tx.type)}
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setTransactionToDelete(tx)}
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
        )}
      </Card>

      {/* Confirmation Dialog for Transaction Deletion */}
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
