# Phase 6 — Architecture Rewrite

## Context

By Phase 6, the scientific core is proven, the UI has a design system, and computations + graphs are isolated in `src/core/` and `src/graphs/`. What remains is the application layer: build tooling, state management, routing, and the React version itself. CLAUDE.md calls the current architecture tangled, and the 7-point modernization plan explicitly calls for rebuilding it on a modern stack.

Current state:
- **Build**: Create React App (CRA) with `react-scripts 5.0.0`, TypeScript 4.5, target ES5, Webpack under the hood.
- **State**: Redux Toolkit (`@reduxjs/toolkit` 1.7.1) with 4 slices totaling ~783 lines, ~177 `useAppSelector`/`useAppDispatch` usages across the codebase. Many slices write directly to `localStorage` for persistence.
- **React**: 17, using `ReactDOM.render` (not `createRoot`).
- **Router**: `react-router-dom` 6.2.1, lazy-loaded pages with Suspense, no route guards.
- **Linting**: ESLint + Prettier, Husky pre-commit hook.
- **Service worker**: defined but not registered.

CRA is unmaintained (last release April 2022, officially deprecated). Staying on it blocks modern tooling. React 17 blocks the useful parts of React 18 (automatic batching, `useId`, `useSyncExternalStore`, Suspense for data, transitions). Redux is overkill for a 4-slice client-only app and forces boilerplate that makes the code harder to read.

This phase is internally sequential. Each sub-step is its own merge-worthy unit; they can land across multiple sessions.

## Goal

1. **Build**: CRA → Vite 5. Jest → Vitest.
2. **React**: 17 → 18, then 18 → 19 (staged).
3. **State**: Redux Toolkit → Zustand. Per-page stores instead of one monolithic store.
4. **Linting/Formatting**: ESLint → Oxlint. Prettier → Oxfmt (if stable; otherwise keep Prettier).
5. **Service worker**: decide — register properly or remove entirely.
6. **Routing**: keep `react-router-dom` 6. No change needed beyond updating imports if React 19 forces it.
7. **`console.log` ban**: preserved through linter migration.

## Non-Goals

- No new features in this phase.
- No scientific changes (core is frozen by ESLint boundary).
- No design changes (design system is the UI contract from Phase 3 onward).
- No migration of i18n engine (i18next stays).
- No migration of file parsing libs (`xlsx`, `file-saver`, etc. stay).

## Sub-Phases (Internal Order)

This phase is **six sub-phases** executed sequentially. Each lands independently and the app stays functional between them.

### 6a — CRA → Vite + Vitest

**Why first**: unblocks React 18, unblocks modern tooling, makes the dev loop orders of magnitude faster. Vitest is a drop-in replacement for Jest (~95% API-compatible), so Phase 1 tests migrate with near-zero friction.

**Steps**:
1. Install `vite`, `@vitejs/plugin-react`, `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/dom`. Remove `react-scripts` after everything works.
2. Create `vite.config.ts`:
   - React plugin
   - Base URL matching current GitHub Pages deploy (`/PMTools_2.0/` or root depending on domain)
   - SCSS modules auto-configured (Vite handles this out of the box)
   - Path aliases mirroring current `tsconfig.json`
   - Test config: `test.environment = 'jsdom'`, `test.globals = true`, `test.setupFiles = ['src/setupTests.ts']`
3. **Verify the production base URL before doing anything else.** `package.json` `homepage` is currently `https://pmtools.ru/` — root path, no subpath. So Vite's `base` is `'/'`. Cross-check that the GitHub Pages workflow doesn't override this with a `/PMTools_2.0/` subpath. If it does, decide which is canonical (the custom domain wins) and align the workflow before the migration. **Document the decision in `.claude/development-roadmap/notes/phase-6a-vite-migration-notes.md`** before committing the Vite config.
4. Move `public/index.html` → root `index.html` (Vite convention). Update `src="/src/index.tsx"` inside.
5. Rename `src/index.tsx` → keep name but update mount code to use `createRoot` if Phase 6b lands together, otherwise keep `ReactDOM.render` for now.
6. Update scripts in `package.json`:
   - `start` → `vite`
   - `build` → `vite build` (no need for `CI=false` anymore)
   - `typecheck` → unchanged
   - `test` → `vitest run`
   - `test:watch` → `vitest`
   - `lint`, `format`, `verify` — unchanged
7. Delete `react-scripts` related config, `craco.config.js` if any, `reportWebVitals.ts`.
8. Update imports that relied on CRA-specific behavior (e.g., `process.env.REACT_APP_VERSION` → `import.meta.env.VITE_VERSION`, with the version pulled from `package.json` via Vite's `define`).
9. Update `.github/workflows/*.yml` — Node version stays at 22.10.0 (already), `npm ci && npm run build` still works.
10. **Service worker decision (cannot defer past 6a):**
    - Today the SW is defined but its `register()` call is dead code. CRA-style `serviceWorkerRegistration.ts` does not survive Vite cleanly.
    - **Decide one of:** (a) remove the SW file and registration entirely — chosen if there is no real offline use case; or (b) replace with `vite-plugin-pwa` and properly register, with a precache list that actually matches PMTools' assets.
    - Default recommendation: **remove**. PMTools has no documented offline use case, scientists run it from a browser tab, and a half-registered SW is a footgun (stale assets after deploy, hard-to-diagnose caching bugs).
    - Document the choice in `phase-6a-vite-migration-notes.md`.
11. Run full test + build + visual regression. Fix any breakage.

**Exit**: `npm run start` launches via Vite, `npm test` runs via Vitest, production build works, GitHub Pages deploy succeeds.

### 6b — React 17 → 18

**Why now**: React 18 is the stable baseline for every modern library. CLAUDE.md currently forbids this without explicit approval — Phase 6 is that approval.

**Steps**:
1. `npm install react@18 react-dom@18 @types/react@18 @types/react-dom@18`.
2. Update `src/index.tsx`:
   ```ts
   import { createRoot } from 'react-dom/client';
   const container = document.getElementById('root')!;
   const root = createRoot(container);
   root.render(<App />);
   ```
3. Wrap in `StrictMode` or not — **not** (thesis notes mention `StrictMode` was removed for performance; respect that, the decision was intentional).
4. Fix the double-render fallout in any code that relied on exact render counts — unlikely in PMTools, which doesn't have this pattern.
5. Check for automatic batching breakage: multi-dispatch flows in Redux that relied on un-batched behavior. In PMTools these are rare; most dispatches are user-initiated.
6. Update `react-router-dom` — v6.2.1 already supports React 18, no change.
7. Run full test + visual regression.

**Exit**: React 18 mounted, app fully functional, no new warnings in console.

### 6c — Redux → Zustand (single-shot migration, all stores at once)

**Why after React 18**: Zustand depends on `useSyncExternalStore`, which is a React 18 API (and has a shim for 17 but the shim is worse than native).

**Why single-shot, not slice-by-slice**: maintaining Redux and Zustand simultaneously across multiple commits creates a bridge period where some pages read state through `useAppSelector` and others through Zustand hooks, with `<Provider>` still mounted, with persisted-state keys colliding. That's a hostile environment for any bug. PMTools has only 4 slices and ~177 hook usages — small enough that the whole migration lands as **one focused sub-phase** (not necessarily one commit, but one sub-phase with no half-state in main).

**Approach**: one Zustand store per logical domain. No single giant store.

```
src/stores/
├── appSettingsStore.ts        # colorMode, hotkeys
├── parsedDataStore.ts          # treatmentData, dirStatData, siteData
├── pcaPageStore.ts             # reference, projection, selectedStepsIDs, interpretations
├── dirPageStore.ts             # vgpData, reference, selectedDirectionsIDs, interpretations
├── persistence.ts              # Shared localStorage middleware + key conventions
└── migration.ts                # ONE-TIME read-old-Redux-keys → write-new-Zustand-keys → delete-old
```

**Per-store template**:
```ts
// src/stores/pcaPageStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PcaPageState {
  reference: 'specimen' | 'geographic' | 'stratigraphic';
  projection: 'NE' | 'SE' | 'NW' | 'SW';
  selectedStepIds: string[];
  // ... rest
  setReference: (r) => void;
  // ... rest
}

export const usePcaPageStore = create<PcaPageState>()(
  persist(
    (set) => ({
      reference: 'specimen',
      projection: 'NE',
      selectedStepIds: [],
      setReference: (reference) => set({ reference }),
      // ...
    }),
    { name: 'pcaPage' }
  )
);
```

### Persistence migration — DO NOT LOSE USER DATA

This is the most critical part of Phase 6c. PMTools users are scientists; their `localStorage` may hold an in-progress interpretation session that took hours to set up. **Losing it is a bug worse than any other in this whole roadmap.**

Two acceptable strategies:

**Strategy A — preserve key shape (preferred)**:
- Pick Zustand persist keys identical to (or transparently compatible with) the existing Redux-persisted shape.
- The first Zustand load reads the same `localStorage` slot the old Redux code wrote and silently inherits user state.
- Pros: zero migration code, zero risk of a botched migration.
- Cons: locks Zustand store shape to whatever Redux had — sometimes that's awkward.

**Strategy B — explicit one-time migration (`src/stores/migration.ts`)**:
- On app boot, before any store initializes, run a migration function that:
  1. Reads every legacy Redux-persisted key.
  2. Maps each into the new Zustand store's persistence format.
  3. Writes the new keys.
  4. **Verifies** the write succeeded by reading back.
  5. Only after verification, deletes the old keys.
  6. Logs a one-line confirmation to a versioned `localStorage.pmtools.migration.v6c` flag so it never runs twice.
- The migration code is exhaustively unit-tested with synthetic localStorage snapshots from the current version.
- The migration code is **kept in the repo permanently** (not "removed in a later cleanup") — users may install the new version after months away, and their old keys still need to migrate.

**Hybrid (most likely outcome)**: Strategy A for slices where the shape happens to align, Strategy B for the rest. Document in `.claude/development-roadmap/notes/phase-6c-zustand-persistence-migration.md` exactly which keys go which way.

**Test plan for the migration**:
1. Manual: take a real localStorage dump from a current PMTools session (Ivan exports his own session), check it into a fixture, write a unit test that runs the migration against it and asserts every interpretation, every selected direction, every reference toggle survives.
2. CI: run the migration test on every PR.
3. Pre-release dry run: deploy to a staging URL, load with a real session, verify nothing is lost, then ship.

### Migration order

The whole sub-phase 6c runs as a tight sequence. No long-lived intermediate state where Redux + Zustand both exist on `main`:

1. Build all four stores in parallel commits on a feature branch.
2. Build and test the persistence migration code on the same branch.
3. Migrate every `useAppSelector`/`useAppDispatch` usage in one mechanical sweep (~177 sites; codemod-able).
4. Delete `src/services/reducers/`, `src/services/store/`, the `<Provider>` wrapper.
5. Remove `@reduxjs/toolkit`, `react-redux`, `redux-thunk` from `package.json`.
6. Delete `src/__tests__/helpers/renderGraph.ts` from Phase 2 — graphs are now prop-driven (Phase 5) and stores are injectable. The throwaway helper has no reason to live past this commit.
7. Run the full test + visual regression suite + persistence migration tests.
8. Merge the whole branch in one PR.

**Consolidate localStorage**: the 40+ direct `localStorage.setItem` calls scattered across reducers get replaced by Zustand's `persist` middleware. This is a big simplification.

**Non-Redux localStorage users** (per Phase 6 audit):
- `src/App/App.tsx` — theme init read (folded into `appSettingsStore`).
- `src/components/AppLogic/AppSettings/hotkeys.tsx` — folded into `appSettingsStore`.
- `src/components/MainPage/Helper/Helper.tsx` — changelog-shown flag. Folded into `appSettingsStore`.
- `src/components/Common/ErrorBoundary/ErrorBoundary.tsx` — crash-recovery flag. Stays as a one-liner outside any store (it's a self-protective flag, not user state).

**Exit**: No Redux imports anywhere in the repo. All state flows through Zustand stores. Persistence migration tested against real session dumps. Visual regression tests still pass. `renderGraph.ts` deleted.

### 6d — React 18 → 19

**Why last in the React track**: React 19 brings concurrent features, the new `use` hook, `useActionState`, and a few minor API shifts. PMTools uses none of the new features; the upgrade is only for staying current.

**Steps**:
1. `npm install react@19 react-dom@19 @types/react@19 @types/react-dom@19`.
2. Check breaking changes list — as of 2026-04 the main ones are deprecated forwardRef for components (`ref` as a normal prop), removal of `PropTypes`, stricter types.
3. Fix any TypeScript errors from stricter types.
4. Run full test + visual regression.

**Exit**: On React 19, `npm run build` green, tests green.

### 6e — ESLint → Oxlint

Oxlint is written in Rust, 50–100× faster than ESLint for the same rule set. It's production-ready as of 2026-04 according to recent benchmarks, though its plugin ecosystem is smaller.

**Check before committing**:
1. Does Oxlint support every rule currently used? Run `oxlint` against the repo, inspect the warnings vs current ESLint output.
2. Does Oxlint support `no-restricted-imports` with **path-pattern restrictions** (the boundary rules from Phases 3, 4, 5 require disallowing imports from specific repo paths, not just specific package names)? Specifically check `oxc_linter::rules::eslint::no_restricted_imports` for path/group support. If it does not support path patterns, **this sub-phase is aborted** — keep ESLint. The boundaries are more important than linter speed.
3. Does Oxlint support the `no-console` rule? (CLAUDE.md mentions `console.log` is forbidden — it's a hard rule.)
4. Does Oxlint enforce the repo-wide `@tanstack/*` ban from Phase 3?

**If Oxlint passes the checks**:
1. Install `oxlint` as devDependency.
2. Replace ESLint in `package.json` scripts.
3. Delete `.eslintrc.*` files.
4. Update CI and Husky pre-commit hook.
5. Run lint, verify the same issues are caught.

**If Oxlint fails any check**: keep ESLint, document the reason in `.claude/development-roadmap/notes/phase-6e-oxlint-decision.md`. No shame in staying — the point of Phase 6 is a better foundation, not a speed contest.

### 6f — Prettier → Oxfmt (conditional)

As of April 2026, Oxfmt status needs re-verification before starting. **If it's still alpha, keep Prettier and skip this sub-phase entirely.** Prettier is boring, reliable, fast enough, and widely supported by editors.

If Oxfmt is stable:
1. Install, replace Prettier in scripts, delete `.prettierrc`.
2. Run full format pass and commit the diff as a single formatting-only commit.

Otherwise defer to a future session.

## Exit Criteria

- [ ] CRA removed, Vite is the build tool.
- [ ] Jest removed, Vitest runs all tests, Phase 1 coverage stays at 100% for statistics + parsers + converters.
- [ ] React 19 mounted, `createRoot` used.
- [ ] Zustand is the only state management library. `@reduxjs/toolkit`, `react-redux`, `redux-thunk` removed from `package.json`.
- [ ] `src/services/reducers/` and `src/services/store/` no longer exist.
- [ ] Every `useAppSelector`/`useAppDispatch` usage replaced by Zustand hooks.
- [ ] `localStorage` writes consolidated through Zustand `persist` middleware where appropriate.
- [ ] **Persistence migration verified against real session dumps** — no user data lost. Migration code permanent in repo, version-flagged in localStorage so it never runs twice.
- [ ] Service worker decision made and committed: either properly registered with real offline support, or removed entirely. No dead code, no half-state. Decision documented in `phase-6a-vite-migration-notes.md`.
- [ ] ESLint or Oxlint (decision documented) enforces all boundary rules from Phases 3, 4, 5, including path-based restrictions for `src/core/`, `src/graphs/`, `src/platform/`, and the repo-wide `@tanstack/*` ban.
- [ ] `no-console` rule still blocks `console.log`.
- [ ] Phase 1 tests, Phase 2 visual tests, and build all pass.
- [ ] **No `@tanstack/*` package in `package.json`** — Phase 3 ban still holds after the architecture rewrite.
- [ ] `src/__tests__/helpers/renderGraph.ts` deleted.
- [ ] Dev server startup time measurably faster (record baseline and final).

## Critical Files

### Files to create
- `vite.config.ts`
- `vitest.config.ts` (or inline in `vite.config.ts`)
- `src/stores/appSettingsStore.ts`, `parsedDataStore.ts`, `pcaPageStore.ts`, `dirPageStore.ts`, `persistence.ts`, `migration.ts`
- `.claude/development-roadmap/notes/phase-6a-vite-migration-notes.md` (base URL + SW decision)
- `.claude/development-roadmap/notes/phase-6c-zustand-persistence-migration.md` (per-key migration strategy)
- `.claude/development-roadmap/notes/phase-6e-oxlint-decision.md` (go / no-go)

### Files to modify
- `index.html` (root, moved from `public/`)
- `src/index.tsx` — `createRoot`
- `package.json` — major dependency shuffle
- `.github/workflows/*` — update for Vite build
- Every consumer of `useAppSelector`/`useAppDispatch`

### Files to delete
- `src/services/reducers/`
- `src/services/store/`
- `react-scripts` and related configs
- `public/index.html` after move
- `reportWebVitals.ts`
- `serviceWorkerRegistration.js` if service worker is removed entirely
- Phase 2's `renderGraph.ts` helper

### Files to leave alone
- `src/core/` — frozen by ESLint boundary.
- `src/graphs/` — frozen by ESLint boundary.
- `src/platform/` — frozen by ESLint boundary.
- `src/design-system/` — frozen by ESLint boundary.

## Verification

After each sub-phase:
```bash
npm run verify
npm test -- --run              # Vitest equivalent of --watchAll=false
npx playwright test
npm run build
```

After the whole phase:
```bash
# Dev server startup time — run 5 times, take best
time npm start -- --port 3001  # kill after ready signal
```

## Risks

| Risk | Mitigation |
|---|---|
| CRA → Vite env variable differences | Search-and-replace `process.env.REACT_APP_*` → `import.meta.env.VITE_*`. One-time mechanical pass. |
| Vite base URL mismatch with GitHub Pages workflow | Resolved in 6a Step 3 before anything else. Decision recorded in notes. |
| Jest → Vitest incompatibility in a test | Expected ~5% surface differences. Fix per test. Document any systematic changes in `src/__tests__/README.md`. |
| React 18 automatic batching breaks an explicit flush-based flow | Rare in PMTools; if it happens, wrap the flush point with `flushSync`. |
| **Persistence migration loses a user's session** | Tested against real session dumps (Ivan's own export). Migration verifies write before deleting old keys. Migration code stays permanent so users returning months later still migrate cleanly. |
| Zustand persist key shape conflicts with Redux-persisted shape | Per-key strategy in `phase-6c-zustand-persistence-migration.md`: Strategy A (preserve key shape) or Strategy B (explicit one-time migration). Hybrid is the realistic outcome. |
| React 19 type strictness surfaces latent bugs | Good — fix them. They would have surfaced eventually. |
| Oxlint missing path-based `no-restricted-imports` | Abort 6e, keep ESLint. Document decision. Boundaries beat speed. |
| Test coverage drops during state migration | Re-run coverage as part of the single-shot 6c verification. 100% must hold. |
| Route structure breaks with lazy loading | Low risk; router version unchanged. Re-test every route manually after the 6b commit. |
| Service worker indecision lingers as dead code | 6a Step 10 forces a yes/no decision before 6a merges. No ambiguity carried forward. |

## Dependencies on Other Phases

- **Depends on Phase 1**: tests guarantee no regression during state migration.
- **Depends on Phase 2**: visual regression is the only practical way to catch render-level breakage from React upgrades.
- **Depends on Phase 3**: design system is already injected with CSS custom properties, no React context needed, so removing Redux is trivial for theme.
- **Depends on Phase 4**: `src/core/` is already isolated, Zustand migration only touches app-layer code.
- **Depends on Phase 5**: graphs are already prop-driven, they don't need any rewiring when state changes.
- **Feeds Phase 7**: clean state layer + modern tooling makes worker and WASM integration much easier.
