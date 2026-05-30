# Part A — Remaining PR Plan

> Companion to [part-a-overview.md](part-a-overview.md) (read that first for the "why").
> This is the step-by-step for a future session. Total Part A = ~6 PRs; **1 and 2 are
> merged**, so 3–6 remain.

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
  `runFoldTest(input, rng)` core first.
- `PMTests/ReversalTest/reversalTestBootstrap.tsx` — RNG + Dispatch. Extract
  `bootstrapCommonMeanTest(...)`.
- `bootstrapManipulations.ts` — randomness. Inject a seeded integer RNG
  (`src/test-utils/seededRandom.ts` exists).
- `PMTests/ConglomeratesTest/conglomeratesTest.ts` — calls `alert()`. Lift the alert to
  the UI boundary first (roadmap refactor #4), then it's pure.

**Also worth a small cleanup PR (optional):** migrate the three *old-style* parser tests
that predate the harness — `parserPMD.test.ts` (248 lines), `parserDIR.test.ts` (110),
`parserSQUID.test.ts` (90) — onto `describeParserReferenceOutput` for consistency. Caveat:
they encode the D1/D3/D5 regression intent as *targeted* assertions, not plain snapshots;
converting to golden snapshots loses that intent unless you keep a couple of focused
assertions alongside. Judgment call — do it only if the consistency is worth it.

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
