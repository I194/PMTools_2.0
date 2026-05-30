# Fixtures — `parseCSV_SitesLatLon`

Reference-output inputs for `src/utils/files/parsers/parserCSV_SitesLatLon.ts`.
Each `<file>.csv` has a `<file>.csv.expected.json` sibling (parser output, `created` pinned).
Regenerate: `UPDATE_FIXTURES=1 npm test -- --watchAll=false parserCSV_SitesLatLon`.

## Format
The header row names the columns; the parser locates `lat`, `lon`, `age`, `plate_id` **by header
name** (case-insensitive). Output is `{ data: [{ lat, lon, age, plateId }], ... }` — the site label
column is not carried into the output, and absent columns become `null`.

## real/
Empty — sites CSVs are exported on demand from PMTools; real fixtures deferred to an export run.

## synthetic/
- `basic_sites.csv` — `label,lat,lon` (age/plate_id absent → null).
- `whitespace_and_signs.csv` — padded cells, negative and zero coordinates.
