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

| ID | PMTools | PmagPy oracle (confirm in PB-00) | Status |
|---|---|---|---|
| PB-00 | Mapping check: confirm each row's oracle and conventions | — | todo |
| PB-01 | Specimen → geographic → stratigraphic (`toReferenceCoordinates`, `Coordinates.correctBedding`) | `pmag.dogeo`, `pmag.dotilt` | todo |
| PB-02 | Fisher mean, k, a95 (`calculateFisherMean`) | `pmag.fisher_mean` | todo |
| PB-03 | PCA on demag steps: line, anchored line, plane, MAD (`calculatePCA_pmd`) | `pmag.domean` DE-BFL / DE-BFL-A / DE-BFP | todo |
| PB-04 | PCA on directions (`calculatePCA_dir`) | `pmag.doprinc` | todo |
| PB-05 | VGP, dp/dm, mean pole (`calculateVGP`, `calculateButlerParameters`) | `pmag.dia_vgp`, `pmag.fisher_mean` on poles | todo |
| PB-06 | Inclination-only mean (`calculateMCFaddenIncMean`) | `pmag.doincfish` | todo |
| PB-07 | Lines + great circles mean (`calculateMcFaddenCombineMean`) | `pmag.dolnp` (see SCI-23) | todo |
| PB-08 | Cutoff 45° / Vandamme (find the live code path first, see SCI-20) | `pmag.dovandamme` | todo |
| PB-09 | Watson tests: randomness, k-ratio, common mean Vw (thesis 1.6–1.11) | `ipmag.common_mean_watson` | todo |
| PB-10 | Reversal tests: classic and bootstrap | `ipmag.reversal_test_MM1990`, `ipmag.reversal_test_bootstrap` | todo |
| PB-11 | Fold test: classic and bootstrap | `ipmag.bootstrap_fold_test` | core done (SCI-01) |
| PB-12 | Conglomerate test | Watson 1956 randomness, thesis §1.4.1 | todo |
| PB-13 | Public verification page built from the oracles and parity results | — | later |

Order: PB-00, then PB-01 to PB-03 (everything else depends on them), then down the table.

**Done when** every row is `verified` or `mismatch` with a ledger item.
