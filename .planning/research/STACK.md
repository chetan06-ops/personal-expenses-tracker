# Technology Stack Research & Inventory

## 1. Core Framework & Build Tooling
- **React (v18.3.1)** & **React DOM (v18.3.1)**: Modern declarative component UI library using hooks and functional components.
- **TypeScript (v5.6.3)**: Strict static type checking (`strict: true`, `noFallthroughCasesInSwitch: true`, `noUncheckedIndexedAccess: true` recommended).
- **Vite (v5.4.11)**: ESM-based ultra-fast dev server and Rollup production bundler.
- **@vitejs/plugin-react (v4.3.4)**: Fast Refresh and JSX transform plugin.

---

## 2. Styling & Design System
- **Tailwind CSS (v3.4.14)**: Utility-first CSS framework configured with custom dark palette:
  - Background: `#0B0F19`
  - Surface: `#111827`
  - Border: `rgba(255, 255, 255, 0.08)`
  - Accent Cyan: `#06B6D4`
  - Accent Emerald: `#10B981`
- **PostCSS (v8.4.47)** & **Autoprefixer (v10.4.20)**: Modern CSS post-processing.
- **Lucide React (v0.454.0)**: Clean, consistent stroke icon system.
- **clsx (v2.1.1)** & **tailwind-merge (v2.5.4)**: Dynamic conditional class composition via `cn()` utility.
- **canvas-confetti (v1.9.4)**: Visual celebratory effects for budget/savings milestones.

---

## 3. 3D WebGL Visualization
- **Three.js (v0.169.0)**: Low-level WebGL graphics engine.
- **@react-three/fiber (v8.17.10)**: Declarative Three.js wrapper inside React component tree.
- **@react-three/drei (v9.120.4)**: Helper components including `<OrbitControls />`, `<Html />`, materials, and cameras.
- **Accessible Fallback**: Custom `Orbit2DFallback` built with pure SVG and React when WebGL is unavailable or motion is reduced.

---

## 4. Local Persistence & State Management
- **Dexie.js (v4.0.9)**: IndexedDB wrapper providing ACID transactions, indexed range queries, and schema version management.
- **dexie-react-hooks (v1.1.7)**: `useLiveQuery` integration for real-time reactivity when IndexedDB tables change.
- **Zero Cloud**: 100% offline-first client storage.

---

## 5. Validation & Forms
- **Zod (v3.23.8)**: TypeScript-first runtime schema validation with user-friendly error messages.
- **react-hook-form (v7.53.2)** & **@hookform/resolvers (v3.9.1)**: High-performance form state management with Zod schema resolution.

---

## 6. Charts & Visual Analytics
- **Recharts (v2.13.3)**: Composable SVG charting library providing:
  - `<PieChart />` with dynamic cell colors and legends.
  - `<BarChart />` for monthly income vs expense comparison.
  - `<AreaChart />` for daily spending velocity and cumulative trends.

---

## 7. Testing Infrastructure
- **Vitest (v2.1.4 / v2.1.9)**: Vite-native test runner with Jest-compatible API.
- **@testing-library/react (v16.0.1)**: React component testing utilities.
- **@testing-library/jest-dom (v6.6.3)**: DOM matchers (`toBeInTheDocument`, etc.).
- **@testing-library/user-event (v14.5.2)**: Realistic browser interaction simulation.
- **jsdom (v25.0.1)**: Node-based browser environment simulation with fake IndexedDB support.
