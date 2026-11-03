import { Transaction } from '../../types';
import { paiseToRupees } from '../../utils/currency';

/**
 * Sanitizes a string cell to protect against CSV / Excel Formula Injection (CSV Injection).
 * Cells starting with '=', '+', '-', '@', '\t', or '\r' can be executed as formulas by spreadsheet software.
 */
function sanitizeCsvCell(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // Check for formula injection triggers
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];
  if (str.length > 0 && formulaTriggers.includes(str.charAt(0))) {
    // Prepend single quote to neutralize formula execution in Excel/Calc
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Converts transactions into a CSV formatted string
 */
export function generateTransactionsCsv(transactions: Transaction[]): string {
  const headers = [
    'Transaction ID',
    'Type',
    'Amount (INR)',
    'Category',
    'Date (YYYY-MM-DD)',
    'Description',
    'Created At',
  ];

  const rows = transactions.map((tx) => [
    sanitizeCsvCell(tx.id),
    sanitizeCsvCell(tx.type),
    sanitizeCsvCell(paiseToRupees(tx.amount).toFixed(2)),
    sanitizeCsvCell(tx.category),
    sanitizeCsvCell(tx.date),
    sanitizeCsvCell(tx.description || ''),
    sanitizeCsvCell(tx.createdAt),
  ]);

  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Triggers a browser download of the CSV file
 */
export function downloadCsvFile(csvContent: string, fileName = 'personal-expenses-export.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
