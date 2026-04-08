# Evaluation Report — PMTools v2.6.3

Date: 2026-04-08
Scope: Entire VGP workflow (DIR page → Calculate VGP modal → sites upload → VGP calculation → reference switching → export → data persistence)

## Bug Report

### Bug 1: Sites table resets to 0.0 after VGP calculation
- **What**: After uploading a sites CSV and clicking "Calculate VGPs", the SitesDataTable reverts all Lat/Lon/age/plateId values to 0.0, even though the VGP calculation used the correct uploaded values
- **Steps**: Open VGP modal → Upload sites CSV → Click "Calculate VGPs" → Observe sites table
- **Expected vs Actual**: Sites table should retain uploaded values (e.g. lat=45.2, lon=38.5). Instead all cells show 0.0
- **Severity**: major — users cannot verify which site coordinates were used after calculation

### Bug 2: Non-serializable Direction object in Redux state
- **What**: Every Redux action triggers a console error: "A non-serializable value was detected in the state, in the path: `dirPageReducer.vgpMean.direction`". The `Direction` class instance is stored directly in Redux state via `setVGPMean`
- **Steps**: Open VGP modal → Calculate VGPs → Observe console
- **Expected vs Actual**: No Redux serialization warnings. Instead, 47+ errors accumulated during a single test session, triggered on every action (setVGPMean, setVGPData, setReference, activateHotkeys, etc.)
- **Severity**: major — pollutes console, may cause issues with Redux DevTools, time-travel debugging, and state persistence; indicates architectural violation of Redux principles

### Bug 3: "Remove imported" does not clear VGP graph or Mean VGP stats
- **What**: After clicking "Remove imported", the VGP results table correctly clears, but the stereonet still displays old VGP pole positions and confidence circle, and the Mean VGP statistics badge still shows old values
- **Steps**: Calculate VGPs → Click "Remove imported" → Observe stereonet and Mean VGP display
- **Expected vs Actual**: Stereonet should clear to empty state, Mean VGP should hide or reset. Instead, old data persists visually
- **Severity**: major — misleading display; user may think old results are still valid after clearing input data

### Bug 4: Hidden directions still included in VGP calculation
- **What**: After hiding a direction on the DIR table (via the eye icon), reopening VGP modal and recalculating still includes the hidden direction. Mean VGP shows N=11 when it should be N=10
- **Steps**: On DIR page, hide direction #1 (S1S-01) → Open VGP modal → Upload sites CSV → Click "Calculate VGPs" → Check N in Mean VGP
- **Expected vs Actual**: Hidden directions should be excluded from VGP calculation (N=10). Instead, all 11 directions are included (N=11). Redux confirms `setHiddenDirectionsIDs` was dispatched, so the issue is in the VGP calculation logic not reading the hidden state
- **Severity**: major — scientific correctness issue; users hide outliers to exclude them from analysis

## Data Consistency Issues

- **Sites table vs VGP results**: The VGP data table correctly shows site Lat/Lon from uploaded data (e.g. 45.2, 45.3), but the SitesDataTable in the same modal shows 0.0. The data is used correctly in calculation but displayed incorrectly in the input table
- **Reference switching**: VGP values correctly change between Geo and Strat references. Cached values are consistent when switching back (e.g. Strat: plat=-70.50, Geo: plat=-72.55, back to Strat: plat=-70.50). No consistency issues here
- **VGP pole positions vs stereonet**: The stereonet correctly shows two clusters — normal polarity poles near the south pole (Down markers for reversed directions 1-6, 9-10) and reversed poles near the north (Up markers for normal directions 7, 8, 11). Positions visually match the pole lat/lon values in the table

## Shortcut Issues

No keyboard shortcuts are specific to the VGP modal. The Escape key correctly closes the VGP modal.

## What Worked Well

- **VGP modal opens/closes cleanly** with proper layout (sites table, VGP results table, stereonet)
- **File upload**: CSV parsing correctly reads lat, lon, age, plate_id columns
- **VGP calculation**: Produces scientifically reasonable pole positions with dp/dm confidence values
- **Reference switching**: Geo/Strat toggle works correctly with cached calculations (no redundant recalculation)
- **Data persistence**: VGP results survive modal close/reopen
- **Export menu**: Four export options available (VGP, GPML, CSV, XLSX)
- **Mean VGP display**: Clean layout with plat, plon, a95, k, N, R values; copy button present
- **Stereonet rendering**: VGP poles, labels, and confidence circle render correctly with Down/Up legend
- **SitesDataTable**: Labels correctly match DIR data labels, cell editing activates on double-click
- **Calculate with zero coordinates**: Gracefully handles edge case of lat=0, lon=0 sites (produces valid VGP at equator/prime meridian intersection)

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Clean modal layout, good use of space for three-panel view (sites, VGP data, stereonet). Mean VGP badge is well-designed |
| Functionality | 2 | Four major bugs: sites table reset, stale graph on clear, hidden directions ignored, Redux serialization errors |
| Technical quality | 2 | 47+ console errors from non-serializable Redux state; every single Redux action triggers a warning |
| UX | 3 | Workflow is intuitive (upload → calculate → review), reference switching is smooth, but stale data display after "Remove imported" is confusing |

## Priority Fixes

1. **Fix hidden directions exclusion from VGP calculation** — scientific correctness issue; the `calculateVGPs` function must filter by `hiddenDirectionsIDs` from Redux state
2. **Fix "Remove imported" to clear VGP graph and Mean VGP** — dispatch `setVGPData(null)` and `setVGPMean(null)` when removing imported data
3. **Fix sites table showing 0.0 after calculation** — the `SitesDataTable` component loses its data after `calculateVGPs` runs; likely the `getRows()` forwardRef approach or Redux `siteData` is being overwritten
4. **Serialize Direction object before storing in Redux** — convert the `Direction` class instance to a plain object `{ declination, inclination }` before dispatching `setVGPMean`, or extract only the needed fields
