# fixtures/parsers/dir — README

Fixtures for `parserDIR` (`.dir` format — directional statistics file).

## Layout

- `real/` — real-world `.dir` files curated from `test-data/potential-data/`.
- `synthetic/` — full edge-case matrix including the paired-G variant.

## Real-file origins

| Filename | Origin | Edge cases covered |
|---|---|---|
| `kola2013_repG_macCR_component_means.dir` | `test-data/potential-data/2000-2014-ARCHIVE/2013-Kola/mag/T/interpret/MiBa/component means.dir` (author: M. Bazhenov, 2013) | **Locks D1 fix** — Mac classic CR-only line endings (no `\n`). The unified regex `/\r\n\|\r\|\n/` (replacing the old `\r?\n` which couldn't match a lone `\r`) is applied across all 9 parsers. Verified by `src/utils/files/__tests__/parserDIR.test.ts` (synthetic CR-only file with standard column layout asserts exact field values; this real archive file asserts the regex split alone, since its non-standard column layout is a separate concern — see Pending follow-ups below). |

More DIR fixtures (`sample.dir`, `field_batch.dir`,
`v2.6.1/{all_invalid,invalid_rows,malformed}.dir`, plus more paired-format
files from the Kola T and AF sub-archives) will be added in follow-up PRs
as the Step 4 parser test suite needs them.

## Pending follow-ups

`kola2013_repG_macCR_component_means.dir` uses a **non-standard column
layout** for its `rep G` / `rep S` / `rep G&S` rows — wider gaps between
columns than `parserDIR.ts` expects. After D1 line-ending fix the parser
no longer collapses the file to one string, but the column slices land
on the wrong fields (e.g. Dgeo column lands on stepCount). This is a
**separate** parser-flexibility concern, tracked for a future Phase 1
follow-up. The fixture stays here to provide both regressions in one
real-world file: D1 (locked now) and the future column-flexibility fix.

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._
