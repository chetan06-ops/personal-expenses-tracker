import Dexie, { type Table } from 'dexie';
import { Transaction, Category, Budget } from '../types';
import {
  DB_NAME,
  DB_VERSION,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
  SettingsRecord,
} from './schema';

export class PersonalExpensesTrackerDatabase extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  budgets!: Table<Budget, string>;
  settings!: Table<SettingsRecord, string>;

  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      transactions: 'id, type, category, date, createdAt, updatedAt, [type+category], [type+date]',
      categories: 'id, name, type, isCustom',
      budgets: 'id, category, month, [category+month]',
      settings: 'key',
    });
  }
}

export const db = new PersonalExpensesTrackerDatabase();

/**
 * Initializes database with default categories if empty.
 */
export async function initializeDatabase(): Promise<void> {
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    const now = new Date().toISOString();
    const categoriesToInsert: Category[] = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((c, i) => ({
        ...c,
        id: `cat_exp_${i + 1}`,
        createdAt: now,
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((c, i) => ({
        ...c,
        id: `cat_inc_${i + 1}`,
        createdAt: now,
      })),
    ];
    await db.categories.bulkAdd(categoriesToInsert);
  }

  // Check if default settings exist
  const existingSettings = await db.settings.get('userSettings');
  if (!existingSettings) {
    await db.settings.put({
      key: 'userSettings',
      value: {
        currency: 'INR',
        currencySymbol: '₹',
        enable3D: true,
        performanceMode: 'high',
        monthlyOverallBudget: 2500000, // ₹25,000 in paise
      },
    });
  }
}
