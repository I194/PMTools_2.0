# Evaluation Report — PMTools v2.6.1

Date: 2026-03-28
Scope: Verification of fixes from evaluation-report-2.md (10-item checklist)

## Bug Report

### Bug 1: Hooks order warnings NOT fixed (critical regression)
- **What**: "React has detected a change in the order of Hooks" warnings fire on every file load for multiple table components
- **Steps**:
  1. Open DevTools console, clear it
  2. Navigate to /app/pca → upload any .pmd file
  3. Observe console errors immediately
- **Expected**: Zero hooks order warnings (per commit 9a59cf6 "fix: stabilize component tree")
- **Actual**: Hooks order warnings fire for `MetaDataTablePMD`, `DataTablePMD`, `OutputDataTablePMD`, `StatisticsDataTablePMD` (PCA page) and `DataTableDIR` (DIR page). Pattern is consistent: last hook goes from `undefined → useContext`, suggesting a conditional `useContext` call is being added on second render.
- **Severity**: major — These are React Rules of Hooks violations. While the app still functions, they indicate unstable component behavior and can lead to unpredictable bugs.

### Bug 2: ErrorBoundary does not catch localStorage corruption crashes
- **What**: Corrupted localStorage data causes blank white screen instead of ErrorBoundary fallback
- **Steps**:
  1. Open DevTools console
  2. Run: `localStorage.setItem('treatmentData', 'CORRUPTED_NOT_JSON')`
  3. Reload the page
- **Expected**: ErrorBoundary fallback UI with "Something went wrong" title and "Clear data and try again" button
- **Actual**: Blank white screen. Error occurs in `<App>` component during Redux store initialization (JSON.parse of corrupted data), which is above the ErrorBoundary that wraps PCAPage/DIRPage.
- **Severity**: major — The ErrorBoundary exists but is placed too deep in the component tree. Crashes during store initialization bypass it entirely.

### Bug 3: Zijderveld unit label shows "-INFINITY" for empty PMD datasets
- **What**: When a PMD file with all-invalid rows is loaded, the Zijderveld diagram shows `Unit=-INFINITY A/m`
- **Steps**:
  1. Navigate to /app/pca
  2. Upload a .pmd file where all data rows have non-numeric values in critical fields
  3. Observe the Zijderveld diagram
- **Expected**: No unit label, or "N/A", or the graph is not rendered at all when there are zero valid steps
- **Actual**: `Unit=-INFINITY A/m` displayed below the empty graph
- **Severity**: cosmetic — The graph is otherwise empty and no NaN/SVG errors occur

## Verification Results

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | Malformed DIR data handling | **PASS** | All-invalid rows silently skipped, table shows "No rows", clean stereonet, no SVG errors |
| 2 | Malformed PMD data handling | **PASS** (minor issue) | Invalid rows skipped, no NaN in table, no SVG errors. Minor: unit label shows `-INFINITY` |
| 3 | Error boundary recovery | **FAIL** | Blank white screen on localStorage corruption — crash occurs above ErrorBoundary |
| 4 | WhyPMToolsPage graphics section | **PASS** | Both paragraphs visible in EN and RU, no raw i18n keys |
| 5 | No React list key warnings | **PASS** | Zero key warnings across PCA and DIR pages |
| 6 | No Redux serialization warnings | **PASS** | Zero serialization warnings during file upload |
| 7 | No hooks order warnings | **FAIL** | Warnings for MetaDataTablePMD, DataTablePMD, OutputDataTablePMD, StatisticsDataTablePMD, DataTableDIR |
| 8 | Regression — PCA workflow | **PASS** | 8 steps, 3 graphs, PCA fit: Dgeo=335.9, Igeo=26.7, MAD=0.9 ✓, coordinate switching works |
| 9 | Regression — DIR workflow | **PASS** | 8 directions, normal (~338/37) and reversed (~145/-42) clusters, stereonet correct |
| 10 | Previously fixed bugs | **PASS** | No contentEditable warnings in Hotkeys, no MUI Menu Fragment warnings on graph right-click |

## Data Consistency Issues

None found. Table values match graph positions on both PCA and DIR pages.

## Shortcut Issues

Not specifically tested in this verification run (not in scope of verify-fixes.md).

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Clean layout, graphs render well, dark/light themes work |
| Functionality | 4 | Core PCA/DIR workflows work correctly, malformed data handled gracefully |
| Technical quality | 2 | Hooks order violations on every page load are a significant code quality issue; ErrorBoundary placement gap |
| UX | 4 | Smooth interactions, data loads correctly, coordinate switching works |

## Priority Fixes

1. **Fix hooks order violations** — The `undefined → useContext` pattern in MetaDataTablePMD, DataTablePMD, DataTableDIR, OutputDataTablePMD, and StatisticsDataTablePMD suggests a conditional hook call (likely `useContext` inside a conditional branch or after an early return). This fires on every file load and violates React Rules of Hooks.
2. **Move ErrorBoundary higher or add try/catch to localStorage parsing** — The ErrorBoundary wraps PCAPage/DIRPage but crashes during Redux store initialization (JSON.parse of localStorage) happen at the `<App>` level. Either wrap `<App>` with an ErrorBoundary, or add try/catch around all localStorage reads in Redux store initialization.
3. **Handle empty dataset in Zijderveld unit label** — When all PMD rows are filtered out, avoid computing unit from an empty array (which gives -Infinity). Show nothing or guard against it.
