# Phase 4 — Isolate All Computations Into a Separate Directory

## Context

PMTools computations are already mostly pure (see the Phase 1 audit findings), but "mostly" is not enough. There are a handful of impurities and entanglements that prevent the scientific core from being fully isolated from the rest of the app. Phase 1 already extracted three of the worst offenders (`foldTestBootstrap`, `reversalTestBootstrap`, `eigManipulations`) as a prerequisite to testing them. Phase 4 finishes the isolation work for everything else, under full protection from the test suite built in Phase 1 and the visual regression net from Phase 2.

**Important framing**: this phase relocates computations into a dedicated in-repo directory — `src/core/` — and enforces purity rules on its contents. It does NOT publish anything, it does NOT split the repo, it does NOT set up a monorepo or workspaces. Extracting the core into a separate npm library is a possible future direction, but it is **out of scope for this plan**. Everything stays inside the PMTools repository.

The purpose is:
1. A clean separation between "scientific code" and "app code" — so the boundary is visible in the file tree and enforced by tooling.
2. A guarantee that nothing in the core depends on React, Redux, i18next, MUI, or any UI layer.
3. Removal of remaining side effects (`Math.random()` as an implicit global, mutation of input arrays, `alert()`, `localStorage`, DOM side effects inside converters).
4. A prerequisite for Phase 7 — Web Workers cannot import React; WASM bindings cannot touch the DOM.

## Goal

After this phase:
1. A new `src/core/` directory contains every computation: parsers, statistics, PM tests, graph math, file serializers. **`src/core/` is the home for all computation, period.**
2. Nothing under `src/core/` imports from: `react`, `react-redux`, `@reduxjs/toolkit`, `i18next`, `react-i18next`, `@mui/*`, `@radix-ui/*`, `@tanstack/*`, `src/services/`, `src/components/`, `src/pages/`, `src/App/`, `src/design-system/`, `src/locales/`, `src/platform/`. Enforced by ESLint.
3. Every function is pure: no `Math.random()`, no `Date.now()`, no `localStorage`, no `alert()`, no `console.*`, no mutation of inputs. Randomness and time come in as function arguments.
4. No hardcoded **localized** error messages — core throws typed error classes with stable codes plus a structured `context` field carrying diagnostic data (line, column, raw value, etc.). UI translates the code into a localized message at the boundary; the structured context is what makes diagnostics still useful.
5. The core has its own self-contained types in `src/core/types/`.

A small sibling directory `src/platform/` (NOT `src/app/` — that name visually collides with `src/App/`) holds the **adapters** that touch the DOM, browser APIs, or other side-effecting environment. `src/platform/` is the place for `download()`, SVG export DOM helpers, `localStorage` access, and similar — anything that **isn't** computation but **isn't** React either. UI components are free to call into both `src/core/` and `src/platform/`.

## Non-Goals

- No publishing to npm, no separate package, no monorepo. `src/core/` is a plain directory inside the PMTools repo. Potential future extraction into a library is explicitly out of scope for this plan.
- No renaming of scientific function names — `calculatePCA_pmd` stays `calculatePCA_pmd`.
- No algorithmic changes — this is pure relocation + purity fixes, not optimization.
- No worker integration — Phase 7.

## Source Inventory (from Phase 1 audit, re-verified at phase start)

### Already pure (just moving)
- `calculateFisherMean.ts`, `calculateVGP.ts`, `calculateButlerParameters.ts`, `calculateMCFaddenIncMean.ts`, `calculateBasicStatisticalParameters.ts`, `reversalTestOldFashioned.tsx`, `getRawPlaneData.ts`
- `parserPMD.ts`, `parserDIR.ts`, `parserCSV_*.ts`, `parserXLSX_*.ts`, `parserPMM.ts`, `parserMDIR.ts`
- `src/utils/graphs/classes/Direction.ts`, `Coordinates.ts`, `Distribution.ts`
- `src/utils/graphs/formatters/*` (`dataToZijd`, `dataToStereo*`, `dataToMag`, `dataToFoldTest`, `dataToReversalTest`)

### Already extracted in Phase 1
- `foldTestCore.ts`, `reversalTestCore.ts`, pure versions of `normalizeEigenValues` / `sortEigenvectors`
- `conglomeratesTest.ts` with `alert()` removed

### Needs purity fixes in this phase
- `calculatePCA_pmd`, `calculatePCA_dir` — check for any `console.*` or implicit Redux-shape dependency.
- `calculateCutoff.ts` — mutates input array (`rejected` property appended). Rewrite to return a new array.
- `bootstrapManipulations.ts` — takes RNG as an argument (already seeded in Phase 1 tests); enforce the same signature in production call sites.
- `parserRS3.ts`, `parserSQUID.ts` — coupled to `Direction` class and `toReferenceCoordinates`. These dependencies are acceptable (both are pure math and part of the core), but re-verify.
- Any writer in `src/utils/files/converters/` that calls `download()` (a DOM side effect) — split into a pure `serializeToPMD()` that returns a string and a UI-side `downloadString(name, content)` helper.

### Stays out of `src/core/` — moves to `src/platform/`
- `download()` helper → `src/platform/files/download.ts`.
- SVG export DOM helpers → `src/platform/files/export.ts`.
- Anything else that touches `document`, `window`, `localStorage`, `Blob`, `URL.createObjectURL`, etc.

### Stays in UI (`src/components/`, `src/pages/`)
- Translation calls.
- File-input / drag-and-drop handling.
- Anything React-specific.

## Target Structure

```
src/
├── core/                           # In-repo scientific core — pure, framework-free
│   ├── index.ts                    # Public barrel — this is the import surface for the rest of the app
│   ├── README.md                   # "What lives here, what does not, and why"
│   ├── types/
│   │   ├── pmd.ts                  # PMDStep, IPmdData, etc.
│   │   ├── dir.ts                  # IDirData, interpretation types
│   │   ├── vgp.ts                  # VGPData, SiteData
│   │   ├── statistics.ts           # MeanDir, ReversalTestResult, FoldTestResult, ...
│   │   └── index.ts
│   ├── math/
│   │   ├── Direction.ts            # moved from utils/graphs/classes/
│   │   ├── Coordinates.ts
│   │   ├── Distribution.ts
│   │   ├── eigen.ts                # moved from utils/statistics/calculation/eigManipulations.ts
│   │   └── rng.ts                  # Seeded RNG type + LCG implementation
│   ├── statistics/
│   │   ├── fisher.ts               # calculateFisherMean + fisherMean + property helpers
│   │   ├── pca.ts                  # calculatePCA_pmd, calculatePCA_dir
│   │   ├── vgp.ts                  # calculateVGP, butlerParameters
│   │   ├── mcfadden.ts             # calculateMcFaddenCombineMean, calculateMCFaddenIncMean
│   │   ├── cutoff.ts               # rewritten to return new array
│   │   ├── bootstrap.ts            # drawBootstrap, generateDirectionsBootstrap (RNG-parameterized)
│   │   ├── foldTest.ts             # runFoldTest (from Phase 1)
│   │   ├── reversalTest.ts         # bootstrapCommonMeanTest, reversalTestClassic, reversalTestOldFashioned
│   │   └── conglomeratesTest.ts
│   ├── parsers/
│   │   ├── pmd.ts
│   │   ├── dir.ts
│   │   ├── rs3.ts
│   │   ├── squid.ts
│   │   ├── csv.ts                  # all CSV variants
│   │   ├── xlsx.ts                 # all XLSX variants, with xlsx_to_csv bridge
│   │   ├── pmm.ts
│   │   ├── mdir.ts                 # legacy, marked deprecated
│   │   ├── validation.ts           # ParseResult, ValidationResult types
│   │   └── shared.ts               # toExponential_PMD, putParamToString, getFileName, etc.
│   ├── converters/
│   │   ├── pmd.ts                  # toPMD — pure string return
│   │   ├── dir.ts                  # toDIR, toPMM
│   │   ├── csv.ts
│   │   ├── xlsx.ts
│   │   ├── vgp.ts                  # toVGP, toCSV_VGP, toXLSX_VGP
│   │   └── gpml.ts
│   ├── graphs/
│   │   ├── formatters/             # dataToZijd, dataToStereo*, dataToMag, dataToFoldTest, dataToReversalTest
│   │   ├── stereoGreatCircle.ts
│   │   ├── createPath.ts
│   │   ├── dirToCartesian.ts
│   │   ├── projections.ts          # projectionByReference, axesNamesByReference
│   │   ├── greatCircleCache.ts
│   │   └── siteToVGP.ts
│   └── errors/
│       ├── ParseError.ts
│       ├── StatisticsError.ts
│       └── index.ts
├── platform/                       # Browser/DOM adapters (NEW) — NOT named src/app/ to avoid collision with src/App/
│   └── files/
│       ├── download.ts             # DOM side effect: Blob + click
│       └── export.ts               # SVG export DOM helpers (moved from utils/graphs/export.ts)
├── services/                       # (still Redux until Phase 6)
├── components/
├── pages/
└── design-system/                  # (from Phase 3)
```

## Execution Order

### Step 0 — Safety net confirmation
1. Confirm Phase 1 unit tests + Phase 2 visual tests all pass on a clean `main`.
2. Create a branch for the extraction work.
3. Capture current test coverage snapshot for `src/utils/statistics/` and `src/utils/files/` in `.claude/development-roadmap/notes/phase-4-coverage-baseline.txt`.

### Step 1 — Create `src/core/` skeleton and move types first
1. Create empty `src/core/` tree and `src/core/README.md` documenting the purity rules.
2. Move scientific types from `src/utils/GlobalTypes.ts` (`PMDStep`, `IPmdData`, `IDirData`, `VGPData`, etc.) into `src/core/types/`.
3. Leave the old `src/utils/GlobalTypes.ts` as a thin re-export file so existing imports don't break mid-migration.
4. Build succeeds, tests pass.

### Step 2 — Move math primitives
1. Move `Direction`, `Coordinates`, `Distribution` from `src/utils/graphs/classes/` to `src/core/math/`.
2. Old path becomes a re-export shim.
3. Move eigenvalue helpers to `src/core/math/eigen.ts`.
4. Introduce `src/core/math/rng.ts`: `RngFn = () => number` type and a default LCG implementation.

### Step 3 — Move statistics (one file per commit)
Order from easiest to hardest:
1. `calculateButlerParameters` → `core/statistics/vgp.ts`.
2. `calculateVGP` → same.
3. `calculateFisherMean` → `core/statistics/fisher.ts`.
4. `calculateMCFaddenIncMean`, `calculateMcFaddenCombineMean` → `core/statistics/mcfadden.ts`.
5. `calculateBasicStatisticalParameters` → `core/statistics/basic.ts`.
6. `reversalTestOldFashioned` → `core/statistics/reversalTest.ts`.
7. `calculatePCA_pmd`, `calculatePCA_dir` → `core/statistics/pca.ts`.
8. `calculateCutoff` — rewrite to return a new array instead of mutating input. Update all call sites.
9. `bootstrapManipulations` — enforce RNG parameter everywhere.
10. `runFoldTest`, `bootstrapCommonMeanTest`, `reversalTestClassic`, `conglomeratesTest` → `core/statistics/`.
11. `getRawPlaneData` → `core/statistics/planes.ts`.

Each step:
- Move file into `src/core/`.
- Leave shim re-export at old path.
- Run `npm run verify && npm test && npx playwright test && npm run build`.
- Commit.

### Step 4 — Move parsers
Same pattern. 12 parsers moved one by one.

### Step 5 — Split converters from download helpers
1. Move pure string/buffer serializers from `src/utils/files/converters/*` into `src/core/converters/`.
2. Move `download()` helper and any DOM-touching code into `src/platform/files/download.ts`.
3. Update call sites: pages call `toPMD(data)` from core, then `downloadString(filename, result)` from `src/platform/`.

### Step 6 — Move graph math
1. Move `src/utils/graphs/formatters/*` into `src/core/graphs/formatters/`.
2. Move `stereoGreatCircle`, `createPath`, `dirToCartesian`, `projectionByReference`, `axesNamesByReference`, `greatCircleCache`, `siteToVGP` into `src/core/graphs/`.
3. Move `src/utils/graphs/export.ts` (SVG export DOM helpers) into `src/platform/files/export.ts` — but keep any pure layout math in core.

### Step 7 — Error class normalization
1. Replace `throw new Error('string')` patterns in parsers with typed `ParseError` from `core/errors/`.
2. Each `ParseError` has:
   - `code: string` — stable error code (UI maps to a localized message).
   - `context: { line?: number; column?: number; field?: string; rawValue?: string; expected?: string }` — structured diagnostic data so the UI can show "row 17, column 'Dec', got 'foo' expected number" without parsing strings.
3. `StatisticsError` follows the same shape with computation-specific context (which input was bad, which step failed).
4. Update UI code to catch typed errors and translate the `code` via i18next at the boundary, while displaying the structured `context` directly. **Diagnostic information must not be lost** — the most common debugging path for paleomag users is "what's wrong with my file" and they need line/column info.

### Step 8 — Shim removal
1. With every file now in `src/core/`, update every import site to import from `src/core/` directly.
2. Delete the shim files under `src/utils/statistics/`, `src/utils/files/parsers/`, `src/utils/files/converters/`, `src/utils/graphs/formatters/`, etc.
3. Final verification pass.

### Step 9 — Boundary enforcement
1. Add ESLint `no-restricted-imports` rule that prevents any file under `src/core/` from importing `react`, `react-redux`, `@reduxjs/toolkit`, `i18next`, `react-i18next`, `@mui/*`, `@radix-ui/*`, `@tanstack/*`, `src/components`, `src/pages`, `src/App`, `src/design-system`, `src/services`, `src/locales`, `src/platform`.
2. Run lint — must pass clean.
3. Mirror grep gate as a sanity check (ESLint is the source of truth, grep is belt-and-braces).

## Exit Criteria

- [ ] Every scientific computation lives under `src/core/`.
- [ ] Nothing under `src/core/` imports from UI / Redux / i18n / framework code (ESLint-enforced).
- [ ] No `Math.random()`, `Date.now()`, `localStorage`, `alert()`, `console.*` in `src/core/`.
- [ ] `calculateCutoff` no longer mutates its input.
- [ ] `bootstrapManipulations` receives RNG as a parameter at every call site.
- [ ] `src/utils/statistics/`, `src/utils/files/parsers/`, `src/utils/files/converters/` are empty or deleted.
- [ ] `src/utils/graphs/` contains only DOM-bound helpers (or is emptied and moved to `src/platform/`).
- [ ] `src/platform/` exists and holds every DOM/browser side-effect helper that used to live in utils.
- [ ] Phase 1 test coverage for `src/core/` is **100%** for statistics + parsers + converters (Phase 1 floor — must not drop). Anything below 100% blocks the phase exit.
- [ ] Phase 2 visual regression suite still passes.
- [ ] `npm run verify && npm test && npx playwright test && npm run build` all green.
- [ ] Typed error classes (`ParseError`, `StatisticsError`) replace raw `throw new Error(...)` in core.
- [ ] `src/core/README.md` clearly states the purity rules and lists what does and does not belong here.

## Critical Files

### Files to create
- `src/core/` — entire tree per the structure above.
- `src/core/README.md` — rules and guidelines.
- `src/platform/files/download.ts`, `src/platform/files/export.ts`.
- `src/platform/README.md` — what belongs here vs `src/core/` vs UI.
- `src/core/errors/ParseError.ts`, `StatisticsError.ts` (with structured `context` field).
- `src/core/math/rng.ts` (integer LCG, deterministic across engines).
- `.eslintrc` — `no-restricted-imports` boundary rule for `src/core/`.
- `.claude/development-roadmap/notes/phase-4-coverage-baseline.txt`.

### Files to modify
- Every call site of moved functions (large mechanical sweep).
- Parsers: replace string throws with typed errors.
- Cutoff callers: switch from in-place mutation to new array.

### Files to delete
- Old shim files after Step 8.
- Original files under `src/utils/statistics/`, `src/utils/files/parsers/`, `src/utils/files/converters/`, `src/utils/graphs/formatters/` once all references are migrated.

### Files to leave alone
- `src/services/` (still Redux until Phase 6).
- `src/design-system/` (done in Phase 3).

## Verification

After each file move:
```bash
npm run verify
npm test -- --watchAll=false
npx playwright test
npm run build
```

After the whole phase:
```bash
# Coverage comparison
npm test -- --watchAll=false --coverage
diff .claude/development-roadmap/notes/phase-4-coverage-baseline.txt <(cat coverage/coverage-summary.json | jq)
```

```bash
# Boundary grep — sanity check (ESLint is the source of truth)
grep -rn -E "from ['\"](react|@reduxjs|react-redux|i18next|@mui|@radix-ui|@tanstack)" src/core/
grep -rn -E "from ['\"](\.\./|src/)(components|pages|App|services|design-system|locales|platform)" src/core/
# Both must return nothing.
```

## Risks

| Risk | Mitigation |
|---|---|
| Mid-migration import breakage | Shim re-export pattern keeps old paths working until Step 8. |
| Test coverage drops during moves | Recheck after each commit; investigate any drop before proceeding. |
| `calculateCutoff` mutation fix breaks a caller that relied on mutation | Shown by test failure or visual diff. Fix the call site in the same commit. |
| Error code explosion | Start with 10–15 stable codes; refine only when a new localized message is actually needed. |
| Typed errors require UI changes | Small, one-pass mapping layer at the error boundary. |
| Scope creep into algorithmic changes | Hard rule: no math changes in Phase 4. Only relocation and purity. Any math bug discovered goes into its own `fix(science):` commit. |
| Temptation to split repo or publish | Hard rule: `src/core/` stays in the PMTools repo. Any library extraction is a separate, future decision. |

## Dependencies on Other Phases

- **Depends on Phase 1**: without the test suite, purity fixes can't be verified.
- **Depends on Phase 2**: visual tests catch any accidental graph data changes.
- **Depends on Phase 3**: cleaner UI layer makes the extraction boundary clearer.
- **Feeds Phase 5**: graph component extraction can reuse `src/core/graphs/` wholesale.
- **Feeds Phase 6**: architecture rewrite is trivial once state code is the only thing left to replace.
- **Feeds Phase 7**: workers / WASM need pure, portable code — this phase delivers it.
