Check that the merge prompt modal works correctly when importing files on the DIR page with data already loaded:

1. **Merge prompt appears for 2+ files via toolbar Import**: Navigate to /app/dir. Load any file first (e.g., use example or upload `test-data/season1_north.pmm`). Now click the Import button in the toolbar and select `test-data/season1_south.pmm` AND `test-data/season2_extra.pmm` together (Ctrl+click). A dialog "Import Options" should appear with "You selected 2 files" text and a "Merge all files into one collection" checkbox. The dialog should have "Cancel" and "Import" buttons.

2. **Merge via prompt produces single collection**: In the merge prompt dialog, check "Merge all files into one collection". Leave the name field empty (auto-generated). Click "Import". The dropdown should now show a SECOND entry with a name like "season1_south.pmm + season2_extra.pmm". The original file should still be there as a separate entry. The merged entry should contain 11 interpretations (6 from south + 5 from extra).

3. **Import without merge via prompt adds files separately**: Clear all data and reload. Load `test-data/season1_north.pmm` first. Click Import, select `test-data/season1_south.pmm` AND `test-data/season2_extra.pmm`. When the merge prompt appears, leave the checkbox UNCHECKED and click "Import". The dropdown should show THREE separate entries: season1_north.pmm, season1_south.pmm, and season2_extra.pmm.

4. **Cancel discards files**: Load any file. Click Import, select 2+ files. When the merge prompt appears, click "Cancel". No new files should be added — the dropdown should be unchanged.

5. **Single file skips prompt**: With data loaded, click Import and select just ONE file (`test-data/lab_results.csv`). No merge prompt should appear — the file should be imported directly.

6. **Drag-and-drop 2+ files shows prompt**: With data loaded, drag and drop `test-data/season1_south.pmm` and `test-data/season2_extra.pmm` onto the page. The merge prompt dialog should appear (same as toolbar scenario).

7. **PCA page unaffected**: Navigate to /app/pca. Import or drag-and-drop multiple .pmd files. No merge prompt should appear — files should be imported directly as before.

8. **Initial UploadModal still works**: Navigate to /app/dir with NO data loaded. The upload modal should appear with the merge checkbox (same as before). Upload 2 files with merge checked — should produce one merged collection.

9. **Language switching**: Switch to Russian. The merge prompt should show "Параметры импорта", "Выбрано файлов: 2", "Объединить все файлы в одну коллекцию", "Импортировать", "Отмена". Switch back to English and verify English labels.

10. **Dark/light theme**: Test the merge prompt in both dark and light themes. Text should be clearly visible in both themes. No black-on-black or white-on-white text.
