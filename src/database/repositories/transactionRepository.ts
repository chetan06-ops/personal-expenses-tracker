import { db } from '../db';
import { Transaction, TransactionFilters } from '../../types';
import { getDateRangeForPeriod } from '../../utils/date';

export const transactionRepository = {
  async getAll(): Promise<Transaction[]> {
    return db.transactions.orderBy('date').reverse().toArray();
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return db.transactions.get(id);
  },

  async add(txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const now = new Date().toISOString();
    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    await db.transactions.add(newTx);
    return newTx;
  },

  async update(id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>): Promise<Transaction> {
    const existing = await db.transactions.get(id);
    if (!existing) {
      throw new Error(`Transaction with ID "${id}" not found`);
    }

    const updated: Transaction = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.transactions.put(updated);
    return updated;
  },

  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return db.transactions
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  },

  async filter(filters: TransactionFilters): Promise<Transaction[]> {
    let results: Transaction[];

    if (filters.period && filters.period !== 'all') {
      const { startDate, endDate } = getDateRangeForPeriod(
        filters.period,
        filters.customStartDate,
        filters.customEndDate
      );
      results = await this.getByDateRange(startDate, endDate);
    } else {
      results = await this.getAll();
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      results = results.filter((tx) => tx.type === filters.type);
    }

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      results = results.filter((tx) => tx.category === filters.category);
    }

    // Apply search filter (matches description or category)
    if (filters.search && filters.search.trim() !== '') {
      const query = filters.search.toLowerCase().trim();
      results = results.filter(
        (tx) =>
          tx.category.toLowerCase().includes(query) ||
          (tx.description && tx.description.toLowerCase().includes(query))
      );
    }

    // Sorting
    const sortBy = filters.sortBy || 'date-desc';
    results.sort((a, b) => {
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

    return results;
  },

  async count(): Promise<number> {
    return db.transactions.count();
  },
};
