import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';
import { categoryRepository } from '../database/repositories/categoryRepository';
import { Category, TransactionType } from '../types';

export function useCategories() {
  const categories = useLiveQuery(() => db.categories.toArray(), []) || [];

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const incomeCategories = categories.filter((c) => c.type === 'income');

  // Multi-key map supporting both `${type}:${name.toLowerCase()}` and plain `name`
  const categoriesMap = new Map<string, Category>();
  for (const c of categories) {
    categoriesMap.set(`${c.type}:${c.name.toLowerCase()}`, c);
    // Also set by plain name if not already set by expense
    if (!categoriesMap.has(c.name)) {
      categoriesMap.set(c.name, c);
    }
  }

  const getCategoryColor = (name: string, type?: TransactionType): string => {
    if (type) {
      const match = categoriesMap.get(`${type}:${name.toLowerCase()}`);
      if (match) return match.color;
    }
    const plain = categoriesMap.get(name);
    return plain?.color || '#06B6D4';
  };

  const addCategory = async (data: Omit<Category, 'id' | 'createdAt' | 'isCustom'>) => {
    return await categoryRepository.add(data);
  };

  const updateCategory = async (id: string, updates: Partial<Omit<Category, 'id' | 'createdAt'>>) => {
    return await categoryRepository.update(id, updates);
  };

  const deleteCategory = async (id: string, reassignToCategory?: string) => {
    return await categoryRepository.delete(id, reassignToCategory);
  };

  const getUsageCount = async (name: string, type: TransactionType) => {
    return await categoryRepository.countUsage(name, type);
  };

  return {
    categories,
    expenseCategories,
    incomeCategories,
    categoriesMap,
    getCategoryColor,
    addCategory,
    updateCategory,
    deleteCategory,
    getUsageCount,
  };
}
