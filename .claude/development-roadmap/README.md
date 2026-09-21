# PMTools 2.0 — Development Roadmap

This directory tracks the long-term modernization plan for PMTools 2.0. Each phase has its own file with detailed scope, execution plan, and exit criteria. Phases are executed sequentially, but later phases may be refined as earlier ones complete.

## Overarching Goals

- **Scientific correctness — NASA-grade**: every computation in `utils/statistics/` must be verified against external sources of truth (PmagPy, published literature, the PMTools thesis). Cost of a wrong number is a retracted paper. There is no acceptable failure mode where a calculation is "probably right" — coverage of computations and parsers must reach 100%.
- **Maintainability**: decouple scientific logic from UI framework so the core can survive multiple frontend rewrites.
- **Performance**: move heavy bootstrap/Monte-Carlo computations off the main thread (workers first, then Rust+WASM where measured to be worth it). Render performance for graphs with hundreds of points must stay smooth.
- **Minimum dependencies**: prefer custom components and small utilities over large frameworks. **No MUI (being replaced by our own UI kit, see 3a). No Tailwind. No TanStack. No DataGrid library — tables are written by hand on top of native HTML table elements.**

## Phases

| # | Phase | Status | Doc |
|---|---|---|---|
| 1 | Comprehensive testing & scientific verification | **Part A done** (reference-output regression net, PRs #37–#45, June 2026). Part B (scientific verification against the thesis/PmagPy) runs lazily, one formula at a time, and never blocks other phases | [part-a-overview.md](part-a-overview.md), [01-testing.md](01-testing.md) |
| 2 | Screenshot / visual regression tests | Planned | [02-visual-tests.md](02-visual-tests.md) |
| 3a | **Custom UI kit** — build it first, in isolation, with a showcase route and snapshot tests | Planned, **next UI work** | [03a-ui-kit.md](03a-ui-kit.md) |
| 3b | Migrate the app onto the kit, delete MUI/Emotion | Planned | [03-ui-migration.md](03-ui-migration.md) |
| 4 | Isolate all computations into `src/core/` | Planned | [04-extract-computations.md](04-extract-computations.md) |
| 5 | Isolate graph components into `src/graphs/` | Planned | [05-graph-library.md](05-graph-library.md) |
| 6 | Architecture rewrite (Vite, Vitest, Zustand, React 18→19, Oxlint/Oxfmt) | Planned | [06-architecture.md](06-architecture.md) |
| 7 | Computation optimization (workers → WASM/Rust if needed) | Planned | [07-performance.md](07-performance.md) |

## Execution Order Notes

- **Phase 1 Part A is the foundation and it is done**: every parser (except MDIR), converter and pure computation has a reference-output test. The old gate ("nothing starts until 100% scientific verification") is lifted; see [part-a-overview.md](part-a-overview.md). Known-but-locked bugs are queued in [notes/found-bugs-todo.md](notes/found-bugs-todo.md) and tracked in `.claude/progress.json`.
- **Phase 3a (the UI kit) does not wait for Phase 2**: the kit is new code with no regressions to protect, and its showcase route becomes the first deterministic screenshot target. Phase 2 must cover the *app pages* before 3b (migration) starts.
- **Phase 4 is partially done inside Phase 1**: the three tangled files (`foldTestBootstrap`, `reversalTestBootstrap`, `eigManipulations`) get their pure cores extracted as a prerequisite for testing them. The rest of the computation isolation work happens after Phase 3.
- **Phases 4 and 5 are in-repo only**: `src/core/` and `src/graphs/` are dedicated directories inside the PMTools repository. No npm packages, no monorepo, no separate repos. Any future library extraction is a separate decision beyond this roadmap.
- **Phase 6 is split internally**: CRA → Vite + Vitest comes first; React 18 next; Zustand after that; React 19 and Oxlint/Oxfmt last.
- **Phase 7 must be measurement-driven**: benchmark first, decide between Web Workers (likely sufficient) and Rust+WASM (only for hot loops that survive profiling).

## Hard Rules

- Do NOT upgrade React without explicit approval (currently pinned at 17, see `CLAUDE.md`). Phase 6 is the explicit approval window.
- Do NOT modify scientific logic without explicit approval. Tests verify it; changes to the math require domain review.
- `src/assets/PMTools_how_to_use.pdf` (Ефремов 2022, the author's thesis) is the **authoritative spec** of every formula PMTools implements. When code and thesis disagree, the thesis wins unless there is a documented intentional deviation.
- Test fixtures (`.expected.json` golden values) are scientific capital — they migrate between test files across refactors, they are never regenerated without justification.
- Coverage for `src/utils/statistics/` (later `src/core/statistics/`) and all parsers must reach **100%** — no skipped lines, no untested branches. NASA-grade rigor; "good enough" is not good enough for science software.
- Test data: every parser uses **all real-world fixtures we have** (from `test-data/`, `src/assets/examples/`, `.claude/issues/*`, plus any private samples Ivan adds) **plus** an exhaustive set of synthetic edge-case fixtures. Real files alone are not enough; synthetic fixtures alone are not enough.
- `CI=false` in the build script must NOT be removed until Vite migration (Phase 6a) replaces CRA entirely. CRA treats warnings as errors in CI; `CI=false` is the workaround.
- All roadmap documents are written in English.
- **No Tailwind CSS** under any circumstances.
- **No new MUI imports** once `src/ui-kit/` exists; app code imports UI only from `src/ui-kit`. Radix (headless) is allowed *inside* the kit only if the open decision in [03a-ui-kit.md](03a-ui-kit.md) lands that way.
- **No TanStack libraries** under any circumstances. Tables, virtualization, query state — all hand-written on top of plain HTML or with a tiny single-purpose dependency.
- `src/core/` is in-repo only. No publishing to npm, no monorepo, no separate package. Future library extraction is out of scope for this entire roadmap.

## Working with agents

The agent harness (subagents in `.claude/agents/`, hooks in `.claude/settings.json` + `.claude/hooks/`, saved workflows in `.claude/workflows/`, the cross-session ledger `.claude/progress.json`) is described in [docs/agentic-workflows.md](../../docs/agentic-workflows.md). Every roadmap item is mirrored as a ledger entry; agents update the ledger, humans read it.
