import { db } from '../db';
import { Budget } from '../../types';

export const budgetRepository = {
  async getAll(): Promise<Budget[]> {
    return db.budgets.toArray();
  },

  async getByMonth(month: string): Promise<Budget[]> {
    return db.budgets.where('month').equals(month).toArray();
  },

  async getByCategoryAndMonth(category: string, month: string): Promise<Budget | undefined> {
    return db.budgets.where(['category', 'month']).equals([category, month]).first();
  },

  async setBudget(budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    const existing = await this.getByCategoryAndMonth(budget.category, budget.month);
    const now = new Date().toISOString();

    if (existing) {
      const updated: Budget = {
        ...existing,
        limit: budget.limit,
        updatedAt: now,
      };
      await db.budgets.put(updated);
      return updated;
    } else {
      const newBudget: Budget = {
        ...budget,
        id: `bud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      };
      await db.budgets.add(newBudget);
      return newBudget;
    }
  },

  async delete(id: string): Promise<void> {
    await db.budgets.delete(id);
  },
};
