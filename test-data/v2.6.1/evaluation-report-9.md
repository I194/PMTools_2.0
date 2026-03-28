# Evaluation Report — PMTools v2.6.1

Date: 2026-03-29
Scope: verify-fixes-5.md — targeted verification of 6 fixes from workplan-2026-03-29.md

## Test Results Summary

| # | Fix | Result | Details |
|---|-----|--------|---------|
| 1 | Magnetization graph shows °C for thermal data | **PASS** | X-axis shows "°C" with range 0–600 for 406c.squid (thermal demag) |
| 2 | Metadata editor shows clean float values | **PASS** | Core Azimuth=38.6, Core Dip=55, Bedding Strike=159.6 — no IEEE 754 artifacts |
| 3 | Metadata editor handles decimal input without NaN | **PASS** | Typing "." then "5" → field shows ".5", Apply → 0.5. No NaN at any point |
| 4 | Interpretation labels don't include file extension | **PASS** | New PCA interpretation shows label "406c" (not "406c.squid") |
| 5 | Rejected files show error reason in alert | **PARTIAL** | No crash, data preserved, but no alert shown (see Bug 1) |
| 6 | MAD values for PCA are non-zero | **PASS** | MAD=29.7 for 406c.squid T420-T560 (5 steps). Non-zero, scientifically reasonable |

## Bug Report

### Bug 1: Malformed SQUID file silently accepted with 0 data rows — no alert shown
- **What**: Uploading 10bg136b.squid (header only, no data rows) does not show an alert with error reason. The file is silently accepted and added to the file list with 0 data rows.
- **Steps**:
  1. Load 406c.squid on PCA page and compute interpretations
  2. Upload 10bg136b.squid via file upload
  3. No alert appears
  4. Navigate to 10bg136b.squid — shows "No rows" in data table and "Mmax = -INFINITY A/m" on magnetization graph
- **Expected**: Alert saying "Some files were skipped: 10bg136b.squid: no data lines" (or similar). The file should be rejected, not added to file list.
- **Actual**: File is silently loaded with metadata but 0 data rows. No user feedback. The SQUID parser does not reject the promise for files with header-only content — it resolves successfully with empty steps. The alert mechanism in `filesAndData.ts` (line 35) only triggers for rejected promises.
- **Severity**: major — user has no feedback that file is invalid; navigating to it shows broken graph with "-INFINITY"

### Bug 2: Magnetization graph shows "Mmax = -INFINITY A/m" for empty file
- **What**: When navigating to 10bg136b.squid (0 data rows), the magnetization graph shows "Mmax = -INFINITY A/m" instead of a graceful empty state.
- **Steps**: Navigate to a SQUID file with header but no data rows
- **Expected**: Graph should show empty state or "No data" message
- **Actual**: Shows "Mmax = -INFINITY A/m" and "Unit= A/m" (missing value)
- **Severity**: minor — cosmetic issue on an edge case, but looks broken

### Bug 3: Stale interpretation label persists in localStorage
- **What**: Interpretations created before the extension-stripping fix retain the old label format (e.g., "406c.squid" instead of "406c") in localStorage. Only newly created interpretations get the correct label.
- **Steps**: Load the app with a pre-existing interpretation from before the fix
- **Expected**: All labels should show without extension
- **Actual**: Old labels show "406c.squid", new labels show "406c"
- **Severity**: cosmetic — resolves itself as users re-compute interpretations

## Data Consistency Issues

No mismatches found between table data and graph visualizations during testing.

## Shortcut Issues

No shortcut issues found (shortcuts not explicitly tested in this targeted evaluation).

## Console Errors

1. `Warning: Failed prop type: apiRef.current is null in DataGrid` — React PropTypes warning in StatisticsDataTablePMD. Non-critical but recurring.

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Clean layout, consistent styling, graphs render well |
| Functionality | 4 | All 6 targeted fixes verified. 5/6 fully working, 1 partial (malformed file handling) |
| Technical quality | 3.5 | PropTypes warning in console, -INFINITY display for empty data, silent failure on malformed files |
| UX | 3.5 | Good overall, but no feedback when malformed file is uploaded silently |

## Priority Fixes

1. **SQUID parser should reject files with 0 data rows** — add validation that rejects the promise when `steps.length === 0` (or only NRM), so the alert mechanism in `filesAndData.ts` can catch it and show the error reason
2. **Handle -INFINITY / empty data in magnetization graph** — guard against `Math.max()` on empty arrays returning `-Infinity`
3. **Migration for stale localStorage labels** — optional, low priority since it self-resolves
