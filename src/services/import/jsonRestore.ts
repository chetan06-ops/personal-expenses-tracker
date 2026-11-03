import { z } from 'zod';
import { db } from '../../database/db';
import { ApplicationBackupData } from '../export/jsonBackup';
import { isValidCalendarDate } from '../../utils/date';
import { Transaction, Category, Budget } from '../../types';

export interface RestoreResult {
  success: boolean;
  message: string;
  transactionsRestored: number;
  categoriesRestored: number;
  budgetsRestored: number;
}

const backupTransactionSchema = z.object({
  id: z.string().min(1, 'Transaction ID cannot be empty'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Invalid transaction type in backup' }),
  }),
  amount: z
    .number()
    .int('Amount must be stored as an integer in paise')
    .positive('Transaction amount must be positive')
    .max(Number.MAX_SAFE_INTEGER, 'Amount exceeds safe integer limit'),
  category: z.string().min(1, 'Category cannot be empty'),
  date: z.string().refine(isValidCalendarDate, {
    message: 'Transaction date must be a valid calendar date',
  }),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const backupCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
  color: z.string().optional().default('#64748B'),
  icon: z.string().optional().default('Tag'),
  isCustom: z.boolean().optional().default(false),
  createdAt: z.string().optional(),
});

const backupBudgetSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  limit: z.number().int().positive('Budget limit must be a positive integer in paise'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Budget month must match YYYY-MM format'),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

const backupSettingsSchema = z
  .object({
    currency: z.string().default('INR'),
    currencySymbol: z.string().default('₹'),
    enable3D: z.boolean().default(true),
    performanceMode: z.enum(['high', 'medium', 'low']).default('high'),
    monthlyOverallBudget: z.number().int().positive().default(2500000),
    lastBackupDate: z.string().optional(),
  })
  .nullable()
  .optional();

export const backupFileSchema = z.object({
  version: z.number().int().min(1, 'Backup version must be at least 1'),
  exportedAt: z.string(),
  source: z.string().optional(),
  transactions: z.array(backupTransactionSchema),
  categories: z.array(backupCategorySchema),
  budgets: z.array(backupBudgetSchema).optional().default([]),
  settings: backupSettingsSchema,
});

export const DEFAULT_USER_SETTINGS = {
  currency: 'INR',
  currencySymbol: '₹',
  enable3D: true,
  performanceMode: 'high' as const,
  monthlyOverallBudget: 2500000, // ₹25,000 in paise
};

/**
 * Validates whether the given parsed JSON is a valid ApplicationBackupData structure with strict Zod validation.
 */
export function validateBackupJson(data: any): data is ApplicationBackupData {
  const result = backupFileSchema.safeParse(data);
  if (!result.success) {
    return false;
  }

  // Check duplicate IDs within transactions
  const txIds = new Set<string>();
  for (const tx of result.data.transactions) {
    if (txIds.has(tx.id)) return false;
    txIds.add(tx.id);
  }

  // Check duplicate IDs within categories
  const catIds = new Set<string>();
  for (const cat of result.data.categories) {
    if (catIds.has(cat.id)) return false;
    catIds.add(cat.id);
  }

  return true;
}

/**
 * Restores application data from a valid backup object inside an atomic Dexie transaction.
 * Mode 'replace': atomically clears transactions, categories, budgets, and settings, and applies backup.
 * Mode 'merge': adds non-existing records while preserving current data.
 */
export async function restoreApplicationBackup(
  backupData: any,
  mode: 'replace' | 'merge' = 'replace'
): Promise<RestoreResult> {
  const parseResult = backupFileSchema.safeParse(backupData);
  if (!parseResult.success) {
    const errorDetails = parseResult.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid backup schema: ${errorDetails}`);
  }

  const validData = parseResult.data;

  // Check duplicate IDs within transactions
  const txIds = new Set<string>();
  for (const tx of validData.transactions) {
    if (txIds.has(tx.id)) {
      throw new Error(`Duplicate transaction ID "${tx.id}" in backup file.`);
    }
    txIds.add(tx.id);
  }

  return await db.transaction('rw', [db.transactions, db.categories, db.budgets, db.settings], async () => {
    if (mode === 'replace') {
      // Clear all tables atomically
      await db.transactions.clear();
      await db.categories.clear();
      await db.budgets.clear();
      await db.settings.clear(); // Bug fix: clear settings on replace
    }

    const now = new Date().toISOString();
    const categoriesToRestore: Category[] = validData.categories.map((c) => ({
      ...c,
      createdAt: c.createdAt || now,
    }));

    const budgetsToRestore: Budget[] = (validData.budgets || []).map((b) => ({
      ...b,
      createdAt: b.createdAt || now,
      updatedAt: b.updatedAt || now,
    }));

    const transactionsToRestore: Transaction[] = validData.transactions.map((tx) => ({
      ...tx,
      createdAt: tx.createdAt || now,
      updatedAt: tx.updatedAt || now,
    }));

    // Categories restoration
    let catCount = 0;
    if (mode === 'replace') {
      await db.categories.bulkAdd(categoriesToRestore);
      catCount = categoriesToRestore.length;
    } else {
      for (const cat of categoriesToRestore) {
        const exists = await db.categories.get(cat.id);
        if (!exists) {
          await db.categories.add(cat);
          catCount++;
        }
      }
    }

    // Transactions restoration
    let txCount = 0;
    if (mode === 'replace') {
      await db.transactions.bulkAdd(transactionsToRestore);
      txCount = transactionsToRestore.length;
    } else {
      for (const tx of transactionsToRestore) {
        const exists = await db.transactions.get(tx.id);
        if (!exists) {
          await db.transactions.add(tx);
          txCount++;
        }
      }
    }

    // Budgets restoration
    let budCount = 0;
    if (budgetsToRestore.length > 0) {
      if (mode === 'replace') {
        await db.budgets.bulkAdd(budgetsToRestore);
        budCount = budgetsToRestore.length;
      } else {
        for (const bud of budgetsToRestore) {
          const exists = await db.budgets.get(bud.id);
          if (!exists) {
            await db.budgets.add(bud);
            budCount++;
          }
        }
      }
    }

    // Settings restoration
    if (mode === 'replace') {
      const finalSettings = validData.settings || DEFAULT_USER_SETTINGS;
      await db.settings.put({
        key: 'userSettings',
        value: finalSettings,
      });
    } else if (validData.settings) {
      const existingSettings = await db.settings.get('userSettings');
      if (!existingSettings) {
        await db.settings.put({
          key: 'userSettings',
          value: validData.settings,
        });
      }
    }

    return {
      success: true,
      message: `Successfully restored ${txCount} transactions, ${catCount} categories, and ${budCount} budgets in ${mode} mode.`,
      transactionsRestored: txCount,
      categoriesRestored: catCount,
      budgetsRestored: budCount,
    };
  });
}
