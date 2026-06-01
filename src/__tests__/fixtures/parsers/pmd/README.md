# fixtures/parsers/pmd — README

Reference-output fixtures for `parserPMD` (`.pmd` — paleomagnetic
demagnetization data). Locked by `src/utils/files/__tests__/parserPMD.test.ts`
via the shared `describeParserReferenceOutput` harness. Each input has a
committed `<input>.expected.json` sibling capturing the parser's **current**
output (the golden-master pattern — see `.claude/development-roadmap/part-a-overview.md`).

`parserPMD` returns the `ParseResult<IPmdData>` wrapper (`{ data, validation }`),
so its references nest the data under `data` and carry a `validation.invalidRows`
list — unlike the bare-`IPmdData` parsers (`parseCSV_PMD`, `parseRS3`). The
harness pins the volatile `data.created` timestamp for this shape.

## Layout

- `real/` — real-world `.pmd` files curated from the archives under `test-data/`.
- `synthetic/` — hand-built files exercising a specific edge case.

## Real-file origins

| Filename | Origin | What it locks (current/as-is behavior) |
|---|---|---|
| `crimea2013_nrm_celsius_dialect_143.pmd` | `2013-Crimea/.../sill_Lebed/143.pmd` | Non-standard "`STEP`" header dialect (not `PAL`); `v=11.0E-6m3`; first valid step `NRM`, then `°C`-suffixed temperatures. **Surfaces a real data-loss bug** (see found-bugs-todo "Surfaced in parserPMD reference output"): only `NRM` + `90°C` parse — the 3-digit `150°C`…`470°C` labels are 5 chars wide and overflow the 4-char step column, corrupting the X field → 10 rows dropped to `validation.invalidRows`. `demagType` stays `undefined` (no `T`/`M` letter prefix). The `°` byte reads as `U+FFFD` (ISO-8859 source decoded as UTF-8) but that is incidental — the overflow happens with a correctly-decoded `°` too. Affects ~23 files in this sub-archive. |
| `khramov2026_70.pmd` | `test-data/potential-data/squid-pmd/70.pmd` | M-prefixed steps `M000`–`M090` → `demagType = 'alternating field'`, 10 clean steps, no invalid rows. Paired golden for the D5 SQUID fix: output of R.V. Veselovsky's reference SQUID→PMD converter applied to `khramov2026_70.squid` (in `parsers/squid/real/`). Also read by `parserSQUID.test.ts` to cross-check `parserSQUID(70.squid)` against `parserPMD(70.pmd)`. |
| `polarural2012_unprefixed_steps_1-1.pmd` | `2012-Polar Ural/MAG/pmd/1-1.pmd` | Bare-number step names (`20`, `60`, … `600`) — no `T`/`M` prefix, no `°C`/`mT` suffix, genuinely ambiguous. Current parser → `demagType = undefined`, 14 clean steps, no warning yet. (The D3 fix will keep `undefined` but add an `AMBIGUOUS_DEMAG_TYPE` warning → flip this reference then.) Affects ~66 files in this sub-archive. |
| `siberia2014_t-space-step1_23.pmd` | `2014-Siberia/.../from Kirill/23.pmd` | Position-based padding: first step is right-aligned `T 20` (T, space, 2, 0) in the 4-char column, later steps `T120`–`T550` unpadded. Current parser → `slice(0,1) = 'T'` on step 1 → `demagType = 'thermal'`, 11 clean steps. Exists to prove the fixed-width padding dialect parses (and, post-D3, to guard the strict `^[Tt]\d` regex against regressing it). |

Further candidates noted for later (`examplePCA.pmd` bundled example, Kola
thermal/AF files) can be dropped into `real/` as needed — adding a case is just
adding a file plus its regenerated reference.

## Synthetic-fixture matrix

| Filename | Source | Edge case locked |
|---|---|---|
| `sample_thermal_baseline.pmd` | `test-data/sample.pmd` | Clean canonical `PAL`-dialect thermal file (`test01`): 8 `T000`–`T600` steps, `demagType = 'thermal'`, no invalid rows, and **distinct** `Dgeo`/`Igeo` vs `Dstrat`/`Istrat` (exercises the strat columns, which the geographic-only real files leave equal). |
| `invalid_rows_nan_fields.pmd` | `test-data/v2.6.1/invalid_rows.pmd` | The `validation.invalidRows` path (parserPMD's distinctive output vs `parseCSV_PMD`): row `T100` has a non-numeric X (`XXXXXXXX`), row `T300` has an empty Y field. Both become `NaN` and are reported in `invalidRows` (row 4 → field `X`, row 6 → field `Y`) and dropped from `steps`, leaving 4 valid steps. |
