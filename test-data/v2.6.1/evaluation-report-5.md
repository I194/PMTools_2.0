# Evaluation Report — PMTools v2.6.1

Date: 2026-03-28
Scope: verify-fixes-3.md — validating all fixes from evaluation-report-4.md

## Bug Report

No new bugs found.

## Test Results

### Test 1: No hooks order warnings on PCA page — PASS
- Navigated to /app/pca, uploaded sample.pmd
- Opened DevTools console — zero warnings after initial load
- Selected steps 1-5, performed PCA fitting (triggered StatisticsDataTablePMD rendering with data)
- Console showed zero hooks order warnings for MetaDataTablePMD, DataTablePMD, or StatisticsDataTablePMD
- Only console errors: `findDOMNode` deprecation from `react-draggable` third-party library (appears when interpretation comment dialog opens) — not an app code issue

### Test 2: No hooks order warnings on DIR page — PASS
- Navigated to /app/dir, uploaded sample.dir
- DataTableDIR rendered with 8 directions
- Console showed zero hooks order warnings

### Test 3: No React key warning on MainPage — PASS
- Navigated to localhost:3000 (landing page)
- Console showed zero warnings — no "Each child in a list should have a unique key prop" warning from PrettyTabs

### Test 4: Regression — PCA workflow — PASS
- Uploaded sample.pmd on /app/pca — table displayed all 8 steps correctly
- Selected steps 1-5, performed PCA fitting — interpretation: Dgeo=335.6, Igeo=27.2, Dstrat=332.7, Istrat=-0.3, MAD=2.0
- Switched from Geographic to Stratigraphic coordinates — all graphs updated correctly
- Verified all three graphs render:
  - **Zijderveld**: horizontal (orange) and vertical (black) projections with data points and PCA fitted line
  - **Stereonet**: data points clustered near N, PCA direction visible
  - **Magnitude (RMG)**: demagnetization curve with proper axis labels, Mmax = 7.42E-3 A/m, unit label correct (no -INFINITY)

### Test 5: Regression — DIR workflow — PASS
- Uploaded sample.dir on /app/dir — table displayed 8 directions
- Selected all directions, computed Fisher statistics — result: N=8, Dgeo=43.0, Igeo=-21.0
- Stereonet rendered correctly with two polarity clusters (normal NNW, reversed SSE) and Fisher mean direction

### Test 6: Regression — previously fixed bugs — PASS
- No contentEditable warnings in console
- No MUI Fragment warnings in console
- No Redux serialization warnings in console
- **localStorage corruption recovery**: corrupted `persist:root` key with invalid JSON, reloaded app — app recovered successfully, no blank screen, all data intact

### Test 7: Console check — all pages clean — PASS
- After completing all tests, DevTools console shows zero React warnings
- Only messages present: i18next initialization logs and `findDOMNode` deprecation from react-draggable (third-party library, not app code)

## Data Consistency Issues

None found. Table values matched graph positions on both stereonet and Zijderveld diagrams.

## Shortcut Issues

Not specifically tested in this evaluation (not in scope for verify-fixes-3.md).

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Consistent dark theme, clean layout, graphs render crisply |
| Functionality | 5 | All core workflows (PCA fitting, Fisher statistics, coordinate switching) work correctly |
| Technical quality | 5 | Zero React warnings in console, localStorage corruption recovery works, no hooks order violations |
| UX | 4 | Clear navigation, responsive interactions, immediate feedback on actions |

## Priority Fixes

All fixes from evaluation-report-4.md are confirmed resolved:

1. ~~Hooks order warnings on PCA page~~ — **FIXED** (zero warnings for MetaDataTablePMD, DataTablePMD, StatisticsDataTablePMD)
2. ~~Hooks order warnings on DIR page~~ — **FIXED** (zero warnings for DataTableDIR)
3. ~~React key warning on MainPage~~ — **FIXED** (no key warning from PrettyTabs)
4. ~~Zijderveld unit label -INFINITY~~ — **FIXED** (unit displays correctly as 6.94E-4 A/m)

### Remaining known issue (pre-existing, not a regression):
- `findDOMNode` deprecation warning from `react-draggable` library — triggered when opening interpretation comment dialogs. This is a third-party library limitation, not fixable in app code without replacing the library. Severity: cosmetic.
