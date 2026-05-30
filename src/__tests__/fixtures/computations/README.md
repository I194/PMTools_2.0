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
