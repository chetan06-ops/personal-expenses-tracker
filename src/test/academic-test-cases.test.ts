import { describe, it, expect } from 'vitest';
import { transactionFormSchema } from '../services/validation/schemas';
import {
  calculateFinancialSummary,
  calculateBudgetStatus,
  calculateDailySpending,
} from '../services/calculations/financialCalculations';
import { rupeesToPaise, paiseToRupees, formatINR } from '../utils/currency';
import { getDateRangeForPeriod, formatIndianDate } from '../utils/date';
import { generateTransactionsCsv } from '../services/export/csvExport';
import { parseAndValidateCsv } from '../services/import/csvImport';
import { validateBackupJson } from '../services/import/jsonRestore';
import { Transaction } from '../types';

describe('Academic Test Baseline (BCA-308 Table 7.1 & Master Specifications)', () => {
  // TC-01: Add a valid expense
  it('TC-01: Accepts and validates a valid expense transaction', () => {
    const input = {
      type: 'expense',
      amount: '2500',
      category: 'Education',
      date: '2026-10-03',
      description: 'Books and notes',
    };
    const result = transactionFormSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('expense');
      expect(result.data.amount).toBe(2500);
      expect(rupeesToPaise(result.data.amount)).toBe(250000);
      expect(result.data.category).toBe('Education');
    }
  });

  // TC-02: Add a valid income
  it('TC-02: Accepts and validates a valid income transaction', () => {
    const input = {
      type: 'income',
      amount: '15000',
      category: 'Allowance',
      date: '2026-10-01',
      description: 'Monthly allowance',
    };
    const result = transactionFormSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe('income');
      expect(result.data.amount).toBe(15000);
      expect(rupeesToPaise(result.data.amount)).toBe(1500000);
      expect(result.data.category).toBe('Allowance');
    }
  });

  // TC-03: Reject an empty amount
  it('TC-03: Rejects an empty amount', () => {
    const input = {
      type: 'expense',
      amount: '',
      category: 'Food',
      date: '2026-10-05',
    };
    const result = transactionFormSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorMsg = result.error.issues[0].message;
      expect(errorMsg).toMatch(/Amount is required and cannot be empty/i);
    }
  });

  // TC-04: Reject zero and negative amounts
  it('TC-04: Rejects zero and negative amounts', () => {
    const zeroInput = {
      type: 'expense',
      amount: '0',
      category: 'Food',
      date: '2026-10-05',
    };
    const zeroResult = transactionFormSchema.safeParse(zeroInput);
    expect(zeroResult.success).toBe(false);

    const negativeInput = {
      type: 'expense',
      amount: '-500',
      category: 'Food',
      date: '2026-10-05',
    };
    const negativeResult = transactionFormSchema.safeParse(negativeInput);
    expect(negativeResult.success).toBe(false);
    if (!negativeResult.success) {
      expect(negativeResult.error.issues[0].message).toMatch(/greater than zero/i);
    }
  });

  // TC-05: Reject alphabetic amounts
  it('TC-05: Rejects alphabetic and non-numeric amounts', () => {
    const input = {
      type: 'expense',
      amount: 'five hundred',
      category: 'Food',
      date: '2026-10-05',
    };
    const result = transactionFormSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/valid number/i);
    }
  });

  // TC-06: Add 1000 income and 250 expense. Verify balance = 750
  it('TC-06: Adds ₹1000 income and ₹250 expense. Verifies Net Balance = ₹750', () => {
    const txs: Transaction[] = [
      {
        id: 'tx_1',
        type: 'income',
        amount: rupeesToPaise(1000), // 100000 paise
        category: 'Allowance',
        date: '2026-10-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_2',
        type: 'expense',
        amount: rupeesToPaise(250), // 25000 paise
        category: 'Food',
        date: '2026-10-02',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const summary = calculateFinancialSummary(txs);
    expect(summary.totalIncome).toBe(100000);
    expect(summary.totalExpenses).toBe(25000);
    expect(summary.netBalance).toBe(75000);
    expect(paiseToRupees(summary.netBalance)).toBe(750);
    expect(summary.savingsAmount).toBe(75000);
    expect(summary.savingsRate).toBe(75); // (750 / 1000) * 100 = 75%
  });

  // TC-07: Filter by category
  it('TC-07: Correctly categorizes and calculates spending distribution', () => {
    const txs: Transaction[] = [
      {
        id: 'tx_1',
        type: 'expense',
        amount: rupeesToPaise(1200),
        category: 'Food',
        date: '2026-10-05',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_2',
        type: 'expense',
        amount: rupeesToPaise(500),
        category: 'Travel',
        date: '2026-10-06',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_3',
        type: 'expense',
        amount: rupeesToPaise(800),
        category: 'Food',
        date: '2026-10-07',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const summary = calculateFinancialSummary(txs);
    expect(summary.categoryBreakdown.length).toBe(2);

    const foodCat = summary.categoryBreakdown.find((c) => c.category === 'Food');
    const travelCat = summary.categoryBreakdown.find((c) => c.category === 'Travel');

    expect(foodCat).toBeDefined();
    expect(foodCat?.amount).toBe(rupeesToPaise(2000));
    expect(foodCat?.count).toBe(2);

    expect(travelCat).toBeDefined();
    expect(travelCat?.amount).toBe(rupeesToPaise(500));
    expect(travelCat?.count).toBe(1);
  });

  // TC-08: Academic Table 7.3 complete dataset verification
  it('TC-08: Verifies full academic reference dataset (Allowance ₹15,000, Education ₹2,500, Food ₹1,200, Travel ₹500)', () => {
    const academicDataset: Transaction[] = [
      {
        id: 'seed_1',
        type: 'income',
        amount: rupeesToPaise(15000),
        category: 'Allowance',
        date: '2026-10-01',
        description: 'Monthly allowance',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'seed_2',
        type: 'expense',
        amount: rupeesToPaise(2500),
        category: 'Education',
        date: '2026-10-03',
        description: 'Books and notes',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'seed_3',
        type: 'expense',
        amount: rupeesToPaise(1200),
        category: 'Food',
        date: '2026-10-05',
        description: 'Groceries',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'seed_4',
        type: 'expense',
        amount: rupeesToPaise(500),
        category: 'Travel',
        date: '2026-10-06',
        description: 'Local travel',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const summary = calculateFinancialSummary(academicDataset);
    expect(paiseToRupees(summary.totalIncome)).toBe(15000);
    expect(paiseToRupees(summary.totalExpenses)).toBe(4200);
    expect(paiseToRupees(summary.netBalance)).toBe(10800);
    expect(summary.savingsRate).toBe(72); // (10800 / 15000) * 100 = 72%
  });

  // TC-09: Delete a transaction and verify totals update
  it('TC-09: Deleting a transaction updates totals accurately', () => {
    let dataset: Transaction[] = [
      {
        id: 'tx_1',
        type: 'income',
        amount: rupeesToPaise(5000),
        category: 'Freelance',
        date: '2026-10-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'tx_2',
        type: 'expense',
        amount: rupeesToPaise(2000),
        category: 'Bills',
        date: '2026-10-02',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    let summary = calculateFinancialSummary(dataset);
    expect(paiseToRupees(summary.netBalance)).toBe(3000);

    // Delete tx_2
    dataset = dataset.filter((tx) => tx.id !== 'tx_2');
    summary = calculateFinancialSummary(dataset);

    expect(paiseToRupees(summary.totalExpenses)).toBe(0);
    expect(paiseToRupees(summary.netBalance)).toBe(5000);
  });

  // TC-10: Edit a transaction and verify all relevant totals recalculate
  it('TC-10: Editing a transaction recalculates all totals', () => {
    let dataset: Transaction[] = [
      {
        id: 'tx_1',
        type: 'expense',
        amount: rupeesToPaise(1000),
        category: 'Shopping',
        date: '2026-10-01',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    let summary = calculateFinancialSummary(dataset);
    expect(paiseToRupees(summary.totalExpenses)).toBe(1000);

    // Edit amount to ₹1850.50
    dataset = dataset.map((tx) =>
      tx.id === 'tx_1' ? { ...tx, amount: rupeesToPaise(1850.5) } : tx
    );
    summary = calculateFinancialSummary(dataset);

    expect(summary.totalExpenses).toBe(185050);
    expect(paiseToRupees(summary.totalExpenses)).toBe(1850.5);
  });

  // Additional Test: Precision with decimals & minor units (paise)
  it('Handles complex decimal amounts precisely without floating point inaccuracies', () => {
    const p1 = rupeesToPaise(12.34);
    const p2 = rupeesToPaise(56.78);
    const totalPaise = p1 + p2;
    expect(totalPaise).toBe(6912);
    expect(paiseToRupees(totalPaise)).toBe(69.12);
    expect(formatINR(totalPaise)).toContain('69.12');
  });

  // Additional Test: Large amounts (Crores)
  it('Formats large amounts correctly in Indian Lakh / Crore notation', () => {
    const crorePaise = rupeesToPaise(12500000); // 1.25 Crore
    const formatted = formatINR(crorePaise, { compact: true });
    expect(formatted).toBe('₹1.25 Cr');
  });

  // Additional Test: Date Period Boundaries
  it('Computes valid date boundaries for this-month and this-year', () => {
    const monthRange = getDateRangeForPeriod('this-month');
    expect(monthRange.startDate).toMatch(/^\d{4}-\d{2}-01$/);
    expect(monthRange.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const yearRange = getDateRangeForPeriod('this-year');
    expect(yearRange.startDate).toMatch(/^\d{4}-01-01$/);
    expect(yearRange.endDate).toMatch(/^\d{4}-12-31$/);
  });

  // Additional Test: Budget Thresholds and Alerts
  it('Correctly classifies budget status into normal, warning (80%+), and danger (>100%)', () => {
    const limit = rupeesToPaise(10000); // ₹10,000

    const safeStatus = calculateBudgetStatus(limit, rupeesToPaise(5000));
    expect(safeStatus.status).toBe('normal');
    expect(safeStatus.isOverBudget).toBe(false);
    expect(safeStatus.isNearLimit).toBe(false);

    const warningStatus = calculateBudgetStatus(limit, rupeesToPaise(8500));
    expect(warningStatus.status).toBe('warning');
    expect(warningStatus.isOverBudget).toBe(false);
    expect(warningStatus.isNearLimit).toBe(true);

    const dangerStatus = calculateBudgetStatus(limit, rupeesToPaise(10500));
    expect(dangerStatus.status).toBe('danger');
    expect(dangerStatus.isOverBudget).toBe(true);
  });

  // Additional Test: CSV Export Formula Injection Defense
  it('Protects CSV export against spreadsheet formula injection', () => {
    const maliciousTxs: Transaction[] = [
      {
        id: 'tx_malicious',
        type: 'expense',
        amount: rupeesToPaise(500),
        category: 'Food',
        date: '2026-10-01',
        description: '=cmd|/c calc.exe!A1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const csv = generateTransactionsCsv(maliciousTxs);
    // Description should be prepended with single quote "'" inside quotes
    expect(csv).toContain("\"'=cmd|/c calc.exe!A1\"");
  });

  // Additional Test: CSV Import with Duplicate Detection
  it('Parses CSV rows, rejects invalid formats, and prevents duplicates', () => {
    const csvData = `Type,Amount,Category,Date,Description
Expense,500,Food,2026-10-01,Groceries
Income,10000,Salary,2026-10-02,October Pay
Expense,-20,Travel,2026-10-03,Negative invalid amount
Expense,abc,Education,2026-10-04,Invalid amount`;

    const result = parseAndValidateCsv(csvData, []);
    expect(result.importedCount).toBe(2);
    expect(result.errorCount).toBe(2); // negative and abc rows rejected
  });

  // Additional Test: JSON Backup Validation
  it('Validates JSON application backup schema and rejects malformed objects', () => {
    const validBackup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      source: 'Test',
      transactions: [
        {
          id: 'tx_1',
          type: 'income',
          amount: 100000,
          category: 'Allowance',
          date: '2026-10-01',
        },
      ],
      categories: [{ id: 'cat_1', name: 'Food', type: 'expense' }],
      budgets: [],
      settings: null,
    };
    expect(validateBackupJson(validBackup)).toBe(true);

    const invalidBackup = { version: 'invalid', data: 123 };
    expect(validateBackupJson(invalidBackup)).toBe(false);
  });
});
