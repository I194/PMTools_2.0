# fixtures/parsers/rs3 — SOURCE

Fixtures for `parserRS3` (`.rs3` format).

## Layout

- `real/` — real `.rs3` files. **None at the start of Phase 1** — the format
  is rare in our archive. Real files are added here as soon as Ivan sources them;
  the phase does not block on this.
- `synthetic/` — synthetic-from-spec covers all parser branches and unblocks
  the test suite immediately.

The synthetic-only path is acceptable per Phase 1 Risks: "synthetic fixture
from spec unblocks the parser test suite immediately. Real files added to
`real/` subdir as soon as sourced — phase does not wait."

## Real-file origins

_Empty until sourced._

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4 from the `.rs3` format spec._
