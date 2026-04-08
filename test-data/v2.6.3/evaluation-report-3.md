# Evaluation Report — PMTools v2.6.3

Date: 2026-04-08
Scope: VGP workflow — verify all 4 bug fixes from evaluation-report-2

## Verification Results

All 4 bugs from evaluation-report-2 are **FIXED**.

### Bug #1: Sites table resets to 0.0 after VGP calculation — FIXED
- **Before**: After uploading a sites CSV and clicking "Calculate VGPs", all Lat/Lon/age/plateId values reverted to 0.0
- **After**: Sites table retains all uploaded values (45.2, 38.5, 150.0, 301) after VGP calculation
- **Root cause fixed**: `setSiteData` now receives proper `ISitesData` object `{ data: [...], format, created }` instead of raw `SiteRow[]`

### Bug #2: Non-serializable Direction object in Redux state — FIXED
- **Before**: Every Redux action triggered console error: "A non-serializable value was detected in the state, in the path: `dirPageReducer.vgpMean.direction`" — 47+ errors accumulated in a single session
- **After**: Zero console errors throughout entire test session (0 errors after navigation, upload, calculation, reference switching, and removal)
- **Root cause fixed**: `Direction` class instance is now serialized to `{ declination, inclination }` plain object before dispatching `setVGPMean`

### Bug #3: "Remove imported" does not clear VGP graph or Mean VGP stats — FIXED
- **Before**: Clicking "Remove imported" cleared VGP results table but left stereonet showing old VGP poles/confidence circle and Mean VGP badge showing old statistics
- **After**: "Remove imported" now clears all three panels: sites table resets to 0.0, VGP results table disappears, stereonet is empty, Mean VGP badge is removed
- **Root cause fixed**: `useEffect` guard for null `vgpData` removed; `setVGPMean(null)` dispatched in the else branch

### Bug #4: Hidden directions still included in VGP calculation — FIXED
- **Before**: After hiding direction #1, VGP calculation still showed N=11 (all directions included)
- **After**: After hiding direction #1, VGP calculation correctly shows N=10; VGP data table starts from ID 2 (hidden row excluded); Mean VGP values changed appropriately (plat=-70.55, plon=24.23 vs previous plat=-70.50, plon=21.61)
- **Root cause fixed**: `Number(row.id)` coercion applied when filtering against `hiddenDirectionsIDs` to handle string/number type mismatch from `getRowModels()`

## Additional Observations

- **Sites table + hidden direction**: The hidden direction's row in the sites table correctly shows № = "-" while retaining its uploaded site data (lat=45.2, lon=38.5). This is good UX — users can see what was excluded without losing data.
- **Reference switching**: GEO/STRAT toggle continues to work correctly with cached VGP data
- **VGP data persistence**: VGP results survive modal close/reopen
- **Export menu**: All 4 export formats (VGP, GPML, CSV, XLSX) remain available and accessible

## Bug Report

No new bugs found during verification testing.

## Data Consistency Issues

None found. VGP table data, stereonet visualization, and Mean VGP statistics are all consistent.

## Shortcut Issues

None applicable to VGP workflow.

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Clean three-panel modal layout, clear hidden-direction indicator (№ = "-"), well-formatted Mean VGP badge |
| Functionality | 5 | All tested features work correctly: upload, calculate, reference switch, remove, hidden direction exclusion |
| Technical quality | 5 | Zero console errors throughout entire session; Redux serialization issue resolved cleanly |
| UX | 4 | Intuitive workflow, immediate visual feedback on actions, hidden directions clearly indicated in sites table |

## Priority Fixes

None — all 4 previously identified bugs are verified as fixed.
