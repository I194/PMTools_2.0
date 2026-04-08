# MAD=0 investigation — awaiting data from scientists

**Reported by**: scientists (EK-march-2026)
**Priority**: bug (unresolved)
**Complexity**: unknown — need more information

## Problem

PCA MAD calculation returns 0.0 for some data. Root cause is unclear — the initial `|| 0` → `isFinite` guard did not address the real issue.

## Status

Request sent to scientists (2026-03-29) asking for:
1. Direct comparisons between PMTools and software where MAD is calculated correctly
2. The formula they expect for PCA and PCA0 MAD calculation
3. More data files and step ranges showing discrepancies

## Technical notes

- The `|| 0` fallback in PCA was replaced with an `isFinite` guard, but this is a defensive fix, not a root-cause fix.
- Relevant code: `src/utils/statistics/calculation/calculatePCA_pmd.ts`
- Cannot proceed without reference data or expected formulas from scientists.
