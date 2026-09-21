# Science-fix queue, PMTools v2.6.6

Generated 2026-09-21 by the `investigate-found-bugs` workflow (rank step). Input: 16 fix specs
(SCI-01 to SCI-15 and SCI-17), each checked by three adversarial refuters (root-cause, fix, science).
Nothing in the repository was changed by the investigation; every number below comes from the specs
and refuter reports.

## How to read this file

- **Queue**: items that may go to a PR now, one fix per PR, in order. Every PR still needs the normal
  gates: branch from `dev`, Ivan's approval for `.claude/.science-unlock` when the path is under
  `src/utils/statistics/`, and Ivan's approval for every `*.expected.json` flip.
- **Needs decision**: items with `survives=false`, `confirmed=false`, or an open question whose answer
  changes which code is written or which reference values get locked, and on which the refuters did
  not converge. They are not in the queue. Each has the question Ivan must answer.
- A spec that "survives" can still carry refuter corrections. The corrections are part of the work
  order: the generator implements the spec **as corrected**, not as originally written.

Ranking rule: researcher impact first (wrong numbers > silent data loss > crashes > cosmetic), cheap
independent fixes may go early, dependencies respected.

## Result at a glance

| Order | ID | Severity (ledger -> revised) | What a researcher sees today | Refutations | Depends on |
|---|---|---|---|---|---|
| 1 | SCI-01 | critical -> critical | Fold test gives a wrong best-unfolding % and wrong bounds for every tilted collection | 1 of 3 | none |
| 2 | SCI-02 | critical -> critical | Crimea JR6 `.pmd` files load with 2 steps instead of 4-15 | 0 of 3 | none (coordinate with SCI-00) |
| 3 | SCI-14 | cosmetic -> cosmetic | Validation modal points one line above the bad row | 0 of 3 | SCI-02 |
| 4 | SCI-12 | cosmetic -> cosmetic | `.gpml` download labelled `text/csv` | 0 of 3 | none |
| 5 | SCI-09 | minor -> cosmetic (code only) | Nothing; misleading comment, dead code, 3 lint warnings | 1 of 3 | none |

Needs decision (11 items): SCI-03, SCI-04, SCI-05, SCI-06, SCI-07, SCI-08 (the dead-code cluster),
SCI-10, SCI-11, SCI-13, SCI-15, SCI-17. Two new findings also need a ledger decision:
`findBed` on vertical and overturned beds (follow-up to SCI-01), and RS3 `CNaN` component rows.

SCI-12 and SCI-09 are independent of everything else. If approval for SCI-01 or SCI-02 stalls, either
can be pulled forward without reordering the rest.

---

# Queue

## 1. SCI-01: Fold test unfolds about the wrong axis

- **Severity:** critical (wrong numbers in production since 2022-05-10, commit 84c20ea).
- **Root cause (one line):** `unfold` passes `findBed`'s dip direction (`azimuth = strike + 90`) to
  `Coordinates.correctBedding(strike, ...)`, which adds 90 again, so the tilt axis is off by 90 degrees
  (`foldTestBootstrap.ts:214-217`).
- **Fix:** call site only. `const beddingStrike = vector.beddingAzimuth - 90;` passed to
  `correctBedding`. Do not change `correctBedding` (its strike contract is right for
  `toReferenceCoordinates.ts:27`) and do not change `findBed`'s return value in this PR.
- **References to flip (2):**
  - `fold_unfold/synthetic_fold_saved_iteration.expected.json`: `index` -17 -> 98; all 21 `taus`
    change (for example 100 %: 0.440267 -> 0.9637346); `taus[x=0]` stays 0.6082507.
  - `fold_unfold/synthetic_fold_unsaved_iteration.expected.json`: `index` -17 -> 98; `taus` stays `[]`.
  - Regenerate through the harness, do not paste. Acceptance: within 5e-4 of
    `synthetic_fold.pmagpy.json` over the full grid (measured maximum 1.938e-4 at 150 %).
  - Text to rewrite by hand: fixture README section on the PmagPy cross-check, the
    `synthetic_fold.pmagpy.json` note via `scripts/gen_foldtest.py`, the comment in
    `foldTestDeterministicCore.test.ts:25-32`, the found-bugs-todo bullet, the ledger entry.
- **Risk:** low. One expression, one production caller (`FoldTestContainer.tsx:57`). Needs
  `.claude/.science-unlock`.
- **Refuter verdicts:**
  - **Root-cause: not refuted (high).** Compiled the real source. Current call gives index -17 and
    taus identical to the locked file; `azimuth - 90` gives index 98 and matches PmagPy to about 1e-4
    on the fixture and to 2e-16..4e-16 on 6 random unrounded datasets, with identical 1 % optimum.
    `git log -L` shows 9bee42a passed `beddingStrike` correctly and 84c20ea broke it. Found a second,
    independent defect: `findBed` returns a dip in (180, 270) for overturned beds (see "New findings").
  - **Fix: REFUTED (high), request-changes.** The call-site change is correct and must stay, but it is
    not sufficient: for vertical and overturned beds (dip >= 90) the tau1 curve is still wrong after
    it (max |tau1 - PmagPy| 0.26 to 0.38; index 103 where PmagPy gives 97 or 100). The sentence "both
    functions are correct on their own" must be dropped. One-line `findBed` normalization verified to
    leave the locked fixture unchanged. Also: tolerance 2e-4 is too tight; `Coordinates.angle` returns
    NaN for near-identical vectors, so the round-trip test must compare components.
  - **Science: not refuted (high), approve with corrections.** `correctBedding(strike, dip)` equals
    `pmag.dotilt(dec, inc, strike + 90, dip)` over 20000 random inputs. Thesis (lines 609-653) gives
    the lambda1 criterion and no bedding convention, so PmagPy is the oracle. The error is a 90-degree
    axis error, not "opposite in sense". The 98 is the finite-sample optimum of this N=18 draw (PmagPy
    on a 1 % grid also gives 98 on unrounded input), so the open question "stop rounding to get 100"
    is dropped.
- **Corrections the PR must carry:** wording "90-degree axis error"; "98 is the sample optimum";
  post-folding data is only approximately right today (random sets: -5/-2/6 against -11/-11/4);
  tolerance 5e-4; component-wise round-trip assertions at 50 % as well as 100 %, restricted to
  dips < 90 until `findBed` is fixed; real-data rows must be hard-coded (the `s=327 d=90` files are
  git-ignored) or taken from `crimea2013_nrm_celsius_dialect_143.pmd` (s=335, d=73) or
  `examplePCA.pmd` (s=51, d=76); never use the hand-typed `s=220 d=30` synthetic PMD files as an oracle.
- **Why first:** the only item where shipped numbers a researcher publishes are wrong for ordinary
  data (two-limb fold: 41 % instead of 92 %; bootstrap bounds -50..150 instead of 90..109).
- **Scope note (one fix per PR):** the `findBed` dip > 180 defect is a separate root cause and goes
  to its own PR directly after this one (see "New findings", NEW-A). The release note must say that
  until NEW-A lands the fold test is still wrong for collections with vertical or overturned limbs.
- **Non-blocking, settle in PR review:** whether the changelog tells users to re-run fold tests made
  with earlier versions (recommended: yes).

## 2. SCI-02: parserPMD drops 3-digit degC steps

- **Severity:** critical (silent data loss; 23 of 132 archive `.pmd` files parse to exactly 2 steps).
- **Root cause (one line):** `parserPMD.ts:44,46` hard-code the label as `slice(0, 4)` and X as
  `slice(4, 14)`; the JR6 "STEP" dialect writes a 5-character label (`150°C`) and a 9-character X, so X
  becomes `C-1.23E-07`, is NaN, and the row is dropped at `:72-86`.
- **Fix:** additive fallback. Only when a non-blank character sits at index 4 and the fixed-width X
  is NaN and `slice(5, 14)` is numeric, take the label from `slice(0, 5)` and X from `slice(5, 14)`.
  Keep the label verbatim (`150°C`); `dataToMag.ts:31` reads the number with `match(/\d+/)`.
- **References to flip (1):**
  `parsers/pmd/real/crimea2013_nrm_celsius_dialect_143.pmd.expected.json`: `steps` 2 -> 12,
  `invalidRows` 10 -> 0. Steps 1-2 unchanged. New values are verbatim file columns (for example step 3
  `150�C` -1.23e-7 -5.61e-8 5.91e-7 0.0551 358.1 48.9 27.8 -1.5 1). The other five PMD references
  stay byte-identical (simulated: 114 of 138 files unchanged, 24 changed = 23 Crimea files + fixture).
- **Risk:** low. Not under `utils/statistics`, but the fixture hook blocks Edit/Write on
  `*.expected.json`; regenerate with `UPDATE_FIXTURES=1` after approval and show that only the Crimea
  file changed.
- **Refuter verdicts:**
  - **Root-cause: not refuted (high).** Five input-only experiments isolate the single character at
    index 4. Across 1985 archive rows index 4 is a space (1741) or `C` (244), never a digit or minus,
    so no silent misparse hides behind the NaN guard. Physical check: |xyz|/volume against the file's
    MAG is 0.9931-1.0076 over all 244 overflow rows. Commit attribution corrected: 591c6ef added the
    bare drop, 8c5c7ec added `invalidRows`; rows are reported (misleadingly), not silently removed.
  - **Fix: not refuted (high), approve.** Patched parser on 138 files: 24 changed, 114 same, 0 crashes,
    no previously parsed step altered. Adversarial rows behave (`150°CXXXXXXXX`, blank X, `abc.E-08`
    stay invalid; 6-character labels stay invalid). One behaviour change to state: a stray character
    at index 4 followed by a valid number (`T100x-1.23E-07`) becomes a valid step `T100x`.
  - **Science: not refuted (high), approve with minor corrections.** Sign of X confirmed with PmagPy:
    `dogeo`/`dotilt` on recovered X,Y,Z reproduce the file's Dgeo/Igeo within 0.08 deg and
    Dstrat/Istrat within 0.11 deg on the fixture, 0.22 deg on all 244 archive rows; flipping the sign
    gives 19-82 deg error. PMTools' own `toReferenceCoordinates` agrees (0.08 / 0.11 deg).
- **Corrections the PR must carry:** replace "Thesis/PmagPy cross-check: not applicable" with the
  sign check above; soften "does not mask bad data" and either lock the stray-character case with a
  fixture or tighten the guard (index 5 is `' '` or `'-'`, true for 244 of 244 rows, and the label
  contains a digit); add a physics assertion (rotate recovered steps, angular distance to file
  Dgeo/Igeo < 0.3 deg); README states the label is locked as mojibake `150�C` pending the encoding
  decision; PMD export truncates the label to `150°` (`fileConstants.ts:65`), columns stay aligned,
  no rows lost; `.dir` `stepRange` truncates to `150°C-470` (9 wide); user impact is "2 steps instead of
  4-15".
- **Sequencing:** the unmerged branch `phase-1/d3-pmd-demagtype` (ledger SCI-00, "first
  reference-flip PR") rewrites `parserPMD.ts` and flips the same Crimea reference. One PR at a time:
  whichever of SCI-00 and SCI-02 lands second rebases and regenerates that reference. D3's
  `THERMAL_MARKER` is compatible with keeping the label verbatim.

## 3. SCI-14: invalidRows rowNumber off by one and not blank-line safe

- **Severity:** cosmetic (parsed data unaffected; the modal's "Row #" points at the wrong line).
- **Root cause (one line):** `parserPMD.ts:81` uses `index + 3`, but three physical lines precede the
  first step (offset is +4), and `index` is taken after `.filter(length > 1)`, so each blank line above
  a bad row adds another -1.
- **Fix:** A+B, as all three refuters recommend: carry `physicalLineNumber` through the pipeline
  (`.map` before `.slice(1)` and `.filter`), set `rowNumber: physicalLineNumber`. `rowNumber` means the
  1-based physical file line (the code comment at `:81` and `parserDIR.ts:87` both show that intent;
  PmagPy's `convert_2_magic.pmd` also reads data from `range(3, ...)`).
- **References to flip:** if SCI-02 has landed, only
  `synthetic/invalid_rows_nan_fields.pmd.expected.json` (4 -> 5, 6 -> 7). If not, also the ten Crimea
  values 5..14 -> 6..15. `UPDATE_FIXTURES=1` rewrites every PMD reference, so the acceptance check is
  `git diff --stat` = those files plus the new fixture pair, `rowNumber`-only diff.
- **Risk:** low. Single consumer (`ValidationModal.tsx:96-98`).
- **Refuter verdicts:**
  - **Root-cause: not refuted (high).** Only producer is `:81`; nothing downstream alters the value.
    Six input-change experiments confirm defect B, including blank lines in the header region and
    single-space lines. Fix A alone stays wrong with interior blank lines ([5,7] where truth is [6,9]).
  - **Fix: not refuted (high), approve.** Both variants re-implemented; A+B leaves no wrong number on
    any adversarial input; steps and metadata byte-identical on all 6 PMD fixtures.
  - **Science: not refuted (high).** Offset +4 confirmed against PmagPy's PMD reader and all six
    fixtures; physical line is the intended meaning in both parsers.
- **Corrections the PR must carry:** cite `src/locales/*` (loaded statically), not `public/locales`;
  the blank-line fixture is required, not optional; the self-checking invariant is required and must
  be a column-slice check (`physicalLine.slice(start, end).trim() === rawValue`) so empty-field rows
  are covered; the `validation.ts:9` doc comment must not claim physical lines for parserDIR unless
  `parserDIR.ts:13/:87` is fixed in the same PR (nothing flips there); error text for files with
  fewer than 2 usable lines changes from `reading 'slice'` to `reading 'lineText'`.
- **Why after SCI-02:** SCI-02 empties the Crimea `invalidRows`, so landing it first removes ten of
  the twelve flips here and avoids regenerating the same reference twice.
- **Non-blocking, settle in PR review:** English label "Row #" vs "Line #" (crimea already shows
  "14 of 12" today).

## 4. SCI-12: toGPML download uses text/csv

- **Severity:** cosmetic.
- **Root cause (one line):** `converters/vgp.ts:69` passes the copy-pasted literal
  `'text/csv;charset=utf-8'` to `download()` for an XML payload (since eef4472, 2022-05-01).
- **Fix:** one string, `'application/xml;charset=utf-8'`, plus the JSDoc example at `vgp.ts:10`.
  All three refuters accept `application/xml` as the safe default (registered, matches the XML
  declaration); Ivan can override the string in PR review.
- **References to flip (2):** `vgp/labeled_pole.toGPML.expected.json` and
  `vgp/two_sites.toGPML.expected.json`, line 3 (`type`) only. Hand-edit or regenerate; the PR shows
  `git diff --stat` of exactly 2 files, 1 line each.
- **Risk:** low. Payload bytes and filename unchanged (verified on two Blobs, 61 bytes each).
- **Refuter verdicts:**
  - **Root-cause: not refuted (high).** One call chain, `Blob` does not sniff, goldens lock the bug.
  - **Fix: not refuted (high), approve.** In-memory regeneration changes only line 3 of the two files.
    The claim "only exporter whose MIME contradicts its payload" holds only inside `converters/`:
    `utils/graphs/export.ts:52` passes `'.svg'` as a MIME type (separate item).
  - **Science: not refuted (high), approve.** Thesis names `.gpml` export only; no MIME, no formula.
- **Corrections the PR must carry:** leave `toVGP` (`vgp.ts:108`, same copy-paste origin) out unless
  Ivan approves flipping the two toVGP goldens; if the optional extension-to-MIME invariant test is
  added it must include `.vgp -> text/csv`; update found-bugs-todo lines 100-105 and the ledger.
- **Not verified by anyone:** real mobile browser behaviour with either MIME type.

## 5. SCI-09: calculatePCA_dir no-op duplication line and dead code

- **Severity:** ledger minor; effectively cosmetic (no numeric change, maintainers only).
- **Root cause (one line):** `calculatePCA_dir.ts:44` `vectors.push(...vectors)` is inert because
  `TMatrix` divides by `vectors.length` (and true antipodal mirroring would be inert too, since
  `(-v)(-v)^T = v v^T`); six dead declarations and an unused import were copied from `calculatePCA_pmd`.
- **Fix:** delete line 44 and the dead code, write an accurate comment. "Delete" is the only
  meaningful option; all three refuters confirm mirroring cannot move the pole. The same line was
  already removed from `calculatePCA_pmd` in 131cd8b.
- **References to flip:** none. `pca_dir/mixed_polarity` and `pca_dir/normal_directions` stay
  identical at 7 significant figures (closest margin 8e-9 relative against 3e-12 noise). If either
  changes, the refactor touched something it should not have.
- **Risk:** low. Needs `.claude/.science-unlock`.
- **Refuter verdicts:**
  - **Root-cause: not refuted (high).** Compiled four variants of the real file; deleted and antipodal
    match current at 7 figures, a control variant differs. PmagPy (`Tmatrix`, `tauV`) reproduces all
    12 locked values.
  - **Fix: REFUTED (high) on two spec claims, deletion itself confirmed safe.** The "1e-11 at most"
    blast-radius bound is false for rank-deficient selections: at N=2 (UI minimum) MAD is float noise
    (0 or about 1e-6 deg) and differs in about 34 % of pairs; for vertical-plane selections the pole
    declination flips by 180 deg in 859 of 5000 cases (same plane, different displayed number). The
    optional N=2 fixture "generated before the refactor" would go red afterwards.
  - **Science: not refuted (high), approve with corrections.** `pmag.domean(..., 'DE-BFP')` end to end
    equals every locked value. Thesis matrix (1.3) is centred while the great-circle fit is correctly
    uncentred (matches DE-BFP); record that as a documented deviation in `THESIS_FORMULAS.md`.
- **Corrections the PR must carry:** PR text states the rank-deficient behaviour honestly; no N=2
  `*.expected.json` (use a tolerance unit test: pole within 1e-4 deg of the cross product, MAD < 1e-4);
  duplication-invariance assertion only on full-rank N >= 3 input; empty input still throws
  (`Error: eig: internal error` instead of `TypeError`); comment says "GCN would be identical to GC"
  (thesis lists GCN for the DIR page); line 44 also throws `RangeError` above about 100k vectors.
- **Why last:** no researcher-visible effect. Cheap and independent, so it can be pulled forward.

---

# Needs decision

## The dead-code cluster: SCI-03, SCI-04, SCI-05, SCI-06, SCI-07, SCI-08

All refuters independently confirmed that none of this code has a production caller:

- `calculateCutoff` -> `calculateBasicStatisticalParameters` -> `Distribution` ->
  `calculateButlerParameters`: the only non-test reference is an **unused import** at
  `dataToStereoDIR.ts:11`; the call was removed in 8648630 (2022-10-27). The shipped 45-degree cutoff
  and the CUT45 export use a separate single-pass filter (`DIRPage/Graphs.tsx:61-88`,
  `markCutoffComments.ts:32`). The ledger note "underneath the CUT45 export shipped in 2.6.5"
  (`progress.json:46`) is wrong and should be corrected regardless.
- `calculateMCFaddenIncMean`: no caller since 2022-03-27.

**The one question that unblocks all six: fix or delete?** Is a Vandamme / iterative VGP cutoff, a
Butler dDx/dIx panel, or an inclination-only mode planned? If not, deletion (function, fixtures,
unused import) closes six ledger items with one hygiene PR and no science unlock for numbers.
Severity for all six should drop from major to minor/latent either way.

If the answer is "fix", the dependency order is:

1. SCI-03 + SCI-04 (same function, must not be split, see below)
2. SCI-05 (Distribution.R) -> then the `getConfidenceInterval` unit fix -> then SCI-06 (Butler units)
3. SCI-08 -> SCI-07 (N=1 guard before the F quantile, which divides by N-1)

### SCI-03: calculateCutoff never resets cutoffValue between iterations

- **Severity:** ledger major -> minor/latent. **Risk:** low.
- **Root cause:** `cutoffValue` and `index` are declared outside the `while` loop
  (`calculateCutoff.ts:13-14`), so the rejection threshold becomes the largest angle ever seen instead
  of A or 45; the loop only exits through the 10-iteration cap.
- **References to flip (option a):** `cutoff/cluster_with_outlier_vandamme` cutoffValue
  166.876 -> 3.983915; `cutoff/cluster_with_outlier_45` 166.876 -> 45; `clean_cluster_vandamme`
  unchanged; `outlier_at_index_zero_vandamme` flips only with SCI-04. Under option (b)
  (`cutoffValue` = Vandamme A) `clean_cluster_vandamme` also flips (3.983915 -> 10.8266).
- **Refuters:** root-cause not refuted (high; "at most one outlier is rejected" is false in general,
  same-side outliers can both be rejected); fix not refuted (high) but request-changes: the proposed
  cap replacement "accepted count <= 2" **hangs** on NaN input, replace with
  `if (index === undefined) break;` plus `iterationsCount >= directions.length`; cap replacement is
  mandatory (13 outliers -> 11 rejected with stale values); science not refuted (high): PmagPy's
  `dovandamme` returns A as the cutoff, which supports option (b); PMTools recomputes the mean pole
  each pass, PmagPy does not, so native `dovandamme` numbers are not the oracle.
- **Questions for Ivan:** (1) fix or delete? (2) if fix, may SCI-03 + SCI-04 + the cap replacement
  land as one PR (SCI-03 alone rejects nothing when the outlier is at index 0)? (3) does
  `cutoffValue` mean the largest accepted angle (a) or the Vandamme A (b)?

### SCI-04: calculateCutoff skips an outlier at index 0

- **Severity:** ledger major -> minor/latent. **Risk:** low.
- **Root cause:** `calculateCutoff.ts:55` `if (index)` treats index 0 as "no index".
- **References to flip:** `cutoff/outlier_at_index_zero_vandamme`: `directions[0].rejected` true,
  scatter 74.73081 -> 3.237001, optimum 139.5154 -> 10.8266; cutoffValue stays 166.876 until SCI-03.
- **Refuters:** all three not refuted (high). Corrections: SCI-03 also changes which directions are
  rejected for 2+ outliers, so SCI-04 alone does not make the function usable; 3.237001 / 10.8266
  match a mean-VGP re-implementation from PmagPy kernels, **not** `pmag.dovandamme` (ASD 36.2974,
  A 70.3353, spin-axis convention), record both so nobody "corrects" the fixture later; order-invariance
  test needs fresh `Direction` instances per position (shallow copy at `:12` leaks `rejected`) and
  7-figure comparison; new behaviour for N=2 '45' (`[true,false]`, scatter NaN).
- **Questions for Ivan:** same fix-or-delete; if fix, bundle with SCI-03; accept or guard the N=2 NaN.

### SCI-05: Distribution.R stuck at 0

- **Severity:** ledger major -> minor/latent. **Risk:** low. **Refutations:** 1 (fix).
- **Root cause:** `Distribution.ts:13` sets `this.R = 0` and nothing assigns it again, so
  `getConfidenceInterval()` is `acos(-Infinity)` = NaN and `butlerDistribution` serializes as null.
- **References to flip:** both `basic_statistical_parameters/*`: `R` 0 -> 4.994398 / 4.993618
  (4.017509 for the unfiltered 6-direction set); Butler nulls become finite. R-only gives finite but
  wrong values (dDx 0.002201367 instead of 3.542636); the combined fix gives
  {3.542636, 3.470276, 27.33895, 33.4677}.
- **Refuters:** root-cause not refuted (high); **fix REFUTED (high)**: without the clamps already in
  `calculateFisherMean.ts:70-72`, scattered sets still give NaN; identical directions give
  R = 3.0000000000000004 > N and NaN; R must be computed from **unit vectors** (thesis eq. 1.5, p. 11),
  `getMeanDirection().length` is length-weighted; science not refuted (high): thesis eqs (1.4)-(1.5)
  **are** the oracle for k and a95 (the spec's grep missed them). All three: the blast-radius text is
  wrong, the chain is fully dead.
- **Questions for Ivan:** (1) fix or delete? (2) if fix: one PR for R + CI units + clamps + SCI-06
  (avoids locking wrong finite references twice) or strict one-fix-per-PR with intermediate
  references? (3) should `directionDistribution` use `filteredDirections`
  (`calculateBasicStatisticalParameters.ts:24`; mean inclination 51.66 vs 49.43)? Needs its own ledger id.

### SCI-06: calculateButlerParameters mixes degrees and radians

- **Severity:** ledger major -> minor/latent. **Risk:** low. **Refutations:** 1 (fix).
  **Depends on:** SCI-05 and the `getConfidenceInterval` `/ RADIANS` -> `* RADIANS` fix.
- **Root cause:** `calculateButlerParameters.ts:11-21` never converts; degree-valued paleolatitude and
  inclination go straight into `Math.cos/sin/tan`.
- **References to flip:** `butler/radians_confidence_inc30|inc45` replaced by degree fixtures
  ({5, 30} -> 5.204717 / 8.125 / 11.35099 / 21.42517; {2.864789, 45} -> 3.203266 / 3.580986 /
  23.80248 / 29.5428); `basic_statistical_parameters/*` Butler fields only after SCI-05 and the unit fix.
- **Refuters:** root-cause not refuted (high); **fix REFUTED (high)**: the unfiltered-directions
  input would lock 2 deg of paleolatitude error; `tan` wraps when inc + dIx >= 90 (A95=19, inc=80 ->
  palatMax -89.28, a finite wrong-sign number); invariant tests fail on exact comparison; science not
  refuted (medium): dDx exact against a PmagPy `vgp_di` geometric oracle, dIx is Butler's
  linearisation (inverse of `dia_vgp`'s dp), palat bounds are a ported convention; the
  paleomagnetism.org source was never checked by anyone.
- **Questions for Ivan:** (1) fix or delete? (2) confirm degrees in, degrees out; (3) steep case:
  clamp to +/-90, return null, or keep NaN? (4) confirm the palat = dipole(I +/- dIx) convention.

### SCI-07: calculateMCFaddenIncMean hardcodes f = 0

- **Severity:** ledger major -> minor/latent. **Risk:** low. **survives = false (2 refutations).**
- **Root cause:** `calculateMCFaddenIncMean.ts:97` `const f = 0;` (the `fcalc` port was never done), so
  a95 equals the bias offset |S/C| and is 5.6x to 14.8x too tight.
- **References to flip:** `mcfadden_inc_mean/steep_inclinations` a95 0.4545597 -> **6.72984**
  (F(2,N-1), PmagPy parity) **or 7.190414** (F(1,N-1)); undecided.
- **Refuters:** root-cause not refuted (high) on the line, with a blocking caveat; **fix REFUTED
  (medium)** and **science REFUTED (medium)**: two independent Monte Carlo runs (one using only PmagPy
  code) show F(2,N-1) covers 92-94 % instead of 95 %, F(1,N-1) covers 94.6-95.5 %; theory agrees
  (inclination carries one degree of freedom). PmagPy's `doincfish` appears to carry the error. Nobody
  could read McFadden & Reid (1982). Also: a95 becomes NaN for small scattered N; PmagPy's
  upper/lower limits are centred on the biased Gaussian mean (coverage down to 75.6 %), do not add
  them; an unbounded search loop never terminates for inputs with no zero crossing
  (`[35,60,80]`, 158 of 4000 synthetic steep sets); `ginc` comes back sign-flipped in about half of
  steep inputs (line 82).
- **Questions for Ivan:** (1) fix or delete? (2) F(1,N-1) (statistically correct, needs a t-quantile
  table, deliberate deviation from PmagPy) or F(2,N-1) (parity, documented under-coverage)? Check
  the confidence-limit equation in McFadden & Reid (1982) first. (3) NaN contract for small N.
  The function must not be wired into any page until (2), (3) and the non-terminating search are resolved.

### SCI-08: calculateMCFaddenIncMean crashes for N = 1

- **Severity:** minor -> minor/latent. **Risk:** low. 0 refutations, but the contract is undecided.
- **Root cause:** `gausspars` returns null for N === 1 (`:6`), the caller guards only the empty array
  (`:41`), and the erased `!` at `:43` lets `gaussparsRes.MI` throw at `:47`.
- **References to flip:** none; new N=1 fixtures only.
- **Refuters:** all three not refuted (high). The all-zero option is **wrong** for steep N=1 (a95 0
  claims zero uncertainty; R = 2C - N = 1). PmagPy's steep N=1 shape is a 0.01-degree grid accident
  ([45.005] gives k 0, csd inf), so a hand calculation is the oracle. Naive `gausspars` fix turns the
  throw into a hang (`[45]`, `[90]`). Harness cannot tell NaN from Infinity (both `null`), so explicit
  `Number.isNaN` assertions are needed.
- **Question for Ivan:** N=1 returns `null`, or `{ginc, inc, n:1, r:1, k:NaN, a95:NaN, csd:NaN}`?
  (And fix or delete.) Open separate ledger items for the `ginc` sign flip and the non-termination.

## SCI-10: CSV converters do not quote fields containing commas

- **Severity:** minor (wrong directions on re-import when a label or stepRange has a comma; ragged
  CSV for comment commas). **Risk:** spec says low; science refuter says medium until the read side
  lands. **survives = false (2 refutations).**
- **Root cause:** `pmd.ts:96-99`, `dir.ts:83-86`, `dir.ts:55-58` (and `vgp.ts:153-156`, `dir.ts:50`)
  concatenate `${value},` with no escaping; the three parsers split on every comma with no quote awareness.
- **References to flip (as specified):** `pmd/oriented_with_comment.toCSV_PMD`,
  `dir/long_labels.toCSV_DIR`, `dir/long_labels.toPMM`; plus the three `pmm/real/season*.pmm`
  references (`"\"normal\""` -> `"normal"`) once the read side becomes quote-aware.
- **Refuters:** root-cause not refuted (high); **fix REFUTED (high)** and **science REFUTED (high)**:
  write-only quoting makes every native-PMM comment grow quotes per export/import cycle (1 -> 3 -> 7 ->
  15 per side; today the cycle is stable) and does not remove the numeric column shift on re-import;
  XLSX re-import has the same shift today (`parserXLSX_*` via `xlsx_to_csv`); whitespace normalisation
  must stay in front of any splitter or native padded PMM rows break; `parserCSV_PMD.ts:48` loses
  demagType for a quoted step; newlines cannot round-trip through line-based parsers; **thesis
  Fig. 2.16 (p. 28, an image) shows native `.pmm` with every comment quoted and no trailing comma**, so
  always-quoting in `toPMM` is the thesis-conformant form; `toCSV_PMD` stays unreadable by external
  tools anyway (header has 10 names for 11 fields).
- **Questions for Ivan:** (1) approve one PR with write + quote-aware read side including `parsePMM`
  quote stripping and the three `season*.pmm` flips (reverses the recorded won't-fix for quoted
  input)? (2) `toPMM`: always quote comments (thesis) or minimal quoting (documented deviation)?
  (3) keep the D4 whitespace strip inside quoted PMM fields (then a PMM round trip cannot be
  lossless)? (4) newline in a field: replace with a space on write? (5) are `toCSV_VGP`, `dir.ts:50`
  and the `pmd.ts:92` header in scope? The spec must be rewritten after these answers.

## SCI-11: toPMM hardcodes author/date; a95g/a95s header

- **Severity:** minor -> cosmetic (false provenance in two header lines; numbers correct).
  **Risk:** low. **Refutations:** 1 (fix).
- **Root cause:** `dir.ts:50` is the literal scaffold `"file_comment"\n${name},"author","2021-11-27"`
  from 2b94381 (2022-01-30). The **a95g/a95s header is not a bug**: it is the canonical PMM header
  (thesis Fig. 2.16, all real files), a generic confidence-radius slot (Fisher a95 recomputed from N
  and k reproduces the column: 10.69 vs 10.7, 34.15 vs 34.2).
- **References to flip:** `dir/normal_and_reversed.toPMM` and `dir/long_labels.toPMM`, lines[0]
  `"file_comment"` -> `""`, lines[1] -> `"<name>","","<date>"`. The date value depends on the decision below.
- **Refuters:** root-cause not refuted (high); **fix REFUTED (high)**: `new Date(localeString)` does
  not fail for days 1-12, it swaps day and month (ru-RU `05.09.2026` -> 2026-05-09, 132 of 365 days),
  which is worse than an obvious placeholder; `toISOString().slice(0,10)` is the UTC date (previous day
  before noon in Auckland, 00:00-03:00 in Moscow); `DIRInputDataTableToolbar` passes the parser's
  **import** timestamp, so a `created`-derived date differs by table; the proposed fixture has no
  clock hook; science not refuted (high), same date corrections.
- **Questions for Ivan:** (1) which date goes in the header: export time everywhere (refuters'
  recommendation; needs a mocked clock in `converterDIR.test.ts`) or the collection's `created`?
  (2) local calendar date or UTC? (3) title field: bare name without extension, as real files?
  (4) author stays `""`? (5) split the ledger item and mark the a95g/a95s half not-a-bug?
  Never parse a `toLocaleString()` value in any variant.

## SCI-13: toPMD truncates the specimen name and merges it with a=

- **Severity:** minor (interop: PmagPy's PMD reader raises `ValueError: 'a=' is not in list`;
  PMTools re-import unaffected). **Risk:** spec low; fix refuter low-medium. **Refutations:** 1 (fix).
- **Root cause:** the 10-wide name cell has no separator before `a=` (`pmd.ts:19`), and
  `metadata.name` is the file name with extension, so any name of 10+ characters merges
  (`133cr15.pmd` -> `133cr15.pma=226.0`).
- **References to flip (3):** `pmd/oriented_with_comment|edge_magnitudes|thermal_and_af.toPMD`,
  lines[1] only (`oriented_wa=` -> `oriented_ a=` under keep-head).
- **Refuters:** root-cause not refuted (high; 22 of 141 real files affected, not "most"); **fix
  REFUTED (high)**: `getFileName` deletes interior dots (`s1.10.pmd` and `s11.0.pmd` both -> `s110`,
  silent specimen-ID collision in PmagPy), use `name.replace(/\.[^/.]+$/, '')` as
  `rawStatisticsPMDToInterpretation.ts:13` already does; the whole-line `.trim()` at `pmd.ts:47` shifts
  every column for an empty stem and re-import then reads **wrong orientation silently**; round-trip
  test must assert `parsed.b === 90 - input.b`; science not refuted (high): thesis Fig. 2.3 shows the
  separated header; PmagPy still fails on `T570`-style step rows, so the fix is necessary but not
  sufficient for PmagPy import.
- **Question for Ivan (blocks the three flips):** the 9-character rule. Keep the head (`khramov20`) or
  the tail (real long stems carry the specimen number at the end: `khramov2026_70`)? Two specimens
  sharing a 9-character prefix collide silently either way; say which is acceptable. Also: header
  carries the file stem (proposed) or should parsers preserve the file's inner specimen name?

## SCI-15: parserRS3 ISO-8859-1 decoded as UTF-8

- **Severity:** cosmetic. **confirmed = false; survives = false.**
- **Finding:** the note does not reproduce for RS3. On all 286 real RS3 files UTF-8 and Latin-1
  decoding give identical parser output; 0xB0 sits only in the discarded title line and in unread
  Limit1/Limit2 columns. The locked RS3 reference is numerically correct (`pmag.dogeo` exact;
  within 0.114 deg of Remasoft's own columns over 3780 rows). The latent defect belongs to
  `fileManipulations.ts:74,110` (`readAsText` with no encoding) and is format-agnostic.
- **References to flip:** none for RS3.
- **Refuters:** root-cause not refuted (high); **fix REFUTED (high)**: the proposed decode helper
  breaks UTF-16 BOM files that load today, `TextDecoder` is undefined in this repo's jest environment,
  and windows-1251 alone covers the degree sign (0xB0 is `°` in cp1251 too); science not refuted (high).
  Note D2's "column offsets survive" is false for valid pairs **and** truncated sequences (cp1251 `её`).
- **Questions for Ivan:** (1) close SCI-15 as not-a-bug for RS3 and re-scope it as "FileReader
  pipeline decodes legacy single-byte files as UTF-8" (BOM sniffing, fatal UTF-8, windows-1251
  fallback), or fold it into the PMD `°C` item? (2) correct note D2 and the rs3 README now?

## SCI-17: calculateMcFaddenMean indexes gcPath[-1]

- **Severity:** ledger cosmetic -> minor (reachable TypeError). **Risk:** low.
  **survives = false (3 of 3 refuted).**
- **Root cause (mechanism confirmed):** with any non-finite direction plus at least one great-circle
  row, every candidate `r` is NaN, `dirIndex` stays -1, `gcPath[-1]` is pushed as `undefined`
  (`calculateMcFaddenCombineMean.ts:65-86`) and `:42` throws.
- **References to flip:** none.
- **Refuters (all high):** the spec's reachability claim is **false**: `parserDIR.ts:82-93` drops NaN
  rows, a `.dir` file cannot trigger this. The reachable route is the unvalidated parsers behind
  `wrapPlain` (`parserCSV_DIR.ts:22-29`, XLSX through it, `parserMDIR`). The same NaN row also throws
  in GC mode, and after the localStorage round trip (NaN -> null) **every** mode throws at
  `calculateStatisticsDIR.ts:27`, so the McFadden guard fixes one of three crash sites. A `return`
  inside `forEach` only skips the circle and outputs a plausible wrong mean (a95 76.9 where 3.5 is
  correct). Two proposed regression values are an argmax over a 7.8e-16 spread with 19 ties
  (platform-fragile, about 80 deg from the true answer). k for a single great circle is -Infinity.
- **Questions for Ivan:** (1) where does the fix live: a NaN-shaped result in McFadden (option 1,
  parity with Fisher), finite-value validation in the CSV/XLSX/MDIR DIR parsers, a finite filter in
  `calculateStatisticsDIR`, or a combination? (2) re-run the investigation with the corrected
  reachability before any PR. Option 2 (silently filter rows, reduce N) is not recommended.

---

# New findings that need a ledger decision

These came out of the refuter runs. None has a verified spec yet, so none is in the queue.

| Tag | Finding | Impact | Suggested action |
|---|---|---|---|
| NEW-A | `findBed` (`foldTestBootstrap.ts:175-181`): `if (cosdip < 0) dip = 180 - dip` runs before the `dip < 0` flip, so vertical and overturned beds get a dip in (180, 270) and fractional unfolding goes the long way round. Two refuters measured it independently (about half of random dip > 90 cases; real `s=327 d=90` data sits on the boundary). One-line normalization verified not to change the locked fixture. | **Wrong numbers in production** after SCI-01 for folds with vertical or overturned limbs (tau1 off by up to 0.38). | Open a ledger item (major/critical), run the investigate workflow on it, slot it directly after SCI-01. |
| NEW-B | `FoldTestContainer.tsx:88-89`, `dataToFoldTest.ts:12-13`: `untilts[...] \|\| -50` / `\|\| 150` replaces a legitimate bound of exactly 0. After SCI-01, index 0 occurred in 27 of 1000 post-fold bootstrap draws; an upper bound of 0 would display as 150 and appear to include 100 %. `getCDF` also sorts React state in place. | Wrong displayed bounds. | Ledger item; ship in the same release as SCI-01. |
| NEW-C | `parserRS3.ts:52-61` turns Remasoft PCA component rows (`C  C1 ...`) into steps named `CNaN`: 312 rows in 142 of 285 archive files, trailing, M up to 310x the last real step, fit MAD lands in `a95`. | Phantom points on Zijderveld/stereo/Mag plots; PCA "to the end" includes them. | Ledger item, major. Decide with Roman: drop, report via `invalidRows`, or import as interpretations. |
| NEW-D | McFadden combined mean is a single greedy pass over 194 points; thesis says iterative. Locked stratigraphic fixture: I = 25.40 (24.66 with GC rows swapped) against PmagPy 25.04. | Production, about 0.4 deg, order-dependent. | Ledger item; intentional reference flip when fixed. |
| NEW-E | `Coordinates.angle` (`Coordinates.ts:106`) calls `acos` on an unclamped dot product: NaN for about 30 % of identical or antipodal integer-degree pairs. | Under the shipped 45-degree cutoff, a direction antipodal to the mean can escape the cut (`NaN > 45` is false). | Ledger item. |
| NEW-F | `toPMD` applies `toExponential_PMD` to bare-number step labels (`100` -> `1.00`, polarural dialect); numeric header cells are cut (`a=-162.9` -> `a=-162.`). | Wrong labels/values in exported `.pmd`. | Ledger items. |
| NEW-G | DIR page dispatches `setStatisticsMode('gcn')` (`ToolsDIR.tsx:145-147`), which `calculateStatisticsDIR` does not handle (code reading only). | Would store `Direction(0,0,0)`, MAD 0. | `/investigate`. |
| NEW-H | Smaller: `toCSV_PMD` header has 10 names for 11 fields; `graphs/export.ts:52` passes `'.svg'` as MIME; `toGPML` does not XML-escape `vgp.label` and reuses one `gpml:identity`; a `.pmd` without a leading line loses its first step; parserDIR `rowNumber` is not blank-line safe; `Distribution.transformCox/Creer` take degrees as radians. | Minor/cosmetic. | found-bugs-todo entries. |

# Ledger hygiene

- `progress.json:46` (SCI-03 note "underneath the CUT45 export shipped in 2.6.5") is factually wrong.
- found-bugs-todo: SCI-17 wording ("poisons the resultant with NaN"), the SCI-06 note ("passes
  confidence in radians"), note D2 ("column offsets survive", `Step[°C]` assertion), the SCI-13 note
  (all three `toPMD` references lock the merge; "widen" is unsafe), the SCI-11 header bullet
  (not-a-bug), and the `foldTestClassic.ts` sub-item (empty stub) are stale or wrong.
- Statements about the paleomagnetism.org source (`doCutoff`, `getButlerParameters`,
  `RADIANS = PI/180`) were never verified by anyone; keep them out of PR text.
