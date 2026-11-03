import { Transaction, TransactionType } from '../../types';
import { rupeesToPaise } from '../../utils/currency';

export interface CsvImportResult {
  totalRows: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  errorCount: number;
  errors: string[];
  importedTransactions: Transaction[];
}

/**
 * Parses raw CSV text into a 2D array of rows and columns, handling quotes and line breaks.
 */
function parseCsvRows(csvText: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \r\n
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * Normalizes date to YYYY-MM-DD format (supports DD-MM-YYYY or YYYY-MM-DD)
 */
function normalizeDate(raw: string): string | null {
  const clean = raw.trim();
  // Check YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }
  // Check DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  return null;
}

/**
 * Imports and validates transactions from CSV content.
 */
export function parseAndValidateCsv(
  csvText: string,
  existingTransactions: Transaction[] = [],
  skipDuplicates = true
): CsvImportResult {
  const rows = parseCsvRows(csvText);
  if (rows.length < 2) {
    return {
      totalRows: 0,
      importedCount: 0,
      skippedDuplicatesCount: 0,
      errorCount: 1,
      errors: ['CSV file is empty or missing headers.'],
      importedTransactions: [],
    };
  }

  const headerRow = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

  // Detect column indexes
  const typeIdx = headerRow.findIndex((h) => h.includes('type'));
  const amountIdx = headerRow.findIndex((h) => h.includes('amount'));
  const categoryIdx = headerRow.findIndex((h) => h.includes('category'));
  const dateIdx = headerRow.findIndex((h) => h.includes('date'));
  const descIdx = headerRow.findIndex((h) => h.includes('desc') || h.includes('note'));
  const idIdx = headerRow.findIndex((h) => h.includes('id'));

  if (amountIdx === -1 || dateIdx === -1 || categoryIdx === -1) {
    return {
      totalRows: rows.length - 1,
      importedCount: 0,
      skippedDuplicatesCount: 0,
      errorCount: 1,
      errors: ['CSV header must contain at least "Amount", "Category", and "Date" columns.'],
      importedTransactions: [],
    };
  }

  // Set up duplicate tracking
  const existingKeys = new Set(
    existingTransactions.map((t) => `${t.date}_${t.amount}_${t.category.toLowerCase()}_${t.type}`)
  );

  const importedTransactions: Transaction[] = [];
  const errors: string[] = [];
  let skippedDuplicatesCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Type
    let type: TransactionType = 'expense';
    if (typeIdx !== -1 && row[typeIdx]) {
      const rawType = row[typeIdx].toLowerCase().trim();
      if (rawType.includes('inc') || rawType === '+') {
        type = 'income';
      } else if (rawType.includes('exp') || rawType === '-') {
        type = 'expense';
      }
    }

    // Amount
    const rawAmount = row[amountIdx]?.replace(/[^\d.-]/g, '');
    const numAmount = parseFloat(rawAmount);
    if (!rawAmount || isNaN(numAmount) || numAmount <= 0) {
      errors.push(`Row ${rowNum}: Invalid or non-positive amount "${row[amountIdx]}".`);
      continue;
    }
    const amountPaise = rupeesToPaise(numAmount);

    // Category
    const category = row[categoryIdx]?.trim();
    if (!category) {
      errors.push(`Row ${rowNum}: Category cannot be empty.`);
      continue;
    }

    // Date
    const rawDate = row[dateIdx];
    const normalizedDate = normalizeDate(rawDate);
    if (!normalizedDate) {
      errors.push(`Row ${rowNum}: Invalid date format "${rawDate}".`);
      continue;
    }

    // Description
    let description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : '';
    // Strip leading single quote from formula injection prevention if present
    if (description.startsWith("'")) {
      description = description.substring(1);
    }

    // ID
    const explicitId = idIdx !== -1 && row[idIdx]?.trim() ? row[idIdx].trim() : null;

    // Check duplicate
    const key = `${normalizedDate}_${amountPaise}_${category.toLowerCase()}_${type}`;
    if (skipDuplicates && (existingKeys.has(key) || (explicitId && existingTransactions.some((t) => t.id === explicitId)))) {
      skippedDuplicatesCount++;
      continue;
    }

    existingKeys.add(key);

    const now = new Date().toISOString();
    const tx: Transaction = {
      id: explicitId || `tx_csv_${Date.now()}_${i}`,
      type,
      amount: amountPaise,
      category,
      date: normalizedDate,
      description: description || undefined,
      createdAt: now,
      updatedAt: now,
    };

    importedTransactions.push(tx);
  }

  return {
    totalRows: rows.length - 1,
    importedCount: importedTransactions.length,
    skippedDuplicatesCount,
    errorCount: errors.length,
    errors,
    importedTransactions,
  };
}
