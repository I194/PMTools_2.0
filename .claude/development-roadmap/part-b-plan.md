# Part B — verify every computation against PmagPy

**The only active track from October 2026.** Everything else in the roadmap is paused.

Goal: every number PMTools shows is covered by a test that compares it with PmagPy, or with
the thesis formula where PmagPy has no equivalent. The same data later feeds a public
verification page.

## Rules

- **One computation per PR**: oracle generator input + `*.pmagpy.json` oracle + parity test.
  No fixes in a Part B PR.
- **A mismatch is recorded, not fixed.** The parity test asserts the mismatch (so a later fix
  makes it fail and must update it), the row below gets status `mismatch`, and the bug goes
  to `found-bugs-todo.md`. Fixes wait until Part B is done, unless Ivan pulls one forward.
- **Oracle**: PmagPy pinned at 4.3.14. Where PMTools follows the thesis on purpose and PmagPy
  differs, the test says so in one line and checks the thesis value.
- **Inputs**: real files (`test-data/`, `src/assets/examples/`) plus synthetic edge cases
  (N = 1, N = 2, antipodal pairs, poles, vertical and overturned beds).
- **Tolerance**: justified once per computation by input rounding; 1e-6 on unrounded inputs.
- **Bootstrap tests**: exact parity for the deterministic core; full runs are compared
  statistically after the seeded pure cores exist (PERF-02).
- Infrastructure already exists: `scripts/generate_fixtures.py` + `_fixture_common.py`
  (`gen_fisher`, `gen_pca`, `gen_foldtest` work; the rest are stubs) and the shared harness
  in `src/test-utils/`.

## Computations

Oracles confirmed in PB-00 (2026-10-16) from the completeness inventory on `handoff/part-b-cloud`;
each row PR re-checks its own mapping against the live code path.

| ID | PMTools (live path) | PmagPy oracle | Status |
|---|---|---|---|
| PB-00 | Mapping check: confirm each row's oracle and conventions | — | done (#57) |
| PB-01 | Specimen → geographic → stratigraphic (`toReferenceCoordinates`, `Coordinates.rotateTo`, `Coordinates.correctBedding`) | `pmag.dogeo(D, I, a, b_stored − 90)` then `pmag.dotilt(D, I, s + 90, d)`. The store keeps `b_stored = 90 − b_file` (`parsedData.ts:45`), so the lab-arrow plunge is `−b_file` = `pmag.orient` or_con 1 = PmagPy's own PMD importer. One convention, no conflict | verified (#58) |
| PB-02 | Fisher mean, k, a95 (`calculateFisherMean`) | `pmag.fisher_mean`; adapter: `'inf'` → Infinity, N = 1 returns only dec/inc | verified (#59) |
| PB-03 | PCA on demag steps (`calculatePCA_pmd`): `pca`, `pca0`, `gcn`, `gc` | `pca` → `domean` DE-BFL. `pca0` → MAD from DE-BFL-A, direction from `pmag.Tmatrix` + `pmag.tauV` (DE-BFL-A returns `vector_mean`, a different estimator). `gcn` → DE-BFP, compared as an axis. `gc` → no PmagPy function: `Tmatrix`/`tauV` on raw xyz + thesis plane MAD | verified (#60) |
| PB-04 | PCA on directions, DIR-page GC (`calculatePCA_dir`) | pole: `pmag.doprinc` V3 (antipode, compared as an axis); MAD: `pmag.domean` DE-BFP | mismatch (#62, SCI-30) |
| PB-05 | VGP, dp/dm, paleolatitude (`calculateVGP`, live source `calculateVGP.ts:48-52`) and mean pole | `pmag.dia_vgp`, `pmag.plat`, `pmag.fisher_mean` on poles. `calculateButlerParameters` is dead (SCI-20), not a source | mismatch (#63, SCI-27..29) |
| PB-06 | Inclination-only mean (`calculateMCFaddenIncMean`) | `pmag.doincfish`. Dead code (no production importer, SCI-20): verifies dead code | mismatch, dead code (#61, SCI-20) |
| PB-07 | Lines + great circles mean (`calculateMcFaddenMean` in `calculateMcFaddenCombineMean.ts`) | `pmag.process_data_for_mean` + `pmag.calculate_best_fit_vectors` (+ the dolnp k/a95 algebra); `pmag.dolnp` returns rounded strings. SCI-23 expected | mismatch (#64, SCI-23) |
| PB-08 | Cutoff 45° (live: angle to the Fisher mean > 45, `DIRPage/Graphs.tsx:84`, `markCutoffComments.ts:32`) | `pmag.angle`. `pmag.dovandamme` applies only to the dead `calculateCutoff` | verified (#65) |
| PB-09 | Watson tests: randomness, k-ratio, common mean Vw | none: PMTools implements no Watson F / k-ratio / Vw test (the only live Watson-family computation is PB-12) | nothing to verify |
| PB-10 | Reversal tests: classic and bootstrap | polarity split → `pmag.flip`; gamma → `pmag.angle`; gamma critical → closed-form McFadden & McElhinny 1990 eq. 15 (`ipmag.reversal_test_MM1990` is Monte Carlo: statistical check only) | mismatch (#68, SCI-31, SCI-32) |
| PB-11 | Fold test: classic and bootstrap | "classic" is an empty stub (`foldTestClassic.ts`, no importer). Bootstrap core → `pmag.dotilt_V` + `pmag.doprinc` tau1 (`ipmag.bootstrap_fold_test` only prints/plots) | mismatch (#67, SCI-25) |
| PB-12 | Conglomerate test (`conglomeratesTest`) | `ipmag.conglomerate_test_Watson(R, n)` | verified (#66) |
| PB-13 | Public verification page built from the oracles and parity results | — | later |

Live computations covered by no row (record in the final status PR, verify later):
- **Stereonet projection**: `dirToCartesian2D` is linear (equidistant): inc 30 → r 0.6667, while
  `pmag.dimap` (equal-area, the thesis §1.2 standard) gives 0.7071. Affects every stereonet and
  exported SVG. Mismatch candidate.
- Small/great circle construction (same points as `pmag.circ`, different parametrisation),
  center-by-mean rotation (= `pmag.dotilt(D, I, meanD + 180, 90 − meanI)`), `reversePolarity`
  (= `pmag.doreverse`), Zijderveld axis mapping, demagnetisation-curve normalisation.
- Input rounding: `calculateStatisticsDIR` rounds every selected direction to 0.1° before any
  mean; parity tests call the computation directly and treat the rounding as an input adapter.

Status as of 2026-10-16: every row has a draft PR (none merged). PRs #58-#68 each add only an
oracle script, a fixture and a parity test; mismatches are asserted as `MISMATCH PB-NN-<n>` tests
and logged in `notes/found-bugs-todo.md` ("Surfaced by Part B parity").

## Parity test conventions (PB-00)

- Oracle script `scripts/oracle_pbNN_<topic>.py` writes one
  `src/__tests__/fixtures/part_b/pbNN_<topic>.pmagpy.json` (inputs + PmagPy outputs +
  `pmagpy_version`), formatted with Prettier. CI never runs Python.
- Parity test `__tests__/<function>.pmagpy.test.ts` next to the live function; it calls the live
  function on the fixture inputs.
- A recorded mismatch is a test named `MISMATCH PB-NN-<n>: ...` that asserts the current PMTools
  value and the PmagPy value as they are, so a fix makes it fail and must turn it into a parity
  assertion.

Order: PB-00, then PB-01 to PB-03 (everything else depends on them), then down the table.

**Done when** every row is `verified` or `mismatch` with a ledger item.
