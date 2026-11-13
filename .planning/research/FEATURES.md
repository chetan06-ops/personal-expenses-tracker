# Existing Feature Implementation Patterns

## 1. Dashboard & Real-Time Overview
- **Location:** `src/features/dashboard/DashboardPage.tsx`
- **Capabilities:**
  - 4 Key Metric Cards (`StatCard`): Total Income, Total Expenses, Net Savings Balance, and Savings Rate percentage.
  - Interactive 3D Financial Orbit / 2D Switcher: Real-time visual representation of financial health.
  - Quick Period Selector: Dynamically re-aggregates dashboard metrics over `this-month`, `this-year`, `all`, etc.
  - Recent Transactions List: Instant access to latest 5 entries with edit/delete triggers.
  - Quick Actions Bar: Direct shortcuts to add income, add expense, set budget, or export CSV.

---

## 2. Transactions Management
- **Location:** `src/features/transactions/TransactionsPage.tsx`
- **Capabilities:**
  - **Full CRUD**: Create, read, update, and delete transactions.
  - **Multi-Filter Engine**:
    - Period: `this-week`, `this-month`, `last-month`, `this-year`, `all`, `custom`.
    - Type: `all`, `income`, `expense`.
    - Category: Dynamic dropdown of all user and system categories.
  - **Instant Search**: Debounced text search matching description or category name.
  - **Sorting**: Toggle sorting by Date (newest/oldest) or Amount (highest/lowest).
  - **Batch Summary Banner**: Dynamic count and total net sum for currently filtered slice.

---

## 3. Budget Management & Threshold Alerts
- **Location:** `src/features/budgets/BudgetsPage.tsx`
- **Capabilities:**
  - Category-level budgets for current or chosen month (`YYYY-MM`).
  - Overall monthly expenditure cap (`TOTAL`).
  - Three-tier threshold alert states:
    - `Normal` (< 80% spent): Green progress bar.
    - `Warning` (80% - 100% spent): Yellow/amber progress bar, warning pill.
    - `Exceeded` (> 100% spent): Red progress bar with overflow indicator and alert banner.
  - Confetti celebration when monthly savings goals are met.

---

## 4. Reports & Analytical Visualizations
- **Location:** `src/features/reports/ReportsPage.tsx`
- **Capabilities:**
  - **Category Breakdown Pie Chart**: Slices colored by category palette with expenditure percentages.
  - **Monthly Income vs Expense Bar Chart**: Visual comparison across chronological months.
  - **Daily Spending Velocity Area Chart**: Granular daily timeline highlighting peak spending days.
  - **Summary Metrics Matrix**: Average daily spend, highest spend category, and net savings retention.

---

## 5. Category Management
- **Location:** `src/features/categories/CategoriesPage.tsx`
- **Capabilities:**
  - Distinguishes system default categories from user custom categories.
  - Create custom categories with custom hex color picker and Lucide icon picker.
  - Edit or delete custom categories (system categories are protected from deletion to maintain report consistency).

---

## 6. Settings & Data Portability
- **Location:** `src/features/settings/SettingsPage.tsx`
- **Capabilities:**
  - **CSV Export**: Clean download of filtered or full transaction history with CSV formula injection mitigation.
  - **CSV Import**: Drag-and-drop or file select with column matching, duplicate ID rejection, and row validation feedback.
  - **JSON Backup**: Full one-click backup of all Dexie IndexedDB tables.
  - **JSON Restore**: File upload with schema verification and destructive overwrite confirmation dialog.
  - **Academic Demo Dataset**: One-click button to load BCA-308 Table 7.3 dataset.
  - **Appearance & 3D Preferences**: Toggle 3D canvas on/off, adjust 3D performance tier (`high`, `medium`, `low`).
