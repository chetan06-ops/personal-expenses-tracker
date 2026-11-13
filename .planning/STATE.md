# Current System State & Living Memory

## Active Milestone & Status
- **Current Position:** Brownfield Onboarding Complete (`/gsd-onboard` executed).
- **Core Status:** Production-ready local-first financial application with 100% test pass rate.
- **Active Test Baseline:** 21 / 21 Vitest tests passing (`academic-test-cases.test.ts` & `components.test.tsx`).
- **Next Logical Step:** Phase 6 Planning (`/gsd-plan`) for PWA installation, recurring transactions, or user-selected feature work.

---

## Technical Health & Metrics
- **TypeScript:** Strict type checking configured (`tsconfig.json`).
- **Persistence:** Dexie.js (IndexedDB `PersonalExpensesTrackerDB`, version 1).
- **Frontend Stack:** React 18.3, Vite 5.4, Tailwind CSS 3.4.
- **3D Engine:** Three.js 0.169, React Three Fiber 8.17, Drei 9.120.
- **Test Framework:** Vitest 2.1, React Testing Library 16.0, JSDOM 25.0.

---

## Architectural Invariants in Effect
1. **Paise Math**: All internal financial numbers are integers representing paise (₹1 = 100 paise).
2. **Formula Neutralization**: Every CSV cell output passes through formula sanitization.
3. **Graceful 3D Degradation**: Automatic fallback to SVG 2D visualization on WebGL absence or error.
4. **Local Isolation**: Zero external analytics or cloud backends; all data remains in browser IndexedDB.

---

## Blockers & Open Items
- **Blockers:** None.
- **Open Items for Decision:**
  1. Priority order for Phase 6 (PWA offline installability vs Recurring Transactions engine vs Dark/Light theme toggle).
