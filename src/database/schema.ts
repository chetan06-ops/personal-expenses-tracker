import { Transaction, Category, Budget } from '../types';

export interface SettingsRecord {
  key: string;
  value: any;
}

export const DB_NAME = 'PersonalExpensesTrackerDB';
export const DB_VERSION = 1;

/**
 * Default categories according to academic report & synopsis:
 * Expense: Food, Travel, Education, Shopping, Bills, Health, Entertainment, Other
 * Income: Salary, Allowance, Freelance, Business, Gifts, Other
 */
export const DEFAULT_EXPENSE_CATEGORIES: Array<Omit<Category, 'id' | 'createdAt'>> = [
  { name: 'Food', type: 'expense', color: '#F97316', icon: 'Utensils', isCustom: false },
  { name: 'Travel', type: 'expense', color: '#06B6D4', icon: 'Car', isCustom: false },
  { name: 'Education', type: 'expense', color: '#8B5CF6', icon: 'GraduationCap', isCustom: false },
  { name: 'Shopping', type: 'expense', color: '#EC4899', icon: 'ShoppingBag', isCustom: false },
  { name: 'Bills', type: 'expense', color: '#EF4444', icon: 'Receipt', isCustom: false },
  { name: 'Health', type: 'expense', color: '#10B981', icon: 'HeartPulse', isCustom: false },
  { name: 'Entertainment', type: 'expense', color: '#A855F7', icon: 'Film', isCustom: false },
  { name: 'Other', type: 'expense', color: '#64748B', icon: 'MoreHorizontal', isCustom: false },
];

export const DEFAULT_INCOME_CATEGORIES: Array<Omit<Category, 'id' | 'createdAt'>> = [
  { name: 'Allowance', type: 'income', color: '#10B981', icon: 'HandCoins', isCustom: false },
  { name: 'Salary', type: 'income', color: '#06B6D4', icon: 'Briefcase', isCustom: false },
  { name: 'Freelance', type: 'income', color: '#8B5CF6', icon: 'Laptop', isCustom: false },
  { name: 'Business', type: 'income', color: '#F59E0B', icon: 'TrendingUp', isCustom: false },
  { name: 'Gifts', type: 'income', color: '#EC4899', icon: 'Gift', isCustom: false },
  { name: 'Other', type: 'income', color: '#64748B', icon: 'Coins', isCustom: false },
];
