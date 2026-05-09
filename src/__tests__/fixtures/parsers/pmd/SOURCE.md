# fixtures/parsers/pmd — SOURCE

Fixtures for `parserPMD` (`.pmd` format — paleomagnetic demagnetization data).

## Layout

- `real/` — every real-world `.pmd` file we have. Names preserved from origin.
- `synthetic/` — hand-built edge-case files (empty, header-only, single-step,
  BOM, CRLF/LF, Russian decimal comma, Windows-1251 encoding, trailing whitespace,
  extreme numeric values, malformed shapes).

Every fixture has a `<name>.expected.json` sibling.

## Real-file origins

_Populated in Phase 1 Step 0.6 (Gather real fixtures)._
Sources to sweep:
- `test-data/` and `test-data/v2.6.*/` regression directories
- `src/assets/examples/examplePCA.pmd`
- `.claude/issues/*` real user-reported tickets

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._ Each synthetic file documents the specific
edge case it exercises (encoding, line ending, malformed shape, etc.).
