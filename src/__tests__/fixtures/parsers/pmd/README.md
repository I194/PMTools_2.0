# fixtures/parsers/pmd — README

Fixtures for `parserPMD` (`.pmd` format — paleomagnetic demagnetization data).

## Layout

- `real/` — real-world `.pmd` files curated from `test-data/potential-data/`.
- `synthetic/` — hand-built edge-case files (empty, header-only, single-step,
  BOM, CRLF/LF, Russian decimal comma, Windows-1251 encoding, trailing whitespace,
  extreme numeric values, malformed shapes). Each documents the specific edge
  case it exercises.

## Real-file origins

| Filename | Origin | Edge cases covered |
|---|---|---|
| `crimea2013_nrm_celsius_dialect_143.pmd` | `test-data/potential-data/2000-2014-ARCHIVE/2013-Crimea/.../sill_Lebed/143.pmd` | **D3 regression** — first valid step is `NRM` (no `T`/`M` letter prefix), subsequent steps are bare temperatures `90°C`, `150°C`, ... (no letter prefix either). Current parser sets `demagType = undefined` because `line.slice(0, 1)` is `'N'` then `'9'`/`'1'`/`'2'`. The `°` byte (0xB0) appears mid-data line. Header begins with `STEP` (other dialect) instead of `PAL`. Volume `v=11.0E-6m3`. Affects 23 files in the Crimea archive. |
| `khramov2026_70.pmd` | `test-data/potential-data/squid-pmd/70.pmd` | **Locks D5 fix (paired golden)** — output of R.V. Veselovsky's reference SQUID→PMD converter applied to `khramov2026_70.squid` (lives in `parsers/squid/real/`). `parserSQUID(70.squid)` and `parserPMD(70.pmd)` produce equivalent step counts, step names (`M000`–`M090`), demag types, and within-tolerance `Dgeo`/`Igeo`/`mag`. Verified by `src/utils/files/__tests__/parserSQUID.test.ts`. Can also be picked up as a standalone PMD fixture in the Step 4 `parserPMD` test suite. |

More PMD fixtures (`sample.pmd` baseline, `examplePCA.pmd` bundled example,
`v2.6.1/{invalid_rows,malformed}.pmd`, Polar Ural unprefixed-step files,
Kola thermal/AF files, Siberia `T 20`-with-space files) will be added in
follow-up PRs as the Step 4 parser test suite needs them.

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._ Each synthetic file documents the specific
edge case it exercises (encoding, line ending, malformed shape, etc.).
