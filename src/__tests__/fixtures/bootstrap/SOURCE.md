# fixtures/bootstrap — SOURCE

Fixtures for `bootstrapManipulations` and the extracted `bootstrapCommonMeanTest`.
Bootstrap procedure per thesis §1.5 (Efron 1979 / Tauxe 1991): resample with
replacement, compute Fisher mean, repeat Q times.

## Fixtures

Every fixture in this directory **must** be paired with a seed value (typically
`seed = 42`) and the LCG output is reproduced by `createSeededRng(seed)` from
`src/test-utils/seededRng.ts` (helpers live outside `__tests__/` because CRA's
Jest config hardcodes `testMatch: __tests__/**/*.{js,ts,…}` and treats every TS
file under `__tests__/` as a test suite). The hand-rolled LCG uses 32-bit unsigned
integer state (Numerical Recipes constants) so output is bit-exact across JS
engines and the future Phase 7 Rust port.

_Populated in Phase 1 Step 2._

## Citation rules

Each fixture cites:

- `PMTools_how_to_use.pdf §1.5`
- Seed value used to generate the expected output
- Number of bootstrap iterations (Q)
