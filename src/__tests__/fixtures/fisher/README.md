# fixtures/fisher — SOURCE

Fixtures for `calculateFisherMean` and the IDirData wrapper. Covers thesis
formulas (1.4) (κ = (N−1)/(N−R)) and (1.5) (α₉₅), both in §1.3.

## Fixtures

_Populated in Phase 1 Step 1 / Step 2._

## Citation rules

Each fixture cites one of:

- `PMTools_how_to_use.pdf formula (1.4)` or `formula (1.5)` (both in §1.3)
- Fisher 1953, Table 2 (handcrafted 9-direction example)
- PmagPy `pmag.fisher_mean` @ version `<X.Y.Z>`

Property-based fixtures (Fisher mean of N copies of direction X equals X)
live in `*.test.ts` files using `fast-check`, not as JSON files.
