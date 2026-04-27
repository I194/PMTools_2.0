# Phase 5 — Isolate Graphs Into a Separate Directory

## Context

PMTools graphs are hand-written SVG — Zijderveld, stereonet (equal-area), magnetization, VGP, fold test, reversal test. The thesis (`src/assets/PMTools_how_to_use.pdf`) explicitly says: *"все графики в PMTools написаны с нуля без использования каких-либо библиотек и внешних модулей"*. This is unusual and valuable — there is no good paleomag-specific plotting library in the JS ecosystem, and existing D3 / Chart.js approaches don't match the visual standards researchers expect.

By Phase 5, the graph math already lives in `src/core/graphs/` (moved in Phase 4), and the graph components live in `src/components/AppGraphs/` still using Redux. This phase relocates the graph *components* into a dedicated in-repo directory — `src/graphs/` — and decouples them from Redux, MUI, and the rest of the app layer. The result is a set of self-contained React components that depend only on React and `src/core/`.

**Important framing**: this phase keeps the graph code inside the PMTools repository. It does not publish anything, does not split the repo, does not create a monorepo. Future extraction into a standalone library is a possible direction but is **out of scope for this plan**.

## Goal

1. Create `src/graphs/` as a dedicated directory for graph React components.
2. Move every component from `src/components/AppGraphs/` into `src/graphs/` as pure, prop-driven components.
3. Remove all Redux coupling from graph components. State they care about (coordinate system, selected steps, hidden directions, label modes) becomes props with sensible defaults.
4. Remove all MUI usage (`useTheme` in AxesAndData) — theme comes from CSS custom properties set by the design system, or from explicit props.
5. Update the calling sites in `src/pages/` to pass the required props (often from Redux selectors).
6. Keep `src/graphs/` depending only on: `react`, `react-dom`, and `src/core/` (pure math).
7. Document each graph with a usage example in `src/graphs/README.md`.

## Non-Goals

- No publishing to npm, no separate package, no monorepo. `src/graphs/` stays inside the PMTools repo. Future library extraction is explicitly out of scope for this plan.
- No new graph types. Only relocation + decoupling.
- No visual redesign — graphs look the same. Any pixel change is a bug caught by Phase 2 snapshots.
- No render performance work either — that's Phase 7 Track E. Phase 5 is purely structural.
- No change to the export / SVG-download mechanism beyond what Phase 4 already did (DOM helpers are already in `src/platform/files/export.ts`).

## Source Inventory (from the codebase audit)

### Seven graph components
1. `ZijdGraph` — `src/components/AppGraphs/ZijdGraph/ZijdGraph.tsx` (~173 lines). Props today: `graphId, width, height, data, rightClickMenu`. Redux: reads `appSettingsReducer.hotkeys`, `pcaPageReducer` (reference, projection, selected steps, hidden steps, interpretation).
2. `StereoGraph` (PMD) — ~91 lines. Redux: reads `pcaPageReducer`.
3. `MagGraph` — ~73 lines. Redux: reads `pcaPageReducer.currentInterpretation`.
4. `StereoGraphDIR` — ~126 lines. Redux: reads `dirPageReducer`.
5. `StereoGraphVGP` — ~75 lines. Redux: reads `dirPageReducer`.
6. `FoldTestGraph` — ~57 lines. No Redux. Already clean.
7. `ReversalTestGraph` — ~66 lines. No Redux. Already clean.

Each graph has an `AxesAndData` child component (~1,218 lines across 7 files total) that draws axes, labels, points, and interpretation overlays. `AxesAndData` in PMD graphs uses MUI `useTheme()`.

### Shared math (already in `src/core/graphs/` after Phase 4)
- `formatters/dataToZijd`, `dataToStereoPMD`, `dataToStereoDIR`, `dataToStereoVGP`, `dataToMag`, `dataToFoldTest`, `dataToReversalTest`
- `stereoGreatCircle`, `createPath`, `dirToCartesian`, `projectionByReference`, `axesNamesByReference`, `greatCircleCache`, `siteToVGP`
- `Direction`, `Coordinates`, `Distribution` classes (moved to `src/core/math/`)

## Target Structure

```
src/graphs/
├── index.ts                              # Public barrel — sole import surface for the rest of the app
├── README.md                             # Usage guide + per-graph examples
├── types.ts                              # GraphProps common type, themes, configs
├── theme/
│   ├── GraphTheme.ts                     # Theme type definition
│   └── defaultTheme.ts                   # Default light + dark palettes for graph-internal colors
├── ZijdGraph/
│   ├── ZijdGraph.tsx
│   ├── ZijdGraph.module.scss
│   ├── AxesAndData.tsx
│   ├── Controls.tsx                      # Reset zoom, projection toggle (optional, can be opted out)
│   └── index.ts
├── StereoGraph/
│   ├── StereoGraph.tsx                   # PCA-side stereonet
│   ├── StereoGraph.module.scss
│   ├── AxesAndData.tsx
│   └── index.ts
├── MagGraph/
│   ├── MagGraph.tsx
│   ├── AxesAndData.tsx
│   └── index.ts
├── StereoGraphDIR/
│   ├── StereoGraphDIR.tsx
│   ├── AxesAndData.tsx
│   └── index.ts
├── StereoGraphVGP/
│   ├── StereoGraphVGP.tsx
│   └── index.ts
├── FoldTestGraph/
│   └── FoldTestGraph.tsx
├── ReversalTestGraph/
│   └── ReversalTestGraph.tsx
└── shared/
    ├── Axis.tsx                          # Common axis drawing primitive
    ├── Point.tsx                         # Common point primitive with hover/selection state
    ├── GreatCircle.tsx                   # Reused across stereo graphs
    ├── Legend.tsx
    └── Tooltip.tsx                       # Graph-internal tooltip (no design-system dep)
```

**Hard boundary**: `src/graphs/` may import from `src/core/graphs/` (pure math) and `react` / `react-dom`. It may NOT import from `src/services/` (Redux), `src/design-system/`, `src/components/`, `src/pages/`, `src/App/`, `src/platform/`, or anything MUI/Radix/TanStack.

Enforced by an ESLint `no-restricted-imports` rule similar to Phase 3 and Phase 4.

## Prop Contract Redesign

Each graph component accepts a **single props object** with a sensible default for every optional field. Example for `ZijdGraph`:

```ts
export interface ZijdGraphProps {
  // Data
  data: PmdData;                                    // from src/core/types
  interpretation?: Interpretation;

  // Coordinate system and projection
  reference: 'specimen' | 'geographic' | 'stratigraphic';
  projection: 'NE' | 'SE' | 'NW' | 'SW';             // default: 'NE'

  // Selection and visibility
  selectedStepIds?: string[];
  hiddenStepIds?: string[];

  // Display options
  width: number;
  height: number;
  showTicks?: boolean;                               // default: true
  showAnnotations?: boolean;                         // default: true
  showLabels?: boolean;                              // default: true
  showTooltips?: boolean;                            // default: true
  labelMode?: 'id' | 'name' | 'both';                // default: 'name'

  // Theme (CSS custom properties by default, or explicit)
  theme?: Partial<GraphTheme>;                       // default: read from [data-theme]

  // Events
  onStepClick?: (stepId: string) => void;
  onStepHover?: (stepId: string | null) => void;
  onSelectionChange?: (selectedIds: string[]) => void;

  // Identification
  graphId: string;                                   // for SVG export
}
```

**All previously-Redux-derived state becomes props.** The calling page (PCA page) reads from Redux and passes down. No `useAppSelector` inside graph components.

The same pattern applies to every graph. Fold test and reversal test are already close to this — they're the easiest.

## Theme Decoupling

Graphs need colors (axes, points, interpretation lines, grid). Options:

**Chosen approach**: graphs read CSS custom properties defined by the Phase 3 design system, with an override prop for standalone use.

```ts
// src/graphs/theme/defaultTheme.ts
export const defaultTheme: GraphTheme = {
  axis: 'var(--color-graph-axis, #333)',
  point: 'var(--color-graph-point, #1e90ff)',
  pointSelected: 'var(--color-graph-point-selected, #ff6b00)',
  interpretationLine: 'var(--color-graph-interpretation, #228b22)',
  greatCircle: 'var(--color-graph-great-circle, #8a2be2)',
  grid: 'var(--color-graph-grid, #ccc)',
  text: 'var(--color-graph-text, #111)',
};
```

This way:
- Inside PMTools: graphs automatically pick up light/dark from `<html data-theme="dark">`.
- Outside PMTools: the fallback colors in `var(..., fallback)` apply.
- Explicit override: pass `theme={{ axis: '#f00' }}` for one-off styling.

`useTheme` from MUI is deleted. Graph components never import anything from the design system — the coupling is via CSS custom properties only.

**SVG gotcha — apply colors via CSS, not inline attributes.** SVG `fill="var(--token)"` and `stroke="var(--token)"` as inline XML attributes do not always pick up CSS custom properties (browser-dependent). The reliable approach is to set colors via CSS rules in the graph's `.module.scss` file (`.zijdAxis { stroke: var(--color-graph-axis); }`) and reference those classes from JSX, not via inline `fill=`/`stroke=` attributes containing `var(...)`. This is a one-line rule but missing it will cause "white-on-white" rendering on a subset of browsers.

## Execution Order

### Step 0 — Prerequisites
1. Confirm Phase 1, 2, 3, 4 are all complete and green on `main`.
2. Create `src/graphs/` skeleton.
3. Add ESLint boundary rule for `src/graphs/`.
4. Capture pre-extraction Phase 2 visual snapshots as the baseline.

### Step 1 — Start with the easy ones (no Redux, no MUI)
1. Move `FoldTestGraph` — already prop-driven. Update pages to import from `src/graphs/`.
2. Move `ReversalTestGraph` — same.
3. Run Phase 2 visual tests. Any diffs? If yes, investigate.

### Step 2 — Decouple Redux-heavy PMD graphs
1. `ZijdGraph`:
   - Identify every Redux read. Lift those reads to the calling page.
   - Replace `useAppSelector` calls with props.
   - Replace `useTheme()` with CSS custom property reads.
   - Move to `src/graphs/ZijdGraph/`.
   - Update calling site in `src/pages/PCAPage`.
2. `StereoGraph` — same pattern.
3. `MagGraph` — same.

### Step 3 — Decouple Redux-heavy DIR graphs
1. `StereoGraphDIR` — lift Redux reads, move, update DIRPage.
2. `StereoGraphVGP` — same.

### Step 4 — Shared primitives (sub-phase 5d — biggest, treat carefully)

`AxesAndData` files total ~1218 lines across 7 graphs. Extracting shared primitives from them is the largest single chunk of Phase 5 and deserves its own internal sub-phase, executed deliberately.

1. Audit every `AxesAndData.tsx`: list every drawing primitive (axis line, tick, point, label, great-circle path, legend entry, tooltip box). Save to `.claude/development-roadmap/notes/phase-5d-axes-and-data-audit.md`.
2. Build shared primitives one at a time, lowest-risk first:
   - `Axis.tsx` — axis line + ticks + axis labels.
   - `Point.tsx` — point with hover/selected state, label affordance.
   - `GreatCircle.tsx` — reused across all stereo graphs.
   - `Legend.tsx`.
   - `Tooltip.tsx` — graph-internal tooltip with no design-system dep.
3. For each primitive: build it, migrate one graph to use it, run Phase 2 visual regression. If snapshots match, migrate the rest of the graphs to the same primitive in subsequent commits.
4. After all primitives are extracted: `AxesAndData` files either shrink to thin coordinators or disappear entirely. Whichever is cleaner wins on a per-graph basis — no forced uniformity.
5. Each primitive extraction is its own commit so any single-primitive regression is bisectable.

### Step 5 — Documentation
1. Write `src/graphs/README.md` with:
   - What each graph does (cite the thesis sections that define them).
   - A minimal usage example per graph.
   - Theme customization example.
   - How to export SVG.
   - A clear statement that this directory stays in-repo; future library extraction is not part of this plan.

### Step 6 — Delete `src/components/AppGraphs/`
1. After every caller migrated, delete the old tree.
2. Run full test + visual regression + build.

## Exit Criteria

- [ ] `src/graphs/` contains every graph component.
- [ ] `src/components/AppGraphs/` no longer exists.
- [ ] No file in `src/graphs/` imports from `src/services/`, `src/design-system/`, `src/components/`, `src/pages/`, `src/App/`, `@mui/*`, `@radix-ui/*`, `@tanstack/*` (ESLint-enforced).
- [ ] Every graph accepts its state as props; no `useAppSelector` anywhere under `src/graphs/`.
- [ ] `useTheme` from MUI is removed from every graph.
- [ ] All Phase 2 visual regression tests pass (any diffs are accepted intentional changes, regenerated after inspection).
- [ ] `src/graphs/README.md` documents usage for every graph type.
- [ ] `npm run verify && npm test && npx playwright test && npm run build` all green.
- [ ] `src/graphs/` has only `react`, `react-dom`, and `src/core/` as import dependencies (ESLint-enforced).

## Critical Files

### Files to create
- `src/graphs/` — entire tree.
- `src/graphs/README.md`.
- `src/graphs/theme/` files.
- `src/graphs/shared/` primitives.
- `.eslintrc` — boundary rule for `src/graphs/`.

### Files to modify
- `src/pages/PCAPage` — lift Redux reads, pass as props to graphs.
- `src/pages/DIRPage` — same.
- `src/design-system/tokens/colors.scss` — add graph-specific color tokens.

### Files to delete
- All of `src/components/AppGraphs/` at the end of the phase.

### Files to leave alone
- `src/core/graphs/` (pure math, already clean after Phase 4).
- `src/platform/files/export.ts` (SVG export DOM helpers, already in the right place after Phase 4).

## Verification

After each graph extraction:
```bash
npm run verify
npm test -- --watchAll=false
npx playwright test
npm run build
```

Standalone check:
```bash
# Graph library has zero app-layer dependencies
grep -rn -E "(services|design-system|components/|pages/|App/|platform/|@mui|@radix-ui|@tanstack|useAppSelector|useAppDispatch)" src/graphs/
# Must return nothing (the first match stops the phase)
```

## Risks

| Risk | Mitigation |
|---|---|
| Prop drilling from pages to graphs gets ugly | That's the correct shape. Cleaned up in Phase 6 when Zustand selectors are colocated with the consumers. |
| Redux state shape leaks into graph props | Explicit prop types in `src/core/types/` mean graph props don't mention Redux at all. |
| Visual diffs from refactoring | Phase 2 tests catch any. Investigate each one. |
| Theme tokens missing a graph-specific color | Add to `src/design-system/tokens/colors.scss` and `src/graphs/theme/defaultTheme.ts` fallback. |
| Decoupling tempts algorithmic changes | Hard rule: no math changes in Phase 5. Only component refactoring. |
| Temptation to split repo or publish | Hard rule: `src/graphs/` stays in the PMTools repo. Any library extraction is a separate, future decision. |

## Dependencies on Other Phases

- **Depends on Phase 1**: test suite covers the math.
- **Depends on Phase 2**: visual snapshots catch any accidental pixel change.
- **Depends on Phase 3**: CSS custom properties are the theming mechanism.
- **Depends on Phase 4**: `src/core/graphs/` already contains the math.
- **Feeds Phase 6**: architecture rewrite has less UI code to touch.
- **Feeds Phase 7**: graphs are the most performance-sensitive UI path; isolating them makes it easier to optimize rendering.
