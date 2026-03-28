Check that all fixes from evaluation-report-3.md are resolved:

1. **No hooks order warnings on PCA page**: Open DevTools console, clear it. Navigate to /app/pca, upload any .pmd file (e.g. test-data/sample.dir's companion PMD, or any valid .pmd). Check console — there should be zero "React has detected a change in the order of Hooks" warnings for MetaDataTablePMD, DataTablePMD, OutputDataTablePMD, StatisticsDataTablePMD.

2. **No hooks order warnings on DIR page**: Navigate to /app/dir, upload any .dir file. Check console — there should be zero hooks order warnings for DataTableDIR.

3. **localStorage corruption recovery**: Open DevTools console. Run: `localStorage.setItem('treatmentData', 'CORRUPTED_NOT_JSON')`. Reload the page. The app should load normally (not blank white screen) — the corrupted key should be silently removed and the app should function as if no saved data existed.

4. **Zijderveld unit label with empty data**: Navigate to /app/pca. Upload the malformed.pmd file (test-data/v2.6.1/malformed.pmd) where all rows have non-numeric values. The Zijderveld diagram should NOT show "Unit=-INFINITY A/m". It should show no unit label or an empty label.

5. **Regression — PCA workflow**: Upload a valid .pmd file on /app/pca. Verify: data table loads, Zijderveld/stereonet/magnetization graphs render, select steps and run PCA — results appear in statistics table. Switch coordinate systems (geo/strat). All should work without console errors.

6. **Regression — DIR workflow**: Upload a valid .dir file on /app/dir. Verify: data table loads, stereonet renders with normal and reversed clusters. Select directions and compute Fisher mean. All should work without console errors.

7. **Previously fixed bugs still working**: No contentEditable warnings in Hotkeys settings, no MUI Menu Fragment warnings on graph right-click, no React list key warnings, no Redux serialization warnings during file upload.
