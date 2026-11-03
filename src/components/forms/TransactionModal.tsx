import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Transaction, TransactionType } from '../../types';
import { useCategories } from '../../hooks/useCategories';
import { rupeesToPaise, paiseToRupees } from '../../utils/currency';
import { getTodayDateString } from '../../utils/date';
import { transactionFormSchema } from '../../services/validation/schemas';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<any>;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { expenseCategories, incomeCategories } = useCategories();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state when editing or opening
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(paiseToRupees(initialData.amount).toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description || '');
    } else {
      setType('expense');
      setAmount('');
      const defaultCat = expenseCategories[0]?.name || 'Food';
      setCategory(defaultCat);
      setDate(getTodayDateString());
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Keep category aligned with selected type
  const availableCategories = type === 'expense' ? expenseCategories : incomeCategories;

  useEffect(() => {
    if (!initialData && availableCategories.length > 0) {
      const match = availableCategories.some((c) => c.name === category);
      if (!match) {
        setCategory(availableCategories[0].name);
      }
    }
  }, [type, availableCategories, initialData, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod schema
    const validationResult = transactionFormSchema.safeParse({
      type,
      amount,
      category,
      date,
      description,
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
      const parsedAmount = validationResult.data.amount;
      const amountPaise = rupeesToPaise(parsedAmount);

      await onSubmit({
        type,
        amount: amountPaise,
        category,
        date,
        description: description.trim() || undefined,
      });

      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save transaction.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record Transaction'}
      description="Enter transaction details below. All entries are stored securely in your browser."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errors.form}
          </div>
        )}

        {/* Type Toggle: Expense / Income */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Transaction Type <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (expenseCategories.length > 0) setCategory(expenseCategories[0].name);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                type === 'expense'
                  ? 'bg-rose-600/90 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (incomeCategories.length > 0) setCategory(incomeCategories[0].name);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                type === 'income'
                  ? 'bg-emerald-600/90 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Income</span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <Input
          label="Amount (INR)"
          type="number"
          step="0.01"
          placeholder="e.g. 500 or 1250.50"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          leftAddon={<span className="font-mono text-cyan-400 font-semibold">₹</span>}
          required
        />

        {/* Category and Date row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            error={errors.category}
            required
          >
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.name} className="bg-slate-900 text-white">
                {cat.name}
              </option>
            ))}
          </Select>

          <Input
            label="Transaction Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            required
          >
          </Input>
        </div>

        {/* Optional Description */}
        <Input
          label="Description / Notes (Optional)"
          type="text"
          placeholder="e.g. Books for BCA-308, Grocery shopping"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          helperText="Maximum 255 characters"
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant={type === 'expense' ? 'danger' : 'primary'}
            size="sm"
            isLoading={isSubmitting}
          >
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
