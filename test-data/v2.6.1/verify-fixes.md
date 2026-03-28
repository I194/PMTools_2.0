Verify all fixes from evaluation-report-2.md are resolved:

1. **Malformed DIR data handling (Bug 1 — critical)**: Create a .dir file with columns shifted by 2+ characters so numeric fields contain text fragments. Upload on /app/dir. **Expected**: the file is silently rejected (rows with NaN in Dgeo/Igeo are skipped). If ALL rows are invalid, the file produces an empty dataset and the upload modal stays open. The app should NOT show NaN values in any table cell, and should NOT emit SVG attribute errors (`<circle> attribute cx: Expected length, "NaN"`) in the console. Also test with the valid `test-data/sample.dir` — all 8 directions should load correctly.

2. **Malformed PMD data handling (Bug 1 — extension)**: Same test for PMD files on /app/pca. Create a .pmd file with misaligned columns. Upload it. **Expected**: rows with NaN critical values (x/y/z/mag/Dgeo/Igeo) are silently skipped. No NaN in table, no SVG errors. Valid `test-data/sample.pmd` should still load all 8 steps correctly.

3. **Error boundary recovery (Bug 1 — fallback)**: If the app does crash from any cause on /app/pca or /app/dir, **Expected**: the ErrorBoundary fallback UI appears with "Something went wrong" title and "Clear data and try again" button. Clicking the button clears localStorage and reloads the page cleanly.

4. **WhyPMToolsPage graphics section (Bug 2)**: Navigate to /why-pmtools → scroll to "Graphs and diagrams" section. **Expected**: TWO paragraphs of text are visible: first about vector graphics for publications, third about graph types (Zijderveld diagrams, stereonets, magnetization plots). No raw i18n keys shown. Switch to Russian — same section should show Russian text.

5. **No React list key warnings (Bug 3c)**: Open DevTools console, clear it. Go to /app/pca, load `test-data/sample.pmd`. Click on coordinate system buttons, interact with graphs. Then go to /app/dir, load `test-data/sample.dir`. **Expected**: zero "Each child in a list should have a unique key" warnings in console.

6. **No Redux serialization warnings (Bug 3d)**: Open DevTools console, clear it. Go to /app/pca or /app/dir → upload any file. **Expected**: zero "non-serializable value was detected in an action" warnings related to `filesAndData/filesToData`.

7. **No hooks order warnings (Bug 4)**: Open DevTools console, clear it. Go to /app/pca → load `test-data/sample.pmd`. **Expected**: zero "React has detected a change in the order of Hooks" warnings for MetaDataTablePMD or DataTablePMD.

8. **Regression check — PCA workflow**: Load `test-data/sample.pmd` on /app/pca. Verify: 8 steps in table, Zijderveld with 8 numbered points, stereonet with NNW cluster, magnetization decay curve. Select steps 1, 3, 5 → run PCA → verify Dgeo≈335.9, Igeo≈26.7, MAD≈0.9. Switch Geo↔Strat — graphs update correctly.

9. **Regression check — DIR workflow**: Load `test-data/sample.dir` on /app/dir. Verify: 8 directions in table, stereonet with normal (~338/37) and reversed (~145/-42) clusters. Theme switching works correctly.

10. **Previously fixed bugs still working**: Verify Bug 3a (no contentEditable warnings in Settings → Hotkeys) and Bug 3b (no MUI Menu Fragment warnings when right-clicking graphs) from evaluation-report-1.md are still resolved.
