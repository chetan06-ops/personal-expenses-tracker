import { z } from 'zod';

export const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Please select a transaction type (Income or Expense)' }),
  }),
  amount: z
    .union([z.number(), z.string()])
    .refine((val) => val !== '' && val !== null && val !== undefined, {
      message: 'Amount is required and cannot be empty',
    })
    .transform((val) => {
      if (typeof val === 'string') {
        const clean = val.trim().replace(/,/g, '');
        return parseFloat(clean);
      }
      return val;
    })
    .refine((val) => !isNaN(val), {
      message: 'Amount must be a valid number',
    })
    .refine((val) => val > 0, {
      message: 'Amount must be greater than zero',
    }),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in valid format (YYYY-MM-DD)'),
  description: z
    .string()
    .max(255, 'Description cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

export const budgetFormSchema = z.object({
  category: z.string().trim().min(1, 'Category is required'),
  limit: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        return parseFloat(val.trim().replace(/,/g, ''));
      }
      return val;
    })
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Budget limit must be a positive number',
    }),
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
});

export type BudgetFormData = z.infer<typeof budgetFormSchema>;

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(40, 'Category name cannot exceed 40 characters'),
  type: z.enum(['income', 'expense']),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please select a valid hex color code'),
  icon: z.string().min(1, 'Please select an icon'),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
