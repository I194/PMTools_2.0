Check that the merge-on-upload feature for DIR page files works correctly:

1. **Merge checkbox appears on DIR page only**: Navigate to `/app/pca` — the upload modal should NOT show any merge checkbox. Navigate to `/app/dir` — the upload modal should show a "Merge all files into one collection" checkbox below the import button row.

2. **Merge multiple PMM files**: On the DIR page, check the "Merge all files into one collection" checkbox. Leave the name field empty (auto-generated name will be used). Select and upload `test-data/season1_north.pmm` and `test-data/season1_south.pmm` together (Ctrl+click). The file selector dropdown should show ONE entry (not two) with a name like "season1_north.pmm + season1_south.pmm". The data table should contain 14 interpretations total (8 from north + 6 from south) with sequential IDs 1-14.

3. **Merge with custom name**: Clear data and reload. Check the merge checkbox and type "Combined Season 1" in the collection name field. Upload the same two PMM files. The dropdown should show "Combined Season 1" as the collection name.

4. **Upload without merge (default behavior preserved)**: Uncheck the merge checkbox. Upload `test-data/season1_north.pmm` and `test-data/season1_south.pmm`. The dropdown should show TWO separate entries, one for each file. Each has its own interpretations.

5. **Merge mixed formats**: Check the merge checkbox. Upload `test-data/season1_north.pmm` and `test-data/lab_results.csv` together. Should produce ONE merged entry with 15 interpretations (8 + 7). Verify all data is visible in the table and on the stereonet graph.

6. **Merge with validation issues**: Check the merge checkbox. Upload `test-data/field_batch.dir` alongside another file. If a validation modal appears, clicking "Load Anyway" should still produce a single merged collection.

7. **Single file with merge enabled**: Check the merge checkbox and upload just one file (`test-data/season2_extra.pmm`). Should still work — creates one entry with 5 interpretations (merge of 1 file is effectively a no-op).

8. **Drag-and-drop does not merge**: With the merge checkbox checked, drag and drop multiple files onto the app. Files should be added as separate entries (drag-and-drop bypasses the modal merge option).

9. **Language switching**: Switch to Russian language. The checkbox should read "Объединить все файлы в одну коллекцию" and the name field label should be "Имя коллекции". Switch back to English and verify English labels.

10. **localStorage persistence**: Merge and upload files. Refresh the page. The merged collection should still be present in the dropdown with all its interpretations.
