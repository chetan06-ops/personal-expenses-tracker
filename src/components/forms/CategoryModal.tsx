import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Category, TransactionType } from '../../types';
import { categoryFormSchema } from '../../services/validation/schemas';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt' | 'isCustom'>) => Promise<any>;
  initialData?: Category | null;
}

const PRESET_COLORS = [
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
  '#EF4444', '#F97316', '#F59E0B', '#10B981',
  '#14B8A6', '#6366F1', '#A855F7', '#64748B',
];

const PRESET_ICONS = [
  'Tag', 'ShoppingBag', 'Utensils', 'Car', 'GraduationCap',
  'Receipt', 'HeartPulse', 'Film', 'Briefcase', 'HandCoins',
  'Laptop', 'TrendingUp', 'Gift', 'Coins', 'Sparkles', 'Home',
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#06B6D4');
  const [icon, setIcon] = useState('Tag');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setColor(initialData.color);
      setIcon(initialData.icon);
    } else {
      setName('');
      setType('expense');
      setColor('#06B6D4');
      setIcon('Tag');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = categoryFormSchema.safeParse({
      name,
      type,
      color,
      icon,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: validationResult.data.name,
        type: validationResult.data.type,
        color: validationResult.data.color,
        icon: validationResult.data.icon,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save category.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Category' : 'Create Custom Category'}
      description="Add a personalized spending or income category to organize your transactions."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errors.form}
          </div>
        )}

        <Input
          label="Category Name"
          type="text"
          placeholder="e.g. Gym, Freelance, Subscriptions"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Select
          label="Category Type"
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          error={errors.type}
          required
        >
          <option value="expense" className="bg-slate-900 text-white">Expense Category</option>
          <option value="income" className="bg-slate-900 text-white">Income Category</option>
        </Select>

        {/* Color Palette Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Badge & Orbit Color
          </label>
          <div className="flex flex-wrap gap-2.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {errors.color && <p className="mt-1 text-xs text-rose-400">{errors.color}</p>}
        </div>

        {/* Icon Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-2">
            Category Icon
          </label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1 bg-slate-900/60 rounded-xl border border-slate-800">
            {PRESET_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`px-2.5 py-1 text-xs rounded-lg transition ${
                  icon === ic
                    ? 'bg-cyan-500 text-white font-medium shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {initialData ? 'Update Category' : 'Save Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
