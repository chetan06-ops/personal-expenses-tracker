import { db } from './db';
import { Transaction, Budget } from '../types';
import { rupeesToPaise } from '../utils/currency';

/**
 * Academic test dataset directly from Project Report Table 7.3
 * Total Income: ₹15,000
 * Total Expenses: ₹4,200 (2500 + 1200 + 500)
 * Expected Balance: ₹10,800
 */
export const ACADEMIC_SAMPLE_TRANSACTIONS: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    type: 'income',
    amount: rupeesToPaise(15000),
    category: 'Allowance',
    date: '2026-10-01',
    description: 'Monthly allowance',
  },
  {
    type: 'expense',
    amount: rupeesToPaise(2500),
    category: 'Education',
    date: '2026-10-03',
    description: 'Books and notes',
  },
  {
    type: 'expense',
    amount: rupeesToPaise(1200),
    category: 'Food',
    date: '2026-10-05',
    description: 'Groceries',
  },
  {
    type: 'expense',
    amount: rupeesToPaise(500),
    category: 'Travel',
    date: '2026-10-06',
    description: 'Local travel',
  },
  // Additional realistic transactions to make 3D visualization and reports complete
  {
    type: 'expense',
    amount: rupeesToPaise(850),
    category: 'Entertainment',
    date: '2026-10-10',
    description: 'Movie tickets & snacks',
  },
  {
    type: 'expense',
    amount: rupeesToPaise(1450),
    category: 'Bills',
    date: '2026-10-15',
    description: 'Mobile recharge and internet',
  },
  {
    type: 'expense',
    amount: rupeesToPaise(2100),
    category: 'Shopping',
    date: '2026-10-20',
    description: 'Casual clothing',
  },
  {
    type: 'income',
    amount: rupeesToPaise(6000),
    category: 'Freelance',
    date: '2026-10-25',
    description: 'Web design project milestone',
  },
  {
    type: 'expense',
    amount: rupeesToPaise(600),
    category: 'Health',
    date: '2026-10-28',
    description: 'Vitamins and pharmacy',
  },
  // November 2026 entries (current period)
  {
    type: 'income',
    amount: rupeesToPaise(16000),
    category: 'Allowance',
    date: '2026-11-01',
    description: 'Semester allowance',
  },
  {
    type: 'expense',
    amount: rupeesToPaise(1500),
    category: 'Food',
    date: '2026-11-02',
    description: 'Mess food & dining',
  },
  {
    type: 'expense',
    amount: rupeesToPaise(400),
    category: 'Travel',
    date: '2026-11-03',
    description: 'Metro card top-up',
  },
];

export async function seedAcademicData(): Promise<void> {
  const now = new Date().toISOString();
  const txs: Transaction[] = ACADEMIC_SAMPLE_TRANSACTIONS.map((tx, idx) => ({
    ...tx,
    id: `seed_tx_${Date.now()}_${idx + 1}`,
    createdAt: now,
    updatedAt: now,
  }));

  await db.transactions.bulkAdd(txs);

  // Seed sample budgets
  const sampleBudgets: Budget[] = [
    {
      id: `bud_1`,
      category: 'Food',
      limit: rupeesToPaise(5000),
      month: '2026-11',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `bud_2`,
      category: 'Travel',
      limit: rupeesToPaise(2000),
      month: '2026-11',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `bud_3`,
      category: 'Education',
      limit: rupeesToPaise(4000),
      month: '2026-11',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `bud_4`,
      category: 'TOTAL',
      limit: rupeesToPaise(20000),
      month: '2026-11',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.budgets.bulkPut(sampleBudgets);
}
