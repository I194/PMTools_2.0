# Science-fix queue, scoped run: SCI-22 and SCI-23

Generated 2026-09-22 by the `investigate-found-bugs` workflow (rank step), scoped run with
`args: ["SCI-22", "SCI-23"]`. Input: 2 fix specs, each checked by three adversarial refuters
(root-cause, fix, science). The investigation was read-only; every number below comes from the specs
and the refuter reports. This file does not replace `science-fix-queue.md` (the full-catalog report
of 2026-09-21), and that file was not touched.

Path note: `package.json` says version 2.6.5, but there is no `test-data/v2.6.5/`; the full-catalog
report and both ledger pointers (`.claude/progress.json`, SCI-22 and SCI-23 notes) use
`test-data/v2.6.6/`. This report is written next to them so the ledger pointer stays valid. If the
directory should follow `package.json` literally, move both reports together.

The rules of `science-fix-queue.md` apply: one fix per PR; branch from `dev`, PR to `dev`; Ivan's
approval for `.claude/.science-unlock` when a path under `src/utils/statistics/` is edited and for
every `*.expected.json` change; a spec that survives is implemented **as corrected** by the refuters.

## Result at a glance

| Order | ID | Severity (ledger -> revised) | What a researcher sees today | Refutations | Depends on |
|---|---|---|---|---|---|
| 1 | SCI-22 | major -> minor (recommendation) | Silent: an exact antipode of the mean escapes CUTOFF 45 and the CUT45 export marker; exact antipodes are split into the normal group; the manual reversal test shows gamma NaN and class A/B/C for exactly antipodal input. Degenerate input only. | 0 of 3 | none |

Needs decision (1 item): **SCI-23** (McFadden combined mean). Confirmed, wrong numbers in the live
MCFAD button, all 12 new reference values verified by three independent routes, but the fix lens
refuted the spec as written (request-changes) and four open questions change which code is written.
The fix refuter's wording: "The PR cannot be written until Ivan decides."

Four follow-up findings from this run have no ledger item yet (see "New findings").

How the two items merge with the full-catalog queue:

- SCI-22 is a cheap independent fix (one line, zero reference flips, file not gated by the science
  hook). It can be pulled forward at any point, including before SCI-01, without reordering the rest.
- SCI-23, once decided, is a "wrong numbers in production" item. It belongs directly after SCI-01 and
  SCI-02, ahead of the cosmetic items SCI-14, SCI-12 and SCI-09.
- Neither item depends on the other. The only link: the SCI-23 convergence loop must not call
  `Coordinates.angle` or `Direction.angle`, whether or not SCI-22 has landed.

---

# Queue

## 1. SCI-22: `Coordinates.angle` takes acos of an unclamped dot product

- **Title (catalog):** Coordinates.angle takes acos of an unclamped dot product; a direction
  antipodal to the mean can escape the live CUTOFF 45.
- **Severity:** ledger says major; recommended revision **minor**. When it fires it is a silent wrong
  answer (a false positive reversal test, a direction 180 degrees from the mean that is not cut). It
  fires only on degenerate input: a mean that coincides with a data direction to about 1e-16 (a mean
  of one direction or of exact duplicates) together with an exact antipode, or hand-typed identical
  or antipodal means. With a Fisher mean of scattered data: 0 NaN in 40000 pairs (spec) and 0 in
  200000 (science refuter). The ledger owner decides the final severity; it does not change the order.
- **Root cause (one line):** `src/utils/graphs/classes/Coordinates.ts:106` computes
  `Math.acos(this.toUnit().dot(coordinates.toUnit()))` with no clamp; rounding pushes the dot product
  to +/-1.0000000000000002 for identical or exactly antipodal vectors, `acos` returns NaN, and every
  caller's `NaN > threshold` is `false` (commit e96cce38, 2022-02-17, unchanged since).
- **Three live symptoms of the one cause:**
  1. CUTOFF 45 escape: the stereonet hide filter (`DIRPage/Graphs.tsx:84`) and the CUT45 export marker
     (`markCutoffComments.ts:32`). Rows (0,-86), (180,86), (180,85), (90,0) against mean (0,-86) get
     comments `""`, `""`, `"CUT45"`, `"CUT45"`: only the exact antipode escapes.
  2. `splitPolarities` (`eigManipulations.ts:161-163`) puts an exact antipode into the normal group:
     `[(0,6), (0,6), (180,-6)]` splits 3/0; 1199 of 5832 synthetic `[n, n, antipode]` cases are wrong,
     all 1199 have a NaN angle, 0 remain wrong with the clamp. Feeds the classic and bootstrap
     reversal tests.
  3. `reversalTestOldFashioned.tsx:24,37`: (0,-86) against (180,86), N=20, K=50 gives gamma NaN and
     class B; the control (0,-85) against (180,85) gives gamma 180 and class '-'.
- **Fix:** one line in `Coordinates.ts:105-107`:
  `const cosineOfAngle = Math.max(-1, Math.min(1, this.toUnit().dot(coordinates.toUnit()))); return Math.acos(cosineOfAngle) * Coordinates.RADIANS;`
  Values already inside [-1, 1] pass through unchanged (0 bit differences on 2,000,000 random pairs,
  fix refuter), only today's NaN results become 0 or 180, a zero-length vector still gives NaN. Do
  not patch the callers. Do not import `clamp` from `stereoGreatCircle.ts` (it imports `Coordinates`,
  so that is an import cycle); inline the expression or use a new leaf module.
- **References to flip:** none. All 5 fixtures whose code path reaches `angle()`
  (`computations/cutoff/*` x4, `computations/eig_split_polarities/normal_and_reversed`) are
  byte-identical before and after the patch (fix refuter, `cmp`); they contain 0 nulls. The locked
  `eig_split_polarities` fixture does contain exact antipodes, but its principal direction
  (16.5167, 48.7990) does not coincide with any row, and all five angles are finite (root-cause
  refuter). No test file references any reversal test, so there is no reversal reference to flip.
- **Risk:** low. Seven call sites of `angle()`, six live (`Direction.ts:48`, `DIRPage/Graphs.tsx:84`,
  `markCutoffComments.ts:32`, `eigManipulations.ts:161`, `reversalTestClassic.tsx:27`,
  `reversalTestOldFashioned.tsx:24`), one dead (`calculateCutoff.ts:33`). No Fisher, PCA, VGP,
  fold-test or McFadden computation calls `angle()`.
- **Gating (checked against `.claude/hooks/guard-protected-paths.sh`):** `Coordinates.ts` is not
  gated. New unit tests are not gated either: the hook exits early for any path containing
  `/__tests__/` (line 21), including `src/utils/statistics/__tests__/`. The science refuter's
  statement that the new `eigManipulations` test needs the unlock is wrong on this point; the
  root-cause refuter's reading is the correct one. The optional new
  `eig_split_polarities/exact_antipodes.expected.json` **is** gated (line 18) and needs Ivan's
  approval plus `.claude/.science-unlock`. Because the change alters cutoff and reversal-test outcomes
  for degenerate input, the PR still needs Ivan's explicit go-ahead: the relayed request covers adding
  SCI-22 and investigating it, not the fix.
- **Refuter verdicts:**
  - **Root-cause: not refuted (high), approve.** Reproduced every number against the real `src/`
    modules through a transpile hook, read-only. For (0,-86) all Cartesian and unit components are
    finite; the dot product is +/-1.0000000000000002; the NaN is born at `acos`, not in
    `toCartesian`, `toUnit` or `dot`. The line needs no trig to fail:
    `new Coordinates(1,1,1).angle(new Coordinates(1,1,1))` and `.angle(new Coordinates(-2,-2,-2))`
    are both NaN today. Integer-degree sweep of 65160 directions: 19255 identical pairs NaN (29.6 %),
    18244 antipodal pairs NaN (28.0 %); Fisher mean of 10 scattered directions: 0 NaN in 40000.
    `grep` finds exactly the seven listed call sites. `ReversalTestControlledContainer.tsx:45-54`
    passes hand-typed means straight through, so the UI reaches symptom 3. The exact proposed
    expression leaves 130320 degenerate-sweep and 300000 random results with 0 bit differences.
    PmagPy's `pmag.angle` is also an unclamped `np.arccos(np.dot(...))` and returns NaN for 735 of
    7320 identical pairs on a 3-degree grid, so it is not an oracle here; the correct values (0 and
    180) come from hand calculation. Not verified: CI behaviour on Node 22.10.0 linux-x64 (ran node
    v25.9.0 on arm64), whether a parser can emit NaN D/I into these callers, the separate
    gammaCritical `acos`.
  - **Fix: not refuted (high); the test list needs corrections before implementation.** Independent
    replica of `toCartesian`/`toUnit`/`dot`/`acos`: same 19255 and 18244 counts, dot range
    -1.0000000000000004 to 1.0000000000000004, 0 NaN with the clamp, `-0` preserved. Real modules
    with the line patched in memory: identical 0, antipodal 180, near-antipodal 179.0000000000001
    unchanged, row 180/86 gets "CUT45", `splitPolarities` 3/0 -> 2/1, sweep 1199 wrong -> 0 wrong,
    manual reversal test gamma null/B -> 180/'-' and null -> 0/B for identical input; gammaCritical
    6.462722569168022 in every run and by hand (R = 19.62). End to end through the real `fisherMean`
    of one direction on the integer grid: 13648 of 64440 antipodes NaN (21.2 %), 13968 identical,
    14823 with three exact duplicates; all 0 with the patch. The spec's headline example does not
    reproduce end to end (`fisherMean([0/-86])` returns I = -86.00000000000006 and the angle is a
    finite 180); a working example is 0/-87: the mean of `[0/-87]` leaves 180/87 without CUT45. The
    existing `centerDirectionOnMean.test.ts:61` (sample equal to the mean, 47/23) passes today only
    because that input happens not to overshoot on this platform. Not verified: the full jest suite
    with the patch applied (read-only), Linux CI trig bits, `Graphs.tsx` in a browser.
  - **Science: not refuted (high), approve with corrections.** True angles are 0 and 180 by
    construction; PmagPy is finite and agrees within its own `acos` conditioning error (8.54e-07,
    179.99999914622637, 178.99999999999972, 180.0). 200000 seeded random pairs: 0 NaN before, 0
    after, 0 finite-but-different, 0 outside [0, 180]. Wrapped `Math.acos` and ran the locked
    fixtures: `eig_split_polarities` made 5 calls, 0 out of range; the four `cutoff/*` fixtures
    produced 34 NaN or out-of-range `acos` arguments, **all from `Distribution.ts:46`**, none from
    `Coordinates.angle`. `pmag.doprinc` plus `pmag.flip` on `[(0,6),(0,6),(180,-6)]` gives 2 normal
    and 1 reversed, matching the clamped split. Evidence the spec missed: thesis Fig. 2.23 (p. 32)
    shows the manual reversal form with opposite-polarity input, 215.5/-24.8 N 78 k 8.8 against
    25.4/52.0 N 146 k 11.2, result "gamma 151.73, gamma critical 6.52, Class: -"; the real code
    returns 151.7336 / 6.5221 / '-'. So the manual form reports the raw angle between the typed
    means with no inversion, and gamma 180 with class '-' for an exact antipode is the
    thesis-consistent continuation; the clamp also removes the discontinuity "179 gives '-', exactly
    180 gives NaN and class B". Not verified: browser behaviour, the 0.1-degree-grid 17.5 % figure,
    cross-platform last-digit behaviour.
- **Corrections the PR must carry:**
  - No exact equality on trig-derived angles. After the clamp, 80 of 65160 integer-grid self-angles
    are nonzero (up to 1.4787793e-06 deg at (17,-23)) and 314 antipode angles are not exactly 180
    (deviation up to 1.2074183e-06 deg at (74,-41)). Use `not.toBeNaN()` plus `toBeCloseTo(0, 5)` and
    `toBeCloseTo(180, 5)`; precision 6 is too tight. Same for the gamma assertions.
  - Add the trig-free exact test: `new Coordinates(1,1,1).angle(new Coordinates(1,1,1))` is exactly
    0 and `.angle(new Coordinates(-2,-2,-2))` is exactly 180 (both NaN today; IEEE-exact operations
    only, so this one fails before the fix on every platform).
  - Do not hard-code 179.0000000000001. Assert bit-identity against an unclamped `acos` of the same
    dot product computed inside the test, or `toBeCloseTo(179, 9)`.
  - Hand-picked inputs such as (0,-86) give NaN only under this platform's trig rounding and may
    already pass on CI before the fix. Add sweep versions: `angle(self)` and `angle(antipode)` never
    NaN and within [0, 180] over all integer degrees; every `[n, n, antipode]` splits 2/1 (5832
    trials, milliseconds); every exact antipode of the mean gets CUT45.
  - Do not lock a classic-test expectation for `[n, n, antipode]` inside SCI-22. Today that input
    returns `{gamma: NaN, gammaCritical: NaN, classification: 'N/A'}` because the mis-split leaves the
    reversed group empty (`fisherMean([])` is NaN), not because line 27 overshoots; after the clamp it
    has R equal to N and runs into the separate unclamped gammaCritical `acos`.
  - The manual reversal test comment must say that gamma 180 and class '-' lock the form's existing
    raw-angle convention (thesis Fig. 2.23, p. 32, cited as the oracle), not the McFadden and
    McElhinny (1990) outcome for a true N/R pair, which would be gamma 0 and a positive test (thesis
    p. 15: deviation of the angle from 180 degrees). Replace the evidence sentence "the thesis has no
    text on the angle formula" with the figure reference.
  - If the optional `exact_antipodes` fixture is added: lock group membership only, never a
    degenerate angle or gamma (near 0 the result is quantised at 0, 8.5e-7, 1.2e-6, 1.48e-6 deg and
    the harness's 7-significant-figure rounding does not absorb that).
  - Narrow the claim "one fix covers all seven call sites": the clamp removes only the
    rounding-overshoot NaN. A NaN that enters through the inputs (NaN D/I in a row, a zero-length
    vector, `fisherMean([])` from an empty polarity group, non-numeric text in the manual reversal
    form passed to `new Direction` at `ReversalTestControlledContainer.tsx:45-46`) still makes
    `NaN > threshold` false. Record as residual, out of scope.
  - User-impact figures: 21.2 % (13648 of 64440) through the real `fisherMean` of a single direction
    on the integer grid; "about 28 %" applies only when the mean is constructed directly as
    `Direction(D, I)`.
  - Sequencing with SCI-20: if `calculateCutoff.ts` and its 4 `cutoff/*` fixtures are deleted first,
    SCI-22 has 6 call sites and the "cutoff/* has 0 nulls" evidence no longer applies. No conflict;
    the PR description cites whichever state is current.
- **Open questions from the spec, and why none blocks the queue:**
  - "The ledger points to a file that does not exist": this file is that pending output
    (`.claude/workflows/investigate-found-bugs.js:40`). The pointer is correct; do not "fix" it.
  - Severity major or minor: ledger hygiene; recommendation above.
  - Deleting `calculateCutoff.ts`: already decided by Ivan (SCI-20, separate PR). Not part of SCI-22.
  - gammaCritical `acos` and the manual-form polarity contract: separate findings, refuters
    converged on "separate ledger items" (see "New findings"). Neither changes the one-line fix.
- **Why first (and only):** the single item of this run with a surviving, unrefuted spec and no
  decision outstanding. Cheap, independent, zero reference flips.

---

# Needs decision

## SCI-23: McFadden combined mean (live MCFAD button)

- **Title (catalog):** McFadden combined mean (live MCFAD button) is a single greedy pass instead of
  the iterative procedure; order-dependent, differs from PmagPy. Recommended retitle (root-cause
  refuter): "single greedy pass on a 194-point grid".
- **Status:** confirmed = true, survives = true, refutations 1 of 3 (fix lens). Not in the queue
  because the open questions below change which code is written and what the result is for inputs
  reachable from the UI, and the refuters did not converge on them.
- **Severity:** major (ledger) stays **major**. Wrong numbers in production since the original 2022
  implementation (`02fbf64`, 2022-03-27; not a regression). Line-rich selections: median 0.08-0.28 deg,
  maximum 0.3-1.4 deg, small next to a95. Circle-dominated selections (1 line + 4 circles, 2 + 10):
  median 1.2-1.8 deg, 95th percentile 3-5 deg, maximum 4-8 deg, and row reordering moves the mean by
  up to 7-12 deg; that is comparable to a typical a95 and enough to change a pole. Circles only
  (M = 0): essentially arbitrary, median about 14 deg. k and a95 are slightly off because R is
  underestimated.
- **Root cause (one line):** `mcFaddenCombineMean`
  (`src/utils/statistics/calculation/calculateMcFaddenCombineMean.ts:61-89`) picks the point on each
  great circle by brute force from the 194-point grid of `getRawPlaneData` (1.865 deg spacing) in a
  single `forEach` pass that never revisits a circle, where McFadden and McElhinny (1988), the thesis
  (section 1.3, "iteratively") and PmagPy's `calculate_best_fit_vectors` iterate a closed-form closest
  point until the points stop moving. The k and a95 formulas (lines 107-115) are correct and match
  PmagPy `dolnp`.
- **Which cause dominates (spec corrected by the root-cause refuter):** on the locked fixture the grid
  accounts for about 0.36 deg and the greedy pass for 0.014-0.020 deg, but only because the fixture's
  two circles nearly coincide (dihedral angle 3.0 deg stratigraphic, 5.0 deg geographic). With
  randomly oriented circles the greedy pass contributes at least as much as the grid at every tested
  mix (median angle to the exact solution, greedy-only against grid-only: 3+2 0.207 / 0.140; 8+4
  0.118 / 0.080; 15+5 0.060 / 0.054; 1+4 1.762 / 0.277; 2+10 1.211 / 0.178). The note's original
  diagnosis is the dominant cause in general. Both causes must be removed together: iterating on the
  194-point grid changes nothing (25.40235 and 24.65784 stay as they are).
- **Proposed fix (direction confirmed by all three refuters):** replace the body of
  `directionsGC.forEach` with the MM88 iteration: Cartesian poles and lines; helper
  `closestPointOnGreatCircle(poleVector, targetUnitVector)` = normalize(target - (target . pole) * pole);
  initialise from the normalised sum of the lines; sweep, recomputing each circle's point against the
  resultant without it, until the movement is below a tight tolerance, with a sweep cap. Leave k, a95,
  csd and the returned `MAD` field untouched; compute the final resultant from scratch with
  `calcRvector`, not from a running add/subtract sum. One file under `src/utils/statistics/`, so it
  needs `.claude/.science-unlock` and Ivan's approval. Full descriptive names.
- **References to flip (1 file, 12 values, all confirmed at 7 significant figures by three
  independent routes: tight closed-form iteration, `pmag.vclose` iterated to 1e-10 deg, and a
  multi-start Nelder-Mead maximisation of R with no closed form):**
  `src/__tests__/fixtures/computations/mcfadden_combine_mean/directions_and_great_circles.expected.json`

  | Field | Geographic, locked -> new | Stratigraphic, locked -> new |
  |---|---|---|
  | declination | 336.6211 -> 336.6302 | 346.6498 -> 346.6868 |
  | inclination | 36.69984 -> 36.65407 | 25.40235 -> 25.04235 |
  | MAD (holds a95) | 2.981304 -> 2.979929 | 5.060245 -> 5.026356 |
  | k | 760.6261 -> 761.3277 | 264.5261 -> 268.0947 |
  | R | 4.996056 -> 4.99606 | 4.988659 -> 4.98881 |
  | csd | 2.936969 -> 2.935616 | 4.980246 -> 4.946988 |
  | N | 5 (unchanged) | 5 (unchanged) |

  Full precision: stratigraphic D 346.686848178, I 25.042347779, R 4.988809926, k 268.0947482, a95
  5.026355564, csd 4.946988099; geographic D 336.630198232, I 36.654066423, R 4.996059515, k
  761.3276743, a95 2.979928938, csd 2.935615760. PmagPy `dolnp` 4.3.14 agrees at its print precision
  (346.7 / 25.0 / R 4.9888 / K 268 / a95 5.0 and 336.6 / 36.7 / R 4.9961 / K 761 / a95 3.0).
  Regenerate through the harness from the fixed code and check against these numbers, not the other
  way round. Rounding margins: stratigraphic D sits 1.8e-6 deg below the boundary 346.68685;
  geographic R sits 1.5e-8 above 4.9960595; stratigraphic k 268.094748 against 268.09475. All safe
  with a tight stop, none safe with PmagPy's 0.1 deg stop.
  `directions_only.expected.json` does **not** flip (no gcNormal rows). No other `*.expected.json` is
  affected by the algorithm change; see question 3 for `raw_plane_data/*`.
- **Risk:** medium. One production caller (`calculateStatisticsDIR.ts:47`, MCFAD mode on the DIR
  page), but it changes every McFadden mean that includes at least one great circle: the
  interpretations table (displayed stratigraphic I on the fixture goes 25.4 -> 25.0), the mean and a95
  circle on the stereonet, every export from those interpretations, and VGPs computed from them.
  Unaffected: selections without great circles, FISHER/GC/GCN modes, the PCA page, fold and reversal
  tests. Performance improves (no 194-point scans).
- **Refuter verdicts:**
  - **Root-cause: not refuted (high); four sub-claims of the spec are wrong, none changes the fix or
    the reference values.** Reproduced production on the fixture with the real module (stratigraphic
    346.64982 / 25.40235, a95 5.06025, k 264.5261, R 4.988659; GC rows swapped 346.72446 / 24.65784;
    geographic identical in both orders). Only the order of the circles matters; GC rows first or
    permuted lines give the original numbers. The decomposition table reproduces digit for digit
    (grid indices 131,62 original and 61,132 swapped; in the iterated-194 variant no pick moves).
    Excluded other origins: plane geometry is correct (max |grid point . pole| = 1.2e-8), lines
    107-115 equal `dolnp`, the caller's preprocessing only rounds to 0.1 deg and applies
    `reversePolarity`. Sub-claims that failed: (a) with M = 0 it is **not** "grid point 0 wins"; the
    winner is the first grid point whose floating-point norm rounds to 1.0000000000000002 (index 18
    for pole 75/5, 130 for 255/-8, 4 for 70/10, 2 for 10/80, 0 for others), so it is rounding noise
    and platform-dependent; (b) "the grid dominates for line-rich sets" is contradicted by an
    independent seeded Monte Carlo (see above); (c) "0.37 deg is a bound and the excess is the greedy
    part" is wrong: measured pick offsets are 0.8005 and 1.0038 deg (original) and 0.8615 and 1.0648
    deg (swapped), they exceed the 0.93 deg half-spacing because the discrete picks pull each other,
    and (0.8005 + 1.0038)/5 = 0.361, (0.8615 + 1.0648)/5 = 0.385 reproduce the observed 0.360 and
    0.384 exactly; (d) "`getRawPlaneData` keeps its other callers" is false. Further observation:
    PmagPy's own loop with its 0.1 deg stop is row-order-dependent at full precision (stratigraphic I
    25.038685 original, 25.047254 swapped), which supports the tight tolerance. Not verified: the
    spec author's Monte Carlo scripts (own run agrees statistically), real collections, other
    platforms, post-fix M = 0 and lambda = +/-1 behaviour.
  - **Fix: REFUTED (high), request-changes; amendments, not a re-investigation.** The algorithmic
    direction and all 12 reference numbers are confirmed (independent implementation of steps 1-4,
    identical at tolerance 1e-10 and 1e-14 and in both row orders; with PmagPy's 0.1 deg stop it
    reproduces PmagPy's geographic R bit for bit, 4.996059473652353, so the 0.0037 deg gap to PmagPy
    is purely its loose stop). Findings: **F1** the blast radius falsely says `getRawPlaneData` keeps
    other callers; after the fix it is dead code inside `utils/statistics/` with a live test and two
    locked fixtures. **F2** step 4 does not say how movement is measured; `acos(dot)` and
    `Coordinates.angle` have a resolution floor of 1.49e-8 rad, above the 1e-10 rad tolerance, and
    return NaN when the self-dot exceeds 1; a literal `Math.max` of `acos(dot)` loop produced NaN
    exits in 116 of 400 (3+2), 260 of 400 (8+4), 255 of 400 (1+4) and 393 of 400 (2+10) runs, worst
    premature-exit error 3.35e-4 deg, which reaches the 7th significant digit and is the macOS
    against Linux CI failure class of hotfix #39; with a chord measure convergence is clean (at most
    9, 37 and 33 sweeps). **F3** the outcome on hitting the sweep cap is undefined; never hit with
    M >= 1 (max 54 sweeps), hit in 198 of 200 trials with M = 0 and nearly coincident circles. **F4**
    the guard test "must not return NaN" cannot detect a missing guard: line 40/55 with pole 40/55
    returns finite garbage from the unguarded helper (D 14.367, I 28.868, R 1.6967; R above sqrt(2)
    is impossible), and the spec contradicts itself between `testsToAdd` and open question 4.
    **F5** the analytic test's oracle is worded wrongly (raw projection instead of the unit vector
    along it; 1.5 deg off). **F6** order invariance at 1e-9 is tighter than a 1e-10 rad stop
    guarantees (up to 6.3e-9 deg on 1+10). **F7** step 3 returns NaN/NaN/NaN for M = 0, reachable
    from the MCFAD button; exactly antipodal lines seed from 1e-16 noise; "the PR cannot be written
    until Ivan decides". **F8** the tolerance must be fixed before references are regenerated (with
    the 0.1 deg stop, 5 of 6 fields per block differ). **F9** the "ledger inconsistency" item is
    mistaken: this file is the pending output. **F10** the SCI-17 brief's crash-site inventory
    changes and must be updated in the same PR. Not verified: the MM88 paper itself, the
    investigator's scripts, Linux CI floats, global optimality for pathological multi-modal sets
    (0 of 300 trials per mix reached a different optimum with M >= 1).
  - **Science: not refuted (high); five inaccuracies, none changes the conclusion.** Thesis lines
    366-370 say iterative and give no formula or stop rule; `THESIS_FORMULAS.md:148-152` and roadmap
    `01-testing.md:47` also say iterative; no documented intentional deviation exists. PmagPy
    `vclose` is the closed form, `dolnp` is algebraically identical to lines 107-114; the update is a
    monotone ascent on R whose fixed point equals the MM88 condition (checked algebraically). All 12
    values reproduced by tight iteration and by multi-start Nelder-Mead; rounding unchanged for any
    tolerance of 1e-6 rad or tighter. Own seeded Monte Carlo agrees in magnitude (3+2 median 0.225,
    max 0.917; 1+4 median 1.66, p95 5.6, max 8.4; 2+10 median 1.25; 0+6 median 13.4; reversing rows
    moves 1+4 by up to 12 deg). Analytic case line (340, 35) plus pole (70, 10): exact 336.5652 /
    34.5430, R 1.9975122; PmagPy 336.6 / 34.5 / 1.9975; production 336.524 / 34.733. Inaccuracies:
    M = 0 is a rounding-noise argmax (four circles through D 0 / I 45 returned 206.6 / -27.5, and
    160.6 / -46.9 reversed); the movement metric must be named (for bit-identical unit vectors
    `acos(x.x)` is 0 in 42 %, NaN in 22.5 %, at least 1.49e-8 rad in 35.5 % of 100000 trials;
    `Math.max(0.5, NaN)` is NaN, so use an `if (movement > maxMovement)` accumulator); 1e-9 order
    invariance is too tight; the spec quotes three tolerances, pick one; "k, a95, csd already match
    PmagPy" holds only for Q = M + N/2 > 1 and a >= 0 (PmagPy clamps NP to 1.1, PMTools does not:
    today k = 0, a95 = NaN, csd = Infinity for M = 0, N = 2; k = -Infinity for M = 0, N = 1; k = NaN
    for M = 1, N = 0). Not verified: the MM88 paper text, real collections, other platforms.
- **Corrections the refuters converged on (no decision needed; they are part of the work order once
  the questions below are answered):**
  - Tight convergence is required, not optional. PmagPy parity (0.1 deg) is not acceptable for the
    references: it is itself order-dependent and moves 5 of 6 fields per block.
  - Movement metric: Euclidean chord `|newPoint - previousPoint|` or `atan2(|cross|, dot)`. Forbid
    `acos(dot)`, `Coordinates.angle` and `Direction.angle`. Write the loop so that NaN can never end
    it early; no `Math.max` accumulator.
  - Measured configuration: chord tolerance 1e-10 with order invariance asserted at 1e-7 deg
    (state the unit), or a chord below 1e-13 if 1e-9 is wanted. Sweep cap 1000 is adequate (median 7
    sweeps line-rich, 16-17 circle-dominated).
  - Lambda guard with an explicit threshold (for example `1 - lambda^2 < 1e-12`), not
    "approximately 1". The guard test asserts geometry that does not depend on the fallback point:
    finite output and R = 1.414214 for line 40/55 with pole 40/55; never a D/I value.
  - Analytic test oracle: `normalize(line + unit(line - (line . pole) * pole))`. Worked numbers: line
    40/55, pole 100/20 gives D 10.619452, I 55.274218, k 5.947242, a95 180.
  - The new greedy-sensitive fixture must use circles that cross at a large dihedral angle (more
    than 30 deg) with circles outnumbering lines; expected values from the tight iteration, checked
    against `dolnp` only at its print precision; record PmagPy 4.3.14 in the fixture README.
  - Never lock current M = 0 output or any value that sits on an argmax over rounding noise.
  - Documentation in the same PR: `THESIS_FORMULAS.md:148-152` ("pole is iteratively reflected toward
    the running mean" does not describe the algorithm), `fixtures/mcfadden/README.md`, and the SCI-17
    brief in `found-bugs-todo.md:230-255` (its `:42` and `:65-85` references and crash-site list).
  - Remove the "ledger inconsistency" evidence item and open question 6 from the spec.
  - Do not mix the "MAD holds a95" quirk (line 130) into this fix.

### Questions Ivan must answer before the SCI-23 PR can be written

1. **Selections with no usable line seed: M = 0 (great circles only) and an exactly zero
   `sumOfLines` (antipodal lines).** Reachable from the UI: select only great-circle-normal rows and
   press MCFAD. Today the result is an arbitrary finite mean decided by rounding noise; step 3 of the
   spec as written would return NaN. Options: (a) refuse, return a NaN-shaped result and tell the
   user to use GC mode or add a line; (b) PmagPy-style fixed seed (dec 180, inc -45) with a stated
   polarity convention. The answer must also cover the statistics, not only the point selection:
   PMTools does not clamp Q = M + N/2 as PmagPy does (NP >= 1.1), so k is 0/0 for M = 0, N = 2 after
   the fix and -Infinity for M = 0, N = 1. Recommendation of this ranking pass: (a), because (b) hits
   the sweep cap in 198 of 200 trials with nearly coincident circles and its polarity is ambiguous;
   but this is a science decision for Ivan or the scientists.
2. **What the user gets when the iteration cannot produce a trustworthy point:** the sweep cap is
   reached, or the running mean is parallel to a circle's pole (lambda = +/-1). Options for the cap:
   NaN-shaped result, or an explicit non-convergence signal; never the last iterate silently. Options
   for lambda: keep the previous point (documented fallback), or a NaN-shaped result. This should be
   one rule, consistent with question 1 and with whatever shape SCI-17 ends up using (parity with
   Fisher's NaN-shaped result is the refuters' common reference point).
3. **`getRawPlaneData` becomes dead code after the fix** (its only production caller is
   `calculateMcFaddenCombineMean.ts:4,63`; graph drawing uses `createStereoPlaneData` ->
   `createConfidenceEllipse`). It still has `src/utils/statistics/__tests__/getRawPlaneData.test.ts`,
   two locked fixtures under `fixtures/computations/raw_plane_data/` (`plane_N9`,
   `small_circle_15deg_N9`) and a comment in `src/test-utils/computationFixtures.ts:39`. Under the
   standing "delete dead code" decision: delete function, test and fixtures in the SCI-23 PR as a
   declared reference removal, or add it to SCI-20 / a follow-up ledger item? Sequencing note: if
   SCI-20 lands first it must **not** delete `getRawPlaneData` (still live until SCI-23).
   Recommendation: a separate small follow-up (or an SCI-20 addendum) after SCI-23, to keep one
   behaviour change per PR and one reason per fixture removal.
4. **Sequencing with SCI-17 (spec refuted 3 of 3, re-investigation pending).** The fix removes the
   `gcPath[-1]` crash site; a NaN great-circle row would then flow through as a NaN McFadden result
   instead of a `TypeError`. Accept that as the interim behaviour and update the SCI-17 brief in the
   same PR (recommended: it is strictly better than a crash and matches Fisher), or hold SCI-23 until
   the SCI-17 result-shape decision is made?

Non-blocking, settle in PR review: retitle the ledger item ("single greedy pass on a 194-point
grid"); changelog note that MCFAD means from versions up to the current release can differ by tenths
of a degree, and by several degrees for circle-dominated selections (recommended: yes, this is the
intentional reference flip the ledger anticipates).

Suggested way to run it once decided: an agent team fits the PmagPy verification loop (ask Ivan
through the agent-teams decision gate first), then `/review` and `/evaluate` on the MCFAD button.

---

# New findings that need a ledger decision

None has a verified spec, so none is in the queue. Tags continue the NEW-A..H series of
`science-fix-queue.md`.

| Tag | Finding | Impact | Suggested action |
|---|---|---|---|
| NEW-I | Manual ("old-fashioned") reversal test has no polarity contract. It reports the raw angle between the two typed means (thesis Fig. 2.23: gamma 151.73, class '-'), while thesis p. 15 and McFadden and McElhinny (1990) measure the deviation from antipodality. The form's labels are only "Declination 1 / Inclination 1 / N 1 / k 1"; `pmtests.reverseTest` in the locales has only title, first and required. | A researcher who types true normal and reversed means always gets gamma near 180 and class '-' (a negative test for a perfect reversal). | Ledger item. Decide with Ivan or the scientists: auto-invert, warn when gamma > 90, or document the same-polarity contract. Not part of SCI-22. |
| NEW-J | Other unclamped `acos` calls: the gammaCritical expression at `reversalTestClassic.tsx:30` and `reversalTestOldFashioned.tsx:27` (NaN for very scattered small-N groups, and for R equal to N after the SCI-22 clamp), and `Distribution.ts:46` (34 NaN or out-of-range arguments while running the locked `cutoff/*` fixtures). | gammaCritical NaN in live reversal tests for edge inputs. `Distribution.ts` is reachable only through the dead code scheduled for deletion in SCI-20; verify that before acting. | One ledger item for the reversal-test gammaCritical; not investigated in this run. |
| NEW-K | Residual NaN-input paths after SCI-22: a NaN D/I row, a zero-length vector, `fisherMean([])` from an empty polarity group, or non-numeric text in the manual reversal form (`ReversalTestControlledContainer.tsx:45-46`) still give `NaN > threshold` = false in every `angle()` caller. | Silent: direction treated as inside the cutoff, normal polarity, or passing. | Fold into the SCI-17 re-investigation (same family: non-finite directions), or a separate ledger item. |
| NEW-L | McFadden statistics at the edges: PMTools does not clamp Q = M + N/2 (PmagPy clamps NP to 1.1); for a < 0 PmagPy's `dolnp` returns `acos(-a)` where PMTools returns 180 (consistent with PmagPy's `fisher_mean`). Today: k = 0 / a95 NaN / csd Infinity for M = 0, N = 2; k = -Infinity for M = 0, N = 1; k = NaN for M = 1, N = 0. | Non-finite statistics in the interpretations table for tiny selections. | Covered by SCI-23 question 1 if Ivan chooses to refuse such input; otherwise a ledger item. |

# Ledger hygiene

- The SCI-22 and SCI-23 ledger pointers to `test-data/v2.6.6/science-fix-queue-SCI-22-SCI-23.md` are
  correct as of this file. Both specs' "the file does not exist" items are obsolete.
- SCI-22: consider severity major -> minor; add to the notes "0 reference flips, `Coordinates.ts` not
  gated, new unit tests not gated, optional `exact_antipodes.expected.json` gated".
- SCI-23: retitle to include the 194-point grid; status stays `todo` but blocked on the four
  questions above; note that `getRawPlaneData` must survive SCI-20 until SCI-23 lands.
- found-bugs-todo SCI-22 bullet says "about 30 %": that is the direct-construction rate (29.6 %
  identical, 28.0 % antipodal); through the real `fisherMean` of one direction it is 21.2 %.
- found-bugs-todo SCI-23 bullet says "single greedy pass (194 per circle)": both causes are real and
  must be fixed together; on the locked fixture the grid explains 0.36 deg of the error, in general
  the greedy pass dominates.
- One refuter statement is wrong and should not be copied into PR text: "the new eigManipulations
  test under `src/utils/statistics/__tests__/` is gated". `guard-protected-paths.sh:21` exempts every
  path containing `/__tests__/`; only `src/__tests__/fixtures/*.expected.json` and non-test files
  under `src/utils/statistics/` are protected.
