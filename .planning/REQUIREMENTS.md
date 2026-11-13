# Requirements Specification

This document defines the complete functional, technical, and compliance requirements for the **Personal Expenses Tracker**.

## Status Legend
- [x] **IMPLEMENTED & VERIFIED**: Fully functional, supported by UI and validated by automated tests.
- [ ] **PLANNED**: Identified for future phases or enhancements.

---

## 1. Transaction Management

| Requirement ID | Description | Validation Reference | Status |
|---|---|---|---|
| **REQ-TX-01** | Support adding income and expense transactions with amount, category, date, and optional description. | TC-01, TC-02 | [x] |
| **REQ-TX-02** | Validate amount inputs: strictly require positive numeric values, rejecting empty, zero, negative, or alphabetic strings. | TC-03, TC-04, TC-05 | [x] |
| **REQ-TX-03** | Support editing existing transactions, recalculating balances and categories instantaneously. | TC-10 | [x] |
| **REQ-TX-04** | Support deleting transactions with immediate balance and budget recalculation. | TC-09 | [x] |
| **REQ-TX-05** | Filter transactions by period (`this-week`, `this-month`, `last-month`, `this-year`, `all`, `custom`), type, and category. | TC-13 | [x] |
| **REQ-TX-06** | Real-time search by transaction description or category name. | UI / TransactionsPage | [x] |
| **REQ-TX-07** | Support sorting transactions by date (desc/asc) and amount (desc/asc). | TransactionsPage | [x] |
| **REQ-TX-08** | Store all amounts in integer minor units (paise) to eliminate floating-point drift. | TC-01, TC-11 | [x] |

---

## 2. Financial Calculations & Budgeting

| Requirement ID | Description | Validation Reference | Status |
|---|---|---|---|
| **REQ-CALC-01** | Calculate Total Income, Total Expenses, Net Balance, and Savings Rate. | TC-06, TC-08 | [x] |
| **REQ-CALC-02** | Support monthly category-specific spending budgets and overall monthly cap. | BudgetsPage | [x] |
| **REQ-CALC-03** | Calculate budget consumption percentage and trigger status thresholds (`Normal` <80%, `Warning` 80-100%, `Exceeded` >100%). | TC-14 | [x] |
| **REQ-CALC-04** | Aggregate daily spending velocity for trend analysis. | TC-06, ReportsPage | [x] |
| **REQ-CALC-05** | Format monetary values in standard Indian numbering system (Lakhs/Crores notation). | TC-12 | [x] |

---

## 3. Visualizations & 3D Financial Orbit

| Requirement ID | Description | Validation Reference | Status |
|---|---|---|---|
| **REQ-VIS-01** | Render interactive 3D WebGL Financial Orbit using Three.js / React Three Fiber. | FinancialOrbitScene | [x] |
| **REQ-VIS-02** | Dynamically scale central core geometry and pulse color based on net balance. | CentralCore.tsx | [x] |
| **REQ-VIS-03** | Orbit category nodes proportional to categorical spending share with hover tooltips. | CategoryNodes.tsx | [x] |
| **REQ-VIS-04** | Provide accessible 2D SVG fallback (`Orbit2DFallback`) when WebGL is absent, in low-performance mode, or when motion is reduced. | TC-21, Orbit2DFallback | [x] |
| **REQ-VIS-05** | Render Recharts categorical spending pie chart, monthly income vs expense bar chart, and trend area chart. | CategoryPieChart, IncomeExpenseBarChart, TrendAreaChart | [x] |

---

## 4. Storage, Backup & Data Portability

| Requirement ID | Description | Validation Reference | Status |
|---|---|---|---|
| **REQ-DATA-01** | Local-first IndexedDB persistence using Dexie.js with reactive updates. | db.ts, schema.ts | [x] |
| **REQ-DATA-02** | Export transactions to CSV with defense against Excel/Spreadsheet formula injection (`sanitizeCsvCell`). | TC-15 | [x] |
| **REQ-DATA-03** | Import transactions from CSV with deduplication and row-level validation. | TC-16 | [x] |
| **REQ-DATA-04** | Complete JSON database backup and restore with Zod schema verification. | TC-17 | [x] |
| **REQ-DATA-05** | One-click academic seed dataset generator matching BCA-308 Table 7.3 specifications. | TC-08, seed.ts | [x] |

---

## 5. UI/UX & Academic Requirements

| Requirement ID | Description | Validation Reference | Status |
|---|---|---|---|
| **REQ-UI-01** | Dark fintech visual theme with responsive sidebar and mobile drawer navigation. | App.tsx, Sidebar, MobileNav | [x] |
| **REQ-UI-02** | Global quick-add transaction modal accessible from header and sidebar across all pages. | TransactionModal | [x] |
| **REQ-UI-03** | Accessible Academic Project modal displaying MMICT & BM university affiliation, guide, and student roll numbers. | AcademicModal | [x] |
| **REQ-UI-04** | Reactive toast notification system for user actions and budget threshold alerts. | ToastContainer, useToast | [x] |

---

## 6. Future Enhancements (Roadmap)

| Requirement ID | Description | Target Phase | Status |
|---|---|---|---|
| **REQ-FUT-01** | Automated recurring transactions (daily, weekly, monthly subscriptions/bills). | Phase 6 | [ ] |
| **REQ-FUT-02** | Offline-capable Progressive Web App (PWA) with service worker and install manifest. | Phase 6 | [ ] |
| **REQ-FUT-03** | Client-side receipt OCR parsing (extracting amount and merchant from uploaded image). | Phase 7 | [ ] |
| **REQ-FUT-04** | Multi-currency support with offline caching of conversion rates. | Phase 7 | [ ] |
| **REQ-FUT-05** | Custom dark/light mode toggle with OLED high-contrast preset. | Phase 6 | [ ] |
