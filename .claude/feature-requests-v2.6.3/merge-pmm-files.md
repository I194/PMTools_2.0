# Merge multiple PMM files (append collections)

**Requested by**: Ekaterina Kulakova (EK-march-2026, issue #2)
**Priority**: feature request
**Complexity**: medium

## Problem

Importing a new file replaces the previously loaded data. Users who have interpretation results split across multiple PMM files (e.g., different field seasons or labs) cannot combine them without external tools.

## Desired behavior

Users should be able to either:
1. Select multiple PMM files at once (Ctrl+click / Shift+click in the file dialog), or
2. Use an "Add to results" / "Append" option that imports a file without clearing existing data.

## Technical notes

- The file upload pipeline currently replaces the Redux store with new data on each import.
- Need to modify the import flow to support an "append" mode alongside "replace" mode.
- UI options: a toggle/checkbox in the upload dialog, or a separate "Add files" button next to the existing "Open files" button.
- Must handle potential ID/label collisions when merging collections.
