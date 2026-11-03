import { Transaction, TransactionType } from '../../types';
import { rupeesToPaise, VALID_INR_AMOUNT_REGEX } from '../../utils/currency';
import { isValidCalendarDate } from '../../utils/date';

export interface CsvImportResult {
  totalRows: number;
  importedCount: number;
  skippedDuplicatesCount: number;
  errorCount: number;
  errors: string[];
  importedTransactions: Transaction[];
}

/**
 * Parses raw CSV text into a 2D array of rows and columns,
 * handling quotes, escaped quotes (""), embedded commas, line breaks, and UTF-8 BOM.
 */
export function parseCsvRows(csvText: string): string[][] {
  // Strip UTF-8 BOM if present
  let cleanText = csvText;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.substring(1);
  }

  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

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
 * Normalizes date to YYYY-MM-DD format and validates real calendar existence.
 * Supports DD-MM-YYYY or YYYY-MM-DD.
 */
export function normalizeAndValidateDate(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  const clean = raw.trim();

  // Case 1: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return isValidCalendarDate(clean) ? clean : null;
  }

  // Case 2: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    const formatted = `${year}-${month}-${day}`;
    return isValidCalendarDate(formatted) ? formatted : null;
  }

  return null;
}

/**
 * Imports and strictly validates transactions from CSV text.
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

  // Set up duplicate tracking against existing records
  const existingKeys = new Set(
    existingTransactions.map((t) => `${t.date}_${t.amount}_${t.category.toLowerCase()}_${t.type}`)
  );
  const existingIds = new Set(existingTransactions.map((t) => t.id));

  // Set up internal duplicate tracking within the CSV file itself
  const fileInternalKeys = new Set<string>();
  const fileInternalIds = new Set<string>();

  const importedTransactions: Transaction[] = [];
  const errors: string[] = [];
  let skippedDuplicatesCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    // Validate Transaction Type strictly — never default unknown types to expense!
    let type: TransactionType | null = null;
    if (typeIdx !== -1 && row[typeIdx]) {
      const rawType = row[typeIdx].toLowerCase().trim();
      if (rawType === 'income' || rawType === 'in' || rawType === 'credit' || rawType === '+') {
        type = 'income';
      } else if (
        rawType === 'expense' ||
        rawType === 'out' ||
        rawType === 'debit' ||
        rawType === '-'
      ) {
        type = 'expense';
      } else {
        errors.push(
          `Row ${rowNum}: Invalid transaction type "${row[typeIdx]}". Must be "Income" or "Expense".`
        );
        continue;
      }
    } else {
      errors.push(`Row ${rowNum}: Transaction type is missing or required.`);
      continue;
    }

    // Validate Amount strictly
    const rawAmountStr = (row[amountIdx] || '').trim().replace(/,/g, '');
    if (!VALID_INR_AMOUNT_REGEX.test(rawAmountStr)) {
      errors.push(
        `Row ${rowNum}: Invalid amount "${row[amountIdx]}". Must be a positive numeric value with at most 2 decimal places.`
      );
      continue;
    }
    const numAmount = parseFloat(rawAmountStr);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.push(`Row ${rowNum}: Amount must be greater than zero.`);
      continue;
    }
    if (numAmount * 100 > Number.MAX_SAFE_INTEGER) {
      errors.push(`Row ${rowNum}: Amount exceeds safe value limit.`);
      continue;
    }
    const amountPaise = rupeesToPaise(numAmount);

    // Validate Category
    const category = row[categoryIdx]?.trim();
    if (!category || category.length === 0) {
      errors.push(`Row ${rowNum}: Category cannot be empty.`);
      continue;
    }

    // Validate Date with calendar verification
    const rawDate = row[dateIdx];
    const normalizedDate = normalizeAndValidateDate(rawDate);
    if (!normalizedDate) {
      errors.push(
        `Row ${rowNum}: Malformed or impossible calendar date "${rawDate}". Expected valid YYYY-MM-DD or DD-MM-YYYY.`
      );
      continue;
    }

    // Process Description
    let description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : '';
    // Strip leading single quote from formula injection defense if present
    if (description.startsWith("'")) {
      description = description.substring(1).trimStart();
    }

    // Process ID and check file-internal duplicate IDs
    const explicitId = idIdx !== -1 && row[idIdx]?.trim() ? row[idIdx].trim() : null;
    if (explicitId) {
      if (fileInternalIds.has(explicitId)) {
        errors.push(`Row ${rowNum}: Duplicate transaction ID "${explicitId}" within the file.`);
        continue;
      }
      fileInternalIds.add(explicitId);
    }

    // Check duplicate key
    const uniqueKey = `${normalizedDate}_${amountPaise}_${category.toLowerCase()}_${type}`;
    if (fileInternalKeys.has(uniqueKey)) {
      if (skipDuplicates) {
        skippedDuplicatesCount++;
        continue;
      }
    }
    fileInternalKeys.add(uniqueKey);

    // Check against existing database
    if (
      skipDuplicates &&
      (existingKeys.has(uniqueKey) || (explicitId && existingIds.has(explicitId)))
    ) {
      skippedDuplicatesCount++;
      continue;
    }

    const now = new Date().toISOString();
    const tx: Transaction = {
      id: explicitId || `tx_csv_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
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
