# Evaluation Report — PMTools v2.6.1

Date: 2026-03-28
Scope: verify-fixes-2.md — fixes from evaluation-report-3.md

## Bug Report

### Bug 1: Hooks order warnings NOT fixed on PCA page
- **What**: "React has detected a change in the order of Hooks" errors fire on PCA page load with data
- **Steps**: Navigate to /app/pca, upload any .pmd file, check DevTools console
- **Expected vs Actual**: Expected zero hooks warnings. Actual: 3 warnings for MetaDataTablePMD, DataTablePMD, StatisticsDataTablePMD (when interpretations exist)
- **Severity**: major
- **Details**: All three components show `undefined → useContext` at the end of their hooks list, indicating a conditional hook call (likely `useTranslation()` or similar) that runs on second render but not first

### Bug 2: Hooks order warning NOT fixed on DIR page
- **What**: "React has detected a change in the order of Hooks" error fires on DIR page load with data
- **Steps**: Navigate to /app/dir, upload any .dir file, check DevTools console
- **Expected vs Actual**: Expected zero hooks warnings. Actual: 1 warning for DataTableDIR
- **Severity**: major
- **Details**: Same pattern — `undefined → useContext` at position 17, indicating a conditional hook call

### Bug 3: React list key warning on MainPage
- **What**: "Each child in a list should have a unique key prop" warning in PrettyTabs component
- **Steps**: Navigate to localhost:3000 (landing page), check DevTools console
- **Expected vs Actual**: Expected no warnings. Actual: key warning in PrettyTabs at MainPage
- **Severity**: minor
- **Details**: Pre-existing issue, not part of the verify-fixes-2 scope

### Bug 4: Zijderveld unit label shows "Unit= A/m" with empty value
- **What**: When malformed.pmd is loaded (all non-numeric data), the unit label shows "Unit= A/m" with a blank space instead of hiding the label entirely
- **Steps**: Upload test-data/v2.6.1/malformed.pmd on /app/pca, check Zijderveld unit label
- **Expected vs Actual**: Expected no unit label or empty label. Actual: shows "Unit= A/m" (with space before A/m)
- **Severity**: cosmetic
- **Details**: The -INFINITY bug IS fixed — no longer shows "Unit=-INFINITY A/m". The current behavior is acceptable but not ideal.

## Data Consistency Issues

No data consistency issues found. Table values match graph positions correctly on both PCA and DIR pages.

## Shortcut Issues

No shortcut issues observed. Hotkeys D (PCA), F (Fisher), Q (coordinate scroll), P (projection scroll) all function correctly when the page body has focus. Note: hotkeys do not fire when a checkbox or text input has focus — this is expected/correct behavior.

## Test Results Summary

| # | Test | Result | Notes |
|---|------|--------|-------|
| 1 | No hooks order warnings on PCA page | **FAIL** | 3 warnings: MetaDataTablePMD, DataTablePMD, StatisticsDataTablePMD |
| 2 | No hooks order warnings on DIR page | **FAIL** | 1 warning: DataTableDIR |
| 3 | localStorage corruption recovery | **PASS** | App loads normally, corrupted key silently removed |
| 4 | Zijderveld unit label with empty data | **PASS** | No -INFINITY shown; "Unit= A/m" (cosmetic only) |
| 5 | Regression — PCA workflow | **PASS** | Upload, table, graphs, PCA fitting, coord switch all work |
| 6 | Regression — DIR workflow | **PASS** | Upload, table, stereonet, Fisher statistics all work |
| 7 | Previously fixed bugs still working | **PASS** | No contentEditable, no MUI Fragment, no Redux serialization warnings |

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Clean layout, good dark theme, graphs well-rendered |
| Functionality | 4 | Core PCA and DIR workflows work correctly end-to-end |
| Technical quality | 2 | 4 hooks-order violations across PCA/DIR pages — these indicate conditional hook calls that could cause runtime bugs |
| UX | 4 | Navigation clear, file selector works, coordinate switching smooth |

## Priority Fixes

1. **Fix hooks order violations in all 4 table components** (MetaDataTablePMD, DataTablePMD, StatisticsDataTablePMD, DataTableDIR) — all show the same pattern of `undefined → useContext` at the end of the hooks list, suggesting a `useTranslation()` or `useTheme()` call that is conditional on data being present. Move the hook call before any early returns.
2. Fix React list key warning in PrettyTabs component on MainPage (minor, pre-existing).
3. Consider hiding the Zijderveld unit label entirely when no valid data is loaded (cosmetic improvement).
