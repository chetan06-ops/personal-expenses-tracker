# Personal Expenses Tracker — 3D Financial Intelligence Application

> **Academic Project Submission:** BCA Project-I (Course Code: BCA-308)  
> **Institution:** Maharishi Markandeshwar Institute of Computer Technology & Business Management (MMICT & BM), Maharishi Markandeshwar (Deemed to be University), Mullana, Ambala, Haryana – 133207, India  
> **Session / Academic Year:** Session 2025–2028 (Document Note: Referenced as 2025–2028 on Report cover and 2026–2027 in acknowledgement; both preserved for faculty review)  
> **Project Guide:** Dr. Bharti Sharma, Associate Professor, MMICT & BM  
> **Project Members:**  
> - **Abhijeet Singh** — Roll No. 13250311  
> - **Aanchal Saini** — Roll No. 13250304  
> - **Ankit** — Roll No. 13250329  
> **Project Location:** `C:\Users\LENOVO\Desktop\here`

---

## 1. Project Overview

The **Personal Expenses Tracker** is a professional, modern, local-first 3D web application designed to help individuals record income and expenditures, manage budgets, analyze categorical spending patterns, and maintain financial discipline through interactive visualizations.

Upgraded from the academic reference prototype into a commercial-grade fintech experience:
- **Genuinely Empty First Launch**: First-time users start with an empty financial dashboard (zero automatic demo transactions). A welcoming empty state guides users to record their first transaction or load academic datasets on demand.
- **Two Separate Idempotent Datasets**:
  - **Dataset A (Exact Academic Reference Dataset)**: Exactly four transactions from Chapter 7, Table 7.3 (Allowance ₹15,000, Education ₹2,500, Food ₹1,200, Travel ₹500; Net Balance ₹10,800; Savings Rate 72%).
  - **Dataset B (Optional Extended Demo Dataset)**: 8 multi-month illustrative transactions demonstrating full category distribution, multi-month spending trends, and 3D orbital topology.
  - Repeated clicks are fully idempotent and never create duplicate records. Demo data can be selectively cleared without touching genuine user records.
- **Category Data Integrity & Type Isolation**: Compound index `[type+category]` guarantees that income and expense categories with identical names (e.g., "Other") remain strictly isolated. Renaming or deleting an expense category never modifies income transactions. Reassignment strictly enforces matching transaction types.
- **Interactive 3D Financial Orbit**: Centerpiece 3D visualization built with Three.js and React Three Fiber that maps spending topology and net capital dynamically.
- **Lazy-Loaded 3D Bundle & 2D Accessible Fallback**: `React.lazy` splits Three.js and the 3D scene into a separate asynchronous chunk (~846 kB), keeping the core dashboard bundle lean (~894 kB). Automatic fallback detects devices without WebGL or users with `prefers-reduced-motion` enabled, with automatic WebGL context loss recovery.
- **Complete Custom Date Range Filtering**: Reports page offers full start-date and end-date inputs with leap-year calendar validation, start <= end verification, active period tags, and dynamic range-specific CSV export.
- **Minor-Unit Financial Precision**: Monetary calculations use integer minor units (paise; ₹1 = 100 paise) with regex format validation (`^\d+(\.\d{1,2})?$`) to eliminate floating-point rounding errors.
- **Data Portability & Formula Injection Defense**: UTF-8 BOM-aware CSV import with internal duplicate detection; sanitized CSV export protecting against spreadsheet formula injection (`=`, `+`, `-`, `@`, `\t`, `\r`); and atomic JSON database backup & restore.

---

## 2. Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite | Component architecture, strict typing, fast HMR |
| **Styling & Design System** | Tailwind CSS, Lucide React | Futuristic dark navy fintech UI, glassmorphic elements |
| **3D Rendering** | Three.js, React Three Fiber, Drei | WebGL Financial Orbit, orbital nodes, lighting, interactive controls |
| **Code-Splitting** | `React.lazy`, `Suspense` | Three.js isolated into dedicated lazy chunk |
| **Charts & Analytics** | Recharts | Pie charts, stacked bar charts, trend area charts |
| **Local Persistence** | IndexedDB, Dexie.js, Dexie React Hooks | Reactive queries, ACID transactions, compound indexing `[type+category]` |
| **Data Validation** | Zod | Runtime schema validation (currency regex, calendar date validation) |
| **Testing** | Vitest, React Testing Library, fake-indexeddb | Unit tests, UI rendering tests, and real IndexedDB integration tests |

---

## 3. Architecture & Project Structure

The project follows a clean, modular, layered architecture:

```
here/
├── docs/                                 # Academic synopsis and project report PDFs
│   ├── Personal_Expenses_Tracker_Project_Report_with_University_Logo_4.pdf
│   └── Personal_Expenses_Tracker_Project_Synopsis.pdf
├── src/
│   ├── app/                              # Root application shell & routing
│   │   └── App.tsx
│   ├── components/
│   │   ├── charts/                       # Recharts analytics components
│   │   ├── forms/                        # Modals & input forms (Transaction, Category, Budget)
│   │   ├── navigation/                   # Desktop sidebar, header, mobile nav & academic modal
│   │   └── ui/                           # Reusable design system primitives
│   ├── database/                         # Dexie IndexedDB persistence layer
│   │   ├── db.ts                         # Dexie database instance & initialization
│   │   ├── schema.ts                     # Table schemas & default categories
│   │   ├── seed.ts                       # Idempotent Datasets A & B, selective demo cleanup
│   │   └── repositories/                 # Data access repositories with type isolation
│   │       ├── budgetRepository.ts
│   │       ├── categoryRepository.ts     # Type-safe category rename, reassignment, delete
│   │       └── transactionRepository.ts  # Transaction CRUD & date-range queries
│   ├── features/                         # Feature pages
│   │   ├── budgets/                      # Budget management & threshold alerts
│   │   ├── categories/                   # Type-isolated category manager
│   │   ├── dashboard/                    # Real-time metrics & lazy-loaded 3D Orbit
│   │   ├── reports/                      # Custom date range reports & dynamic CSV export
│   │   ├── settings/                     # Dataset seeding, CSV/JSON backup & restore
│   │   └── transactions/                 # Full CRUD table & multi-filter
│   ├── hooks/                            # Custom reactive React hooks
│   ├── services/
│   │   ├── calculations/                 # Financial calculation engine
│   │   ├── export/                       # CSV export (safe formula escape) & JSON backup
│   │   ├── import/                       # CSV parsing (BOM & duplicate detection) & JSON restore
│   │   └── validation/                   # Zod validation schemas
│   ├── styles/                           # Tailwind setup, glassmorphism, scrollbars
│   ├── test/                             # Automated test suites
│   │   ├── academic-test-cases.test.ts   # TC-01 to TC-17 academic unit tests
│   │   ├── components.test.tsx           # UI component test suite
│   │   ├── database-integration.test.ts  # Real IndexedDB integration tests (fake-indexeddb)
│   │   └── setup.ts                      # Test environment setup
│   ├── three/                            # 3D WebGL Financial Orbit
│   │   ├── components/                   # Nodes, CentralCore, OrbitRings, Particles
│   │   ├── fallback/                     # Accessible 2D SVG fallback
│   │   └── scenes/                       # FinancialOrbitScene (WebGL loss handler, reduced motion)
│   ├── types/                            # TypeScript interfaces
│   └── utils/                            # Currency (paise math, INR formatting), date helpers
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Automated Test Suite Execution Results

All 32 test cases across 3 test suites pass with 100% success rate:
- **Unit Suite (`academic-test-cases.test.ts`)**: 17 tests covering academic TC-01 to TC-10, currency precision, budget alerts, CSV injection prevention, and schema validations.
- **Database Integration Suite (`database-integration.test.ts`)**: 11 real Dexie IndexedDB integration tests covering genuine empty DB launch, full transaction CRUD, category rename type isolation, reassignment constraints, budget cascade, idempotent seeding, selective clearing, and atomic JSON restore.
- **Component Suite (`components.test.tsx`)**: 4 tests verifying StatCards, Badges, Buttons, and the 2D accessible fallback.

### Comprehensive Test Matrix: 32 Tests Passed (100% Pass Rate)

| Test Suite | Test Objective | Test Condition / Input | Result | Status |
|---|---|---|---|---|
| **Unit** | TC-01: Valid Expense | Amount: ₹2,500, Category: Education, Date: 2026-10-03 | Validated & stored as 250,000 paise | **PASS** |
| **Unit** | TC-02: Valid Income | Amount: ₹15,000, Category: Allowance, Date: 2026-10-01 | Validated & stored as 1,500,000 paise | **PASS** |
| **Unit** | TC-03: Empty Amount | Amount: `""` | Rejected: "Amount is required and cannot be empty" | **PASS** |
| **Unit** | TC-04: Zero / Negative | Amount: `0` and `-500` | Rejected: "Amount must be a valid number greater than zero" | **PASS** |
| **Unit** | TC-05: Alphabetic Amount | Amount: `"five hundred"` | Rejected: numeric regex validation | **PASS** |
| **Unit** | TC-06: Balance Calculation | Income: ₹1,000, Expense: ₹250 | Net Balance = ₹750, Savings Rate = 75% | **PASS** |
| **Unit** | TC-07: Category Breakdown | Food: ₹1,200 + ₹800, Travel: ₹500 | Food: ₹2,000 (count: 2), Travel: ₹500 (count: 1) | **PASS** |
| **Unit** | TC-08: Academic Table 7.3 | Allowance ₹15k, Education ₹2.5k, Food ₹1.2k, Travel ₹500 | Income: ₹15,000, Expenses: ₹4,200, Net: ₹10,800 | **PASS** |
| **Unit** | TC-09: Delete Updates Balance | Delete ₹2,000 expense from ₹5,000 income | Expenses: ₹0, Net Balance: ₹5,000 | **PASS** |
| **Unit** | TC-10: Edit Updates Balance | Edit ₹1,000 expense to ₹1,850.50 | Expenses: ₹1,850.50 (185,050 paise) | **PASS** |
| **Unit** | Minor Unit Precision | ₹12.34 + ₹56.78 | 6,912 paise = ₹69.12 exact | **PASS** |
| **Unit** | Indian Currency Notation | ₹1,25,00,000 | Formats as ₹1.25 Cr | **PASS** |
| **Unit** | Date Range Boundaries | `this-month`, `this-year` | Generates proper ISO date boundaries | **PASS** |
| **Unit** | Budget Status Alerts | Spending at 50%, 85%, and 105% | Correctly flags `normal`, `warning`, `danger` | **PASS** |
| **Unit** | CSV Formula Injection | Cell with `=cmd\|/c calc.exe!A1` | Escaped with leading single quote `"'=cmd..."` | **PASS** |
| **Unit** | CSV Import Validation | Valid rows, negative amounts, alphabetic amounts | Rejects malformed rows with row-level errors | **PASS** |
| **Unit** | JSON Backup Validation | Strict Zod schema verification | Accepts valid backup, rejects malformed | **PASS** |
| **Integration** | Empty First Launch | Fresh database initialization | 0 transactions; default categories intact | **PASS** |
| **Integration** | DB Transaction Ingestion | Income ₹15,000 + Expense ₹2,500 | Persisted in IndexedDB; retrieved via repo | **PASS** |
| **Integration** | DB Transaction Update | Modify amount to ₹1,450.50 | Amount and `updatedAt` updated in Dexie | **PASS** |
| **Integration** | DB Transaction Deletion | Delete transaction from Dexie | Record removed; count decrements to 0 | **PASS** |
| **Integration** | Category Rename Isolation | Expense "Other" and Income "Other" both exist | Renaming Expense "Other" does NOT rename Income "Other" | **PASS** |
| **Integration** | Reassignment Type Safety | Delete "Snacks" (expense) | Reassign to "Dining" succeeds; reassign to "Freelance" (income) throws error | **PASS** |
| **Integration** | Budget Cascade & Cleanup | Budget for "Entertainment" | Renames with category; deletes when category deleted | **PASS** |
| **Integration** | Idempotent Dataset A Seeding | Click `seedAcademicReferenceData` twice | Count remains exactly 4 (Table 7.3 totals preserved) | **PASS** |
| **Integration** | Selective Demo Cleanup | 4 academic + 8 extended demo + 1 user record | Clears only the 12 demo records; user record preserved | **PASS** |
| **Integration** | CSV BOM & Internal Duplicates | CSV with UTF-8 BOM, impossible date, duplicate row | Strips BOM, imports valid row, skips duplicate | **PASS** |
| **Integration** | Atomic JSON Restore | Replace mode restore with custom settings | Replaces transactions, categories, budgets, and settings | **PASS** |
| **Component** | StatCard Rendering | Render stat card with ₹7,500 | Formatted INR text and title displayed | **PASS** |
| **Component** | Button States | Enabled, loading, and disabled states | Correct ARIA and disabled attributes | **PASS** |
| **Component** | Badge Variants | Variant color classes | Correct styling and text rendered | **PASS** |
| **Component** | Orbit2DFallback | Render SVG accessible fallback | Displays Net Balance, category bubbles, and legend | **PASS** |

---

## 5. Getting Started & Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24.21.0)
- **npm**: v9.0.0 or higher (Tested on npm 11.19.0)
- **Modern Web Browser**: Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari (WebGL enabled for 3D Financial Orbit)

### Installation
Navigate to the project folder:
```bash
cd "C:\Users\LENOVO\Desktop\here"
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Running Automated Tests
To run all 32 unit and real IndexedDB integration test suites:
```bash
npm run test
```

For live watch mode during development:
```bash
npm run test:watch
```

### Building for Production
```bash
npm run build
```
Production output:
- `dist/assets/index-[hash].js`: Main application bundle (~894 kB, ~250 kB gzip).
- `dist/assets/FinancialOrbitScene-[hash].js`: Three.js 3D canvas chunk (~846 kB, ~228 kB gzip), loaded lazily on demand.
- `dist/assets/index-[hash].css`: Compiled Tailwind CSS bundle (~35.7 kB, ~6.6 kB gzip).

To preview the production build locally:
```bash
npm run preview
```

---

## 6. Data Storage & Security Considerations

1. **Local-First Architecture**: Financial data is strictly persisted inside the user's browser database using **IndexedDB** through **Dexie.js**. No financial records are ever transmitted to remote cloud servers or third-party tracking APIs.
2. **Unencrypted Browser Storage Disclosure**: In standard web browsers, IndexedDB data is stored client-side in the browser user profile without application-level encryption. For shared or public workstations, users should use individual operating system accounts or private browsing sessions.
3. **Spreadsheet Formula Injection Defense**: CSV exports sanitize all cell content. Strings beginning with spreadsheet formula triggers (`=`, `+`, `-`, `@`, `\t`, `\r`) are automatically escaped with a leading single quote (`'`).
4. **Data Portability**: Users can export their complete financial database as a structured JSON file at any time via the Settings page, and restore it on another machine using either Replace or Merge modes.

---

## 7. Academic Reference Alignment

- **Table 7.3 Reference Verification**:
  - Income: ₹15,000 (Monthly Allowance, 01-10-2026)
  - Expense 1: ₹2,500 (Education — Books and notes, 03-10-2026)
  - Expense 2: ₹1,200 (Food — Groceries, 05-10-2026)
  - Expense 3: ₹500 (Travel — Local travel, 06-10-2026)
  - **Net Balance: ₹10,800** | **Savings Rate: 72%**
  - Seeding this dataset via Dataset A in Settings reproduces these exact figures.
- **Academic Year Notation**: The submitted synopsis lists the course as *Session 2025–2028*, while the report certificate notes *2025–2028* and acknowledgement notes *2026–2027*. Both notations are documented and displayed in the Academic Details modal for university review.
"# personal-expenses-tracker" 
