# Multi-window / multi-collection support

**Requested by**: Roman Veselovsky (RV-march-2026, issue #1)
**Priority**: feature request
**Complexity**: large

## Problem

All browser tabs/windows share the same Redux state via localStorage. Opening PMTools in a new tab mirrors the first tab's data. Users cannot view different collections side by side.

## Desired behavior

Users should be able to open multiple PMTools instances (tabs or windows) and work with independent collections in each.

## Technical notes

- Current architecture persists Redux state to localStorage, which is shared across all tabs of the same origin.
- Possible approaches:
  1. **sessionStorage** — scoped per tab, simplest migration but breaks "reopen tab" persistence.
  2. **URL-based state** — encode collection ID in the URL; each tab loads its own data.
  3. **Per-tab ID** — generate a unique tab ID on load, key localStorage entries by tab ID.
- This is a fundamental architecture change — needs careful design to avoid breaking existing single-tab workflows.
