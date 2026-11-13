import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  calculateMonthComparison,
  calculateSafeDailyAllowance,
  calculateFinancialInsights,
} from '../services/calculations/financialCalculations';
import { rupeesToPaise, formatINR } from '../utils/currency';
import { formatMonthLabel } from '../utils/date';
import { Transaction, Budget } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { PeriodFilterBar } from '../components/ui/PeriodFilterBar';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TransactionModal } from '../components/forms/TransactionModal';
import { Receipt } from 'lucide-react';

vi.mock('../hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { id: 'cat_exp_1', name: 'Food', type: 'expense', color: '#F97316', icon: 'Utensils', isCustom: false, createdAt: '' },
      { id: 'cat_inc_1', name: 'Allowance', type: 'income', color: '#10B981', icon: 'HandCoins', isCustom: false, createdAt: '' },
    ],
    expenseCategories: [
      { id: 'cat_exp_1', name: 'Food', type: 'expense', color: '#F97316', icon: 'Utensils', isCustom: false, createdAt: '' },
    ],
    incomeCategories: [
      { id: 'cat_inc_1', name: 'Allowance', type: 'income', color: '#10B981', icon: 'HandCoins', isCustom: false, createdAt: '' },
    ],
    categoriesMap: new Map(),
  }),
}));

describe('Financial Insights & Calculations Suite', () => {
  it('Calculates exact month-over-month spending and income comparison in paise', () => {
    const txs: Transaction[] = [
      {
        id: '1',
        type: 'expense',
        amount: rupeesToPaise(2000),
        category: 'Food',
        date: '2026-10-10',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        type: 'expense',
        amount: rupeesToPaise(1500),
        category: 'Food',
        date: '2026-11-05',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '3',
        type: 'income',
        amount: rupeesToPaise(10000),
        category: 'Allowance',
        date: '2026-10-01',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '4',
        type: 'income',
        amount: rupeesToPaise(12000),
        category: 'Allowance',
        date: '2026-11-01',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const refDate = new Date(2026, 10, 12); // Nov 12, 2026
    const res = calculateMonthComparison(txs, refDate);
    expect(res.currentMonthKey).toBe('2026-11');
    expect(res.previousMonthKey).toBe('2026-10');
    expect(res.currentExpenses).toBe(150000);
    expect(res.previousExpenses).toBe(200000);
    expect(res.expenseDeltaPct).toBe(-25);
    expect(res.incomeDeltaPct).toBe(20);
  });

  it('Computes remaining days and safe daily allowance using integer floor math', () => {
    // Nov 2026 has 30 days. On Nov 21, 10 days remain (21..30 inclusive).
    const refDate = new Date(2026, 10, 21);
    const { daysRemaining, safeDailyPaise } = calculateSafeDailyAllowance(
      rupeesToPaise(10000),
      rupeesToPaise(7000),
      refDate
    );
    expect(daysRemaining).toBe(10);
    expect(safeDailyPaise).toBe(rupeesToPaise(300));
  });

  it('Generates deterministic insights solely from provided transactions and budgets', () => {
    const txs: Transaction[] = [
      {
        id: '1',
        type: 'expense',
        amount: rupeesToPaise(3000),
        category: 'Food',
        date: '2026-11-02',
        createdAt: '',
        updatedAt: '',
      },
      {
        id: '2',
        type: 'expense',
        amount: rupeesToPaise(1000),
        category: 'Travel',
        date: '2026-11-03',
        createdAt: '',
        updatedAt: '',
      },
    ];
    const budgets: Budget[] = [
      {
        id: 'b1',
        category: 'Food',
        limit: rupeesToPaise(5000),
        month: '2026-11',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const insights = calculateFinancialInsights({
      filteredTransactions: txs,
      allTransactions: txs,
      budgets,
      overallBudgetLimitPaise: rupeesToPaise(20000),
      referenceDate: new Date(2026, 10, 12),
    });

    const topSpend = insights.find((i) => i.id === 'top-category');
    expect(topSpend).toBeDefined();
    expect(topSpend?.title).toContain('Food');

    const pace = insights.find((i) => i.id === 'spending-pace');
    expect(pace?.metric).toContain('₹2,000');

    const compliance = insights.find((i) => i.id === 'budget-compliance');
    expect(compliance?.metric).toBe('1/1 OK');
  });
});

describe('Refined UI & Form Components Suite', () => {
  it('Renders EmptyState and fires primary action callback', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        icon={<Receipt />}
        title="No Entries"
        description="Add an entry to continue"
        actionLabel="Add Entry"
        onAction={onAction}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('Shows custom date range inputs in PeriodFilterBar when Custom is active', () => {
    const onPeriodChange = vi.fn();
    const { rerender } = render(
      <PeriodFilterBar period="this-month" onPeriodChange={onPeriodChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Custom' }));
    expect(onPeriodChange).toHaveBeenCalledWith('custom');

    rerender(
      <PeriodFilterBar
        period="custom"
        onPeriodChange={onPeriodChange}
        customStart="2026-10-01"
        customEnd="2026-10-31"
      />
    );
    expect(screen.getByLabelText('Start Date')).toHaveValue('2026-10-01');
    expect(screen.getByLabelText('End Date')).toHaveValue('2026-10-31');
  });

  it('Renders CategoryIcon with tinted container and ConfirmDialog variants', () => {
    const { container } = render(<CategoryIcon name="Utensils" color="#F97316" />);
    expect(container.firstChild).toBeInTheDocument();

    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={onConfirm}
        title="Load Dataset"
        message="Confirm loading dataset?"
        variant="primary"
        confirmText="Proceed"
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Validates TransactionModal input and submits exact integer paise', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <TransactionModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );

    // Submit with empty amount should show validation error and NOT submit
    fireEvent.click(screen.getByRole('button', { name: 'Save Transaction' }));
    expect(await screen.findByText(/Amount is required and cannot be empty/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();

    // Fill valid decimal amount ₹1,250.50 and submit
    const amountInput = screen.getByLabelText(/Amount \(INR\)/i);
    fireEvent.change(amountInput, { target: { value: '1250.50' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Transaction' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0][0].amount).toBe(125050);
    expect(onSubmit.mock.calls[0][0].type).toBe('expense');
    expect(onSubmit.mock.calls[0][0].category).toBe('Food');
  });

  it('Handles invalid month labels and negative compact INR values safely', () => {
    expect(formatMonthLabel('')).toBe('Invalid Month');
    expect(formatMonthLabel('invalid')).toBe('invalid');
    expect(formatMonthLabel('2026-11')).toContain('2026');
    expect(formatINR(-rupeesToPaise(250000), { compact: true })).toBe('-₹2.50 L');
  });
});
