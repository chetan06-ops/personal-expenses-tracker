import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Budget } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { rupeesToPaise, paiseToRupees } from '../../utils/currency';
import { getMonthKey } from '../../utils/date';
import { budgetFormSchema } from '../../services/validation/schemas';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  initialData?: Budget | null;
  defaultMonth?: string;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultMonth = getMonthKey(),
}) => {
  const { expenseCategories } = useCategories();

  const [category, setCategory] = useState<string>('TOTAL');
  const [limit, setLimit] = useState<string>('');
  const [month, setMonth] = useState<string>(defaultMonth);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category);
      setLimit(paiseToRupees(initialData.limit).toString());
      setMonth(initialData.month);
    } else {
      setCategory('TOTAL');
      setLimit('');
      setMonth(defaultMonth);
    }
    setErrors({});
  }, [initialData, defaultMonth, isOpen]);

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
      description="Set a spending cap for a specific category or your entire monthly expenses."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <option value="TOTAL" className="bg-slate-900 text-cyan-300 font-semibold">
            ★ Total Overall Monthly Spending
          </option>
          {expenseCategories.map((cat) => (
            <option key={cat.id} value={cat.name} className="bg-slate-900 text-white">
              {cat.name}
            </option>
          ))}
        </Select>

        <Input
          label="Budget Spending Limit (INR)"
          type="number"
          step="0.01"
          placeholder="e.g. 5000"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          error={errors.limit}
          leftAddon={<span className="font-mono text-cyan-400 font-semibold">₹</span>}
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

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
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
