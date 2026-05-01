# fixtures/pca — SOURCE

Fixtures for `calculatePCA_pmd` and `calculatePCA_dir`. Covers thesis formulas
§1.1 (vector MAD), §1.2 (great-circle MAD), §1.3 (covariance matrix H).

## Fixtures

_Populated in Phase 1 Step 2._

## Citation rules

Every fixture must have a `<name>.expected.json` sibling and cite at least one of:

- `PMTools_how_to_use.pdf §<n>`
- PmagPy `pmag.doprinc` (or equivalent) @ version `<X.Y.Z>`
- Tauxe "Essentials of Paleomagnetism" 2010 chapter/page reference

The v2.6.3 MAD-zero regression case is mandatory and must originate from
`test-data/v2.6.3/` (preserve the original filename in `real/`).
