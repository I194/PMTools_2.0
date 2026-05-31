# Verify: DIR center-by-mean export + CUT45 (apr-rv-last)

The DIR module now exports the **main directions table** (the big bottom table)
rotated so the Fisher mean sits at the centre of the stereonet, plus a new
**"Export with hidden"** variant that keeps the cutoff-rejected directions and
tags them `CUT45`. Test on **/app/dir** with `test-data/sample.dir`.

## Setup
1. Open **/app/dir**, upload `test-data/sample.dir` (8 directions: alternating
   normal ~D340/I+37 and reversed ~D145/I−42).
2. Select statistics mode **Fisher** so a mean direction appears on the stereonet.
   (Centering needs a mean.)
3. All checks below are about the **bottom big table** (`DataTableDIR`) and its
   **Export** menu — not the small statistics table on top.

## 1. "Center by mean" now updates the table
- Toggle **Center by mean** on the stereonet **on**.
- The bottom table's **Dgeo/Igeo and Dstrat/Istrat columns must change** (rotated
  values) — previously they did not react. Toggling it **off** restores the
  original values. Points on the graph move as before.

## 2. Regular export reflects the toggle
- With **Center by mean OFF**: open the bottom table's **Export** menu →
  **Export as CSV**. The file holds the **original** Dgeo/Igeo.
- With **Center by mean ON**: **Export as CSV** again → the file holds the
  **rotated** Dgeo/Igeo (same values the table now shows). Values rounded to 0.1°.
- The regular export still **excludes** directions hidden on the graph.

## 3. New "Export with hidden as PMM/CSV/XLSX"
- The Export menu shows three new items: **Export with hidden as PMM / CSV / XLSX**
  below the regular ones.
- These include **every** direction — even ones hidden on the graph — whereas the
  regular export drops hidden ones. Hide a direction (eye icon) and compare:
  the regular CSV omits it; the "with hidden" CSV keeps it.

## 4. Cutoff → CUT45 in "Export with hidden"
- Enable the **45° cutoff** on the stereonet (the outliers get hidden on the
  graph and drop out of the table).
- **Export with hidden as CSV**. In the `Comment` column, the directions beyond
  45° from the mean must contain **`CUT45`**:
  - empty comment → `CUT45`
  - existing comment `foo` → `foo; CUT45`
- Directions inside 45° keep their original comment (no `CUT45`).
- Export **with hidden** twice → still a single `CUT45` per row (no
  `CUT45; CUT45`).
- Disable the cutoff → **Export with hidden** has **no** `CUT45` anywhere (but
  still includes all directions).
- The **regular** export never adds `CUT45` (and drops the hidden/cut rows).

## 5. Reversed directions
- Reverse one direction (swap-polarity icon). Both the table and every export
  show the **flipped** D/I (declination +180, inclination negated), then centered
  if the toggle is on.

## 6. No mean → no centering, no crash
- Before computing a Fisher mean (fresh reload), the **Center by mean** toggle has
  nothing to centre on: the table shows raw values and exports are unrotated. No
  console errors.

## 7. Console / regression
- DevTools console: no errors or new React warnings through all steps.
- The small **statistics table on top** is unchanged (no "Export with hidden"
  there — that change was reverted).
- The Export menu shows no stray "я" glyph (pre-existing typo removed).

## Companion issue (no app change expected)
- `may-rv-1` (SQUID/ARM): no UI change. Uploading a `.squid` with an `ARM` block
  still imports only the AF steps before `ARM` (handled by parserSQUID).
