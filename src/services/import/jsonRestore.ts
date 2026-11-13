import { db } from '../../database/db';
import { ApplicationBackupData } from '../export/jsonBackup';
import { Transaction, Category, Budget } from '../../types';

export interface RestoreResult {
  success: boolean;
  message: string;
  transactionsRestored: number;
  categoriesRestored: number;
  budgetsRestored: number;
}

/**
 * Validates whether the given parsed JSON is a valid ApplicationBackupData structure.
 */
export function validateBackupJson(data: any): data is ApplicationBackupData {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.version !== 'number') return false;
  if (!Array.isArray(data.transactions)) return false;
  if (!Array.isArray(data.categories)) return false;

  // Validate transaction structure minimally
  for (const tx of data.transactions) {
    if (!tx.id || !tx.type || typeof tx.amount !== 'number' || !tx.category || !tx.date) {
      return false;
    }
  }

  return true;
}

/**
 * Restores application data from a valid backup object.
 * Mode: 'replace' deletes existing tables and restores backup.
 * Mode: 'merge' adds new items while preserving existing records.
 */
export async function restoreApplicationBackup(
  backupData: ApplicationBackupData,
  mode: 'replace' | 'merge' = 'replace'
): Promise<RestoreResult> {
  if (!validateBackupJson(backupData)) {
    throw new Error('Invalid backup file structure: missing required tables or fields.');
  }

  return await db.transaction('rw', [db.transactions, db.categories, db.budgets, db.settings], async () => {
    if (mode === 'replace') {
      await db.transactions.clear();
      await db.categories.clear();
      await db.budgets.clear();
    }

    // Categories
    let catCount = 0;
    if (mode === 'replace') {
      await db.categories.bulkAdd(backupData.categories);
      catCount = backupData.categories.length;
    } else {
      for (const cat of backupData.categories) {
        const exists = await db.categories.get(cat.id);
        if (!exists) {
          await db.categories.add(cat);
          catCount++;
        }
      }
    }

    // Transactions
    let txCount = 0;
    if (mode === 'replace') {
      await db.transactions.bulkAdd(backupData.transactions);
      txCount = backupData.transactions.length;
    } else {
      for (const tx of backupData.transactions) {
        const exists = await db.transactions.get(tx.id);
        if (!exists) {
          await db.transactions.add(tx);
          txCount++;
        }
      }
    }

    // Budgets
    let budCount = 0;
    if (backupData.budgets && backupData.budgets.length > 0) {
      if (mode === 'replace') {
        await db.budgets.bulkAdd(backupData.budgets);
        budCount = backupData.budgets.length;
      } else {
        for (const bud of backupData.budgets) {
          const exists = await db.budgets.get(bud.id);
          if (!exists) {
            await db.budgets.add(bud);
            budCount++;
          }
        }
      }
    }

    // Settings
    if (backupData.settings) {
      await db.settings.put({
        key: 'userSettings',
        value: backupData.settings,
      });
    }

    return {
      success: true,
      message: `Successfully restored ${txCount} transactions, ${catCount} categories, and ${budCount} budgets (${mode} mode).`,
      transactionsRestored: txCount,
      categoriesRestored: catCount,
      budgetsRestored: budCount,
    };
  });
}
