# Part A — Remaining PR Plan

> Companion to [part-a-overview.md](part-a-overview.md) (read that first for the "why").
> **Status (2026-05-31): PRs 1–6 + Layer A all merged.** The final piece — locking
> `parsePMD` (PR 7, branch `phase-1/parserpmd-reference-output`) — closes the parser
> surface and the Part A Definition of Done. The PR-3/4/5/6 sections below are kept as the
> as-built record. The only remaining Part-A-adjacent work is the explicitly-deferred
> tangled computations (see the bottom section) and the still-open D3 fix (PR #36), which
> PR 7 leaves as a clean reference-flip.

## Conventions every PR follows

- Branch from `dev` (`git checkout dev && git pull`), PR back to `dev` as a **draft**.
  One PR at a time — open, stop, wait for review.
- Reuse the harness in [`src/test-utils/referenceFixtures.ts`](../../../src/test-utils/referenceFixtures.ts).
  Don't hand-write the read/parse/compare loop.
- Fixtures go under `src/__tests__/fixtures/...`. `.prettierignore` already excludes that
  tree so regenerating references never breaks `format:check`.
- A fixture's **filename is load-bearing** for parsers that echo their `name` arg into the
  output (PMM → `name`, RS3 → `metadata.name`): renaming a fixture changes its expected
  output, so regenerate the reference after any rename. Keep names descriptive and stable.
- Generate references with `UPDATE_FIXTURES=1 npm test -- --watchAll=false <pattern>`,
  then **eyeball the `.expected.json`** before committing. Re-run WITHOUT the env var to
  prove they pass.
- Verify each PR: `npm run verify` (typecheck+lint+format) and `npm run build` must be
  clean. `npm test -- --watchAll=false` green.
- **Lock behavior as-is.** Found a bug? Record in
  [notes/found-bugs-todo.md](notes/found-bugs-todo.md); do not fix it in the test PR.
- The pre-commit hook (lefthook/lint-staged) reformats staged files and can try to stage
  extras — `git add` only the exact paths you mean; check `git show --name-only HEAD`
  after committing.

---

## PR 3 — XLSX parsers (×3)

**Files to test:** `parserXLSX_PMD`, `parserXLSX_DIR`, `parserXLSX_SitesLatLon`
(each is a thin wrapper: `XLSX.read(ArrayBuffer)` → `xlsx_to_csv` → the matching CSV parser).

**Key difference from PR 1–2:** input is binary (`ArrayBuffer`), not a UTF-8 string. The
harness already supports this via the `readInput` hook:

```ts
import parseXLSX_PMD from '../parsers/parserXLSX_PMD';
import { readFileSync } from 'fs';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

describeParserReferenceOutput({
  parser: parseXLSX_PMD,
  fixtureDirectory: 'xlsx_pmd',
  readInput: (absolutePath) => readFileSync(absolutePath), // Buffer/ArrayBuffer, not utf8
});
```
(Check that `XLSX.read` accepts a Node `Buffer` with `{type:'array'}`/`'buffer'`; the
parser currently does `new Uint8Array(data)` then `XLSX.read(..., {type:'array'})`, so a
Buffer should work — verify, adjust the reader to pass `data.buffer` if needed.)

**Fixtures:** no real `.xlsx` exist on disk (users export them on demand). Two options:
1. Generate small `.xlsx` files with the `xlsx` lib in a one-off script (multi-sheet,
   empty sheet, etc.), commit them as synthetic.
2. Better "real": generate via a PMTools export run (Playwright) — load real PMD/DIR data,
   click export, capture the produced `.xlsx`. This is the same deferred export-run that
   PR 1's `csv_pmd/real/` and sites CSVs need; doing it once yields real CSV + XLSX
   fixtures together. If the export run is more than ~30 min of fuss, ship synthetic now
   and add real ones in a tiny follow-up PR.

**Watch for:** `.gitignore` may ignore `.xlsx` — `git add -f` if so (PR 1 hit this with a
test file). Binary fixtures won't be prettier-touched (already ignored).

> **As built (PR 4):** shipped golden snapshots for **all 11** converters, **no** round-trip
> tests. The round-trip preferred above turned out non-exact for every matching pair — the
> committed goldens themselves show why: `toCSV_*`/`toPMM` corrupt comment commas, `toDIR`
> truncates labels to 6 chars, `toVGP` rounds to 2 decimals and drops 2 columns, `toPMM`
> hardcodes provenance. A golden snapshot also locks output *formatting* (what a converter
> regression net must catch), which round-trip does not. Each converter is captured via a
> mocked `download` and locked as `{ filename, type, eol, lines[] }`; `.xlsx` payloads are
> decoded through the same `xlsx_to_csv` bridge the parser uses (reviewable cell text, not
> the non-deterministic zip). Helper: [`src/test-utils/converterFixtures.ts`](../../../src/test-utils/converterFixtures.ts).

---

## PR 4 — Converters (round-trip + forward-only)

**The catch:** every converter is `async` and emits output by calling `download()` (a real
DOM side effect in `src/utils/files/fileManipulations.ts` — creates an `<a>`, sets a Blob
URL, clicks it). They return `void`, not the serialized string. So you must **capture the
download argument**.

**Build one helper first** (in `src/test-utils/`, e.g. `captureDownload.ts`):
```ts
// jest.mock('../utils/files/fileManipulations') so download is a no-op spy,
// call the async converter, return (download as jest.Mock).mock.calls[0][0]
export const captureDownload = async (run: () => Promise<void>): Promise<string | ArrayBuffer> => { ... }
```
Pin any non-deterministic header fields (dates) before snapshotting, mirroring
`PINNED_CREATED`.

**Two test styles:**

- **Round-trip** (preferred, no golden file needed) — `parse(serialize(parsed))` deep-equals
  `parsed`. Works for the 7 converters that have a matching parser:
  `toPMD↔parserPMD`, `toCSV_PMD↔parserCSV_PMD`, `toXLSX_PMD↔parserXLSX_PMD`,
  `toDIR↔parserDIR`, `toPMM↔parserPMM`, `toCSV_DIR↔parserCSV_DIR`, `toXLSX_DIR↔parserXLSX_DIR`.
  Feed the parsed fixtures we already committed in PR 1–3.
  - Note: round-trip may **not** be exact (converters reformat numbers, drop comment
    commas, etc.). Where it isn't, fall back to a golden snapshot of the serialized string
    and record the asymmetry in found-bugs-todo.md.
- **Forward-only golden snapshot** — for the 4 VGP-family converters with no parser:
  `toVGP`, `toCSV_VGP`, `toXLSX_VGP`, `toGPML`. Capture the serialized output and compare
  to a committed golden. `toGPML` is XML — watch for embedded timestamps/ids to pin.

**Files:** `converters/pmd.ts` (toPMD, toCSV_PMD, toXLSX_PMD), `converters/dir.ts`
(toDIR, toPMM, toCSV_DIR, toXLSX_DIR), `converters/vgp.ts` (toVGP, toCSV_VGP, toXLSX_VGP,
toGPML). `index.ts` is just re-exports — no test.

---

## PR 5 — Simple pure stats

All deterministic, plain inputs → plain objects, numbers a scientist can eyeball. Build
small hand-authored input fixtures (JSON) + references. These are pure functions, so the
test is `import → call → compare`, no file reading needed (or a JSON-input variant of the
harness).

| Function | File | Input shape |
|----------|------|-------------|
| `calculateFisherMean` | calculation/calculateFisherMean.ts | `Direction[]` |
| `calculateVGP` | calculation/calculateVGP.ts | site lat/lon + dec/inc |
| `calculateButlerParameters` | calculation/calculateButlerParameters.ts | a95 + inclination |
| `calculateBasicStatisticalParameters` | calculation/calculateBasicStatisticalParameters.ts | `Direction[]`/vectors |
| `getRawPlaneData` | calculation/getRawPlaneData.ts | two great-circle endpoints |
| `calculateCutoff` | calculation/calculateCutoff.ts | `VGP[]` with paleolat |

Optional easy add: `PMTests/FoldTest/foldTestClassic.ts` (8 lines, pure McElhinny ratio).

Consider a thin `describeComputationReferenceOutput` helper (input JSON file → result
JSON) so PR 5/6 stay as terse as the parser tests. Test-utils already has
`directionFixtures.ts` and `mathMatchers.ts` scaffolding to lean on.

---

## PR 6 — PCA / matrix / McFadden core

The numerically sensitive heart of the app — the highest-value behavior to lock before
any refactor. Group the matrix/eig dependencies with their PCA consumers.

| Function | File | Input shape | Note |
|----------|------|-------------|------|
| `calculatePCA_pmd` | calculation/calculatePCA_pmd.ts | PMD step vectors (x,y,z)[] | core line/plane fit |
| `calculatePCA_dir` | calculation/calculatePCA_dir.ts | directions[] | |
| matrix helpers | matrix.ts | number[][] | underpins PCA |
| `eigManipulations` | eigManipulations.ts | eigen object | **clone input** — `normalizeEigenValues` mutates in place (refactor target; lock via clone now) |
| `calculateMCFaddenIncMean` | calculation/calculateMCFaddenIncMean.ts | inclinations[] | iterative, deterministic |
| `calculateMcFaddenCombineMean` | calculation/calculateMcFaddenCombineMean.ts | directions + great circles | iterative, deterministic |

Real-input option: feed `calculatePCA_pmd` the parsed `examplePCA.pmd` / `sample.pmd`
step subsets so the reference is a real demagnetization fit, not a toy.

---

## Deferred — NOT part of the 6 (need a refactor or seeded RNG first)

These are tangled (touch React.Dispatch / timers / randomness / `alert()`). Each needs a
small extraction before it can be cleanly reference-tested — that extraction is itself a
separate `refactor(...)` PR (the roadmap's Step 3), and these belong to a later batch, not
Part A's 6.

- `PMTests/FoldTest/foldTestBootstrap.ts` — timers + RNG + Dispatch. Extract a pure
  `runFoldTest(input, rng)` core first. **Partially covered now via "Layer A"** (see the
  layered strategy below): the randomness-free inner functions `findBed` + `unfold` are
  already exported and locked (`fixtures/computations/fold_unfold/*`) with a PmagPy
  cross-check that **uncovered a real bug** (90° bedding-convention error → wrong
  best-unfolding %; see found-bugs-todo "Surfaced in Layer A").
- `PMTests/ReversalTest/reversalTestBootstrap.tsx` — RNG + Dispatch. Extract
  `bootstrapCommonMeanTest(...)`. Layer A candidate: lock any pure inner helper now.
- `bootstrapManipulations.ts` — randomness. Inject a seeded integer RNG
  (`src/test-utils/seededRandom.ts` exists).
- `PMTests/ConglomeratesTest/conglomeratesTest.ts` — calls `alert()`. Lift the alert to
  the UI boundary first (roadmap refactor #4), then it's pure.

### Layered strategy for randomized tests (fold / reversal / bootstrap)

The bootstrap tests look untestable because their output is random — but the randomness is
a thin shell around a deterministic kernel. Three layers, in priority order:

- **Layer A — lock the deterministic core now (no refactor).** The per-sample math
  (`findBed` + `unfold` for the fold test; the eigen/Tmatrix work) is pure and
  randomness-free — it just needs `export`. Golden-master it **and** cross-check it against
  PmagPy on the *same fixed input* (no RNG → exact comparison is possible). This is where
  most of the science and most of the refactor risk lives. **Done for the fold test** — and
  it immediately paid off: the PmagPy cross-check found the bedding-convention bug a plain
  golden-master would have silently enshrined. Do the same for the reversal/conglomerate
  cores.
- **Layer B — seed the RNG, then golden-master the whole pipeline.** Needs the Step-3
  extraction (`runFoldTest(input, rng)` with an injected seeded RNG; `seededRandom.ts`
  exists). Same seed + input → identical output every run *and* across a future
  web-worker/Rust port, so it guards "did my refactor change behavior". Fixtures live under
  `src/__tests__/fixtures/fold_test/` (reserved for exactly this).
- **Layer C — cross-check against PmagPy statistically.** You can't byte-match PmagPy across
  languages (different RNG streams), but bootstrap confidence intervals converge: run both
  with large N and assert the 95 % bounds agree within a calibrated tolerance. This is a
  property/statistical test (loose tolerance), distinct from the Layer A/B golden-masters —
  it validates "our science agrees with the field standard" without identical draws.

Key point: execution substrate (JS / worker / Rust) is irrelevant to all three — the
deferral is about **non-determinism + impurity** (`Math.random` + Dispatch/timer/localStorage
baked into the function), not about how the code runs. Layer A is the cheapest, highest-value
slice and does not wait on Step 3.

**Also worth a small cleanup PR (optional):** two *old-style* parser tests still predate the
harness — `parserDIR.test.ts` (110 lines) and `parserSQUID.test.ts` (90) — and could move onto
`describeParserReferenceOutput` for consistency. (`parsePMD` is now on the harness — PR 7. The
248-line `parserPMD.test.ts` referenced earlier never lived on `dev`; it is the targeted D3 test
on the open PR #36 branch, which stays as the science-fix test.) Caveat: the two remaining
old-style tests encode the D1/D5 regression intent as *targeted* assertions, not plain
snapshots; converting to golden snapshots loses that intent unless you keep a couple of focused
assertions alongside. Judgment call — do it only if the consistency is worth it. When migrating,
note `parserDIR` returns the `ParseResult` wrapper, so the harness's `pinCreated` (generalized in
PR 7) already handles its nested `data.created`; `parserSQUID` returns bare `IPmdData` (top-level
`created`, the common case).

**Optional integration-level goldens (low priority):** `calculateStatisticsPMD`,
`calculateStatisticsDIR` (orchestrators), and the two `rawStatistics*ToInterpretation`
formatters in `statistics/formtatters/` (note the misspelled dir name).

---

## Definition of done for Part A

Every parser (except `parserMDIR`, out of scope), every converter, and every *pure*
computation in `src/utils/statistics/` has a reference-output test. Tangled computations
are explicitly deferred with a written reason. `npm test`, `npm run verify`, `npm run
build` all green on `dev`. At that point refactors (UI migration, Vite, Zustand, etc.)
have a safety net and can proceed incrementally — and Job B (scientific verification) can
be layered on lazily, one formula at a time, without ever blocking.
```
