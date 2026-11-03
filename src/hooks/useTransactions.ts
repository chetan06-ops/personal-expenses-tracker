import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import { transactionRepository } from '../database/repositories/transactionRepository';
import { Transaction, TransactionFilters } from '../types';
import { getDateRangeForPeriod } from '../utils/date';
import { showToast } from './useToast';

export function useTransactions(initialFilters?: Partial<TransactionFilters>) {
  const [filters, setFilters] = useState<TransactionFilters>({
    period: 'this-month',
    type: 'all',
    category: 'all',
    search: '',
    sortBy: 'date-desc',
    ...initialFilters,
  });

  // Query all transactions reactively from IndexedDB
  const allTransactions = useLiveQuery(
    () => db.transactions.orderBy('date').reverse().toArray(),
    []
  ) || [];

  // Filter transactions in memory using reactive data
  const filteredTransactions = useMemo(() => {
    let result = [...allTransactions];

    // Period filter
    if (filters.period && filters.period !== 'all') {
      const { startDate, endDate } = getDateRangeForPeriod(
        filters.period,
        filters.customStartDate,
        filters.customEndDate
      );
      result = result.filter((tx) => tx.date >= startDate && tx.date <= endDate);
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      result = result.filter((tx) => tx.type === filters.type);
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      result = result.filter((tx) => tx.category === filters.category);
    }

    // Search query
    if (filters.search && filters.search.trim() !== '') {
      const query = filters.search.toLowerCase().trim();
      result = result.filter(
        (tx) =>
          tx.category.toLowerCase().includes(query) ||
          (tx.description && tx.description.toLowerCase().includes(query))
      );
    }

    // Sorting
    const sortBy = filters.sortBy || 'date-desc';
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
        case 'date-asc':
          return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return b.date.localeCompare(a.date);
      }
    });

    return result;
  }, [allTransactions, filters]);

  const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTx = await transactionRepository.add(data);
      showToast({
        type: 'success',
        title: 'Transaction Saved',
        description: `Successfully added ${newTx.type === 'income' ? 'income' : 'expense'} of ₹${(newTx.amount / 100).toFixed(2)}.`,
      });
      return newTx;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Save',
        description: err.message || 'An error occurred while saving transaction.',
      });
      throw err;
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
  ) => {
    try {
      const updated = await transactionRepository.update(id, updates);
      showToast({
        type: 'success',
        title: 'Transaction Updated',
        description: `Successfully updated transaction in ${updated.category}.`,
      });
      return updated;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        description: err.message || 'Could not update transaction.',
      });
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionRepository.delete(id);
      showToast({
        type: 'info',
        title: 'Transaction Deleted',
        description: 'Transaction was removed from your records.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Deletion Failed',
        description: err.message || 'Could not delete transaction.',
      });
      throw err;
    }
  };

  return {
    transactions: filteredTransactions,
    allTransactions,
    filters,
    setFilters,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    totalCount: allTransactions.length,
    filteredCount: filteredTransactions.length,
  };
}
