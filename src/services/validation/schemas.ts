import { z } from 'zod';
import { isValidCalendarDate } from '../../utils/date';
import { VALID_INR_AMOUNT_REGEX } from '../../utils/currency';

export const transactionFormSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Please select a transaction type (Income or Expense)' }),
  }),
  amount: z
    .union([z.number(), z.string()])
    .refine((val) => val !== '' && val !== null && val !== undefined, {
      message: 'Amount is required and cannot be empty (TC-03)',
    })
    .transform((val) => {
      if (typeof val === 'number') {
        return val.toString();
      }
      return val.trim().replace(/,/g, '');
    })
    .refine((val) => VALID_INR_AMOUNT_REGEX.test(val), {
      message: 'Amount must be a valid number greater than zero with at most 2 decimal places (TC-04 / TC-05)',
    })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Amount must be greater than zero (TC-04)',
    })
    .refine((val) => val * 100 <= Number.MAX_SAFE_INTEGER, {
      message: 'Amount exceeds safe transaction limit',
    }),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required'),
  date: z
    .string()
    .refine(isValidCalendarDate, {
      message: 'Date must be a valid calendar date in YYYY-MM-DD format',
    }),
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
    .refine((val) => val !== '' && val !== null && val !== undefined, {
      message: 'Budget limit is required and cannot be empty',
    })
    .transform((val) => {
      if (typeof val === 'number') return val.toString();
      return val.trim().replace(/,/g, '');
    })
    .refine((val) => VALID_INR_AMOUNT_REGEX.test(val), {
      message: 'Budget limit must be a positive numeric value with at most 2 decimal places',
    })
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Budget limit must be greater than zero',
    })
    .refine((val) => val * 100 <= Number.MAX_SAFE_INTEGER, {
      message: 'Budget limit exceeds safe value limit',
    }),
  month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format between 01 and 12'),
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
