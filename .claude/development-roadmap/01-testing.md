# Phase 1 — Comprehensive Testing & Scientific Verification

## Context

PMTools 2.0 is scientific software. **Treat it like NASA flight code**: a wrong number can mean a retracted paper, a misinterpreted geomagnetic record, a bad PhD chapter. There is no "good enough" tier for a calculation that ends up in published research. Its statistics and parser modules must produce numerically correct results, and those results must stay stable across the large refactors planned in phases 3–7 of this roadmap. Today the repo has a single test file (`src/utils/files/__tests__/mergeDir.test.ts`) and CI does not run tests at all. That is the gap this phase closes before any other modernization work starts.

This phase is **not** about testing UI. UI gets its own visual regression safety net in Phase 2. This phase is about locking down the scientific core.

## Goal

Establish a test suite that:
1. **Verifies scientific correctness** of every computation in `src/utils/statistics/` against PmagPy, published literature, and the PMTools thesis document.
2. **Locks current behavior** of parsers, converters, and graph projections with golden-master regression tests.
3. **Runs in CI** so regressions are caught automatically.
4. **Survives refactors**: expected values live in fixture files separate from test code, so Phase 3/5/6 rewrites of test code do not lose scientific capital.
5. **Reaches 100% coverage** for `src/utils/statistics/` and every parser/converter — every line, every branch, every edge case. This is non-negotiable. If a line cannot be reached, it is dead code and gets deleted; there is no "uncovered but probably fine" state.

## Non-Goals

- No UI component tests (Phase 2).
- No tests for Redux slices in their current shape — they will be replaced in Phase 6.
- No migration to Vitest — Jest ships with `react-scripts` and is ready today. The Jest → Vitest migration happens in Phase 6 and is trivial (~95% API compatibility).

## Oracle Strategy

Three independent sources of truth per computation.

### Primary: `PMTools_how_to_use.pdf` (authoritative formulas)

The file `src/assets/PMTools_how_to_use.pdf` is the author's own specification of PMTools — an excerpt from the diploma thesis "Новое программное обеспечение для палеомагнитных операций и его практическое использование" (Ефремов И. В., 2022). It explicitly lists every formula PMTools implements. This is our highest-priority oracle because it is what the code is *supposed* to match.

Formulas defined in the thesis that must each have matching tests:

- **MAD for vectors** (1.1): `MAD = arctan(sqrt((λ_int + λ_min) / λ_max))` — Kirschvink 1980.
- **MAD for great-circle planes** (1.2): `MAD = arctan(sqrt(λ_min/λ_int + λ_min/λ_max))`.
- **Covariance matrix H** (1.3) used for PCA.
- **Fisher kappa** (1.4): `k = (N-1)/(N-R)`.
- **Fisher α₁₋ₚ** (1.5): `α_{1-p} = cos⁻¹(1 - ((N-R)/R)((1/p)^(1/(N-1)) - 1))`, standard `p = 0.05`.
- **Watson randomness test** (section 1.4.1): `R₀ = sqrt(7.815 · N / 3)`, compare against `R = sqrt((Σxᵢ)² + (Σyᵢ)² + (Σzᵢ)²)`.
- **McElhinny kappa ratio F-test** (1.6) used by the classical fold test.
- **Watson F-statistic** for common mean (1.7): `F = (N-2)(R₁+R₂-R) / (N-R₁-R₂)`.
- **Vw statistic** (1.8–1.11): `Sw = k₁R₁ + k₂R₂`, `X̂_j = k₁R₁x̄_{1j} + k₂R₂x̄_{2j}`, `Rw = sqrt(X̂₁² + X̂₂² + X̂₃²)`, `Vw = 2(Sw − Rw)`.
- **Fold test scatter matrix T** (1.12) — used by the bootstrap fold test instead of classical kappa.
- **McFadden combined mean** (1988) — iterative fit when the dataset mixes directions with great circles.
- **Bootstrap procedure** (section 1.5) — resample N vectors with replacement, compute Fisher mean, repeat Q times.

Each of these formulas gets at least one unit test with handcrafted inputs whose expected output can be computed by hand or derived from the formula directly. Each test references the formula number in a comment (`// PMTools_how_to_use.pdf §1.1`).

### Secondary: PmagPy parity

PmagPy (Tauxe / Swanson-Hysell) is the de-facto standard in paleomagnetism and is explicitly referenced in the PMTools thesis.

- A Python helper script `scripts/generate_fixtures.py` reads each input file in `test-data/` and `src/__tests__/fixtures/`, runs the equivalent PmagPy routine (`pmag.fisher_mean`, `pmag.doprinc`, `pmag.dolnp`, etc.), and writes `.pmagpy.json` next to each input.
- Python is **only** needed when regenerating fixtures locally. CI consumes the committed JSON, so no Python in CI.
- `scripts/README.md` documents: `pip install pmagpy`, PmagPy version used, how to regenerate.
- Any numeric delta between PMTools and PmagPy is investigated. Outcome is either: (a) PMTools has a bug, fixed with `fix(science):` commit; or (b) PMTools uses a different documented convention (e.g., Watson F-test vs Vw), documented in `SOURCE.md` for that fixture.

### Tertiary: external published literature

Cross-checks for edge cases and worked examples not covered by the thesis or PmagPy:

- **Fisher 1953** — Fisher statistics original paper.
- **Tauxe "Essentials of Paleomagnetism" 2010** — PCA, VGP, fold test worked examples. Already cited by the thesis.
- **Butler "Paleomagnetism: Magnetic Domains to Geologic Terranes"** — VGP conversion worked examples.
- **McFadden & McElhinny 1990** — reversal test classification (cited by thesis).
- **McFadden 1988** — combined remagnetization circles / direct observations method (cited).
- **Watson 1956, 1983** — randomness test, Vw test (cited).
- **Efron 1979 / Tauxe 1991** — bootstrap method (cited).

Each literature-sourced fixture has a `SOURCE.md` sibling explaining paper / page / equation used.

### Tolerance

- Angles and dimensionless values: `toBeCloseTo(..., 6)` (6 decimal places).
- Derived statistics (k, α95): `toBeCloseTo(..., 4)`.
- Bootstrap outputs: seeded integer-RNG, exact equality of integer state; floating-point outputs within 1 ULP of the JS reference (cross-engine `Math.sin`/`atan2` are not bit-deterministic, so demanding "byte-for-byte" is wrong even within JS).

## Fixture Strategy: Real + Synthetic

Every parser test suite must combine **two complementary sources**:

1. **All real-world fixtures we have.** Copy every available file of each format from:
   - `test-data/` (current sample files)
   - `test-data/v2.6.1/`, `v2.6.2/`, `v2.6.3/` (regression files captured during prior bug fixes)
   - `src/assets/examples/` (`examplePCA.pmd`, `exampleDIR.pmm`)
   - `.claude/issues/*` (real user-reported files like `406c.squid`, `10bg136b.squid`, `a11-19.squid`)
   - Any private samples Ivan adds during the phase (3–11 files per format target).

   These represent how the format **actually appears in the wild** — encoding quirks, instrument-specific headers, lab conventions, partial measurements, mixed line endings, BOMs, comments. None of this can be invented from a spec.

2. **An exhaustive set of synthetic fixtures** built per-format, designed to cover:
   - Every documented field combination.
   - Every documented optional field present and absent.
   - Boundary numeric values (zero, negative, very small, very large, infinity, NaN).
   - Every malformed shape: missing column, extra column, wrong type, truncated row, BOM, CRLF vs LF, Russian decimal comma, trailing whitespace, empty file, header-only file, single-row file, duplicated header.
   - Encoding edges: UTF-8, UTF-8 with BOM, Windows-1251 (legacy Russian lab files), mixed encodings.
   - Whitespace variants: tabs, multiple spaces, alignment columns.

**Both sets are mandatory.** Real fixtures alone miss synthetic edge cases the wild hasn't surfaced yet. Synthetic fixtures alone miss the messiness real instruments produce. Coverage of a parser is only "done" when both sets pass and the parser hits 100% line + branch coverage.

The same real+synthetic principle applies to converters (round-trip every real file, then round-trip a wide synthetic matrix) and to statistics computations (real DIR/PMD inputs from `test-data/` + handcrafted thesis-formula inputs + property-based tests).

## Fixture Layout

```
src/__tests__/fixtures/
├── pca/
│   ├── thesis_pca_handcrafted.json             # §1.1 vector MAD — hand-computed
│   ├── thesis_pca_handcrafted.expected.json
│   ├── thesis_gc_handcrafted.json              # §1.2 great-circle MAD
│   ├── thesis_gc_handcrafted.expected.json
│   ├── tauxe_example_chapter9.pmd
│   ├── tauxe_example_chapter9.expected.json
│   ├── sample_from_testdata.pmd                # copy of test-data/sample.pmd
│   ├── sample_from_testdata.pmagpy.json
│   ├── mad_zero_regression.pmd                 # captures v2.6.3 fix
│   ├── mad_zero_regression.expected.json
│   └── SOURCE.md
├── fisher/
│   ├── thesis_fisher_formula.json              # §1.4–1.5 hand-computed
│   ├── thesis_fisher_formula.expected.json
│   ├── fisher_1953_table2.json
│   ├── fisher_1953_table2.expected.json
│   └── SOURCE.md
├── watson/
│   ├── thesis_watson_R0.json                   # §1.4.1 randomness test
│   ├── thesis_watson_R0.expected.json
│   ├── thesis_watson_F.json                    # (1.7) common mean F-test
│   ├── thesis_watson_F.expected.json
│   ├── thesis_watson_Vw.json                   # (1.8–1.11) Vw statistic
│   └── SOURCE.md
├── vgp/
│   ├── butler_chapter7_example.json
│   ├── butler_chapter7_example.expected.json
│   └── SOURCE.md
├── mcfadden/
│   ├── mcfadden_1988_combined.json             # directions + great circles
│   └── SOURCE.md
├── fold_test/
│   ├── thesis_fold_matrix_T.json               # (1.12) scatter matrix
│   ├── mcfadden_1990_dataset.json
│   └── SOURCE.md
├── cutoff/
│   ├── vandamme_reference.json
│   └── SOURCE.md
├── bootstrap/
│   ├── seed_42_reference.json                  # generated with seeded RNG
│   └── SOURCE.md
├── parsers/
│   ├── pmd/
│   │   ├── real/                               # all real fixtures we can find — multiple per format
│   │   │   ├── sample_from_testdata.pmd
│   │   │   ├── examplePCA_from_assets.pmd
│   │   │   ├── malformed_v2.6.1.pmd
│   │   │   ├── invalid_rows_v2.6.1.pmd
│   │   │   └── ... (every real .pmd we have)
│   │   ├── synthetic/                          # exhaustive edge cases hand-built
│   │   │   ├── empty.pmd
│   │   │   ├── header_only.pmd
│   │   │   ├── single_step.pmd
│   │   │   ├── crlf_line_endings.pmd
│   │   │   ├── lf_line_endings.pmd
│   │   │   ├── utf8_bom.pmd
│   │   │   ├── windows1251.pmd
│   │   │   ├── russian_decimal_comma.pmd
│   │   │   ├── trailing_whitespace.pmd
│   │   │   ├── extreme_values.pmd
│   │   │   └── ... (full edge-case matrix)
│   │   ├── *.expected.json                     # one per fixture
│   │   └── SOURCE.md
│   ├── dir/                                    # same real/ + synthetic/ structure
│   ├── rs3/                                    # synthetic from spec first, real files added when sourced
│   ├── squid/                                  # real .squid from .claude/issues/* + synthetic
│   ├── csv_pmd/
│   ├── csv_dir/
│   ├── pmm/                                    # real .pmm from test-data/ + synthetic
│   ├── xlsx_pmd/
│   └── xlsx_dir/
└── graphs/
    ├── zijderveld_projection.json
    └── stereo_projection.json
```

**Principle**: fixture files are the scientific capital. Test code in `.test.ts` files can be rewritten freely during later phases; fixtures are only regenerated with documented justification. Every fixture's `SOURCE.md` entry must cite one of: (a) PMTools thesis formula number, (b) PmagPy version + function, (c) paper + page.

## Prerequisites (Step 0 — one-time setup)

1. **Verify the existing single test runs in CI as-is, before adding any new tests.** Add `npm test -- --watchAll=false` to `.github/workflows/react-build-and-deploy.yml` after `npm run lint`. Confirm the single existing `mergeDir.test.ts` passes a real CI run on a throwaway commit. Only after that goes green do new tests start landing — otherwise test infra problems get blamed on new tests.
2. Install devDependencies:
   - `fast-check` — property-based tests.
   - A seedable integer-PRNG: hand-rolled LCG (preferred, ~10 lines, fully deterministic across engines) or `seedrandom`. **Integer state, not float**, so cross-engine and cross-language (Phase 7 Rust port) parity is bit-exact.
3. Create `scripts/generate_fixtures.py` (PmagPy wrapper) + `scripts/README.md`.
4. Create `src/__tests__/helpers/`:
   - `directionFixtures.ts` — factories for `Direction`, `IPmdData`, `IDirData` from plain JSON.
   - `mathMatchers.ts` — custom matchers (`toBeCloseToArray`, `toBeCloseToDirection`).
   - `seededRng.ts` — seedable integer-PRNG used in bootstrap tests instead of `Math.random`.
5. Scaffold `src/__tests__/fixtures/` tree with empty `SOURCE.md` files per section. Each parser fixture directory has both `real/` and `synthetic/` subdirectories from day one.
6. Capture coverage baseline before any new tests land: `npm test -- --watchAll=false --coverage` → save to `.claude/development-roadmap/notes/phase-1-coverage-baseline.txt`. This is the floor; the phase exit requires this coverage to grow to 100% for statistics + parsers + converters.
7. Copy `src/assets/PMTools_how_to_use.pdf` formulas into a cheatsheet at `src/__tests__/fixtures/THESIS_FORMULAS.md` so test authors can cite them without reopening the PDF.
8. **Gather real fixtures**: copy every real file matching each parser's format from `test-data/`, `test-data/v2.6.*/`, `src/assets/examples/`, `.claude/issues/*` into the matching `parsers/<format>/real/` directory. Then ask Ivan for any additional private samples (target 3–11 real files per format).
9. Format-specific fixture sourcing:
   - `.rs3`: write a synthetic file from the format spec **first** (unblocks the parser test suite), then add real files when sourced. Do not block the phase on a real `.rs3`.
   - `.mdir`: deprecated; build synthetic from spec to lock current behavior, mark legacy in `SOURCE.md`. No real-file requirement.

## Extraction Refactors (before writing tests for these modules)

These extractions unblock testing of tangled modules. Each is its own commit, verified by `npm run verify && npm run build`. **No behavior change** for the pure-move refactors (#1–#3). The `conglomeratesTest` `alert()` removal (#4) is a small **behavior-preserving** change — the call site shows the alert instead — and is committed separately from the pure moves.

### 1. `src/utils/statistics/calculation/eigManipulations.ts`
- Replace `normalizeEigenValues(eigen)` (in-place mutation) with a pure version that returns a new object.
- Update `sortEigenvectors` to be pure.
- Update all call sites.

### 2. `src/utils/statistics/PMTests/foldTestBootstrap.ts`
- Extract the pure unfolding algorithm into `foldTestCore.ts`:
  - `runFoldTest(input: FoldTestInput, rng: () => number): FoldTestResult`
  - Pure, synchronous, deterministic given the same `rng` seed.
- Keep `foldTestBootstrap.ts` as a thin orchestrator that:
  - Calls `runFoldTest` in chunks with `setTimeout` so the UI stays responsive.
  - Handles `React.Dispatch` callbacks and `localStorage` caching.
- **Test only `runFoldTest`.** The orchestrator is glue and will be replaced by a Web Worker in Phase 7.

### 3. `src/utils/statistics/PMTests/reversalTestBootstrap.tsx`
- Extract `bootstrapCommonMeanTest(dataA, dataB, numberOfSimulations, rng)` into `reversalTestCore.ts` as a pure function.
- Keep the `.tsx` file as a thin async wrapper for React.Dispatch callbacks.
- Optional: rename `.tsx` → `.ts` (nothing renders JSX).

### 4. `src/utils/statistics/PMTests/conglomeratesTest.ts` (small behavior-preserving change)
- Remove `alert()` call. Return an error object `{ ok: false, reason: string }` instead.
- Update the one call site to show the alert in UI land.
- This is **not** a pure relocation — it's a tiny behavior-preserving refactor. Commit separately from #1–#3 with `refactor(conglomerates): lift alert to UI boundary`. Visual regression tests (Phase 2) will catch any UX regression.

## Execution Order

Every step ends with `npm run verify && npm test -- --watchAll=false && npm run build` passing.

### Step 0 — Prerequisites
See above.

### Step 1 — Easy-to-test statistics (pure, simple I/O)
Each gets thesis formula tests + 2–3 PmagPy parity cases + property-based tests + literature cases.

1. `calculateFisherMean` (aliased `fisherMean`) — thesis (1.4), (1.5); Fisher 1953 Table 2; property: Fisher mean of N copies of direction X == X.
2. `calculateVGP` — Butler chapter 7 worked example; Tauxe worked example.
3. `calculateButlerParameters` — trivial math, 5 literature cases.
4. `calculateMCFaddenIncMean` — McFadden 1988 examples.
5. `calculateBasicStatisticalParameters` — composite; verify via component parts.
6. `reversalTestOldFashioned` — thesis §1.4.2; McFadden & McElhinny 1990.
7. `getRawPlaneData` — geometric property tests (great circle through two points).

### Step 2 — Testable-with-fixtures statistics

1. **`calculatePCA_pmd` — HIGHEST PRIORITY**. Core of the PCA page. Tests must cover thesis formulas (1.1) vector MAD, (1.2) great-circle MAD, (1.3) covariance matrix H. Include regression case for the v2.6.3 MAD=0 bug fix (fixture captured from `test-data/v2.6.3/`).
2. `calculatePCA_dir`.
3. `calculateFisherMean` (IDirData wrapper).
4. `calculateMcFaddenCombineMean` — McFadden 1988.
5. `calculateCutoff` — Vandamme paper reference.
6. `bootstrapManipulations` — **requires seeded RNG**; fixture is deterministic output for seed 42.
7. `reversalTestClassic`.
8. `conglomeratesTest` — after `alert()` removal; thesis §1.4.2 reduces to Watson randomness test.

### Step 3 — Extracted pure cores (from the three tangled files)

1. `runFoldTest` — thesis (1.12) scatter matrix T; McFadden 1990 fold test reference dataset; seeded.
2. `bootstrapCommonMeanTest` — thesis §1.5.1 modified common mean test; seeded.
3. `normalizeEigenValues`, `sortEigenvectors` (pure versions) — algebraic property tests.

### Step 4 — Parsers

One test suite per parser. **Each suite iterates over both `real/` and `synthetic/` fixture directories** — every real file is parsed and asserted against its `.expected.json`, then every synthetic edge case is parsed and asserted. No `it.skip` allowed without a written justification in `SOURCE.md`.

Per-parser coverage target: 100% lines, 100% branches. If a branch can't be reached by real or synthetic input, it's dead code — delete it.

1. `parserPMD` — every real `.pmd` we have + full synthetic matrix (empty, header-only, single-step, BOM, CRLF/LF, Russian decimal comma, Windows-1251, trailing whitespace, extreme numeric values, malformed shapes).
2. `parserDIR` — every real `.dir` (including `field_batch.dir`, `sample.dir`, `malformed.dir`, `invalid_rows.dir`, `all_invalid.dir`) + full synthetic matrix including paired-G variant.
3. `parserCSV_PMD`, `parserCSV_DIR`, `parserCSV_SitesLatLon` — real CSVs from `test-data/lab_results.csv` and any others + synthetic separators (comma, semicolon), quoted fields, empty cells, encoding variants.
4. `parserXLSX_PMD`, `parserXLSX_DIR`, `parserXLSX_SitesLatLon` — real `.xlsx` files Ivan provides + synthetic generated via `xlsx` lib (multi-sheet, empty sheet, formula cells, date cells, hidden columns).
5. `parserPMM` — real `.pmm` (`season1_north.pmm`, `season1_south.pmm`, `season2_extra.pmm`, `exampleDIR.pmm`) + synthetic.
6. `parserSQUID` — real `.squid` from `test-data/406c.squid` and `.claude/issues/*` (`a11-19.squid`, `10bg136b.squid`, `406c.squid`) + synthetic edge cases including the throws-on-empty/invalid paths.
7. `parserRS3` — synthetic-from-spec covers all branches (unblocks the test suite); real files added to `real/` as soon as they're sourced. Both layers are required for this parser to be considered tested.
8. `parserMDIR` — deprecated; synthetic-only test suite that locks current behavior so the parser can be safely removed in a future cleanup. Document the legacy status in `SOURCE.md`.

### Step 5 — Converters (round-trip tests)

For each format with both parser and converter, run two layers:
- **Real round-trip**: every file in `parsers/<format>/real/` round-trips: `parse(file) → serialize → parse → deep-equal original parsed`.
- **Synthetic round-trip**: every file in `parsers/<format>/synthetic/` round-trips the same way.

If a real file does not survive round-trip, that's a converter bug (or a parser bug); fix it as `fix(science):` with the failing fixture as the regression test.

- `toPMD` ↔ `parserPMD`
- `toDIR` ↔ `parserDIR`
- `toCSV_PMD`, `toCSV_DIR`, `toXLSX_PMD`, `toXLSX_DIR`, `toPMM`
- `toVGP`, `toCSV_VGP`, `toXLSX_VGP`, `toGPML` — forward-only (no VGP parser). For these, snapshot-test the serialized output against committed golden snapshots produced from real DIR fixtures and a full synthetic input matrix.

### Step 6 — Graph projections (math only, not SVG)

- Zijderveld orthogonal projection: data point → (x, y) pairs for horizontal and vertical planes. Thesis §1.1, figures 1.3, 1.4.
- Stereographic equal-area projection: direction → (x, y) on unit circle, upper vs lower hemisphere. Thesis §1.2, figure 1.5.
- Coordinate transformations: specimen ↔ geographic ↔ stratigraphic.
- Reference: Butler appendix B.

### Step 7 — CI integration verification

- Confirm the GitHub Actions run picks up the new `npm test` step and all tests pass.
- Fix any flakes by root cause (likely non-seeded randomness), never by disabling.

## Exit Criteria

Phase 1 is complete when all of:

- [ ] Every formula listed in `PMTools_how_to_use.pdf` chapter 1 has at least one test citing its formula number.
- [ ] Every file in `src/utils/statistics/calculation/` has a test suite with ≥1 PmagPy parity case and ≥1 thesis-formula or literature case.
- [ ] Every file in `src/utils/statistics/PMTests/` has a test suite with documented reference data.
- [ ] Every parser in `src/utils/files/parsers/` has a test suite that exercises **every real fixture** in its `real/` directory **and** the full synthetic edge-case matrix in its `synthetic/` directory.
- [ ] Every converter in `src/utils/files/converters/` has a round-trip test against both real and synthetic fixtures.
- [ ] All graph projection functions in `src/utils/graphs/` have math tests.
- [ ] `fast-check` property tests exist for: Fisher mean idempotence, PCA on colinear data, VGP roundtrip, Fisher-VGP composition.
- [ ] CI runs `npm test -- --watchAll=false` and fails the build on any test failure.
- [ ] `npm run verify && npm test && npm run build` all green.
- [ ] Any scientific bugs found during verification are fixed in separate commits labeled `fix(science):` with the test that caught them.
- [ ] `src/__tests__/fixtures/` tree is fully populated and documented (including `real/` and `synthetic/` subtrees per parser).
- [ ] **100% line + branch coverage** for `src/utils/statistics/` and `src/utils/files/parsers/` and `src/utils/files/converters/`. Any unreachable line is deleted as dead code, not exempted.
- [ ] Coverage report committed alongside the phase exit so the floor is visible to Phase 4 (which must not let it drop).

## Critical Files

### Files to read (not modify)
- `src/assets/PMTools_how_to_use.pdf` — authoritative formula reference.

### Files to modify
- `.github/workflows/react-build-and-deploy.yml` — add test step.
- `package.json` — add `fast-check`, `seedrandom` devDependencies.
- `src/utils/statistics/calculation/eigManipulations.ts` — pure refactor.
- `src/utils/statistics/PMTests/foldTestBootstrap.ts` — extract core.
- `src/utils/statistics/PMTests/reversalTestBootstrap.tsx` — extract core.
- `src/utils/statistics/PMTests/conglomeratesTest.ts` — remove `alert()`.
- All call sites of the above (found via grep).

### Files to create
- `src/utils/statistics/PMTests/foldTestCore.ts`
- `src/utils/statistics/PMTests/reversalTestCore.ts`
- `src/__tests__/helpers/directionFixtures.ts`
- `src/__tests__/helpers/mathMatchers.ts`
- `src/__tests__/helpers/seededRng.ts`
- `src/__tests__/fixtures/THESIS_FORMULAS.md` — cheatsheet of thesis formulas.
- `src/__tests__/fixtures/**` — full tree.
- `scripts/generate_fixtures.py` + `scripts/README.md`
- One `*.test.ts` file per module tested.

### Files to leave alone
- `src/components/`, `src/pages/`, `src/App/` — UI tested in Phase 2.
- `src/services/reducers/` — Redux slices will be replaced in Phase 6.

## Reused Existing Code

- `src/utils/files/__tests__/mergeDir.test.ts` — existing test, use as a style/convention reference.
- `src/setupTests.ts` — already imports `@testing-library/jest-dom`, no changes.
- `test-data/` — **copy (not symlink — cross-OS)** real files into `src/__tests__/fixtures/`.
- `src/assets/examples/examplePCA.pmd` + `exampleDIR.pmm` — additional golden inputs.
- `src/utils/graphs/classes/Direction.ts` — already pure, use directly.
- `src/assets/PMTools_how_to_use.pdf` — formula reference (use via cheatsheet copy, not re-extracted).

## Verification

After each step:
```bash
npm run verify
npm test -- --watchAll=false
npm run build
```

After the phase overall:
```bash
npm test -- --watchAll=false --coverage
# Coverage MUST show 100% line + branch for:
#   src/utils/statistics/
#   src/utils/files/parsers/
#   src/utils/files/converters/
# Anything below 100% blocks the phase exit. Unreachable lines are deleted, not exempted.
```

Manual verification of scientific findings:
- Review any `fix(science):` commits with a domain expert.
- Cross-check at least 3 PmagPy-parity fixtures by hand against the thesis formulas.

## Risks

| Risk | Mitigation |
|---|---|
| PmagPy produces different output than PMTools or the thesis formula on a real file | Investigate every delta. Either PMTools has a bug (commit as `fix(science):`) or different documented convention (note in `SOURCE.md`). |
| Bootstrap tests flaky due to RNG | Mandatory seeded **integer** PRNG in all bootstrap tests. No `Math.random()` directly. |
| Extraction refactors silently change behavior | Golden-master snapshot BEFORE refactoring, then refactor, then assert snapshot still matches. |
| `.rs3` real file missing | Synthetic fixture from spec unblocks the parser test suite immediately. Real files added to `real/` subdir as soon as sourced — phase does not wait. |
| 100% coverage gate is hard for parsers with rarely-triggered branches | Either build the synthetic input that triggers the branch, or delete the branch as unreachable. Both are acceptable; "exempt" is not. |
| Scope creep into Phase 4 (full extraction) | Strict boundary: only the 3 named tangled files get extracted here. All other extractions wait for Phase 4. |
| Thesis formula differs from live code | Treat as a bug in the code — the thesis is the spec. Fix in a `fix(science):` commit unless there is a documented reason the code intentionally deviates. |

## Estimated Commits

~30–50 commits over the phase, grouped by module. Each commit passes `npm run verify && npm test && npm run build`.
