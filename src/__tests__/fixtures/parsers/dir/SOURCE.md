# fixtures/parsers/dir — SOURCE

Fixtures for `parserDIR` (`.dir` format — directional statistics file).

## Layout

- `real/` — every real-world `.dir` we have, including known regression cases
  (`field_batch.dir`, `sample.dir`, `malformed.dir`, `invalid_rows.dir`,
  `all_invalid.dir`).
- `synthetic/` — full edge-case matrix including the paired-G variant.

## Real-file origins

_Populated in Phase 1 Step 0.6._
Sweep `test-data/`, `test-data/v2.6.*/`, `.claude/issues/*`.

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._
