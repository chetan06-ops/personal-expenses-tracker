import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CategoryIcon, CategoryIconGlyph } from '../ui/CategoryIcon';
import { Category, TransactionType } from '../../types';
import { categoryFormSchema } from '../../services/validation/schemas';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt' | 'isCustom'>) => Promise<any>;
  initialData?: Category | null;
  defaultType?: TransactionType;
}

const PRESET_COLORS = [
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#EC4899', '#F43F5E', '#F97316',
  '#F59E0B', '#10B981', '#14B8A6', '#64748B',
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
  defaultType = 'expense',
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);
  const [color, setColor] = useState('#06B6D4');
  const [icon, setIcon] = useState('Tag');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setColor(initialData.color);
      setIcon(initialData.icon);
    } else {
      setName('');
      setType(defaultType);
      setColor('#06B6D4');
      setIcon('Tag');
    }
    setErrors({});
  }, [initialData, defaultType, isOpen]);

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
      description="Personalize your expense or income classification with a badge color and icon."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errors.form}
          </div>
        )}

        {/* Live Preview */}
        <div className="p-3 rounded-xl bg-[#090E18] border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CategoryIcon name={icon} color={color} size="md" />
            <div>
              <p className="text-sm font-semibold text-white">
                {name.trim() || 'Category Preview'}
              </p>
              <p className="text-[11px] text-slate-400 capitalize">{type} category</p>
            </div>
          </div>
          <span
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ backgroundColor: color }}
          />
        </div>

        <Input
          label="Category Name"
          type="text"
          maxLength={40}
          placeholder="e.g. Gym, Rent, Subscriptions"
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
          <option value="expense" className="bg-[#0D131F] text-white">Expense Category</option>
          <option value="income" className="bg-[#0D131F] text-white">Income Category</option>
        </Select>

        {/* Color Palette Selector */}
        <div>
          <span className="block text-xs font-medium text-slate-300 mb-2">
            Accent Color
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Select color ${c}`}
                aria-pressed={color === c}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0D131F] scale-110'
                    : 'hover:scale-105 opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          {errors.color && <p className="mt-1 text-xs text-rose-400">{errors.color}</p>}
        </div>

        {/* Visual Icon Picker Grid */}
        <div>
          <span className="block text-xs font-medium text-slate-300 mb-2">
            Category Icon
          </span>
          <div className="grid grid-cols-8 gap-1.5 p-2 bg-[#090E18] rounded-xl border border-white/[0.06]">
            {PRESET_ICONS.map((ic) => {
              const selected = icon === ic;
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  title={ic}
                  aria-label={`Select ${ic} icon`}
                  aria-pressed={selected}
                  className={`h-9 rounded-lg flex items-center justify-center transition border ${
                    selected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80 border-transparent'
                  }`}
                >
                  <CategoryIconGlyph name={ic} className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
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
