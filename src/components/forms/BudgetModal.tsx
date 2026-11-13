import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Budget } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { useTransactions } from '../../hooks/useTransactions';
import { rupeesToPaise, paiseToRupees, formatINR } from '../../utils/currency';
import { getMonthKey } from '../../utils/date';
import { budgetFormSchema } from '../../services/validation/schemas';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  initialData?: Budget | null;
  defaultMonth?: string;
  initialCategory?: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultMonth = getMonthKey(),
  initialCategory,
}) => {
  const { expenseCategories } = useCategories();
  const { allTransactions } = useTransactions();

  const [category, setCategory] = useState<string>('TOTAL');
  const [limit, setLimit] = useState<string>('');
  const [month, setMonth] = useState<string>(defaultMonth);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setCategory(initialData.category);
      setLimit(paiseToRupees(initialData.limit).toString());
      setMonth(initialData.month);
    } else {
      setCategory(initialCategory || 'TOTAL');
      setLimit('');
      setMonth(defaultMonth);
    }
    setErrors({});
  }, [initialData, defaultMonth, initialCategory, isOpen]);

  // Real spent amount for the selected category and month so user has immediate context
  const currentSpentPaise = useMemo(() => {
    return allTransactions
      .filter((tx) => {
        if (tx.type !== 'expense' || !tx.date.startsWith(month)) return false;
        return category === 'TOTAL' ? true : tx.category === category;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [allTransactions, category, month]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = budgetFormSchema.safeParse({
      category,
      limit,
      month,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const limitPaise = rupeesToPaise(validationResult.data.limit);

      await onSubmit({
        category,
        limit: limitPaise,
        month,
      });

      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save budget.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Budget Target' : 'Create Budget Limit'}
      description="Set a monthly spending cap for a specific category or your overall monthly expenses."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errors.form}
          </div>
        )}

        <Select
          label="Budget Scope / Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={errors.category}
          required
        >
          <option value="TOTAL" className="bg-[#0D131F] text-cyan-300 font-semibold">
            ★ Overall Monthly Spending Limit
          </option>
          {expenseCategories.map((cat) => (
            <option key={cat.id} value={cat.name} className="bg-[#0D131F] text-white">
              {cat.name}
            </option>
          ))}
        </Select>

        {/* Live Context Banner */}
        <div className="p-3 rounded-xl bg-[#090E18] border border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Actual spent ({category === 'TOTAL' ? 'All Categories' : category}) in {month}
          </span>
          <span className="font-mono font-bold text-slate-200 tabular-nums">
            {formatINR(currentSpentPaise)}
          </span>
        </div>

        <Input
          label="Budget Spending Limit (INR)"
          type="number"
          step="0.01"
          min="1"
          placeholder="e.g. 5000"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          error={errors.limit}
          leftAddon={<span className="font-mono text-cyan-400 font-semibold">₹</span>}
          className="font-mono tabular-nums"
          required
        />

        <Input
          label="Target Month (YYYY-MM)"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          error={errors.month}
          required
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {initialData ? 'Update Budget' : 'Save Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
