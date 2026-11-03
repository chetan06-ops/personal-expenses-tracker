import { Transaction } from '../../types';
import { paiseToRupees } from '../../utils/currency';

/**
 * Sanitizes a string cell to protect against CSV / Excel Formula Injection (CSV Injection).
 * Spreadsheet software executes cells starting with '=', '+', '-', '@', '\t', '\r',
 * or leading spaces followed by these characters.
 */
export function sanitizeCsvCell(value: string | number | undefined | null): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // Check trimmed character for formula triggers
  const trimmed = str.trimStart();
  const formulaTriggers = ['=', '+', '-', '@', '\t', '\r'];

  if (trimmed.length > 0 && formulaTriggers.includes(trimmed.charAt(0))) {
    // Neutralize formula trigger by prepending single quote
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Converts transactions into a CSV formatted string.
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
 * Triggers a browser download of the CSV file.
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
