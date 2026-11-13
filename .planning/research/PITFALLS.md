# Known Pitfalls, Anti-Patterns & Engineering Guidelines

## 1. Floating-Point Financial Calculations (Crucial)
- **Pitfall**: In JavaScript, `0.1 + 0.2 === 0.30000000000000004`. Using standard floating numbers for accounting leads to rounding drift, discrepancies in balances, and broken budget calculations.
- **Rule**:
  - Always store monetary values in IndexedDB and state as integer minor units (**paise**; 1 Rupee = 100 paise).
  - Use `rupeesToPaise(val)` solely at form/import ingestion boundaries.
  - Use `paiseToRupees(val)` solely for display formatting (`formatINR`).
  - Never do `amount += floatValue` directly.

---

## 2. CSV / Spreadsheet Formula Injection (CWE-1236)
- **Pitfall**: If an imported or exported description begins with `=`, `+`, `-`, `@`, `\t`, or `\r`, opening the CSV in Microsoft Excel or LibreOffice Calc will trigger formula execution, potentially executing arbitrary local processes.
- **Rule**:
  - Always pass exported cells through `sanitizeCsvCell()`.
  - Prefix trigger characters with `'` (single quote) to force spreadsheet processors to treat the cell as raw text.

---

## 3. WebGL Context Loss & Headless Browser Crashes
- **Pitfall**: In low-memory mobile browsers, headless testing environments (e.g. JSDOM), or systems without hardware acceleration, Three.js `<Canvas>` throws context loss errors or crashes.
- **Rule**:
  - Always wrap `<FinancialOrbitScene>` inside `<ThreeErrorBoundary>`.
  - Maintain feature parity in `<Orbit2DFallback>` so that all core information (net balance, categories, percentages) remains fully interactive without WebGL.
  - Automatically honor `prefers-reduced-motion` and user settings toggles.

---

## 4. Date Formatting & Timezone Shifts in Local-First Apps
- **Pitfall**: Using `new Date().toISOString().split('T')[0]` or UTC getters can roll dates forward or backward by one day depending on local user timezones (especially IST UTC+5:30).
- **Rule**:
  - Date strings in storage must strictly follow `YYYY-MM-DD` using local calendar boundaries (`getLocalDateString()`).
  - Periods (`this-month`, `this-year`) should be generated from local calendar functions in `src/utils/date.ts`.

---

## 5. Dexie IndexedDB Transactions & Reactive Loops
- **Pitfall**: Mutating IndexedDB records within a `useLiveQuery` callback causes infinite re-render loops and UI freezes.
- **Rule**:
  - Keep queries read-only inside `useLiveQuery`.
  - Trigger mutations strictly through repository helper functions inside user event handlers (`handleTransactionSubmit`, `handleDelete`).
