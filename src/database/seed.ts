import { db } from './db';
import { Transaction, Budget } from '../types';
import { rupeesToPaise } from '../utils/currency';

/**
 * DATASET A: Exact Academic Reference Dataset
 * Directly from Project Report Chapter 7, Table 7.3:
 * 1. Income:  ₹15,000 | Allowance | 01-10-2026 | Monthly allowance
 * 2. Expense:  ₹2,500 | Education | 03-10-2026 | Books and notes
 * 3. Expense:  ₹1,200 | Food      | 05-10-2026 | Groceries
 * 4. Expense:    ₹500 | Travel    | 06-10-2026 | Local travel
 *
 * Expected Totals:
 * Total Income:   ₹15,000 (1,500,000 paise)
 * Total Expenses:  ₹4,200   (420,000 paise)
 * Net Balance:    ₹10,800 (1,080,000 paise)
 * Savings Rate:   72%
 */
export const ACADEMIC_REFERENCE_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo_academic_tx_1',
    type: 'income',
    amount: rupeesToPaise(15000),
    category: 'Allowance',
    date: '2026-10-01',
    description: 'Monthly allowance',
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'demo_academic_tx_2',
    type: 'expense',
    amount: rupeesToPaise(2500),
    category: 'Education',
    date: '2026-10-03',
    description: 'Books and notes',
    createdAt: '2026-10-03T11:30:00.000Z',
    updatedAt: '2026-10-03T11:30:00.000Z',
  },
  {
    id: 'demo_academic_tx_3',
    type: 'expense',
    amount: rupeesToPaise(1200),
    category: 'Food',
    date: '2026-10-05',
    description: 'Groceries',
    createdAt: '2026-10-05T14:15:00.000Z',
    updatedAt: '2026-10-05T14:15:00.000Z',
  },
  {
    id: 'demo_academic_tx_4',
    type: 'expense',
    amount: rupeesToPaise(500),
    category: 'Travel',
    date: '2026-10-06',
    description: 'Local travel',
    createdAt: '2026-10-06T17:45:00.000Z',
    updatedAt: '2026-10-06T17:45:00.000Z',
  },
];

export const ACADEMIC_REFERENCE_BUDGETS: Budget[] = [
  {
    id: 'demo_academic_bud_1',
    category: 'TOTAL',
    limit: rupeesToPaise(10000),
    month: '2026-10',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'demo_academic_bud_2',
    category: 'Education',
    limit: rupeesToPaise(3000),
    month: '2026-10',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'demo_academic_bud_3',
    category: 'Food',
    limit: rupeesToPaise(2000),
    month: '2026-10',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'demo_academic_bud_4',
    category: 'Travel',
    limit: rupeesToPaise(1000),
    month: '2026-10',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  },
];

/**
 * DATASET B: Optional Extended Demo Dataset
 * Additional illustrative records for demonstrating charts, categories, and 3D Financial Orbit.
 */
export const EXTENDED_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'demo_ext_tx_1',
    type: 'expense',
    amount: rupeesToPaise(850),
    category: 'Entertainment',
    date: '2026-10-10',
    description: 'Movie tickets & streaming',
    createdAt: '2026-10-10T19:00:00.000Z',
    updatedAt: '2026-10-10T19:00:00.000Z',
  },
  {
    id: 'demo_ext_tx_2',
    type: 'expense',
    amount: rupeesToPaise(1450),
    category: 'Bills',
    date: '2026-10-15',
    description: 'Mobile recharge & electricity',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'demo_ext_tx_3',
    type: 'expense',
    amount: rupeesToPaise(2100),
    category: 'Shopping',
    date: '2026-10-20',
    description: 'Stationery and apparel',
    createdAt: '2026-10-20T16:30:00.000Z',
    updatedAt: '2026-10-20T16:30:00.000Z',
  },
  {
    id: 'demo_ext_tx_4',
    type: 'income',
    amount: rupeesToPaise(6000),
    category: 'Freelance',
    date: '2026-10-25',
    description: 'Web development milestone payment',
    createdAt: '2026-10-25T12:00:00.000Z',
    updatedAt: '2026-10-25T12:00:00.000Z',
  },
  {
    id: 'demo_ext_tx_5',
    type: 'expense',
    amount: rupeesToPaise(600),
    category: 'Health',
    date: '2026-10-28',
    description: 'Pharmacy and medical checkup',
    createdAt: '2026-10-28T15:00:00.000Z',
    updatedAt: '2026-10-28T15:00:00.000Z',
  },
  // November records (next month trend)
  {
    id: 'demo_ext_tx_6',
    type: 'income',
    amount: rupeesToPaise(16000),
    category: 'Allowance',
    date: '2026-11-01',
    description: 'November semester allowance',
    createdAt: '2026-11-01T09:00:00.000Z',
    updatedAt: '2026-11-01T09:00:00.000Z',
  },
  {
    id: 'demo_ext_tx_7',
    type: 'expense',
    amount: rupeesToPaise(1500),
    category: 'Food',
    date: '2026-11-02',
    description: 'Monthly mess charges',
    createdAt: '2026-11-02T13:00:00.000Z',
    updatedAt: '2026-11-02T13:00:00.000Z',
  },
  {
    id: 'demo_ext_tx_8',
    type: 'expense',
    amount: rupeesToPaise(750),
    category: 'Travel',
    date: '2026-11-03',
    description: 'Bus pass renewal',
    createdAt: '2026-11-03T08:30:00.000Z',
    updatedAt: '2026-11-03T08:30:00.000Z',
  },
];

export const EXTENDED_DEMO_BUDGETS: Budget[] = [
  {
    id: 'demo_ext_bud_1',
    category: 'TOTAL',
    limit: rupeesToPaise(15000),
    month: '2026-11',
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
  {
    id: 'demo_ext_bud_2',
    category: 'Food',
    limit: rupeesToPaise(3000),
    month: '2026-11',
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
  {
    id: 'demo_ext_bud_3',
    category: 'Travel',
    limit: rupeesToPaise(1500),
    month: '2026-11',
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  },
];

export interface SeedingResult {
  insertedCount: number;
  skippedCount: number;
  message: string;
}

/**
 * Idempotently loads the Exact Academic Reference Dataset (Table 7.3).
 * Repeated clicks never duplicate records.
 * mode 'append': adds the 4 records without touching existing user records.
 * mode 'replace': clears existing academic demo records and reinserts the 4 records.
 */
export async function seedAcademicReferenceData(
  mode: 'append' | 'replace' = 'append'
): Promise<SeedingResult> {
  return await db.transaction('rw', [db.transactions, db.budgets], async () => {
    if (mode === 'replace') {
      const existingDemoTxs = await db.transactions
        .filter((tx) => tx.id.startsWith('demo_academic_'))
        .toArray();
      await db.transactions.bulkDelete(existingDemoTxs.map((t) => t.id));

      const existingDemoBudgets = await db.budgets
        .filter((b) => b.id.startsWith('demo_academic_'))
        .toArray();
      await db.budgets.bulkDelete(existingDemoBudgets.map((b) => b.id));
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const tx of ACADEMIC_REFERENCE_TRANSACTIONS) {
      const exists = await db.transactions.get(tx.id);
      if (exists) {
        skippedCount++;
      } else {
        await db.transactions.add(tx);
        insertedCount++;
      }
    }

    for (const bud of ACADEMIC_REFERENCE_BUDGETS) {
      const exists = await db.budgets.get(bud.id);
      if (!exists) {
        await db.budgets.add(bud);
      }
    }

    return {
      insertedCount,
      skippedCount,
      message: `Academic Reference Dataset: ${insertedCount} transactions added, ${skippedCount} already existed (idempotent).`,
    };
  });
}

/**
 * Idempotently loads the Extended Demo Dataset.
 */
export async function seedExtendedDemoData(
  mode: 'append' | 'replace' = 'append'
): Promise<SeedingResult> {
  return await db.transaction('rw', [db.transactions, db.budgets], async () => {
    if (mode === 'replace') {
      const existingDemoTxs = await db.transactions
        .filter((tx) => tx.id.startsWith('demo_ext_'))
        .toArray();
      await db.transactions.bulkDelete(existingDemoTxs.map((t) => t.id));

      const existingDemoBudgets = await db.budgets
        .filter((b) => b.id.startsWith('demo_ext_'))
        .toArray();
      await db.budgets.bulkDelete(existingDemoBudgets.map((b) => b.id));
    }

    let insertedCount = 0;
    let skippedCount = 0;

    for (const tx of EXTENDED_DEMO_TRANSACTIONS) {
      const exists = await db.transactions.get(tx.id);
      if (exists) {
        skippedCount++;
      } else {
        await db.transactions.add(tx);
        insertedCount++;
      }
    }

    for (const bud of EXTENDED_DEMO_BUDGETS) {
      const exists = await db.budgets.get(bud.id);
      if (!exists) {
        await db.budgets.add(bud);
      }
    }

    return {
      insertedCount,
      skippedCount,
      message: `Extended Demo Dataset: ${insertedCount} transactions added, ${skippedCount} already existed (idempotent).`,
    };
  });
}

/**
 * Removes only demo records (starting with 'demo_'), leaving user records intact.
 */
export async function clearDemoDataOnly(): Promise<{ removedCount: number }> {
  return await db.transaction('rw', [db.transactions, db.budgets], async () => {
    const demoTxs = await db.transactions
      .filter((tx) => tx.id.startsWith('demo_'))
      .toArray();
    await db.transactions.bulkDelete(demoTxs.map((t) => t.id));

    const demoBudgets = await db.budgets
      .filter((b) => b.id.startsWith('demo_'))
      .toArray();
    await db.budgets.bulkDelete(demoBudgets.map((b) => b.id));

    return { removedCount: demoTxs.length };
  });
}
