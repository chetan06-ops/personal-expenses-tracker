import { FilterPeriod } from '../types';

/**
 * Verifies whether a date string is a real calendar date (checks day, month, leap year).
 * Rejects impossible dates like 2026-02-30 or 2026-04-31.
 */
export function isValidCalendarDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  const match = dateString.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1970 || year > 2099) return false;
  if (month < 1 || month > 12) return false;

  // Days in month checking leap years
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  return true;
}

/**
 * Returns today's date in YYYY-MM-DD format (local time)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into Indian format DD-MM-YYYY (e.g. 05-10-2026)
 */
export function formatIndianDate(dateString: string): string {
  if (!dateString) return '';
  const clean = dateString.split('T')[0];
  const [year, month, day] = clean.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}-${month}-${year}`;
}

/**
 * Formats date into human-readable medium form (e.g. 05 Oct 2026)
 */
export function formatDisplayDate(dateString: string): string {
  if (!dateString) return '';
  const clean = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  const date = new Date(clean);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Gets start and end date for a given filter period
 */
export function getDateRangeForPeriod(
  period: FilterPeriod,
  customStart?: string,
  customEnd?: string
): { startDate: string; endDate: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const pad = (n: number) => String(n).padStart(2, '0');

  switch (period) {
    case 'this-week': {
      const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
      const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + distanceToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return {
        startDate: `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`,
        endDate: `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`,
      };
    }

    case 'this-month': {
      const start = `${currentYear}-${pad(currentMonth + 1)}-01`;
      const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
      const end = `${currentYear}-${pad(currentMonth + 1)}-${pad(lastDay)}`;
      return { startDate: start, endDate: end };
    }

    case 'last-month': {
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthYear = lastMonthDate.getFullYear();
      const lastMonthNum = lastMonthDate.getMonth();
      const lastDay = new Date(lastMonthYear, lastMonthNum + 1, 0).getDate();
      return {
        startDate: `${lastMonthYear}-${pad(lastMonthNum + 1)}-01`,
        endDate: `${lastMonthYear}-${pad(lastMonthNum + 1)}-${pad(lastDay)}`,
      };
    }

    case 'this-year': {
      return {
        startDate: `${currentYear}-01-01`,
        endDate: `${currentYear}-12-31`,
      };
    }

    case 'custom': {
      return {
        startDate: customStart && isValidCalendarDate(customStart) ? customStart : '1970-01-01',
        endDate: customEnd && isValidCalendarDate(customEnd) ? customEnd : '2099-12-31',
      };
    }

    case 'all':
    default: {
      return {
        startDate: '1970-01-01',
        endDate: '2099-12-31',
      };
    }
  }
}

/**
 * Returns month key in YYYY-MM format
 */
export function getMonthKey(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/**
 * Formats YYYY-MM into a friendly label like "October 2026"
 */
export function formatMonthLabel(monthKey: string): string {
  if (!monthKey || !monthKey.includes('-')) return monthKey;
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
}
