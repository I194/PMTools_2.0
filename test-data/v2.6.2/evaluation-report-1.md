# Evaluation Report — PMTools v2.6.2

Date: 2026-04-05
Scope: Merge-on-upload feature for DIR page files (verify-fixes.md, 10 test cases)

## Bug Report

### Bug 1: Last row of second file dropped during merge (mixed formats)
- **What**: When merging season1_north.pmm (8 rows) + lab_results.csv (7 rows), only 14 interpretations load instead of 15. The last row of the CSV (LAB-07) is silently dropped.
- **Steps**:
  1. Navigate to /app/dir
  2. Check "Merge all files into one collection"
  3. Click Import and select season1_north.pmm + lab_results.csv
  4. Count rows in the data table
- **Expected vs Actual**: Expected 15 interpretations (8 + 7). Actual: 14 (8 + 6). LAB-07 is missing. Uploading lab_results.csv alone without merge loads all 7 rows correctly.
- **Severity**: major

### Bug 2: Collection name field persists across clear/reload cycles
- **What**: The custom collection name text (e.g., "Combined Season 1") persists in the input field even after data is cleared and new files are uploaded. This causes subsequent merged uploads to use the stale name instead of auto-generating from file names.
- **Steps**:
  1. Check merge, type "Combined Season 1", upload files
  2. Click delete/clear all data
  3. Upload new files with merge enabled (without clearing the name field)
  4. The dropdown shows "Combined Season 1" instead of auto-generated name
- **Expected vs Actual**: Expected the name field to clear when data is deleted, or at minimum on each new upload session. Actual: the old name persists indefinitely.
- **Severity**: minor

## Data Consistency Issues

- No mismatches between table data and stereonet graph positions were observed during merge testing.
- All declination/inclination values in the table correspond correctly to dot positions on the stereonet.
- Sequential IDs (1-14) are correctly assigned after merge.

## Shortcut Issues

No shortcut issues observed (shortcuts were not the focus of this evaluation).

## Test Results Summary

| Test | Result | Notes |
|------|--------|-------|
| 1. Merge checkbox on DIR only | PASS | PCA has no modal/checkbox; DIR shows checkbox correctly |
| 2. Merge PMM files (auto name) | PASS | 14 rows, one dropdown entry "season1_north.pmm + season1_south.pmm" |
| 3. Merge with custom name | PASS | Dropdown shows "Combined Season 1" |
| 4. No merge (default behavior) | PASS | Two separate dropdown entries, each with own data |
| 5. Merge mixed formats | BUG | 14/15 rows — last CSV row (LAB-07) dropped |
| 6. Merge with validation | N/A | field_batch.dir did not trigger validation modal |
| 7. Single file with merge | PASS | 5 interpretations loaded correctly |
| 8. Drag-and-drop bypass | SKIPPED | Not testable via Playwright MCP |
| 9. Language switching | PASS | RU: "Объединить все файлы в одну коллекцию", "Имя коллекции" — correct |
| 10. localStorage persistence | PASS | Merged collection survives page refresh |

## Console Errors

- 1 pre-existing DOM nesting warning: `<li>` cannot appear as descendant of `<li>` in the dropdown file selector. Not related to the merge feature.

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Clean checkbox + name field layout, good spacing, consistent with app style |
| Functionality | 3 | Core merge works well, but last-row-dropped bug in mixed format merge is a data integrity issue |
| Technical quality | 4 | No console errors from the merge feature itself, good localStorage persistence |
| UX | 3 | Name field persistence across sessions is confusing; merge checkbox state could be clearer |

## Priority Fixes

1. **Fix last-row-dropped bug in mixed-format merge** — data integrity issue where the final interpretation from the second file is silently lost during merge. Likely an off-by-one error in the merge concatenation logic.
2. **Clear collection name field when data is cleared** — the stale custom name causes confusion when uploading new files with merge enabled.
