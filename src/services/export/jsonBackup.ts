import { db } from '../../database/db';
import { Transaction, Category, Budget, UserSettings } from '../../types';

export interface ApplicationBackupData {
  version: number;
  exportedAt: string;
  source: string;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  settings: UserSettings | null;
}

/**
 * Creates a complete JSON backup of the application database.
 */
export async function createFullApplicationBackup(): Promise<ApplicationBackupData> {
  const transactions = await db.transactions.toArray();
  const categories = await db.categories.toArray();
  const budgets = await db.budgets.toArray();
  const settingsRecord = await db.settings.get('userSettings');

  const backup: ApplicationBackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: 'Personal Expenses Tracker — BCA-308',
    transactions,
    categories,
    budgets,
    settings: settingsRecord ? settingsRecord.value : null,
  };

  return backup;
}

/**
 * Triggers a browser download of the full JSON backup.
 */
export function downloadJsonBackup(backup: ApplicationBackupData): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const jsonString = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `personal-expenses-backup-${dateStr}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
