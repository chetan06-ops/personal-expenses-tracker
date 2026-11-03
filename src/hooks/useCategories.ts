import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import { categoryRepository } from '../database/repositories/categoryRepository';
import { Category, TransactionType } from '../types';

export function useCategories() {
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  const categoriesMap = new Map<string, Category>(
    categories.map((c) => [c.name, c])
  );

  const addCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'isCustom'>) => {
    return await categoryRepository.add(data);
  };

  const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    return await categoryRepository.update(id, updates);
  };

  const deleteCategory = async (id: string, reassignToCategory?: string) => {
    return await categoryRepository.delete(id, reassignToCategory);
  };

  const getUsageCount = async (name: string) => {
    return await categoryRepository.countUsage(name);
  };

  return {
    categories,
    expenseCategories,
    incomeCategories,
    categoriesMap,
    addCategory,
    updateCategory,
    deleteCategory,
    getUsageCount,
  };
}
