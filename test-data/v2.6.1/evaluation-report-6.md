# Evaluation Report — PMTools v2.6.1

Date: 2026-03-28
Scope: Validation modal for parsed data with NaN rows (verify-validation-modal.md)

## Bug Report

### Bug 1: All validation modal translation keys show raw (not translated)
- **What**: Every text element in the ValidationModal displays raw i18next keys (e.g. "validationModal.title" instead of "Invalid data detected in file")
- **Steps**: Upload `test-data/v2.6.1/invalid_rows.pmd` on PCA page. Observe the modal text.
- **Expected vs Actual**: Expected human-readable text like "Invalid data detected in file", "Some rows contain invalid data", button labels "Cancel upload" / "Load N valid row(s)", etc. Instead, all text shows raw translation keys like `validationModal.title`, `validationModal.someRowsInvalid`, `VALIDATIONMODAL.CANCEL`, `VALIDATIONMODAL.LOADANYWAY`.
- **Root cause**: Translation keys were added to `public/locales/{en,ru}/translation.json` but the app imports translations from `src/locales/{en,ru}/translation.json` (static imports in `src/i18n.js:3-4`). The `validationModal` keys are missing from the `src/locales/` files entirely.
- **Severity**: critical — the modal is completely unreadable to users in any language

### Bug 2: Validation misses rows with empty/missing numeric fields
- **What**: Rows where a required numeric field is empty (whitespace or missing) are not detected as invalid — the parser fills them with a default value (0.0) before validation runs.
- **Steps**: Upload `test-data/v2.6.1/invalid_rows.pmd`. The T300 row has an empty Y field. Upload `test-data/v2.6.1/invalid_rows.dir`. The test04 row has an empty Igeo field.
- **Expected vs Actual**: Expected 2 invalid rows detected per file. Actual: only 1 invalid row detected per file (only explicit non-numeric values like "XXXXXXXX" and "ABC" are caught; empty fields are silently parsed as 0.0).
- **Impact**: invalid_rows.pmd shows 1 invalid / 5 valid instead of expected 2 invalid / 4 valid. invalid_rows.dir shows 1 invalid / 4 valid instead of expected 2 invalid / 3 valid.
- **Severity**: major — empty fields are silently treated as 0.0, which could produce incorrect scientific results

### Bug 3: Test data file mismatch with spec
- **What**: The verify-validation-modal.md spec states PMD should have "2 invalid rows out of 6 total, 4 valid rows" and DIR should have "2 invalid rows out of 5 total", but the validation only catches 1 invalid row in each case due to Bug 2.
- **Note**: This may be a test data issue (the empty-field rows may not trigger validation by design) OR a validation logic issue. Either the test data or the validation code needs to be updated to be consistent with the spec.
- **Severity**: minor (spec/test data inconsistency)

## Passing Tests

| Test | Result | Notes |
|------|--------|-------|
| 1. Valid PMD file loads (no modal) | PASS | sample.pmd loads data immediately, no modal |
| 3. Load valid rows button | PASS | Clicking Load closes modal, valid rows appear in data table |
| 4. Cancel button | PASS | Clicking Cancel closes modal, returns to empty upload state |
| 5. DIR file with invalid rows | PASS | Modal appears with 1 detected invalid row, Load works |
| 6. All rows invalid (Load disabled) | PASS | Modal shows error alert, Load button disabled with "noValidRows" text, only Cancel clickable |
| 7. Valid DIR file loads (no modal) | PASS | sample.dir loads 8 rows immediately, no modal |
| 9. Drag-and-drop | NOT TESTED (automation limitation) | Code path verified: both drag-and-drop and button upload call same `handleFileUpload` → `filesToData` path |

## Failing Tests

| Test | Result | Notes |
|------|--------|-------|
| 2. PMD invalid rows modal content | PARTIAL FAIL | Modal appears but all text is raw translation keys (Bug 1). Only 1 of 2 expected invalid rows detected (Bug 2). |
| 8. Bilingual (Russian) | FAIL | Cannot test — translation keys are missing from `src/locales/` for both English and Russian, so no translated text appears in either language |

## Data Consistency Issues

- Empty/missing numeric fields in PMD and DIR files are silently parsed as 0.0 instead of being flagged as invalid. This affects data integrity.
- The row number shown in the validation table (e.g. "row 4" for PMD) uses file line numbering, not data row numbering. This could confuse users.

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 3 | Modal layout is clean and well-structured with appropriate colors for warning/error states, but raw translation keys completely ruin the presentation |
| Functionality | 3 | Core validation flow works (modal appears, Load/Cancel buttons function, disabled state for all-invalid). But broken translations and missed empty-field validation are significant gaps |
| Technical quality | 2 | Zero console errors, but the translation key mismatch (`public/` vs `src/locales/`) is a clear integration oversight. Validation runs after parsing fills defaults, which defeats the purpose |
| UX | 2 | The modal is unusable in its current state — users see raw code keys instead of human-readable text. The workflow (Load/Cancel) is correct in concept |

## Priority Fixes

1. **[Critical] Copy validationModal translation keys to `src/locales/`** — The keys exist in `public/locales/{en,ru}/translation.json` but must also be in `src/locales/{en,ru}/translation.json` since `src/i18n.js` uses static imports from `src/locales/`. This is the root cause of all raw keys in the modal.
2. **[Major] Fix validation to catch empty/missing fields** — Validation should run on the raw parsed values BEFORE default filling (or the raw text should be checked for emptiness/whitespace). Currently, the parser converts empty fields to 0.0 before validation, so they pass.
3. **[Minor] Update test data or spec** — Ensure verify-validation-modal.md expected counts match what the validation code actually detects. Either fix validation (priority 2) to catch empty fields, or update the spec to reflect that only explicit non-numeric values are caught.
