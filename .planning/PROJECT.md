# Personal Expenses Tracker — 3D Financial Intelligence Application

## 1. Project Overview & Vision

**Personal Expenses Tracker** is a client-side, local-first fintech web application that transforms personal cash-flow management into an intuitive, visually engaging experience. Centered around an interactive **3D Financial Orbit** built with Three.js / React Three Fiber (alongside an accessible 2D SVG fallback), the application provides zero-latency expense tracking, dynamic category budgeting, automated threshold warnings, and deep analytics without requiring any remote cloud server or external account.

### Academic Context
- **Course / Subject:** BCA Project-I (BCA-308)
- **Institution:** Maharishi Markandeshwar Institute of Computer Technology & Business Management (MMICT & BM), Maharishi Markandeshwar (Deemed to be University), Mullana, Ambala, Haryana, India
- **Academic Session:** 2025–2028 (Report cover: 2025–2028; acknowledgement note: 2026–2027)
- **Project Guide:** Dr. Bharti Sharma, Associate Professor, MMICT & BM
- **Team Members:**
  - Abhijeet Singh (Roll No. 13250311)
  - Aanchal Saini (Roll No. 13250304)
  - Ankit (Roll No. 13250329)

---

## 2. Core Decisions & Architectural Invariants

The following technical decisions are strictly enforced across the entire codebase:

1. **Minor-Unit Financial Arithmetic (Zero Floating-Point Drift)**:
   - All currency values stored in state and IndexedDB are strictly positive integers in minor units (**paise**; ₹1 = 100 paise).
   - Conversions between floating rupee user input and integer paise occur solely at the validation boundary (`rupeesToPaise` / `paiseToRupees`).
   - Floating-point addition or subtraction on monetary values is banned.

2. **Local-First, Zero-Cloud IndexedDB Storage**:
   - Complete persistence is hosted locally inside the client's browser using IndexedDB managed by **Dexie.js**.
   - No data leaves the user's browser, satisfying strict privacy principles.
   - Reactive UI binding is powered by `dexie-react-hooks`.

3. **Dual Visualizations (3D WebGL Orbit + 2D Accessible SVG)**:
   - Primary view: Three.js / React Three Fiber interactive orbital visualization where the central core reflects net capital and orbiting nodes reflect categorical expenditure.
   - Fallback view: `Orbit2DFallback` automatically engages if WebGL is unavailable, if an error boundary catches a Three.js issue, or if the user/environment enables `prefers-reduced-motion` / Low performance mode.

4. **Security & Data Sanitization**:
   - Runtime validation with **Zod** schema enforcement (`amount > 0`, non-empty strings, ISO dates).
   - CSV Formula Injection defense (`sanitizeCsvCell` neutralizes cells prefixed with `=`, `+`, `-`, `@`, `\t`, `\r` by escaping with a leading single quote `'`).
   - JSON Backup schema verification before database restoration.

5. **Design System & Theme**:
   - Futuristic dark fintech UI (`#0B0F19` background, `#111827` cards, cyan/emerald glowing accents, glassmorphic modals and borders).
   - Indian Rupee (`₹`) primary notation with formatted Indian numbering system (`₹1,25,000` or compact `₹1.25 L` / `₹1.25 Cr`).

---

## 3. Scope Boundaries

### What the Project IS:
- A responsive, standalone, local-first Single Page Application (SPA).
- A complete budgeting, expense tracking, and reporting platform with 3D visualization.
- An academic-compliant reference software meeting all BCA-308 test cases (TC-01 through TC-21).
- Portable through standard CSV and JSON export/import pipelines.

### What the Project IS NOT:
- Not a multi-tenant cloud SaaS with backend authentication servers.
- Not a live bank account syncing app (no Plaid / Open Banking APIs).
- Not an investment trading or cryptocurrency portfolio simulator.

---

## 4. Evolution Rules & Subagent Guidelines

When making changes or adding features:
- **Preserve Minor Units**: Never introduce raw floats for stored or calculated amounts.
- **Maintain Test Coverage**: Ensure all 21 Vitest test cases in `src/test/` continue to pass without regression.
- **Keep Clean Layering**: Feature logic resides in `src/features/`, reusable components in `src/components/`, data queries in `src/database/repositories/`, and mathematical transformations in `src/services/calculations/`.
