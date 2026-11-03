import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase } from '../database/db';
import { transactionRepository } from '../database/repositories/transactionRepository';
import { categoryRepository } from '../database/repositories/categoryRepository';
import { budgetRepository } from '../database/repositories/budgetRepository';
import {
  seedAcademicReferenceData,
  seedExtendedDemoData,
  clearDemoDataOnly,
} from '../database/seed';
import { calculateFinancialSummary } from '../services/calculations/financialCalculations';
import { parseAndValidateCsv } from '../services/import/csvImport';
import { restoreApplicationBackup } from '../services/import/jsonRestore';
import { paiseToRupees } from '../utils/currency';

describe('Real Database & Repository Integration Suite (IndexedDB via Dexie)', () => {
  beforeEach(async () => {
    // Clear all tables before each integration test to guarantee isolated test state
    await db.transactions.clear();
    await db.categories.clear();
    await db.budgets.clear();
    await db.settings.clear();
  });

  // 1. Genuinely Empty Database Launch
  it('Initializes with genuinely empty transactions (first-time launch has 0 transactions)', async () => {
    await initializeDatabase(); // seeds categories, but NO transactions
    const txCount = await db.transactions.count();
    const transactions = await transactionRepository.getAll();

    expect(txCount).toBe(0);
    expect(transactions).toEqual([]);

    const catCount = await db.categories.count();
    expect(catCount).toBeGreaterThan(0); // Default categories exist
  });

  // 2. Add Income and Expense Transactions
  it('Persists income and expense transactions correctly in IndexedDB', async () => {
    const incTx = await transactionRepository.add({
      type: 'income',
      amount: 1500000, // ₹15,000
      category: 'Allowance',
      date: '2026-10-01',
      description: 'Monthly student allowance',
    });

    const expTx = await transactionRepository.add({
      type: 'expense',
      amount: 250000, // ₹2,500
      category: 'Education',
      date: '2026-10-03',
      description: 'Course textbooks',
    });

    expect(incTx.id).toBeDefined();
    expect(expTx.id).toBeDefined();

    const all = await transactionRepository.getAll();
    expect(all.length).toBe(2);

    const fetchedInc = await transactionRepository.getById(incTx.id);
    expect(fetchedInc?.amount).toBe(1500000);
    expect(fetchedInc?.category).toBe('Allowance');

    const summary = calculateFinancialSummary(all);
    expect(paiseToRupees(summary.totalIncome)).toBe(15000);
    expect(paiseToRupees(summary.totalExpenses)).toBe(2500);
    expect(paiseToRupees(summary.netBalance)).toBe(12500);
  });

  // 3. Edit Transaction
  it('Edits an existing transaction and updates timestamps', async () => {
    const tx = await transactionRepository.add({
      type: 'expense',
      amount: 120000, // ₹1,200
      category: 'Food',
      date: '2026-10-05',
      description: 'Groceries',
    });

    // Update amount to ₹1,450.50 (145050 paise)
    const updated = await transactionRepository.update(tx.id, {
      amount: 145050,
      description: 'Groceries & snacks',
    });

    expect(updated.amount).toBe(145050);
    expect(updated.description).toBe('Groceries & snacks');

    const retrieved = await transactionRepository.getById(tx.id);
    expect(retrieved?.amount).toBe(145050);
  });

  // 4. Delete Transaction
  it('Deletes a transaction and removes it from IndexedDB', async () => {
    const tx = await transactionRepository.add({
      type: 'expense',
      amount: 50000, // ₹500
      category: 'Travel',
      date: '2026-10-06',
    });

    expect(await db.transactions.count()).toBe(1);

    await transactionRepository.delete(tx.id);
    expect(await db.transactions.count()).toBe(0);

    const retrieved = await transactionRepository.getById(tx.id);
    expect(retrieved).toBeUndefined();
  });

  // 5. CRITICAL: Category Rename Isolation Across Types
  it('Renaming an Expense category does NOT touch Income transactions of the same name', async () => {
    // Create both an expense category "Other" and an income category "Other"
    const expOther = await categoryRepository.add({
      name: 'Other',
      type: 'expense',
      color: '#64748B',
      icon: 'MoreHorizontal',
    });

    const incOther = await categoryRepository.add({
      name: 'Other',
      type: 'income',
      color: '#06B6D4',
      icon: 'HelpCircle',
    });

    // Add an expense transaction under "Other"
    const expTx = await transactionRepository.add({
      type: 'expense',
      amount: 45000,
      category: 'Other',
      date: '2026-10-04',
      description: 'Expense other item',
    });

    // Add an income transaction under "Other"
    const incTx = await transactionRepository.add({
      type: 'income',
      amount: 80000,
      category: 'Other',
      date: '2026-10-04',
      description: 'Income other item',
    });

    // Verify usage counts before rename
    expect(await categoryRepository.countUsage('Other', 'expense')).toBe(1);
    expect(await categoryRepository.countUsage('Other', 'income')).toBe(1);

    // RENAME the EXPENSE category "Other" -> "Miscellaneous Expense"
    await categoryRepository.update(expOther.id, { name: 'Miscellaneous Expense' });

    // Verify the expense transaction was updated to "Miscellaneous Expense"
    const updatedExpTx = await transactionRepository.getById(expTx.id);
    expect(updatedExpTx?.category).toBe('Miscellaneous Expense');
    expect(updatedExpTx?.type).toBe('expense');

    // CRITICAL: Verify the income transaction is UNTOUCHED and still "Other"
    const updatedIncTx = await transactionRepository.getById(incTx.id);
    expect(updatedIncTx?.category).toBe('Other');
    expect(updatedIncTx?.type).toBe('income');

    // Verify type-specific counts
    expect(await categoryRepository.countUsage('Miscellaneous Expense', 'expense')).toBe(1);
    expect(await categoryRepository.countUsage('Other', 'expense')).toBe(0);
    expect(await categoryRepository.countUsage('Other', 'income')).toBe(1);
  });

  // 6. Category Deletion & Reassignment Isolation
  it('Reassigns transactions strictly within the same transaction type during category deletion', async () => {
    const snacksCat = await categoryRepository.add({
      name: 'Snacks',
      type: 'expense',
      color: '#F97316',
      icon: 'Coffee',
    });

    const diningCat = await categoryRepository.add({
      name: 'Dining',
      type: 'expense',
      color: '#EC4899',
      icon: 'Utensils',
    });

    const freelanceCat = await categoryRepository.add({
      name: 'Freelance',
      type: 'income',
      color: '#10B981',
      icon: 'Briefcase',
    });

    const tx = await transactionRepository.add({
      type: 'expense',
      amount: 15000,
      category: 'Snacks',
      date: '2026-10-05',
    });

    // Attempting to reassign an expense category to an income category must throw an error
    await expect(
      categoryRepository.delete(snacksCat.id, 'Freelance')
    ).rejects.toThrow(/does not exist for expense transactions/i);

    // Reassigning to an expense category succeeds
    await categoryRepository.delete(snacksCat.id, 'Dining');

    const updatedTx = await transactionRepository.getById(tx.id);
    expect(updatedTx?.category).toBe('Dining');

    const deletedCat = await db.categories.get(snacksCat.id);
    expect(deletedCat).toBeUndefined();
  });

  // 7. Budget Cascade & Orphan Budget Cleanup
  it('Cascades category rename to budgets and deletes budgets when category is removed', async () => {
    const entCat = await categoryRepository.add({
      name: 'Entertainment',
      type: 'expense',
      color: '#8B5CF6',
      icon: 'Film',
    });

    // Create a budget for Entertainment
    const budget = await budgetRepository.setBudget({
      category: 'Entertainment',
      limit: 300000, // ₹3,000
      month: '2026-10',
    });

    expect(budget.category).toBe('Entertainment');

    // Rename category Entertainment -> Movies & Outings
    await categoryRepository.update(entCat.id, { name: 'Movies & Outings' });

    // Verify budget category cascaded
    const updatedBudget = await db.budgets.get(budget.id);
    expect(updatedBudget?.category).toBe('Movies & Outings');

    // Delete category without transactions -> orphaned budget should be automatically cleaned up
    await categoryRepository.delete(entCat.id);
    const orphanedBudget = await db.budgets.get(budget.id);
    expect(orphanedBudget).toBeUndefined();
  });

  // 8. Idempotent Academic Reference Seeding (Table 7.3)
  it('Seeds exact academic reference dataset idempotently (exactly ₹15,000 income, ₹4,200 expenses, ₹10,800 balance)', async () => {
    // First seed
    const res1 = await seedAcademicReferenceData('append');
    expect(res1.insertedCount).toBe(4);

    const all1 = await transactionRepository.getAll();
    expect(all1.length).toBe(4);

    const summary = calculateFinancialSummary(all1);
    expect(paiseToRupees(summary.totalIncome)).toBe(15000);
    expect(paiseToRupees(summary.totalExpenses)).toBe(4200);
    expect(paiseToRupees(summary.netBalance)).toBe(10800);
    expect(summary.savingsRate).toBe(72);

    // Second seed (idempotent click)
    const res2 = await seedAcademicReferenceData('append');
    expect(res2.insertedCount).toBe(0);
    expect(res2.skippedCount).toBe(4);

    const all2 = await transactionRepository.getAll();
    // Count MUST remain 4, not 8!
    expect(all2.length).toBe(4);
  });

  // 9. Selective Demo Data Clearing
  it('Clears only demo records and preserves genuine user transactions', async () => {
    await seedAcademicReferenceData('append');
    await seedExtendedDemoData('append');

    // Add a real user-created transaction
    const userTx = await transactionRepository.add({
      type: 'expense',
      amount: 49900,
      category: 'Food',
      date: '2026-10-12',
      description: 'My genuine grocery bill',
    });

    const totalBefore = await db.transactions.count();
    expect(totalBefore).toBe(13); // 4 academic + 8 extended + 1 user

    // Clear demo records only
    const cleared = await clearDemoDataOnly();
    expect(cleared.removedCount).toBe(12);

    const totalAfter = await db.transactions.count();
    expect(totalAfter).toBe(1);

    const preservedTx = await transactionRepository.getById(userTx.id);
    expect(preservedTx).toBeDefined();
    expect(preservedTx?.description).toBe('My genuine grocery bill');
  });

  // 10. CSV Import with BOM & Duplicate Key Rejection
  it('Handles UTF-8 BOM, validates types, and rejects internal duplicate records', () => {
    const csvWithBOM = '\uFEFFType,Amount,Category,Date,Description\nExpense,350,Food,2026-10-01,Lunch\nIncome,5000,Freelance,2026-10-02,Client project';
    const resBOM = parseAndValidateCsv(csvWithBOM, []);
    expect(resBOM.importedCount).toBe(2);
    expect(resBOM.importedTransactions[0].type).toBe('expense');
    expect(resBOM.importedTransactions[0].amount).toBe(35000);

    // CSV with unknown type and invalid leap year date
    const malformedCsv = `Type,Amount,Category,Date,Description
UnknownType,500,Food,2026-10-01,Invalid type
Expense,200,Food,2026-02-30,Impossible February 30th date
Expense,400,Food,2026-10-05,First valid row
Expense,400,Food,2026-10-05,First valid row`; // duplicate

    const resMalformed = parseAndValidateCsv(malformedCsv, []);
    expect(resMalformed.errorCount).toBe(2); // unknown type & impossible date
    expect(resMalformed.skippedDuplicatesCount).toBe(1); // internal duplicate skipped
    expect(resMalformed.importedCount).toBe(1);
  });

  // 11. Atomic JSON Backup & Restore
  it('Restores application data in Replace mode atomically including settings', async () => {
    // Add existing dummy data
    await transactionRepository.add({
      type: 'expense',
      amount: 10000,
      category: 'Food',
      date: '2026-10-01',
    });

    const backupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: 'MMU Academic Test Suite',
      transactions: [
        {
          id: 'restored_tx_1',
          type: 'income',
          amount: 2000000, // ₹20,000
          category: 'Allowance',
          date: '2026-10-01',
          description: 'Restored income',
        },
      ],
      categories: [
        {
          id: 'restored_cat_1',
          name: 'Allowance',
          type: 'income',
          color: '#10B981',
          icon: 'Wallet',
          isCustom: false,
        },
      ],
      budgets: [
        {
          id: 'restored_bud_1',
          category: 'Allowance',
          limit: 1000000,
          month: '2026-10',
        },
      ],
      settings: {
        currency: 'INR',
        currencySymbol: '₹',
        enable3D: false,
        performanceMode: 'low',
        monthlyOverallBudget: 3000000,
      },
    };

    const restoreResult = await restoreApplicationBackup(backupPayload, 'replace');
    expect(restoreResult.success).toBe(true);
    expect(restoreResult.transactionsRestored).toBe(1);

    // Verify transactions were replaced
    const txs = await transactionRepository.getAll();
    expect(txs.length).toBe(1);
    expect(txs[0].id).toBe('restored_tx_1');

    // Verify settings were restored
    const settingsRecord = await db.settings.get('userSettings');
    expect(settingsRecord?.value.enable3D).toBe(false);
    expect(settingsRecord?.value.performanceMode).toBe('low');
  });
});
