# Fixtures — `parseCSV_DIR`

Reference-output inputs for `src/utils/files/parsers/parserCSV_DIR.ts`.
Each `<file>.csv` has a `<file>.csv.expected.json` sibling (parser output, `created` pinned).
Regenerate: `UPDATE_FIXTURES=1 npm test -- --watchAll=false parserCSV_DIR`, then review the diff.

## Columns (as the parser reads them)
`id, Code, StepRange, N, Dgeo, Igeo, Kgeo, MADgeo, Dstrat, Istrat, Kstrat, MADstrat, Comment`
(`gcNormal` is derived from `Code` starting with `GC`; `demagType` from the first char of `StepRange`.)

## real/
- `lab_results.csv` — copied from `test-data/lab_results.csv`. Format-accurate DIR CSV (this is the
  file that is *not* a valid CSV_PMD input — see the csv_pmd notes).

## synthetic/
- `normal_and_reversed.csv` — normal + reversed polarity + a `GC` code.
- `crlf_line_endings.csv` — D1 regression (`\r\n`).
