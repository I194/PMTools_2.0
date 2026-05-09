# fixtures/parsers/dir — SOURCE

Fixtures for `parserDIR` (`.dir` format — directional statistics file).

## Layout

- `real/` — real-world `.dir` files curated from `test-data/potential-data/`.
- `synthetic/` — full edge-case matrix including the paired-G variant.

## Real-file origins

| Filename | Origin | Edge cases covered |
|---|---|---|
| `kola2013_repG_macCR_component_means.dir` | `test-data/potential-data/2000-2014-ARCHIVE/2013-Kola/mag/T/interpret/MiBa/component means.dir` (author: M. Bazhenov, 2013) | **D1 regression** — Mac classic CR-only line endings (no `\n`). Current parser regex `\r?\n` does not match a lone `\r`, so the file collapses to a single line and parsing returns garbage. Same input class would break all 9 parsers. Bonus: paired-row format with `rep G` / `rep S` / `rep G&S` codes (parserDIR.ts:43 dedicated branch, otherwise uncovered) and a wide variety of interpretation codes (`LTC`, `ITC`, `HTC-SW`, `HTC-NE`, `HTC-All`, `IT-MAD<`, etc.). |

More DIR fixtures (`sample.dir`, `field_batch.dir`,
`v2.6.1/{all_invalid,invalid_rows,malformed}.dir`, plus more paired-format
files from the Kola T and AF sub-archives) will be added in follow-up PRs
as the Step 4 parser test suite needs them.

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._
