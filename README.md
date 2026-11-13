# Personal Expenses Tracker — 3D Financial Intelligence Application

> **Academic Project Submission:** BCA Project-I (Course Code: BCA-308)  
> **Institution:** Maharishi Markandeshwar Institute of Computer Technology & Business Management (MMICT & BM), Maharishi Markandeshwar (Deemed to be University), Mullana, Ambala, Haryana – 133207, India  
> **Session / Academic Year:** Session 2025–2028 (Document Note: Referenced as 2025–2028 on Report cover and 2026–2027 in acknowledgement; flagged for review)  
> **Project Guide:** Dr. Bharti Sharma, Associate Professor, MMICT & BM  
> **Project Members:**  
> - **Abhijeet Singh** — Roll No. 13250311  
> - **Aanchal Saini** — Roll No. 13250304  
> - **Ankit** — Roll No. 13250329  

---

## 1. Project Overview

The **Personal Expenses Tracker** is a professional, modern, local-first 3D web application designed to help individuals track income and expenditures, manage budgets, analyze categorical spending patterns, and maintain financial discipline through interactive visualizations.

Originally conceived as a vanilla browser prototype in academic reference documentation, this implementation upgrades the project into a commercial-grade fintech experience featuring:
- **Interactive 3D Financial Orbit**: Centerpiece 3D visualization built with Three.js and React Three Fiber that maps spending topology and net capital dynamically.
- **2D Accessible Fallback**: Automatic detection for devices without WebGL or users with `prefers-reduced-motion` enabled.
- **Local-First IndexedDB Storage**: Zero cloud dependency, keeping all financial data stored private and resilient in the browser via Dexie.js.
- **Minor-Unit Financial Precision**: Monetary calculations use integer minor units (paise; ₹1 = 100 paise) to eliminate floating-point rounding errors.
- **Full Transaction Lifecycle (CRUD)**: Create, read, edit, delete, search, multi-period filter, and sort transactions.
- **Intelligent Budget Management**: Category-level spending caps, overall monthly limits, and visual warning thresholds (80% and over-budget alerts).
- **Reports & Analytics**: Daily spending velocity, weekly/monthly/yearly comparisons, and categorical breakdowns.
- **Data Portability**: Safe CSV export/import with spreadsheet formula injection mitigation, and complete JSON database backup & restore.

---

## 2. Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite | Component architecture, strict typing, fast HMR |
| **Styling & Design System** | Tailwind CSS, Lucide React | Futuristic dark navy fintech UI, glowing glassmorphic elements |
| **3D Rendering** | Three.js, React Three Fiber, Drei | WebGL Financial Orbit, orbital nodes, lighting, interactive controls |
| **Charts & Analytics** | Recharts | Pie charts, stacked bar charts, trend area charts |
| **Local Persistence** | IndexedDB, Dexie.js, Dexie React Hooks | Reactive queries, ACID transactions, schema versioning |
| **Data Validation** | Zod | Runtime schema validation (positive amounts, required fields) |
| **Unit & Integration Testing** | Vitest, React Testing Library, JSDOM | Execution of academic test cases (TC-01 through TC-10 and beyond) |

---

## 3. Architecture & Project Structure

The project strictly follows a clean, modular, layered architecture:

```
personal-expenses-tracker/
├── docs/                                 # Academic synopsis and project report PDFs
│   ├── Personal_Expenses_Tracker_Project_Report_with_University_Logo_4.pdf
│   └── Personal_Expenses_Tracker_Project_Synopsis.pdf
├── src/
│   ├── app/                              # Root application shell & routing
│   │   └── App.tsx
│   ├── components/
│   │   ├── charts/                       # Recharts analytics components
│   │   │   ├── CategoryPieChart.tsx
│   │   │   ├── IncomeExpenseBarChart.tsx
│   │   │   └── TrendAreaChart.tsx
│   │   ├── forms/                        # Modals & input forms
│   │   │   ├── BudgetModal.tsx
│   │   │   ├── CategoryModal.tsx
│   │   │   └── TransactionModal.tsx
│   │   ├── navigation/                   # Desktop sidebar, header, mobile nav & academic modal
│   │   │   ├── AcademicModal.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/                           # Reusable design system primitives
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Select.tsx
│   │       └── ToastContainer.tsx
│   ├── database/                         # Dexie IndexedDB persistence layer
│   │   ├── db.ts                         # Dexie database instance
│   │   ├── schema.ts                     # Table schemas & default categories
│   │   ├── seed.ts                       # Academic test data seed (Table 7.3)
│   │   └── repositories/                 # Data access repositories
│   │       ├── budgetRepository.ts
│   │       ├── categoryRepository.ts
│   │       └── transactionRepository.ts
│   ├── features/                         # Feature pages
│   │   ├── budgets/                      # Budget management & threshold alerts
│   │   │   └── BudgetsPage.tsx
│   │   ├── categories/                   # Default & custom category manager
│   │   │   └── CategoriesPage.tsx
│   │   ├── dashboard/                    # Real-time metrics & financial orbit
│   │   │   ├── DashboardPage.tsx
│   │   │   └── StatCard.tsx
│   │   ├── reports/                      # Daily, monthly, and category reports
│   │   │   └── ReportsPage.tsx
│   │   ├── settings/                     # Backups, CSV import/export, academic seed
│   │   │   └── SettingsPage.tsx
│   │   └── transactions/                 # Full CRUD table & multi-filter
│   │       └── TransactionsPage.tsx
│   ├── hooks/                            # Custom reactive React hooks
│   │   ├── useBudgets.ts
│   │   ├── useCategories.ts
│   │   ├── useSettings.ts
│   │   ├── useToast.ts
│   │   └── useTransactions.ts
│   ├── services/
│   │   ├── calculations/                 # Financial calculation engine
│   │   │   └── financialCalculations.ts
│   │   ├── export/                       # CSV export (safe formula escape) & JSON backup
│   │   │   ├── csvExport.ts
│   │   │   └── jsonBackup.ts
│   │   ├── import/                       # CSV parsing (deduplication) & JSON restore
│   │   │   ├── csvImport.ts
│   │   │   └── jsonRestore.ts
│   │   └── validation/                   # Zod validation schemas
│   │       └── schemas.ts
│   ├── styles/
│   │   └── index.css                     # Tailwind setup, glassmorphism, scrollbars
│   ├── test/                             # Automated test suites
│   │   ├── academic-test-cases.test.ts   # TC-01 to TC-10 & boundary tests
│   │   ├── components.test.tsx           # UI component test suite
│   │   └── setup.ts                      # Test environment setup
│   ├── three/                            # 3D WebGL Financial Orbit
│   │   ├── components/
│   │   │   ├── CategoryNodes.tsx         # Orbiting interactive 3D nodes
│   │   │   ├── CentralCore.tsx           # Pulsing core reflecting net balance
│   │   │   ├── OrbitRings.tsx            # Orbital geometric rings
│   │   │   └── Particles.tsx             # Ambient particle drift
│   │   ├── fallback/
│   │   │   └── Orbit2DFallback.tsx       # Accessible SVG 2D fallback
│   │   └── scenes/
│   │       └── FinancialOrbitScene.tsx   # Canvas, OrbitControls & lighting
│   ├── types/                            # TypeScript interfaces
│   │   └── index.ts
│   └── utils/
│       ├── cn.ts                         # Classname merger
│       ├── currency.ts                   # INR currency formatting & paise math
│       └── date.ts                       # Date range and Indian formatting helpers
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Academic Test Suite Execution Results

All test cases specified in the project report (Chapter 7, Table 7.1) along with boundary condition tests have been codified and executed via Vitest.

### Test Results Summary: 21 Tests Passed (100% Pass Rate)

| Test ID | Objective | Input / Condition | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-01** | Add Valid Expense | Amount: ₹2,500, Category: Education, Date: 2026-10-03 | Transaction is validated and saved as 250,000 paise | Validated and stored correctly | **PASS** |
| **TC-02** | Add Valid Income | Amount: ₹15,000, Category: Allowance, Date: 2026-10-01 | Transaction is validated and saved as 1,500,000 paise | Validated and stored correctly | **PASS** |
| **TC-03** | Reject Empty Amount | Amount: `""` (empty string) | Rejected with schema validation error | Error thrown: "Amount is required and cannot be empty" | **PASS** |
| **TC-04** | Reject Zero / Negative | Amount: `0` and `-500` | Rejected with schema validation error | Error thrown: "Amount must be greater than zero" | **PASS** |
| **TC-05** | Reject Alphabetic Amount | Amount: `"five hundred"` | Rejected with numeric validation error | Error thrown: "Amount must be a valid number" | **PASS** |
| **TC-06** | Income & Expense Math | Inflow: ₹1,000, Outflow: ₹250 | Net Balance = ₹750, Savings Rate = 75% | Net Balance = ₹750 (75,000 paise), Rate = 75% | **PASS** |
| **TC-07** | Category Aggregation | 2 Food txs (₹1200 + ₹800), 1 Travel tx (₹500) | Food total = ₹2,000, Travel total = ₹500 | Categorized and aggregated precisely | **PASS** |
| **TC-08** | Academic Dataset (Table 7.3) | Allowance ₹15,000, Education ₹2,500, Food ₹1,200, Travel ₹500 | Total Income: ₹15,000, Total Expenses: ₹4,200, Balance: ₹10,800 | Matches exact academic report calculations | **PASS** |
| **TC-09** | Deletion Recalculation | Delete ₹2,000 expense from ₹5,000 income | Expenses drop to ₹0, Net Balance updates to ₹5,000 | Recalculated immediately | **PASS** |
| **TC-10** | Edit Recalculation | Update expense from ₹1,000 to ₹1,850.50 | Total expenses update to ₹1,850.50 (185,050 paise) | Recalculated without floating-point errors | **PASS** |
| **TC-11** | Decimal Amount Math | ₹12.34 + ₹56.78 | 6,912 paise = ₹69.12 exact | Exact to the single paise | **PASS** |
| **TC-12** | Indian Currency Format | ₹1,25,00,000 | Formats as ₹1.25 Cr | Compact Indian notation verified | **PASS** |
| **TC-13** | Date Boundaries | `this-month`, `this-year` | Correct start and end dates generated | Proper ISO month/year boundary strings | **PASS** |
| **TC-14** | Budget Thresholds | Normal (<80%), Warning (80-100%), Danger (>100%) | Status flags match spending consumption | All 3 status states verified | **PASS** |
| **TC-15** | CSV Formula Injection | Malicious formula cell `=cmd\|/c calc.exe!A1` | Neutralized by prepending `'` single quote | Safely escaped in CSV export | **PASS** |
| **TC-16** | CSV Import Validation | Valid rows, negative amounts, alphabetic amounts | Imports valid, skips invalid with detailed error log | 2 imported, 2 errors logged cleanly | **PASS** |
| **TC-17** | JSON Backup Validation | Valid schema vs malformed object | Valid accepted, malformed rejected | Validated without data corruption | **PASS** |
| **TC-18-21** | UI Component Testing | StatCard, Button, Badge, Orbit2DFallback | Proper DOM rendering and accessible attributes | All 4 component test suites passed | **PASS** |

---

## 5. Getting Started & Execution Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24.21.0)
- **npm**: v9.0.0 or higher (Tested on npm 11.19.0)
- Modern web browser: Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari (WebGL enabled for 3D Orbit)

### Installation
Clone or navigate to the project repository:
```bash
cd personal-expenses-tracker
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### Running Automated Tests
To run all 21 unit and integration test suites:
```bash
npm run test
```

For live watch mode during development:
```bash
npm run test:watch
```

### Building for Production
To generate an optimized production bundle:
```bash
npm run build
```
Production artifacts will be generated in `dist/`.

To preview the production build locally:
```bash
npm run preview
```

---

## 6. Data Storage & Security Explanation

1. **Local-First Architecture**: Financial information is strictly persisted in the client's browser database using **IndexedDB** through **Dexie.js**. No financial records are ever sent to remote cloud databases or third-party tracking services.
2. **Formula Injection Defense**: All CSV export functions sanitize cell inputs. If any string starts with spreadsheet formula execution characters (`=`, `+`, `-`, `@`, `\t`, `\r`), it is neutralized with a prepended single quote (`'`).
3. **Backup Recommendation**: Because browser caches can be cleared by disk cleaners or private browsing modes, users are encouraged to use the built-in **Export JSON Backup** feature in the Settings page regularly.

---

## 7. Known Limitations & Academic Scope Notes

- **Manual Transaction Entry**: Automated bank API feeds and SMS scrapers are intentionally outside the academic prototype scope to avoid exposing user banking credentials or requiring paid third-party banking APIs.
- **Single-Device Local Persistence**: Because storage is local to the device's browser profile, transactions do not synchronize across devices unless transferred using the export/import JSON backup tool.
- **Academic Year Notation**: The submitted synopsis lists the course as *Session 2025–2028*, while the report certificate notes *2025–2028* and acknowledgement notes *2026–2027*. Both notations are documented and displayed in the Academic Details modal for university review.
