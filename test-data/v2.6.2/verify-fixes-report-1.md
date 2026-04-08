Check that all fixes from evaluation-report-1.md are resolved:

1. **All rows visible after mixed-format merge**: Navigate to /app/dir. Check "Merge all files into one collection". Upload season1_north.pmm + lab_results.csv. Count rows in the data table — should be exactly 15 (8 + 7). The last row should be LAB-07 with Dgeo=11.6, Igeo=49.4. All 15 rows must be present in the DOM (no rows hidden by virtualization).

2. **Collection name field resets on modal reopen**: Navigate to /app/dir. Check "Merge all files into one collection", type "Combined Season 1" in the name field, upload files. Click delete/clear all data (the upload modal should reopen). Verify the merge checkbox is unchecked and the collection name field is empty — not showing "Combined Season 1". Re-enable merge, upload new files — the dropdown should show an auto-generated name, not the previously typed name.

3. **Regression: merge PMM-only still works**: Upload season1_north.pmm + season1_south.pmm with merge enabled. Should produce 14 rows (8 + 6) in a single collection. Verify all rows are present.

4. **Regression: non-merge upload still works**: Upload season1_north.pmm without merge enabled. Should create a single dropdown entry with 8 interpretations. No merge UI artifacts.
