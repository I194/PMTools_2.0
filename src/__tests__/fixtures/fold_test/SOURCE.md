# fixtures/fold_test — SOURCE

Fixtures for `runFoldTest` (extracted pure core of `foldTestBootstrap`). Covers
thesis formula (1.12) (scatter matrix T, in §1.5.1) and the bootstrap fold-test
procedure.

Fixtures are deterministic: every entry pairs with a seed used by the
`createSeededRandom` helper so the bootstrap output is bit-exact reproducible.

## Fixtures

_Populated in Phase 1 Step 3._

## Citation rules

Each fixture cites one of:

- `PMTools_how_to_use.pdf formula (1.12)` (in §1.5.1)
- McFadden & McElhinny 1990 fold-test reference dataset
- PmagPy `pmag.bootstrap_fold_test` @ version `<X.Y.Z>` with documented seed
