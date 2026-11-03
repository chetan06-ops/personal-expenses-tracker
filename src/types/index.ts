export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // Stored in integer minor units (paise) to prevent floating-point rounding errors
  category: string;
  date: string; // YYYY-MM-DD
  description?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  isCustom: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string; // Category name or 'TOTAL' for overall monthly limit
  limit: number; // Stored in paise
  month: string; // YYYY-MM
  createdAt: string;
  updatedAt: string;
}

export type FilterPeriod = 'this-week' | 'this-month' | 'last-month' | 'this-year' | 'all' | 'custom';

export interface TransactionFilters {
  period: FilterPeriod;
  customStartDate?: string;
  customEndDate?: string;
  type?: 'all' | TransactionType;
  category?: string;
  search?: string;
  sortBy?: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number; // in paise
  percentage: number; // 0-100
  color: string;
  count: number;
}

export interface MonthlyTrendItem {
  month: string; // 'Jan 2026'
  rawMonth: string; // '2026-01'
  income: number; // in paise
  expenses: number; // in paise
  savings: number; // in paise
}

export interface DailySpendingItem {
  date: string;
  amount: number; // in paise
}

export interface FinancialSummary {
  totalIncome: number; // in paise
  totalExpenses: number; // in paise
  netBalance: number; // in paise
  currentMonthExpenses: number; // in paise
  currentMonthIncome: number; // in paise
  savingsAmount: number; // in paise
  savingsRate: number; // percentage 0-100
  transactionCount: number;
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrend: MonthlyTrendItem[];
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  enable3D: boolean;
  performanceMode: 'high' | 'medium' | 'low';
  monthlyOverallBudget: number; // in paise
  lastBackupDate?: string;
}

export interface AcademicProjectInfo {
  projectTitle: string;
  course: string;
  subjectCode: string;
  institution: string;
  department: string;
  session: string;
  students: Array<{ name: string; rollNo: string }>;
  guide: { name: string; designation: string; department: string };
}
