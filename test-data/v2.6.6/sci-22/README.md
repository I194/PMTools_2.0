# SCI-22 manual verification data

`Coordinates.angle()` called `Math.acos` on an unclamped dot product. For identical or exactly
antipodal unit vectors rounding can give `+/-1.0000000000000002`, `acos` returns `NaN`, and every
`NaN > threshold` comparison is silently false. The fix clamps the dot product to `[-1, 1]`.

## Files

- `sci22_cutoff45_exact_antipode.csv`: DIR import, 8 rows, Dgeo/Igeo equal to Dstrat/Istrat.
- `before-reversal-manual.png`: manual reversal test before the fix (gamma NaN, class B).

| id | D | I | Angle from the mean of DUP-1..3 (5 / 54) |
|---|---|---|---|
| DUP-1, DUP-2, DUP-3 | 5 | 54 | 0 (the three rows the mean is built from) |
| ANTIPOD | 185 | -54 | 180 exactly (the bug row) |
| ANTI-1 | 184 | -54 | 179.41 (control, always hidden) |
| FAR-50 | 5 | 4 | 50 (control, always hidden) |
| NEAR-40 | 5 | 14 | 40 (control, always visible) |
| NEAR-20 | 5 | 34 | 20 (control, always visible) |

Why 5 / 54: the overshoot depends on the last bit of `sin`/`cos`, and Chrome (V8 built with the
libm trig port) and Node/Jest (fdlibm port) differ there. For 5 / 58 Node gives a dot product of
`-1.0000000000000002` but Chrome gives exactly `-1`, so that pair shows nothing in the browser.
For 5 / 54 the persisted mean is `{4.999999999999999, 54.00000000000001, 1}` and the dot product
with ANTIPOD is `-1.0000000000000002` in Chrome 153, in Node 25 and with the macOS system libm,
for a mean of two or of three duplicates.

## Check 1: CUTOFF 45 on the DIR page

1. Open `/app/dir` and import `sci22_cutoff45_exact_antipode.csv`. Keep the GEO reference.
2. Tick rows DUP-1, DUP-2, DUP-3 (at least two rows are required; one row does not start a mean).
3. Click FISHER (the F hotkey does nothing while a checkbox has focus), then press Enter in the
   empty comment popup.
4. Click "CUTOFF 45" on the stereonet button strip (BORDER on, OUTER DOTS off).

| | Hidden rows |
|---|---|
| Before the fix | ANTI-1, FAR-50. ANTIPOD, the farthest direction of all, stays visible. |
| After the fix | ANTIPOD, ANTI-1, FAR-50 |

DUP-1..3, NEAR-40 and NEAR-20 stay visible in both cases.

## Check 2: CUT45 marker in the export

With CUTOFF 45 still on, open EXPORT in the table toolbar and choose "Export with hidden as CSV"
(also "... as PMM", "... as XLSX"). These exports keep every row and append `CUT45` to the comment
of each cut row (`src/utils/files/transforms/markCutoffComments.ts`). The plain "Export as ..."
entries drop hidden rows instead and carry no marker.

- Before the fix: `CUT45` on ANTI-1 and FAR-50 only.
- After the fix: `CUT45` on ANTIPOD, ANTI-1 and FAR-50.

## Check 3: manual reversal test

Toolbar "PALEOMAGNETIC TESTS" -> tab "Reversal Test (manual input)":
Declination 1 = 0, Inclination 1 = -86, N 1 = 20, k 1 = 50;
Declination 2 = 180, Inclination 2 = 86, N 2 = 20, k 2 = 50 -> Calculate.

| | gamma | gamma critical | class |
|---|---|---|---|
| Before the fix | NaN | 6.46 | B |
| After the fix | 180.00 | 6.46 | - |

## Automated checks

`CI=true npx react-scripts test --watchAll=false Coordinates reversalTestOldFashioned eigManipulations markCutoffComments`
The new tests sweep integer-degree directions instead of one hand-picked pair, so they do not
depend on the trig rounding of one platform.
