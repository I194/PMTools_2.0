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
| `crimea2013_nrm_celsius_dialect_143.pmd` | `test-data/potential-data/2000-2014-ARCHIVE/2013-Crimea/.../sill_Lebed/143.pmd` | **Locks D3 fix (thermal evidence)** — first valid step is `NRM`, subsequent steps are bare temperatures `90°C`, `150°C`, ... with no `T`/`M` letter prefix. Pre-D3 `parserPMD` produced `demagType=undefined` for all 23 files in this Crimea sub-archive. After D3, the parser scans the entire steps block and detects `°` (or `U+FFFD` from a UTF-8 mis-decoded ISO-8859 source) as a thermal marker, classifying the file as `'thermal'` with no warning. Verified by `src/utils/files/__tests__/parserPMD.test.ts`. |
| `polarural2012_unprefixed_steps_1-1.pmd` | `test-data/potential-data/2000-2014-ARCHIVE/2012-Polar Ural/MAG/pmd/1-1.pmd` | **Locks D3 fix (genuine ambiguity + warning)** — step names are bare numbers (`20`, `60`, `120`, `180`, `220`) with no `T`/`M` prefix and no `°C`/`mT` suffix. Consistent with both thermal (°C) and AF (mT) protocols, no markers either way — genuinely ambiguous. After D3 the parser keeps `demagType=undefined` (does not guess) and emits a non-blocking `AMBIGUOUS_DEMAG_TYPE` warning so the UI (Phase 2) can tell the user why the demag column is empty. Affects 66 files in this Polar Ural sub-archive. |
| `khramov2026_70.pmd` | `test-data/potential-data/squid-pmd/70.pmd` | **Locks D5 fix (paired golden)** — output of R.V. Veselovsky's reference SQUID→PMD converter applied to `khramov2026_70.squid` (lives in `parsers/squid/real/`). `parserSQUID(70.squid)` and `parserPMD(70.pmd)` produce equivalent step counts, step names (`M000`–`M090`), demag types, and within-tolerance `Dgeo`/`Igeo`/`mag`. The same file also locks D3's M-prefix path: parserPMD classifies the steps as `'alternating field'` with no warning. Verified by `src/utils/files/__tests__/parserSQUID.test.ts` and `parserPMD.test.ts`. |
| `siberia2014_t-space-step1_23.pmd` | `test-data/potential-data/2000-2014-ARCHIVE/2014-Siberia/MAG/z_raw/from Kirill/23.pmd` | **Locks D3 letter-prefix tightening** — first step is right-aligned `T 20` in the 4-char fixed-width column (T, space, 2, 0); subsequent steps `T120`/`T180`/`T240`/`T300`/... are unpadded. After D3's `^[Tt]\d` strictness, step 1 casts no vote (the space breaks the strict regex) but later steps cover, so `thermalEvidence > 0` and the file still classifies as thermal with no warning. Without the rest of the file, the strict regex would silently drop `T 20` to `undefined`+warning — this fixture exists specifically to prove the strict regex doesn't regress the position-based padding dialect. Verified by `parserPMD.test.ts`. |

More PMD fixtures (`sample.pmd` baseline, `examplePCA.pmd` bundled example,
`v2.6.1/{invalid_rows,malformed}.pmd`, Polar Ural unprefixed-step files,
Kola thermal/AF files, Siberia `T 20`-with-space files) will be added in
follow-up PRs as the Step 4 parser test suite needs them.

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._ Each synthetic file documents the specific
edge case it exercises (encoding, line ending, malformed shape, etc.).
