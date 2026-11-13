import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CategoryIcon } from '../ui/CategoryIcon';
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

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

  const availableCategories = type === 'expense' ? expenseCategories : incomeCategories;

  const selectedCategoryObj = useMemo(
    () => availableCategories.find((c) => c.name === category),
    [availableCategories, category]
  );

  // Sync state when editing or opening
  useEffect(() => {
    if (!isOpen) return;
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
  useEffect(() => {
    if (availableCategories.length > 0) {
      const match = availableCategories.some((c) => c.name === category);
      if (!match && (!initialData || type !== initialData.type)) {
        setCategory(availableCategories[0].name);
      }
    }
  }, [type, availableCategories, initialData, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
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

  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record Transaction'}
      description="All entries are validated and stored locally in IndexedDB with paise precision."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {errors.form}
          </div>
        )}

        {/* Type Toggle: Expense / Income */}
        <div>
          <span className="block text-xs font-medium text-slate-300 mb-1.5">
            Transaction Type <span className="text-rose-400">*</span>
          </span>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#090E18] rounded-xl border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (expenseCategories.length > 0) setCategory(expenseCategories[0].name);
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
                type === 'expense'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white border border-transparent'
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
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white border border-transparent'
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
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          leftAddon={<span className="font-mono text-cyan-400 font-semibold">₹</span>}
          className="font-mono text-base font-semibold tabular-nums"
          required
          autoFocus
        />

        {/* Category and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              error={errors.category}
              required
            >
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-[#0D131F] text-white">
                  {cat.name}
                </option>
              ))}
            </Select>
            {selectedCategoryObj && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <CategoryIcon
                  name={selectedCategoryObj.icon}
                  color={selectedCategoryObj.color}
                  size="sm"
                  className="w-5 h-5 rounded-md"
                />
                <span>{selectedCategoryObj.name}</span>
              </div>
            )}
          </div>

          <div>
            <Input
              label="Transaction Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
              required
            />
            <div className="flex items-center gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setDate(today)}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                  date === today
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(yesterday)}
                className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                  date === yesterday
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Yesterday
              </button>
            </div>
          </div>
        </div>

        {/* Optional Description */}
        <div>
          <Input
            label="Description / Notes (Optional)"
            type="text"
            maxLength={255}
            placeholder="e.g. Books for semester, Grocery shopping"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px] font-mono text-slate-500 tabular-nums">
              {description.length}/255
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
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
