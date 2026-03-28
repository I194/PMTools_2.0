# VGP for both geographic and stratigraphic coordinate systems

**Requested by**: Alexander Pasenko (AP-march-2026, issue #2)
**Priority**: major improvement
**Complexity**: medium

## Problem

VGP calculations currently use whichever coordinate system is selected (geographic OR stratigraphic). Users need VGP computed and displayed for both systems simultaneously, similar to how PCA shows Dgeo/Igeo and Dstrat/Istrat side by side.

## Desired behavior

1. VGP table and graph should show poles for both geographic and stratigraphic coordinate systems at the same time.
2. (Stretch) Allow users to input custom directions directly in the VGP section and calculate VGP without importing a DIR file — currently requires an external tool like Excel.

## Technical notes

- Key files:
  - `src/components/AppLogic/DataTablesDIR/SitesDataTable/SitesDataTable.tsx` — lines 128–130 select one coord system
  - `src/utils/statistics/calculation/calculateVGP.ts` — pure VGP math
  - `src/components/AppLogic/VGP/` — VGP display components
  - `src/utils/GlobalTypes.ts` — VGPData type definition
- Current behavior: VGP uses either `DgeoFinal/IgeoFinal` or `DstratFinal/IstratFinal` based on the `reference` toggle. VGPData stores a single set of pole coordinates.
- Suggested approach: extend VGPData to include both `poleLatGeo/poleLonGeo` and `poleLatStrat/poleLonStrat`. Calculate VGP for both systems when site data is processed.
