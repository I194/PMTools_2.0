# Part A — Regression Safety Net (the "what & why")

> Read this first. It's the mental model. The concrete step-by-step is in
> [part-a-pr-plan.md](part-a-pr-plan.md). The deep, original plan is in
> [01-testing.md](01-testing.md) — but see "How this relates to Phase 1" below.

## The problem this fixes

The original Phase 1 ([01-testing.md](01-testing.md)) quietly bundled **two different
jobs** with very different costs, and required both, for every module, before anything
could move forward. That made the plan feel infinite, so it sat untouched for a month.

The two jobs are:

- **Job A — regression safety net.** Lock the *current* behavior so a refactor can't
  change it silently. Cheap: feed a real input, snapshot the output, commit it. It does
  **not** require knowing whether the number is scientifically correct — only that it
  doesn't change unexpectedly.
- **Job B — scientific verification (NASA-grade).** Prove each number is *correct*
  against three external oracles (the thesis PDF, PmagPy, published literature), with
  100% branch coverage, property-based tests, a Python PmagPy harness, hand-checks.
  This is open-ended and can't be finished in spare time by one person.

**Part A is Job A, on its own.** Job B becomes a separate, *optional, never-blocking*
track you do lazily — one formula at a time, when there's a reason to.

The trap in the old plan was a hard gate: "no other phase starts until Phase 1 has
verified scientific correctness and reached 100% coverage." That gate is removed for
Part A. Part A just needs every parser/converter/pure-computation to have a
reference-output test. Then refactors are safe and the rest can happen incrementally.

## What "reference output" means (a.k.a. golden master)

The standard golden-master pattern, named plainly so it isn't jargon:

1. Take an input file (e.g. `season1_north.pmm`).
2. Run the function once; save its output as `season1_north.pmm.expected.json`.
3. Every future test run re-parses and compares against that committed reference.
   Same → green. Different → the test fails and you look at *why*.

It locks **"output didn't change"**, not **"output is correct"**. That's exactly Job A.

**Crucial discipline:** eyeball a reference before committing it. If you lock garbage,
the test faithfully guards garbage. (This is how we caught that `test-data/lab_results.csv`
is actually a DIR file, not a PMD file — the reference output was visibly wrong.)

## The readability contract

The other half of why the old work felt bad: the tests themselves were unreadable
(`parserPMD.test.ts` is 248 lines for a 186-line parser, with bug-fix investigations
baked in). Part A tests obey:

1. Test *code* is tiny and read once; test *cases* are data files reviewed as data.
2. The review surface is the **numbers in `*.expected.json`**, not assertion lines.
3. One shared helper runs the loop, so every parser is tested **identically**.

In practice a parser test is now 3 lines:

```ts
import parsePMM from '../parsers/parserPMM';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

describeParserReferenceOutput({ parser: parsePMM, fixtureDirectory: 'pmm' });
```

The helper lives in [`src/test-utils/referenceFixtures.ts`](../../../src/test-utils/referenceFixtures.ts).
It reads every file in the fixture's `real/` and `synthetic/` dirs, runs the parser,
pins the non-deterministic `created` timestamp, **rounds every float to 7 significant
figures**, and compares to the `.expected.json`. Adding a case = dropping a file into the
fixture dir. Regenerate references (only after an *intentional* behavior change) with
`UPDATE_FIXTURES=1 npm test -- <pattern>`.

The float rounding matters: parsers/computations that derive values via trig
(`Math.sin`/`atan2` — e.g. RS3/SQUID directions, and later PCA/VGP/Fisher) are **not**
bit-identical across platforms (macOS dev vs Linux CI disagree in the ~15th digit).
Locking full-precision floats passes locally but fails CI. 7 sig figs sits ~8 digits above
that noise (residual cross-platform collision ~10^(7-15) ≈ 1e-8 per value) yet is still
~1000× finer than any meaningful precision (~0.1°). This was learned the hard way — a
hotfix after PR #38 merged with a red CI (locked at 10 sig figs, later tightened to 7).
**Lesson: wait for CI green before merging.**

## Hard rule for Part A: lock as-is, don't fix

Part A locks behavior **exactly as it is today, including bugs.** When a reference reveals
something wrong, do **not** fix it in the test PR. Record it in
[notes/found-bugs-todo.md](notes/found-bugs-todo.md) and move on. Bugs get their own
`fix(science):` PR later, where the locking test is flipped to assert the *correct*
output. This keeps each PR small and reviewable — the exact thing that burned the prior
effort.

## Working rules (from the user)

- Branch from `dev`, PR back to `dev`. Never touch `main` directly.
- **One PR at a time.** Open it, stop, wait for explicit review/approval before the next.
- Full descriptive names in code (domain abbreviations like `Dgeo`, `a95` are fine).

## Current status (2026-05-31)

| PR | Scope | Status |
|----|-------|--------|
| 1 | reference-output harness + `parseCSV_PMD` exemplar | **merged** (#37) |
| 2 | `parseCSV_DIR`, `parseCSV_SitesLatLon`, `parsePMM`, `parseRS3` + harness refactor into `describeParserReferenceOutput` | **merged** (#38) |
| 3 | XLSX parsers (×3) | **merged** (#41) |
| 4 | converters (golden snapshots of serialized output, ×11) | **merged** (#42) |
| 5 | simple pure stats (Fisher, VGP, Butler, cutoff, basic-stats, raw-plane; ×6) | **merged** (#43) |
| 6 | PCA / matrix / McFadden core | on branch `phase-1/pca-matrix-mcfadden-reference-output`, pending review |
| A | **Layer A**: fold-test deterministic core (`findBed` + `unfold`) locked + PmagPy cross-check | done locally, uncommitted — follow-up PR after #6 |

After PR 6, the *pure* surface of Part A is done: every parser, converter, and pure
computation has a reference-output test. Tangled computations (bootstrap/fold/reversal
tests, conglomerates) are random + impure and need small refactors first — but they are
**not all-or-nothing**. See the plan's **layered strategy (A/B/C)**: the deterministic
*kernel* of each (e.g. the fold test's `findBed`/`unfold`) can be locked now (Layer A)
without any refactor, the seeded full pipeline later (Layer B), and PmagPy agreement
statistically (Layer C). Layer A for the fold test is already done — and its PmagPy
cross-check **uncovered a real scientific bug** (90° bedding-convention error → wrong
best-unfolding %; found-bugs-todo "Surfaced in Layer A"), proving the cross-check earns its
keep over a plain golden-master.

## How this relates to the old Phase 1

[01-testing.md](01-testing.md) is the original, maximal plan and is still a useful
reference for the science (thesis formula list, oracle strategy, the D1–D5 fixture-sweep
findings). Part A is the *executable subset* of its "lock current behavior" goal, with
the 100%-coverage gate and the three-oracle requirement lifted off the critical path.
Treat 01-testing.md as the encyclopedia; treat these two Part A docs as the to-do list.
```
