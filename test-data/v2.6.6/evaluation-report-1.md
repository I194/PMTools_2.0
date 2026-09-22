# Evaluation Report — PMTools v2.6.6

Date: 2026-09-22
Branch: `fix/sci-01-fold-test-unfold-axis`
Scope: SCI-01 verification prompt (`test-data/v2.6.6/verify-fixes.md`), sections 1–5 — bootstrap fold
test 90-degree unfold-axis error + `findBed` dip normalization for vertical/overturned beds.
Comparison baseline: `dev` @ `c979320`, served from a separate git worktree (no working-tree changes).

## Environment

| Item | Value |
|------|-------|
| Branch under test | `fix/sci-01-fold-test-unfold-axis` (HEAD `a799adf`) |
| "After" server | fresh `npm start` from the working tree, `localhost:3002`, nav shows **V2.6.6** |
| "Before" server | `dev` @ `c979320` in a git worktree, `localhost:3001`, nav also shows V2.6.6 (dev already carries the version bump; it does **not** carry the fold-test fix) |
| Pre-existing server on :3000 | running, but its nav reads **V2.6.5** — `REACT_APP_VERSION` was baked when it was started, before the version bump. Code is hot-reloaded and current; only the displayed version string is stale. All measurements below were taken on the fresh :3002 server to avoid any doubt. |
| Browser | Chromium via Playwright, 1700x1100, dark theme (app default) |

## Important note on the acceptance criterion

The prompt asks for "the best-unfolding percentage on the first result line". **The UI never renders a
single best-unfolding percentage.** `FoldTestContainer.tsx` renders the 2.5th and 97.5th percentiles of
the 1000 bootstrap optima on line 1 and the min/max on line 2:

```
{`${unfoldingMinimun} — ${unfoldingMaximum}`}   // line 1: 95 % CI of the bootstrap optima
{`${Math.min(...untilts)} — ${Math.max(...untilts)}`}  // line 2: full range
```

So the readable evidence is (a) the 95 % CI on line 1 and whether it brackets the oracle value, and
(b) the peak position and height of the tau1 curve. Both are reported below, and both are cross-checked
against `sci-01/oracle.json`. This is recorded as Bug 1 (UX gap), not as a fix failure.

---

## Section 1 — Two-limb fold (`two_limb_fold.dir`) — **PASS**

Load check: table shows **18 directions** (S01–S18), no validation-error modal, no console errors.

| Run | Line 1 (95 % CI of bootstrap optima) | Line 2 (full range) |
|-----|--------------------------------------|---------------------|
| 1 | **91 — 106** | 84 — 110 |
| 2 | **91 — 106** | 84 — 111 |
| 3 | **91 — 106** | 85 — 112 |
| 4 (Russian UI) | **91 — 106** | 85 — 110 |
| 5 (light theme) | **91 — 106** | 85 — 111 |

- PmagPy oracle: best untilt **98** on a 1 % grid. The CI 91–106 brackets 98 in every run.
- Nothing is pinned to the −50 / 150 grid edges.
- Graph: tau1 rises monotonically from ~0.68 at −50/0 %, peaks at ~100 %, then falls to ~0.87 at 150 %.
  Cross-check against the oracle: `pmagpy_tau1_at_0_percent = 0.682365` (graph reads ~0.68) and
  `pmagpy_tau1_at_best = 0.968721` (graph peak reads ~0.97). Both match.
- Before (dev): line 1 read **−50 — 150** and **−49 — 150** — the full grid, completely uninformative,
  and the tau1 family was flat/declining with its high point jammed against the right-hand edge.

Screenshots: `sci-01/screenshots/01-two-limb-BEFORE-dev-c979320.png`,
`sci-01/screenshots/02-two-limb-AFTER-fix.png`.

## Section 2 — Overturned limb (`overturned_limb.dir`) — **PASS**

Load check: 18 directions (S01–S18), no validation-error modal.

| Run | Line 1 (95 % CI) | Line 2 (full range) |
|-----|------------------|---------------------|
| 1 | **97 — 106** | 94 — 108 |
| 2 | **96 — 105** | 93 — 111 |
| 3 | **96 — 105** | 93 — 108 |

- PmagPy oracle: best untilt **101**. The CI brackets 101 in all three runs.
- Not near 83 (pre-fix value) and not pinned at 99 (half-fix value).
- Graph: tau1 starts at ~0.77 (oracle `tau1_at_0_percent = 0.767889`), dips to ~0.52 near 30 %, and
  peaks at ~0.97 at ~102 % (oracle `tau1_at_best = 0.968621`). Both match.
- Before (dev): **−3 — 100** and **−4 — 100**, range −50 — 110, tau1 capped at 0.80 with a bimodal
  shape and its maximum near 85 %. This is the case that visibly needed both fixes.

Screenshots: `sci-01/screenshots/03-overturned-BEFORE-dev-c979320.png`,
`sci-01/screenshots/04-overturned-AFTER-fix.png`,
`sci-01/screenshots/05-overturned-loaded-18-directions.png`.

**Table-vs-stereonet cross-check** (done on this file): row 9 reads `Dgeo 299.3 / Igeo −68.5`. Dot 9
plots as an open (up) symbol at azimuth ≈ 299.5° measured clockwise from N and at r/R ≈ 0.24, versus
the equal-area prediction r/R = sin(10.75°)/sin(45°) = 0.264. Consistent within pixel-measurement error.

## Section 3 — Ordinary data and the other three tabs — **PASS (no regression)**

`test-data/sample.dir`, 18 rows loaded.

- Fold test completes, prints both result lines, draws the graph. No `NaN`, no blank panel, no empty
  "—" in either line. Result on this branch: **−50 — −22** (range −50 — −16); on `dev` it was
  **150 — 150** (range 135 — 150). `sample.dir` is not a fold, so both answers are meaningless, but
  the change of sign is exactly the signature of the 90-degree axis correction, and the changelog
  already warns that every tilted collection changes. **Not a regression** — but see Bug 2: an answer
  hard against a grid edge is presented with no caveat.
- Other three tabs: I captured each tab on this branch and on `dev` under identical conditions and
  compared the PNGs byte-for-byte.

| Tab | Before/after screenshots identical? |
|-----|-------------------------------------|
| Reversal Tests (Automatic) — tab render | **identical** (md5 `8c3077d0…`) |
| Reversal Tests (Automatic) — after Run | differs only in the stochastic bootstrap CDF curves; the numeric output is byte-identical (γ: 11.23, γ critical: 3.15, Class: −) on both |
| Reversal Test (manual input) — render | **identical** (md5 `4894c617…`) |
| Reversal Test (manual input) — after Calculate | **identical** (md5 `fed075d5…`) |
| Conglomerate Test | **identical** (md5 `426d90af…`) |

No regression in any of the three untouched tabs.

- Console: one warning, identical on `dev` and on this branch, therefore pre-existing:
  `Warning: Invalid prop 'error' of type 'object' supplied to 'ForwardRef(FormHelperText)', expected 'boolean'`
  (Reversal Test manual-input form). No fold-test-originated errors or warnings on either server.

Screenshots: `sci-01/screenshots/06-sample-dir-foldtest-AFTER.png`, `07-reversal-auto-AFTER.png`,
`08-reversal-manual-AFTER.png`, `09-conglomerate-AFTER.png`.

## Section 4 — Changelog and languages — **PASS**

The changelog modal auto-opens on `/app/dir` and the **v2.6.6 (current)** entry, dated
September 21, 2026, contains all three required fold-test lines verbatim:

1. "Fold test: fixed a wrong best-unfolding percentage. The test unfolded about an axis 90 degrees away from the fold axis…"
2. "Fold test: fixed fractional unfolding taking the long way round for vertical and overturned beds (dip ≥ 90°)…"
3. "If you ran a fold test in an earlier version, please re-run it…"

Russian round trip: switching to `ru` via the globe menu localises the nav, toolbar
(«ПАЛЕОМАГНИТНЫЕ ТЕСТЫ», «Загрузить файл»), the tests modal («Тест складки (Bootstrap-версия)»,
«Запустить тест») and both fold-test result sentences. The fold test run in the Russian UI gives
**91 — 106**, matching the English runs. Switching back to `en` restores every string; nothing
regressed on the round trip. The changelog body stays English in the Russian UI — as designed, and
reasonable given it is a developer-facing release log; I do not flag it as a defect.

Light/dark: the fold-test modal, result lines and graph all render legibly in light theme after a
theme toggle, and the result (91 — 106) is unchanged.

Screenshots: `sci-01/screenshots/10-changelog-266-en.png`, `11-foldtest-russian-ui.png`,
`12-foldtest-light-theme.png`.

## Section 5 — Verdict

| Section | Verdict | Reading |
|---------|---------|---------|
| 1. Two-limb fold | **PASS** | 91 — 106 (×5 runs), oracle 98 |
| 2. Overturned limb | **PASS** | 97 — 106 / 96 — 105 / 96 — 105, oracle 101 |
| 3. Ordinary data + other tabs | **PASS** | no crash, no NaN; other tabs pixel-identical to `dev` |
| 4. Changelog + languages | **PASS** | all three lines present, RU/EN round trip clean |

Both defects are fixed and no regression was found.

---

## Bug Report

### Bug 1: the fold test never shows the best-unfolding percentage
- **What**: The label says "The densest grouping of vectors (accuracy, 95% confidence interval) is
  observed on:" but only a `min — max` interval is printed. The point estimate — the actual
  best-unfolding percentage, the number a researcher quotes in a paper and the number the SCI-01
  verification prompt asks for — is never displayed anywhere in the UI.
- **Steps**: `/app/dir` → load any tilted DIR file → Paleomagnetic tests → Fold Test → Run.
- **Expected vs Actual**: Expected something like `98 % (91 — 106)`. Actual: `91 — 106` only.
- **Impact on this PR**: the acceptance criterion in `verify-fixes.md` cannot be read literally off the
  screen; I had to verify via the CI and the tau1 peak instead. Worth fixing before the prompt is
  reused.
- **Severity**: major (science-facing; this is the headline number of the test)

### Bug 2: grid-edge answers are presented as if they were real results
- **What**: For `sample.dir` the first line reads `-50 — -22`, i.e. the lower bound sits exactly on the
  −50 search-grid edge. The UI gives no hint that the optimum ran off the end of the searched range.
  On `dev` the same file read `150 — 150`.
- **Steps**: `/app/dir` → load `test-data/sample.dir` → Paleomagnetic tests → Fold Test → Run.
- **Expected vs Actual**: Expected a warning that the optimum is unbounded / the collection is not a
  fold. Actual: a plain number that reads like a valid result.
- **Severity**: minor (pre-existing, not introduced by this PR, but the fix makes edge answers more
  visible because they now change sign relative to previous versions)

### Bug 3: falsy-zero bug in the confidence bounds (code-level, latent)
- **What**: `dataToFoldTest.ts` / `FoldTestContainer.tsx` both compute
  `const unfoldingMinimun = untilts[...] || -50;`. When the 2.5th percentile of the bootstrap optima is
  exactly `0` — a perfectly ordinary outcome for a post-folding magnetisation — the `||` makes it
  display **−50** instead of 0. Same for `|| 150` on the upper bound.
- **Steps**: not reproducible on demand with the supplied data; found by reading the render path while
  cross-checking the displayed numbers.
- **Expected vs Actual**: expected `0`, would display `-50`.
- **Severity**: minor (latent, out of scope for this PR)
- Related fragility in the same two lines: the percentile index is taken from `untilts` and only works
  because `getCDF()` sorts its input **in place**. If `getCDF` is ever changed to sort a copy, both
  bounds silently become garbage.

### Bug 4 (environment, not code): stale version string on a long-running dev server
- **What**: The dev server that was already running on :3000 shows **V2.6.5** in the nav bar and in the
  changelog header, because `REACT_APP_VERSION` is captured at server start. The code it serves is
  current.
- **Severity**: cosmetic — but it can make a reviewer think they are testing the wrong build. Restart
  the dev server after a version bump.

## Data Consistency Issues

None found. Table-vs-stereonet cross-check on `overturned_limb.dir` matched (see Section 2). The tau1
values read off the graph match `oracle.json` at both 0 % and the optimum, for both datasets.

## Shortcut Issues

Not in scope for this run; no hotkey testing was performed.

## Scores (1-5)

| Category | Score | Notes |
|----------|-------|-------|
| Design quality | 4 | Modal, tabs, graph and both themes render cleanly in EN and RU; result lines are colour-coded and readable. Loses a point for the graph panel being an empty grey slab before the first Run. |
| Functionality | 5 | Both fixes verified against the PmagPy oracle on two synthetic folds; the three untouched tabs are pixel-identical to `dev`; the RU/EN and light/dark round trips are clean. |
| Technical quality | 4 | No new console errors or warnings; the 1000-draw bootstrap completes in a few seconds. One pre-existing MUI prop-type warning on the manual reversal tab. |
| UX | 3 | The headline number of the test is not displayed (Bug 1), and grid-edge results are shown without a caveat (Bug 2). Both are pre-existing, and both are now the weakest part of an otherwise correct feature. |

## Priority Fixes

1. Display the best-unfolding point estimate on the first result line, e.g. `98 % (91 — 106)` — Bug 1.
2. Flag results whose optimum or confidence bound lands on the −50 / 150 search-grid edge — Bug 2.
3. Replace `|| -50` / `|| 150` with an explicit `undefined` check in the bound computation, and make
   `getCDF` sort a copy while fixing the now-dependent percentile indexing — Bug 3.
