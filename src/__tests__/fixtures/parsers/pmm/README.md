# Fixtures — `parsePMM`

Reference-output inputs for `src/utils/files/parsers/parserPMM.ts`.
Each `<file>.pmm` has a `<file>.pmm.expected.json` sibling (parser output, `created` pinned).
Regenerate: `UPDATE_FIXTURES=1 npm test -- --watchAll=false parserPMM`, then review the diff.

## Format (as the parser reads it)
The first physical line is dropped; the next line is a quoted title (ignored for parsing); then a
column header; then data rows with columns
`ID, CODE, STEPRANGE, N, Dg, Ig, kg, a95g, Ds, Is, ks, a95s, comment`.

## real/
- `season1_north.pmm`, `season1_south.pmm`, `season2_extra.pmm` — copied from `test-data/`.
  Format-accurate PMM site-mean files.

## Locked-as-is
- Comments keep their surrounding quotes (`"normal"`) — data rows are not quote-stripped.
