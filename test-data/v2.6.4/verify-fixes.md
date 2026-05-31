# Verify: DIR "Export centered" feature (apr-rv-last)

Feature: the DIR Directional-Statistics module can now export the directions
**rotated so the Fisher mean sits at the centre of the stereonet**, to PMM, CSV
and XLSX — not just as graphics. Cut directions are tagged `CUT95` when the 45°
cutoff is on. Test on the DIR page with `test-data/sample.dir`.

## Setup
1. Open the app, go to **/app/dir**.
2. Upload `test-data/sample.dir` (8 directions: alternating normal ~D340/I+37 and
   reversed ~D145/I−42).
3. Compute a mean: select a statistics mode (**Fisher**) so a mean direction and
   its confidence circle appear on the stereonet. This is required — the centered
   export only appears once a mean exists.

## 1. New menu items appear only with a mean
- Open the table toolbar **Export** menu. With a mean computed you should see the
  regular items (**Export as PMM / CSV / XLSX**) **plus** three new ones:
  **Export centered as PMM**, **Export centered as CSV**, **Export centered as XLSX**.
- Before any mean is computed (fresh reload, no statistics mode), the "Export
  centered as …" items must **not** be present.

## 2. Centered export recomputes D/I, mean → centre
- Click **Export centered as CSV**. Open the downloaded file.
- Compared with the file from plain **Export as CSV**: every row must have the
  **same** id/Code/StepRange/N/K/MAD/Comment, but **different Dgeo/Igeo and
  Dstrat/Istrat** (rotated values).
- Sanity check the rotation: the centred directions should cluster near the centre
  of a stereonet, i.e. the **inclinations move toward ±90** relative to the mean.
  A direction that equals the mean comes out at inclination ≈ **90.0**.
- Values are rounded to **one decimal place** (e.g. `12.3`, never `12.345`).

## 3. CUT95 only when the 45° cutoff is enabled
- On the stereonet, toggle the **cutoff** control **on** (45°) and turn on
  **show outer dots** so the rejected directions remain visible.
- **Export centered as CSV** again. In the `Comment` column, the directions that
  fall **outside** the 45° circle (far from the mean) must contain **`CUT95`**.
  Directions inside the circle must **not** contain it. If a direction already had
  a comment, it becomes `…; CUT95` (existing text preserved).
- Turn the cutoff **off**, export again → **no** `CUT95` anywhere.
- Export centered **twice** with cutoff on → still a single `CUT95` per row (no
  `CUT95; CUT95` duplication).

## 4. "Exactly what is visible on the graph"
- **Hide** one direction (e.g. via the table/graph hide control). Export centered
  → the hidden direction is **absent** from the exported file.
- **Reverse** one direction (reverse-polarity control). Export centered → that
  direction's exported D/I reflect the **flipped** polarity (declination +180,
  inclination negated) before centering.

## 5. Regression — plain exports unchanged
- **Export as PMM / CSV / XLSX** (the non-centered items) still download and show
  the **original** Dgeo/Igeo (no rotation, no CUT95).
- The regular cutoff behaviour on the graph (hide/show outer dots, border circle)
  still works as before after the cutoff state moved into Redux.

## 6. No console errors / stray glyph
- Open DevTools console. Perform the steps above. There should be **no** errors or
  new React warnings.
- The Export menu must **not** show a stray lone "я" character (a pre-existing
  typo that was removed in this change).

## Companion issue (no app change expected)
- `may-rv-1` (SQUID/ARM): no UI change. Optionally confirm that uploading a
  `.squid` file with an `ARM` block still imports only the AF steps before `ARM`
  (already handled by parserSQUID). `.claude/issues/may-rv-1/70.squid` is a sample.
