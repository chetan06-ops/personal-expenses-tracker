import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import { budgetRepository } from '../database/repositories/budgetRepository';
import { Budget } from '../types';
import { getMonthKey } from '../utils/date';
import { showToast } from './useToast';

export function useBudgets(selectedMonth = getMonthKey()) {
  const budgets = useLiveQuery(
    () => db.budgets.where('month').equals(selectedMonth).toArray(),
    [selectedMonth]
  ) || [];

  const setBudget = async (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const budget = await budgetRepository.setBudget(data);
      showToast({
        type: 'success',
        title: 'Budget Set',
        description: `Budget limit for ${budget.category === 'TOTAL' ? 'Total Expenses' : budget.category} saved.`,
      });
      return budget;
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Save Budget',
        description: err.message || 'Could not save budget limit.',
      });
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      await budgetRepository.delete(id);
      showToast({
        type: 'info',
        title: 'Budget Removed',
        description: 'Budget limit was deleted.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Failed to Remove',
        description: err.message,
      });
    }
  };

  return {
    budgets,
    setBudget,
    deleteBudget,
  };
}
