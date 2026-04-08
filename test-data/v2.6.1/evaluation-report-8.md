# Evaluation Report — PMTools v2.6.1

Date: 2026-03-29
Scope: Pre-evaluation checks from workplan-2026-03-29.md — confirming which reported bugs still exist

## Pre-evaluation Results Summary

| Check | Bug | Status | Notes |
|-------|-----|--------|-------|
| 1 | MAD=0 for PCA line fitting | **NOT REPRODUCING** | Tested with a11-19.squid (T600-T700: MAD=16.4, T510-T620: MAD=10.1) and 406c.squid (T420-T560: MAD=29.7). All MAD values non-zero. |
| 2 | Demagnetization unit (mT vs °C) | **CONFIRMED** | 406c.squid (thermal) shows "mT" on magnetization graph x-axis instead of "°C" |
| 3 | Crash on malformed file | **FIXED** | 10bg136b.squid (header only, no data) silently rejected. No crash, existing data/interpretations preserved. |
| 4 | Metadata floating-point precision | **CONFIRMED** | Core Azimuth shows `38.599999999999994` instead of `38.6` in metadata editor |
| 5 | Metadata NaN on decimal input | **INCONCLUSIVE** | Playwright automation couldn't fully reproduce the manual user flow (fill→type "." resulted in "0", not NaN). Needs manual testing. |

---

## Bug Report

### Bug 1: Magnetization graph shows "mT" instead of "°C" for thermal treatment
- **What**: When loading a SQUID file with thermal demagnetization steps (prefixed "T"), the magnetization decay graph x-axis incorrectly shows "mT" (millitesla) instead of "°C" (degrees Celsius).
- **Steps**:
  1. Upload `.claude/issues/RV-march-2026/406c.squid` on PCA page
  2. Click "RMG" tab to view magnetization graph
  3. Observe x-axis label
- **Expected vs Actual**: Expected "°C" for thermal demagnetization; actual shows "mT"
- **Severity**: major — misleading scientific data presentation

### Bug 2: Metadata editor shows floating-point artifacts
- **What**: The metadata editor shows IEEE 754 floating-point artifacts for parsed decimal values (e.g., `38.599999999999994` instead of `38.6`).
- **Steps**:
  1. Upload `406c.squid` on PCA page
  2. Click the Edit (pencil) icon in the metadata row
  3. Observe the Core Azimuth field
- **Expected vs Actual**: Expected `38.6`; actual shows `38.599999999999994`
- **Severity**: major — confusing to users, could lead to incorrect manual edits

### Bug 3: No user feedback when malformed file is silently rejected
- **What**: When uploading a SQUID file with header but no data rows, the file is silently ignored with no error message or alert.
- **Steps**:
  1. Load a valid file (e.g., 406c.squid) and compute interpretations
  2. Upload `.claude/issues/RV-march-2026/10bg136b.squid`
  3. Observe: nothing happens — no error shown, no modal, file silently skipped
- **Expected vs Actual**: Expected a validation modal or error alert explaining the file has no data; actual is silent rejection
- **Severity**: minor — no crash (good!), but confusing UX. The user won't know why the file wasn't loaded.

## Data Consistency Issues

None observed. PCA results matched expected ranges for the test data.

## Console Errors

- 2x `findDOMNode` deprecation warnings (React StrictMode + DraggableCore) — known, non-blocking
- No actual runtime errors

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Clean layout, consistent styling |
| Functionality | 3 | Two confirmed bugs affecting data display (mT/°C, float artifacts) |
| Technical quality | 4 | No crashes, graceful handling of malformed input, only StrictMode warnings |
| UX | 3 | Silent file rejection is confusing; metadata float display is misleading |

## Priority Fixes

1. **Fix 2: Demagnetization unit (mT → °C)** — straightforward, high visibility, misleading scientific output
2. **Fix 3: Metadata floating-point display** — affects data integrity perception, same component as NaN bug
3. **Fix 4: Metadata NaN on decimal input** — needs manual verification, but likely still present based on code analysis
4. **Fix 1: MAD=0** — not reproducing in current tests, may need specific data conditions or may have been partially fixed
5. **Silent rejection feedback** — minor UX improvement, add error toast/modal for files with no data rows

## Notes

- **MAD=0 bug**: Could not reproduce with either a11-19.squid or 406c.squid. The workplan mentions steps 17-23 (T510-T700) but step 17 in the app corresponds to T600, not T510. The workplan step labels may refer to a different numbering. However, all tested ranges produced non-zero MAD values. This may have been partially fixed by recent eigenvalue handling changes, or may require very specific data conditions not met by the available test files. **Recommend keeping in the fix list** — the code analysis in the workplan identifies real issues (the `|| 0` fallback and eigenvalue normalization).
- **Crash on malformed file**: Appears to be fixed by recent validation work (commits 591c6ef, 2bd821a, bb7494b, 0be633d). The app handles it gracefully. Consider adding a user-facing notification.
- **NaN bug**: Playwright's `fill()` method bypasses React's `onChange` handler, so the NaN path wasn't triggered. The code analysis in the workplan (`+event.target.value` on ".") strongly suggests the bug still exists for real user input. **Recommend manual testing or fixing based on code analysis.**
