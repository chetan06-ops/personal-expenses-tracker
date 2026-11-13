# Project Roadmap & Phase Tracking

This roadmap defines the milestone phases for the **Personal Expenses Tracker**, tracking both historical foundation work and active/future engineering cycles.

---

## Completed Phases (Milestones Achieved)

### Phase 1: Core Architecture & Persistence Foundation
- **Goal:** Establish zero-drift financial calculation engine, Zod validation, and local-first Dexie.js IndexedDB storage.
- **Deliverables:**
  - `src/types/index.ts` with minor-unit (paise) integer model.
  - `src/database/` with `db.ts`, `schema.ts`, `seed.ts`, and repository layer.
  - `src/services/calculations/financialCalculations.ts` with paise math.
  - Academic test baseline TC-01 through TC-10 passing in Vitest.
- **Status:** **COMPLETE** (2026-11)

### Phase 2: Design System & 3D Financial Orbit Visualization
- **Goal:** Implement responsive dark fintech interface and 3D WebGL centerpiece with accessible fallback.
- **Deliverables:**
  - Glassmorphic UI library (`Card`, `Button`, `Input`, `Select`, `Badge`, `Modal`).
  - Three.js / React Three Fiber `FinancialOrbitScene` (`CentralCore`, `OrbitRings`, `CategoryNodes`, `Particles`).
  - Accessible `Orbit2DFallback` SVG alternative.
  - Recharts categorical breakdown, trend areas, and income-vs-expense bar charts.
- **Status:** **COMPLETE** (2026-11)

### Phase 3: Budget Management & Analytics Engine
- **Goal:** Comprehensive category and overall monthly budgeting with multi-level threshold alerts.
- **Deliverables:**
  - Category-level budgets with monthly partitioning.
  - Real-time warning flags (<80% Normal, 80-100% Warning, >100% Exceeded).
  - Reports page with daily velocity, monthly trends, and date range filters.
- **Status:** **COMPLETE** (2026-11)

### Phase 4: Data Portability & Security Hardening
- **Goal:** Enterprise-grade data import/export pipelines with security sanitization.
- **Deliverables:**
  - CSV export with CSV/Excel formula injection prevention (`sanitizeCsvCell`).
  - CSV import with row-by-row validation and deduplication logic.
  - Complete JSON backup and restore with Zod validation.
  - Comprehensive boundary tests (TC-11 through TC-21).
- **Status:** **COMPLETE** (2026-11)

### Phase 5: Academic Alignment & Project Packaging
- **Goal:** Fully align with MMICT & BM BCA-308 project report specifications.
- **Deliverables:**
  - Academic modal highlighting team members, guide, and syllabus requirements.
  - Table 7.3 sample dataset seeding button in Settings and automated on initial launch.
  - Documentation and test suites covering all academic test cases.
- **Status:** **COMPLETE** (2026-11)

---

## Active & Upcoming Phases

### Phase 6: PWA, Theming & Recurring Transactions (Current Target)
- **Goal:** Make the application installable as a desktop/mobile PWA, support recurring schedules, and add OLED high-contrast modes.
- **Features Planned:**
  - `vite-plugin-pwa` configuration with Web App Manifest and service worker for 100% offline caching.
  - Recurring transaction scheduler (monthly salary, recurring bills, rent).
  - High-contrast / OLED dark theme preferences in settings.
- **Status:** **READY FOR PLANNING**

### Phase 7: Smart Intelligence & Receipt Scanner (Future)
- **Goal:** Add lightweight on-device OCR for receipt image ingestion and multi-currency exchange rates.
- **Features Planned:**
  - Tesseract.js / Web-worker OCR client for receipt images.
  - Multi-currency support (USD, EUR, GBP to INR) with cached exchange rates.
- **Status:** **BACKLOG**
