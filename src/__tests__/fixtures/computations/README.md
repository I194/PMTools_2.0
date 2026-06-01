# Fixtures — pure computations (Part A reference output)

Reference-output inputs for the **pure** computations in `src/utils/statistics/`.
Same golden-master pattern as `fixtures/parsers/` and `fixtures/converters/`, driven
by [`src/test-utils/computationFixtures.ts`](../../../test-utils/computationFixtures.ts).

Each function has its own subdirectory holding `<case>.input.json` (a plain,
reviewable description of the arguments) and a committed `<case>.expected.json`
sibling (the function's output, with floats rounded to 7 sig figs and noise-floor
values < 1e-9 snapped to 0 for cross-platform stability — see the helper).

The matching test (`src/utils/statistics/__tests__/<function>.test.ts`) is ~10 lines:
it supplies an `invoke(input)` adapter that maps the JSON into the real arguments
(constructing `Direction` instances where needed) and the harness does the rest.
Adding a case = dropping one `*.input.json` here and regenerating.

```
UPDATE_FIXTURES=1 npm test -- --watchAll=false <function-name>
```
…then eyeball the JSON diff before committing. Never regenerate just to go green.

## Subdirectories

| Dir | Function | Input shape |
|-----|----------|-------------|
| `fisher_mean/` | `calculateFisherMean` | array of `{Dgeo, Igeo, Dstrat, Istrat}` |
| `vgp/` | `calculateVGP` | `{declination, inclination, siteLatitude, siteLongitude, a95?}` |
| `butler/` | `calculateButlerParameters` | `{confidence, inclination}` |
| `cutoff/` | `calculateCutoff` | `{directions: [{declination, inclination, length}], cutoffType}` |
| `basic_statistical_parameters/` | `calculateBasicStatisticalParameters` | `{directions: [{declination, inclination, length}]}` |
| `raw_plane_data/` | `getRawPlaneData` | `{direction: {declination, inclination, length}, angle?, angle2?, N?}` |
| `pca_pmd/` | `calculatePCA_pmd` | `{steps: [{x, y, z}], anchored, normalized, type}` |
| `pca_dir/` | `calculatePCA_dir` | array of `{Dgeo, Igeo, Dstrat, Istrat}` |
| `mcfadden_inc_mean/` | `calculateMCFaddenIncMean` | `{inclinations: number[]}` |
| `mcfadden_combine_mean/` | `calculateMcFaddenMean` | array of `{Dgeo, Igeo, Dstrat, Istrat, gcNormal?}` |
| `matrix_rotation_matrix/`, `…_transposed/` | `getRotationMatrix` / `getRotationMatrixTransposed` | `{lambda, phi}` (radians) |
| `matrix_t_matrix/` | `TMatrix` | `{vectors: number[][]}` |
| `matrix_multiply/` | `matrixMultiply` | `{a: number[][], b: number[][]}` |
| `matrix_rotate_around_y/`, `…_z/` | `rotate3x3AroundY` / `rotate3x3AroundZ` | `{angle}` (degrees) |
| `matrix_strange_rotation/` | `strangeRotation` | `{start: {declination, inclination}, end: {…}}` |
| `eig_eigenvalues_fast/` | `getEigenvaluesFast` | `{matrix: number[][]}` (symmetric 3×3) |
| `eig_sort_eigenvectors/` | `sortEigenvectors` | `{lambda: number[], E: number[][]}` (numeric.eig-shaped) |
| `eig_normalize_eigenvalues/` | `normalizeEigenValues` | `{lambda: number[]}` |
| `eig_principal_components/` | `makePrincipalComponents` | `{vectors: number[][]}` |
| `eig_split_polarities/` | `splitPolarities` | `{directions: [{declination, inclination}]}` |

`matrix.ts` and `eigManipulations.ts` each hold a bag of small pure helpers, so they contribute
several `matrix_*` / `eig_*` dirs (one per exported function) rather than a single folder. PCA,
McFadden-combine, `makePrincipalComponents` and `splitPolarities` go through `numeric.eig`, which
is pure-JS (IEEE-deterministic across platforms); only the final `atan2`/`asin` direction
conversion needs the harness's 7-sig-fig rounding.

## Locked-as-is behavior (bugs documented, NOT fixed here)

Part A locks current behavior even when it's wrong (see the overview). These references
faithfully capture today's output; each is tracked in
[`notes/found-bugs-todo.md`](../../../../.claude/development-roadmap/notes/found-bugs-todo.md):

- **`butler/*` and `basic_statistical_parameters/*` butler fields.**
  `calculateButlerParameters` mixes angle units (treats `confidence` as radians despite the
  "degrees" comment, and feeds degree-valued `inclination`/`paleoLatitude` straight into
  `Math.tan`/`Math.cos`), so its outputs are deterministic but not physically meaningful.
  In `basic_statistical_parameters` the butler fields lock as **null** because
  `Distribution.R` is never updated from its constructor `0`, so `getConfidenceInterval()`
  divides by zero → NaN → null.
- **`cutoff/outlier_at_index_zero_vandamme`** locks the `if (index)` falsy-zero bug: an
  outlier at array index 0 is never rejected (`if (0)` is false), so `scatter` stays huge.
  The two `cluster_with_outlier_*` cases reject an outlier at a non-zero index correctly,
  but `cutoffValue` is never reset between iterations, so the loop terminates via the
  10-iteration cap rather than true convergence.
- **`fisher_mean/single_direction`** locks the degenerate N=1 case: `k`/`MAD` are
  Infinity/NaN → null.
- **PR 6 (`pca_*`, `mcfadden_*`, `matrix_*`, `eig_*`).** Locked as-is, detailed in
  [`found-bugs-todo.md`](../../../../.claude/development-roadmap/notes/found-bugs-todo.md):
  `calculatePCA_dir`'s `vectors.push(...vectors)` neither mirrors nor changes the result (no-op
  + wrong comment) and it carries dead copy-paste code; `calculateMCFaddenIncMean` hardcodes the
  α₉₅ F-term to 0 (`mcfadden_inc_mean/steep_inclinations` locks an over-tight `a95 ≈ 0.45°`) and
  crashes for N=1 (not lockable); `calculateMcFaddenMean` returns α₉₅ under a field named `MAD`.
  `pca_pmd/line_fit_normalized` exercises the `normalized` branch, which unit-normalizes each step
  *before* the fit, so a "directions" PCA on a tight cluster fits the unit-vector scatter (hence
  the large `MAD ≈ 25.5°`) rather than a decay line — not a bug, just the documented branch.
