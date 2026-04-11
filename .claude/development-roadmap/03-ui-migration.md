# Phase 3 — MUI → Design System + Radix + SCSS Modules + In-House Tables

## Context

PMTools depends on `@mui/material@^5.6.3`, `@mui/icons-material@^5.3.1`, `@mui/system@^5.15.6`, `@mui/x-data-grid@^6.0.0`, `@emotion/react`, and `@emotion/styled`. Across the codebase there are ~260 MUI import sites, including 12 DataGrid instances with an `apiRef` workaround in `src/components/AppLogic/DataTablesDIR/useApiRef.tsx` to compensate for free-tier DataGrid API gaps. CLAUDE.md already flags MUI as "morally outdated, scheduled for replacement."

Theme customization is minimal (only `palette.mode` light/dark in `src/App/App.tsx`), and i18next is not coupled to MUI internals, so translation keys don't need rewiring. 74 `*.module.scss` files already exist with component-scoped naming — SCSS modules are the established styling system, so the migration lands on native ground.

The goal isn't just "delete MUI" — it's to build **a proper design system layer** that pages and AppLogic components consume, so the UI primitives become a replaceable foundation rather than scattered component imports. This is the first time PMTools has a real separation between primitives and application code.

## Goal

1. Build `src/design-system/` — a dedicated layer with design tokens, primitives, and patterns.
2. Remove every MUI / Emotion dependency.
3. Replace MUI primitives with Radix UI Primitives wrapped by the design system.
4. Replace `@mui/x-data-grid` with an **in-house `DataTable` primitive** built from scratch on top of native HTML `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<td>` elements. **No TanStack Table. No DataGrid library of any kind.** Ivan has years of experience with table libs and knows they are best built by hand.
5. Replace `@mui/icons-material` with inlined SVG icons under the design system.
6. Make the rest of the app (`src/pages/`, `src/components/AppLogic/`) import **only** from `src/design-system/`, never from Radix directly.

## Non-Goals

- No visual redesign — migration is "functionally identical, visually identical, no MUI left." Design changes go in a separate future session after the migration proves stable.
- No accessibility overhaul — Radix gives a huge a11y upgrade for free, but not auditing every keyboard interaction in this phase.
- No framework migration (that's Phase 6).
- No Tailwind CSS under any circumstances.
- **No TanStack libraries under any circumstances** — table, query, virtual, anything. Hand-rolled or tiny single-purpose deps only.
- Bundle size measurement is **not** an exit criterion. The point is removing technical debt, not chasing kilobytes. If the bundle ends up bigger and the code ends up cleaner, that's a win for the project.

## Design System Structure

```
src/design-system/
├── tokens/                        # Source of truth for all design values
│   ├── colors.scss                # Light + dark palettes as CSS custom properties
│   ├── spacing.scss               # 4px scale (--space-1 .. --space-12)
│   ├── typography.scss            # Font family, sizes, weights, line heights
│   ├── radii.scss
│   ├── shadows.scss
│   ├── z-index.scss
│   ├── motion.scss                # Duration and easing tokens
│   └── index.scss                 # @forward all tokens
├── theme/
│   ├── theme.scss                 # :root {} and [data-theme="dark"] {} with all custom properties
│   └── theme.ts                   # Type-safe token names exported as TS constants
├── primitives/                    # Low-level reusable building blocks
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.scss
│   │   ├── Button.types.ts
│   │   └── index.ts
│   ├── IconButton/
│   ├── ButtonGroup/
│   ├── TextField/
│   ├── NumberField/
│   ├── Select/                    # Wraps @radix-ui/react-select
│   ├── Checkbox/
│   ├── Switch/
│   ├── Dialog/                    # Wraps @radix-ui/react-dialog
│   ├── Tooltip/                   # Wraps @radix-ui/react-tooltip
│   ├── DropdownMenu/              # Wraps @radix-ui/react-dropdown-menu
│   ├── Tabs/                      # Wraps @radix-ui/react-tabs
│   ├── Divider/
│   ├── Stack/                     # Layout primitive (flex column/row with gap)
│   ├── Typography/                # <Heading>, <Text>, <Label>
│   └── DataTable/                 # Hand-built on native <table>; no library
├── icons/                         # Inlined SVGs — no icon lib dependency
│   ├── Visibility.tsx
│   ├── VisibilityOff.tsx
│   ├── DeleteOutlined.tsx
│   ├── HelpOutlineOutlined.tsx
│   ├── UploadFileOutlined.tsx
│   ├── SwapVertRounded.tsx
│   ├── SettingsOutlined.tsx
│   ├── SettingsBackupRestore.tsx
│   ├── Language.tsx
│   ├── GitHub.tsx
│   ├── ... (all 58 icons used today)
│   └── index.ts
├── patterns/                      # Reusable composite components
│   ├── FileDropzone/              # Replaces react-dropzone + MUI styling
│   ├── FormRow/                   # Label + field + error message layout
│   └── ToolbarButton/             # Button + optional tooltip pattern used across the app
├── utils/
│   ├── composeRefs.ts
│   ├── useIsomorphicLayoutEffect.ts
│   └── classNames.ts              # Tiny local clsx replacement
├── README.md                      # How to use the design system
└── index.ts                       # Public barrel — the only import surface for the rest of the app
```

**Hard rule**: nothing under `src/pages/`, `src/components/AppLogic/`, or `src/components/Layouts/` may import from `@radix-ui/*` or from deep paths inside `src/design-system/`. They import only from `src/design-system` (the barrel). The ESLint `no-restricted-imports` rule added in Step 0 also **bans `@tanstack/*` repo-wide** as a tripwire — no one should ever accidentally pull in a TanStack package.

**`src/components/Common/` fate**: absorbed into `src/design-system/primitives/` where appropriate, or promoted to `src/design-system/patterns/`. Anything app-specific that doesn't belong in a design system (e.g., things coupled to PMTools data shapes) stays in `src/components/Common/` but is refactored to consume only DS primitives.

## Dependency Replacement Map

| Removed | Replaced with | Notes |
|---|---|---|
| `@mui/material` | Radix UI primitives + design-system wrappers | Wrapped once, used everywhere. |
| `@mui/x-data-grid` | **Hand-built `design-system/primitives/DataTable/`** on native `<table>` | 12 DataGrid instances. No TanStack, no DataGrid lib. |
| `@mui/icons-material` | Inlined SVGs in `design-system/icons/` | 58 distinct icons. |
| `@mui/system` | Removed entirely | Layout via SCSS + `Stack` primitive. |
| `@emotion/react`, `@emotion/styled` | Removed entirely | Only installed because MUI required them. |

## Token Strategy

CSS custom properties are the single source of truth. SCSS files only `@forward` / `@use` tokens — no hardcoded colors, sizes, radii, or durations anywhere in the codebase after the migration.

```scss
/* src/design-system/tokens/colors.scss */
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text-primary: #111111;
  --color-accent: #3b82f6;
  /* ... */
}

[data-theme="dark"] {
  --color-bg-primary: #0f0f0f;
  --color-bg-secondary: #1a1a1a;
  --color-text-primary: #f5f5f5;
  --color-accent: #60a5fa;
  /* ... */
}
```

Dark/light toggle becomes a `document.documentElement.dataset.theme = 'dark' | 'light'` assignment. No `ThemeProvider`, no React context, no re-render cascade.

**Anti-flash on load**: a small synchronous inline script in `public/index.html` reads the stored theme preference from localStorage and sets `data-theme` on `<html>` before React mounts.

## Component Migration Priority

### Tier 1 — Tokens + layout primitives
First commits establish the foundation — nothing migrates yet. Build:
1. `tokens/` complete scale.
2. `theme/theme.scss` with light + dark.
3. `Stack`, `Typography`, `Divider`, `Button`, `IconButton`, `TextField`, `NumberField`, `Checkbox`, `Switch` primitives.
4. All 58 icons inlined.
5. ESLint `no-restricted-imports` rule blocking direct Radix / MUI imports from pages/AppLogic, plus a repo-wide `@tanstack/*` ban.
6. Design system `README.md` documenting the rules and examples.

### Tier 2 — Overlays and navigation
1. `Dialog` — highest-impact primitive. Used for file upload, VGP modal, settings, changelog, tests modal.
2. `Tooltip`.
3. `DropdownMenu` — file list selector uses this.
4. `Tabs` — settings modal.
5. `Select` — coordinate system and projection menus.
6. `ButtonGroup`.

### Tier 3 — In-house DataTable (sub-phase — biggest item)

Build `design-system/primitives/DataTable/` from scratch on top of native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`. **No TanStack. No grid library.** Ivan has years of experience with table libs and the conclusion is: hand-rolled tables on native HTML are simpler, smaller, more accessible, and easier to debug than any abstraction layer.

**Why hand-built**:
- Native HTML tables already implement keyboard navigation, screen-reader semantics, column-header relationships, and printability for free.
- Sort / filter / select / edit are small, local pieces of logic — none of them need a 30 KB library.
- The only feature MUI DataGrid had that's non-trivial to write is virtualization, and that gets either a tiny single-purpose library or a hand-rolled scroll-window in ~80 lines.
- Phase 1 + Phase 2 give us the safety net to refactor freely.

**Architecture**:
```
src/design-system/primitives/DataTable/
├── DataTable.tsx               # Main component — renders <table> with composable subcomponents
├── DataTable.types.ts          # Column<T>, Row<T>, SortState, SelectionState, FilterState
├── DataTable.module.scss       # Styling (sticky header, zebra rows, hover, selected)
├── useSortableRows.ts          # Hook: sort state + comparator helpers
├── useFilterableRows.ts        # Hook: filter state + predicate helpers
├── useRowSelection.ts          # Hook: single/multi selection state
├── useEditableCell.ts          # Hook: in-place edit state (replaces the useApiRef hack)
├── useVirtualRows.ts           # Hook: simple windowed rendering for >200-row tables.
│                               # Hand-rolled is the goal. If profiling shows hand-roll is too
│                               # slow, the ONLY acceptable replacement is a tiny single-purpose
│                               # virtualization-only library (NOT @tanstack/* — repo-wide banned).
│                               # Examples to evaluate if needed: `react-virtuoso` (single-purpose),
│                               # or any small (~5 KB) virtualization-only package. Never a table lib.
├── HeaderCell.tsx              # <th> with sort indicator + filter affordance
├── BodyRow.tsx                 # <tr> with selection + hover + edit support
├── EmptyState.tsx              # Renders inside <tbody> when data is empty
├── Toolbar.tsx                 # Optional slot above the table
├── README.md                   # Usage examples for every existing DataGrid pattern
└── index.ts
```

**Component API**:
```ts
interface DataTableProps<T> {
  // Data
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;

  // Sort
  sort?: SortState;
  onSortChange?: (next: SortState) => void;

  // Filter
  filters?: FilterState;
  onFiltersChange?: (next: FilterState) => void;
  globalFilter?: string;

  // Selection
  selection?: SelectionState;
  onSelectionChange?: (next: SelectionState) => void;
  selectionMode?: 'none' | 'single' | 'multi';

  // Editing
  editableColumns?: string[];
  onCellEdit?: (rowId: string, columnId: string, value: unknown) => void;

  // Rendering slots
  renderToolbar?: () => ReactNode;
  renderEmptyState?: () => ReactNode;

  // Virtualization (off by default; enabled per-table when row count > threshold)
  virtualize?: boolean;
  estimatedRowHeight?: number;
}
```

Then migrate the 12 grids in order of increasing complexity:
1. `SitesDataTable` — simplest.
2. `VGPDataTable`.
3. `StatisticsDataTableDIR`, `StatisticsDataTablePMD`.
4. `OutputDataTableDIR`, `OutputDataTablePMD`.
5. `DataTableDIR`, `DataTablePMD`, `MetaDataTablePMD`.

**Delete `src/components/AppLogic/DataTablesDIR/useApiRef.tsx`** once the last migration lands. With hand-built tables, the table state is just plain hooks held by the page — no ref hack, no imperative API, no apiRef.

### Tier 4 — Pattern migration
1. `FileDropzone` pattern that wraps `react-dropzone` behind DS API.
2. `FormRow`, `ToolbarButton` patterns.
3. Migrate remaining ad-hoc composites to patterns.

### Tier 5 — MUI removal sweep
1. `grep -r '@mui' src/` — must return zero.
2. `grep -r '@emotion' src/` — must return zero.
3. `grep -r '@tanstack' src/` and `grep -r '@tanstack' package.json` — must return zero. (Tripwire: if anything matches, something slipped in.)
4. Remove MUI/Emotion from `package.json`.
5. Run `npm install`.
6. Full unit + visual test run.

## Execution Order

### Step 0 — Infrastructure
1. Install `@radix-ui/react-dialog`, `@radix-ui/react-tooltip`, `@radix-ui/react-select`, `@radix-ui/react-tabs`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-checkbox`, `@radix-ui/react-switch`, `@radix-ui/react-slot`.
2. **Do NOT install `@tanstack/react-table` or any other TanStack package.** The DataTable is hand-built. The lint rule below makes accidental TanStack installs visible.
3. Scaffold `src/design-system/` with empty folders and `index.ts`.
4. Add ESLint rule `no-restricted-imports` disallowing:
   - `@mui/*` repo-wide
   - `@emotion/*` repo-wide
   - `@radix-ui/*` everywhere except inside `src/design-system/`
   - `@tanstack/*` repo-wide (full ban — tripwire for accidental installs).

### Step 1 — Tokens and theme
1. Build `tokens/` with full scale.
2. Build `theme/theme.scss` with CSS custom properties for both themes.
3. Move theme toggle from `createTheme` / `palette.mode` to `documentElement.dataset.theme`.
4. Add synchronous anti-flash script in `public/index.html`.

### Step 1.5 — SCSS token sweep (its own step, mechanical but large)

74 `*.module.scss` files exist today. Most hardcode colors, sizes, radii, durations. This step rewrites every hardcoded value to use the design tokens introduced in Step 1.

1. Audit each `.module.scss` file: list every literal color, every literal size, every literal duration. Save the audit log to `.claude/development-roadmap/notes/phase-3-token-sweep-log.md`.
2. Replace literals with `var(--token-...)` references. One commit per logical group (e.g., "all StereoGraph SCSS files", "all DataTable SCSS files") so reverts are surgical.
3. After each commit: run Phase 1 unit tests + Phase 2 visual regression tests. Visual diffs are the only way to catch a wrong token replacement.
4. Exit when `grep -nE "#[0-9a-fA-F]{3,8}|rgba?\(" src/**/*.module.scss` returns no matches outside the design-system tokens directory.

This is treated as its own sub-phase because mixing it into Step 1 would inflate Step 1 commits and obscure intent. The token sweep is mechanical but spans the whole frontend; it deserves separate audit logs and separate commits.

### Step 2 — Tier 1 primitives
One commit per primitive. Each commit:
1. Builds the new primitive.
2. Migrates every usage site in a single pass.
3. Removes the corresponding MUI import.
4. Runs visual regression tests (Phase 2) and unit tests (Phase 1).

### Step 3 — Tier 2 overlays
Same pattern. Modals are the highest-risk item because of focus management and keyboard interaction — Radix handles both well by default.

### Step 4 — Tier 3 DataTable sub-phase
Follows the order above. Each DataGrid migration is one commit. `useApiRef.tsx` deleted at the end.

### Step 5 — Tier 4 patterns
File dropzone, form row, toolbar button pattern extraction.

### Step 6 — Tier 5 removal sweep
Final grep, package removal. No bundle measurement — bundle size is intentionally not a goal of this phase.

## Exit Criteria

- [ ] `grep -rn '@mui' src/` returns zero results.
- [ ] `grep -rn '@emotion' src/` returns zero results.
- [ ] `grep -rn '@tanstack' src/` returns zero results AND `package.json` lists no `@tanstack/*` package.
- [ ] `useApiRef.tsx` no longer exists.
- [ ] All DataTables use `src/design-system/primitives/DataTable/`, which is hand-built on native `<table>` with no library dependency.
- [ ] `package.json` no longer lists any MUI or Emotion package.
- [ ] `src/pages/` and `src/components/AppLogic/` import only from `src/design-system` or from domain code — never from Radix / ex-MUI primitives directly.
- [ ] ESLint `no-restricted-imports` rule enforces this AND bans `@tanstack/*` repo-wide.
- [ ] SCSS token sweep complete: no hardcoded colors, sizes, or durations in any `*.module.scss` outside `src/design-system/tokens/`.
- [ ] All Phase 1 unit tests pass.
- [ ] All Phase 2 visual regression tests pass (intentional diffs regenerated after inspection).
- [ ] Light/dark theme still works via `data-theme` attribute.
- [ ] Dev server + production build both succeed.
- [ ] `src/design-system/README.md` is complete and `src/design-system/primitives/DataTable/README.md` documents how to handle every existing DataGrid pattern.

## Critical Files

### Files to create
- `src/design-system/` — entire tree per the structure above.
- `.eslintrc` — `no-restricted-imports` rule (incl. full `@tanstack/*` ban).
- `.claude/development-roadmap/notes/phase-3-token-sweep-log.md`.

### Files to modify
- `src/App/App.tsx` — remove `createTheme`, `ThemeProvider`, `CssBaseline`. Replace with `data-theme` attribute toggling via the existing theme action.
- `public/index.html` — add anti-flash inline script.
- Every file under `src/components/AppLogic/DataTables*/` — migrate to design-system `DataTable`.
- Every file under `src/pages/` — swap MUI imports for design-system imports.
- `package.json` — remove MUI/Emotion; add Radix. **Do not add any TanStack package.**

### Files to delete
- `src/components/AppLogic/DataTablesDIR/useApiRef.tsx`.

### Files to leave alone
- `src/utils/` — no changes.
- `src/services/reducers/` — state still Redux until Phase 6 (except theme toggle which is trivial).

## Verification

After each primitive migration:
```bash
npm run verify
npm test -- --watchAll=false
npx playwright test
npm run build
```

After the whole phase:
```bash
npm run build                             # must succeed
grep -rn '@mui\|@emotion\|@tanstack' src/ # must return zero
```

## Risks

| Risk | Mitigation |
|---|---|
| DataGrid feature parity bug in the hand-built table | Start with the simplest grid (`SitesDataTable`) to shake out the API. Phase 1 + Phase 2 catch any data-display regression. |
| Hand-built virtualization is too fragile | Acceptable fallback: a tiny single-purpose virtualization library (NOT TanStack). Hand-rolled is preferred; library only if profiling shows hand-roll is too slow. |
| Radix accessibility defaults differ from MUI | Strictly better. Any regression is expected to go the right direction. |
| SCSS module naming collisions after consolidation | Strict component-scoped naming; `DS-` prefix for design-system classes. |
| SCSS token sweep misses a hardcoded value | Final grep gate at exit (`grep -nE "#[0-9a-fA-F]{3,8}|rgba?\(" src/**/*.module.scss` outside tokens dir) blocks the phase. |
| Dark/light flash during hydration | Synchronous inline script in `index.html` before React mounts. |
| Design system drifts from being actually used | ESLint rule prevents direct Radix imports outside DS. Any violation fails lint. |
| Over-engineering tokens | Keep the scale small (4px spacing, 6 colors per role). No token for every possible value. |
| Someone accidentally `npm install`s a TanStack package | ESLint repo-wide ban + exit-criteria grep both flag it. |

## Dependencies on Other Phases

- **Depends on Phase 1**: unit tests lock behavior.
- **Depends on Phase 2**: visual regression is the only realistic safety net.
- **Feeds Phase 6**: architecture rewrite is easier when pages/AppLogic depend on a small set of DS primitives rather than scattered MUI imports.
