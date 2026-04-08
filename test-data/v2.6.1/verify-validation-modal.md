Check that the validation modal for parsed data with NaN rows works correctly:

1. **Valid file loads normally (no modal)**: Go to /app/pca. Upload `test-data/sample.pmd` (the button or drag-and-drop). Data should load immediately into the table without any modal appearing. Clear data afterward.

2. **PMD file with invalid rows shows validation modal**: Go to /app/pca. Upload `test-data/v2.6.1/invalid_rows.pmd`. A modal dialog should appear with:
   - Warning icon and title about invalid data
   - A yellow/warning alert saying some rows are invalid
   - Summary showing 2 invalid rows out of 6 total, 4 valid rows
   - A table listing the invalid rows with row numbers, field names (like "X" or "Y"), and the raw values that failed
   - An info section explaining validation rules
   - Two buttons: "Cancel upload" and "Load 4 valid row(s)"

3. **Load anyway button works**: In the same modal from step 2, click "Load N valid row(s)". The modal should close, and the data table should show 4 rows (the valid ones). The 2 invalid rows should not appear.

4. **Cancel button works**: Clear data. Upload `test-data/v2.6.1/invalid_rows.pmd` again. This time click "Cancel upload". The modal should close and NO data should appear in the table (empty state / upload modal shown).

5. **DIR file with invalid rows**: Go to /app/dir. Upload `test-data/v2.6.1/invalid_rows.dir`. A validation modal should appear showing 2 invalid rows out of 5 total. Click "Load" — table should show 3 valid interpretations.

6. **All rows invalid — Load button disabled**: Go to /app/dir. Upload `test-data/v2.6.1/all_invalid.dir`. The modal should appear with a red/error alert saying all rows are invalid. The "Load" button should be disabled (greyed out, says "No valid rows to load"). Only "Cancel upload" should be clickable. Click Cancel — no data loaded.

7. **Valid DIR file loads normally**: Upload `test-data/sample.dir` on the DIR page. Should load immediately without any modal.

8. **Bilingual support**: Switch language to Russian (via settings). Upload `test-data/v2.6.1/invalid_rows.pmd` on PCA page. The modal should display all text in Russian: title, alerts, table headers, button labels, and validation rules.

9. **Drag-and-drop upload also triggers validation**: On PCA page, drag and drop `test-data/v2.6.1/invalid_rows.pmd` onto the page. The validation modal should appear (same as button upload).
