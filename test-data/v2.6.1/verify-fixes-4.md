Check that all fixes from evaluation-report-6.md are resolved:

1. **Translation keys display correctly (English)**: Upload `test-data/v2.6.1/invalid_rows.pmd` on PCA page. The validation modal should show human-readable English text: title "Invalid data detected in file", description "Some rows contain invalid data", summary with counts, button labels "Cancel upload" / "Load 4 valid row(s)", table headers "Row #", "Field", "Raw value". No raw translation keys like `validationModal.title` should be visible anywhere in the modal.

2. **PMD detects 2 invalid rows (including empty field)**: Same upload as test 1. The modal should report **2 invalid rows out of 6 total, 4 valid rows**. The invalid rows table should show: row with field "X" and raw value "XXXXXXXX" (T100 line), AND row with field "Y" and raw value shown as "empty" (T300 line with empty Y field). Both rows must appear.

3. **Load valid rows works correctly**: Click "Load 4 valid row(s)". Modal closes. Data table should show exactly 4 rows of demagnetization data (T000, T200, T400, T500). The T100 and T300 rows should NOT be present.

4. **Cancel button works**: Re-upload `test-data/v2.6.1/invalid_rows.pmd`. Click "Cancel upload". Modal closes. No data should be loaded (empty state).

5. **DIR detects 2 invalid rows (including empty field)**: Upload `test-data/v2.6.1/invalid_rows.dir` on DIR page. Modal should report **2 invalid rows out of 5 total, 3 valid rows**. Invalid rows: one with "Dgeo" field showing "ABC", another with "Igeo" field showing "empty". Click "Load 3 valid row(s)" — should load 3 direction rows.

6. **All rows invalid (Load disabled)**: Upload `test-data/v2.6.1/all_invalid.dir` on DIR page. Modal should show red/error alert with "All rows contain invalid data". Load button should be disabled showing "No valid rows to load". Only Cancel should be clickable.

7. **Translation keys display correctly (Russian)**: Switch language to Russian. Upload `test-data/v2.6.1/invalid_rows.pmd` on PCA page. All modal text should be in Russian (e.g. title "В файле обнаружены некорректные данные"). Verify no `validationModal.*` raw keys appear anywhere.

8. **Valid files load without modal**: Upload `test-data/sample.pmd` on PCA page. No modal should appear — data loads directly with 8 steps. Similarly load `test-data/sample.dir` on DIR page — 8 directions should load directly with no modal.
