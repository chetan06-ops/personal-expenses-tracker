/**
 * Currency utilities for Personal Expenses Tracker
 * All financial amounts are stored as integer minor units (paise) to prevent floating-point rounding inaccuracies.
 * ₹1.00 = 100 paise.
 */

/**
 * Converts rupees (number or string representation) to integer paise.
 * Properly handles decimal values with precise rounding.
 */
export function rupeesToPaise(rupees: number | string): number {
  if (typeof rupees === 'string') {
    const clean = rupees.trim().replace(/,/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    return Math.round(num * 100);
  }
  if (isNaN(rupees)) return 0;
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise back to rupees as a standard number.
 */
export function paiseToRupees(paise: number): number {
  if (isNaN(paise)) return 0;
  return paise / 100;
}

/**
 * Formats a paise value into standard Indian Rupee notation (e.g. ₹1,25,000.00 or ₹1,25,000)
 */
export function formatINR(
  paise: number,
  options?: {
    showDecimals?: boolean;
    compact?: boolean;
    includeSymbol?: boolean;
  }
): string {
  const { showDecimals = true, compact = false, includeSymbol = true } = options || {};
  const rupees = paiseToRupees(paise);

  if (compact && Math.abs(rupees) >= 10000000) {
    // Crores
    const cr = (rupees / 10000000).toFixed(2);
    return `${includeSymbol ? '₹' : ''}${cr} Cr`;
  } else if (compact && Math.abs(rupees) >= 100000) {
    // Lakhs
    const lk = (rupees / 100000).toFixed(2);
    return `${includeSymbol ? '₹' : ''}${lk} L`;
  } else if (compact && Math.abs(rupees) >= 1000) {
    // Thousands
    const k = (rupees / 1000).toFixed(1);
    return `${includeSymbol ? '₹' : ''}${k}k`;
  }

  const formatter = new Intl.NumberFormat('en-IN', {
    style: includeSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? (paise % 100 !== 0 ? 2 : 0) : 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(rupees);
}

/**
 * Formats signed INR for income (+) and expense (-)
 */
export function formatSignedINR(paise: number, type?: 'income' | 'expense'): string {
  const formatted = formatINR(Math.abs(paise));
  if (type === 'income') {
    return `+${formatted}`;
  } else if (type === 'expense') {
    return `-${formatted}`;
  }
  return paise >= 0 ? `+${formatted}` : `-${formatted}`;
}
