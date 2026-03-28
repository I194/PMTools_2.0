# Evaluation Report — PMTools v2.6.1

Date: 2026-03-29
Scope: Targeted verification of fixes from verify-fixes-6.md (Bug 1 & Bug 2 from evaluation-report-9.md + regression checks)

## Test Results

### Test 1: SQUID parser rejects header-only files
- **Status**: PASS
- **Steps**: Uploaded `10bg136b.squid` (header only, no data rows) on PCA page
- **Result**: Alert appeared: "Some files were skipped: 10bg136b.squid: No measurement data in .squid file: 10bg136b.squid"
- **File did NOT appear** in the file list
- **Previously loaded data preserved**: 406c.squid and its interpretation (406c, pca, T420-T560, MAD=29.7) remained intact
- **App did NOT crash** — no white screen

### Test 2: Magnetization graph handles empty data gracefully
- **Status**: PASS
- **Steps**: Loaded 406c.squid, checked magnetization graph
- **Result**: Graph shows "Mmax = 3.79E-3 A/m" — a valid real value, not "-INFINITY"
- **Note**: Since the header-only file is now properly rejected before loading, the empty-data scenario cannot arise in normal use. The guard against -Infinity is a defense-in-depth measure.

### Test 3: Regression checks — all previous fixes still work

| Check | Status | Details |
|-------|--------|---------|
| X-axis shows "°C" with range 0-600 | PASS | Magnetization graph correctly shows °C (thermal demag), range 0-600 |
| Metadata: clean float values | PASS | Core Azimuth=38.6, Core Dip=0.5, Bedding Strike=159.6, Bedding Dip=19.0 — no IEEE 754 artifacts |
| Metadata: "." then "5" input | PASS | Typed ".5" in Core Dip field, applied — shows 0.5. No NaN |
| Interpretation label | PASS | Label shows "406c" (not "406c.squid") |
| PCA MAD for T420-T560 | PASS | MAD = 29.7 (non-zero, scientifically reasonable) |

## Bug Report

No new bugs found.

## Data Consistency Issues

None detected. Table values are consistent with graph displays.

## Console Errors

Zero console errors throughout all tests.

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Consistent dark theme, clear layout, readable data tables |
| Functionality | 5 | All tested features work correctly, error handling is graceful |
| Technical quality | 5 | Zero console errors, proper validation with user-friendly messages |
| UX | 4 | Clear error messaging on bad file upload, metadata editing works smoothly |

## Summary

All 5 checks from verify-fixes-6.md pass. The two bugs from evaluation-report-9.md (header-only SQUID crash and -Infinity magnetization) are confirmed resolved. All previous fixes (°C axis, clean floats, no NaN on decimal input, label without extension, non-zero MAD) remain working. No regressions detected.

## Priority Fixes

None needed — all tested functionality works correctly.
