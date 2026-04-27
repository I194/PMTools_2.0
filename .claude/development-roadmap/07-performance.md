# Phase 7 — Computation Optimization

## Context

PMTools processes paleomagnetic data entirely in the browser — no server, no backend. Several computations are already known to be painfully slow or even structurally broken:

1. **Bootstrap / Monte Carlo tests** (fold test, reversal test, conglomerates test) run on the main thread, freeze the UI, and can take seconds to minutes on real-world collections. These are algorithmically expensive by design and deserve a native-speed implementation.
2. **Fisher mean and great-circle (GC) computation for stereonet with 200–500 directions** currently causes noticeable lag. More alarmingly, the lag is **cumulative**: the app becomes progressively laggier over the course of a session, and the only workaround is to reload the page and clear localStorage. This is not a "computation is slow" problem — this is a leak of some kind (Redux state bloat, memoization miss, stale `greatCircleCache`, detached DOM nodes, or all of the above). The symptoms fit a classic accumulation bug, and it must be investigated as its own track before any language-level optimization work begins.
3. **Graph rendering** for stereonet / Zijderveld / fold-test plots becomes slow when the number of points climbs into the hundreds — even when the underlying math is fast. React reconciliation over hundreds of `<circle>` / `<path>` nodes, pointer-event handlers per element, and re-renders triggered by unrelated state changes all contribute. This is a separate problem from compute cost and gets its own track.
4. **Other computations across `src/core/`** need a general optimization sweep — not for WASM, but for algorithmic cleanup, better data structures, reduced allocations, and tighter hot loops in JavaScript.

By Phase 7, `src/core/` is pure and portable (Phase 4), workers are trivial to wire, and `src/graphs/` is decoupled (Phase 5). That is the right time to attack performance from multiple angles at once.

## Goal

1. **Investigate and fix the cumulative Fisher/GC lag** on the DIR page — find the root cause of the "needs page reload + clear localStorage" symptom and eliminate it.
2. **Benchmark every non-trivial computation** in `src/core/` and establish a reference baseline.
3. **Rewrite bootstrap-family computations in Rust + WASM** and ship them. Bootstrap / Monte Carlo tests are the target because they are both algorithmically heavy and structurally suited to native code.
4. **Move every heavy computation off the main thread** via Web Workers (Comlink), so the UI stays responsive regardless of input size.
5. **Optimize every other hot path** in JavaScript: reduce allocations, cache derived values correctly, kill unnecessary work, profile with Chrome DevTools.
6. **Optimize SVG graph rendering** for high-point-count scenarios — fewer DOM nodes via grouping/instancing, smarter memoization, batched event delegation, smaller path strings, fewer re-renders. **PMTools stays on SVG. Canvas is not an option** — users export SVG and that capability is non-negotiable. Every rendering optimization must preserve the ability to grab the live SVG and save it to a file.

## Non-Goals

- No algorithmic changes to the math itself. Every test in Phase 1 must still pass for deterministic inputs (bit-exact for integer state, ≤1 ULP for floating-point). Speedups come from better implementations of the same formulas, not from changing what is computed.
- No GPU compute. WebGPU for paleomag workloads would be premature and far off the shortest path.
- No C++. The native-code track is Rust — rationale below.
- **No canvas, no WebGL, no abandonment of SVG.** SVG export is a hard product requirement. Every render-perf optimization must keep `<svg>` as the output and preserve serializability.
- **No JS fallback for the WASM bootstrap path.** WASM is universal in 2026. Maintaining two parallel implementations doubles correctness work for zero real-user benefit. JS implementations stay only as Phase 1 references for cross-checking — they are not a runtime fallback path.

## Tracks

Phase 7 runs on **five** parallel tracks. Each is independent and can be paused and resumed. They share the same Phase 1 test suite as a correctness safety net and the same Phase 2 visual regression suite as a UX safety net.

- **Track A** — Fisher/GC cumulative lag investigation and fix.
- **Track B** — Bootstrap in Rust + WASM.
- **Track C** — Benchmark everything and optimize JS hot paths.
- **Track D** — Web Workers via Comlink.
- **Track E** — SVG graph rendering optimization for high-point-count scenarios.

---

## Track A — Fisher/GC Lag Investigation and Fix

This is treated as a bug, not an optimization. It gets its own investigation phase with root-cause analysis *before* any fix goes in.

### Symptoms to reproduce

1. Load a DIR file with 200+ directions on the DIR page.
2. Apply Fisher mean.
3. Switch coordinate systems repeatedly, select/deselect directions, open/close the VGP modal, trigger tests.
4. Observe: initially smooth, progressively laggier, eventually visibly janky.
5. Reload page → clear localStorage → performance returns to initial state.

The "clear localStorage" part of the workaround is the key diagnostic clue. It rules out pure CPU cost (which would reset after reload alone) and points at **accumulated state** — something is growing in the Redux store or persisted storage and being re-serialized or re-processed on every interaction.

### Hypothesis checklist (investigate in order)

1. **`greatCircleCache` not being evicted** (top suspect): `src/utils/graphs/greatCircleCache.ts` (after Phase 4: `src/core/graphs/greatCircleCache.ts`) caches computed great circles. If the cache key is stable per direction object and directions are stable-referenced, it's fine. If directions are deep-cloned every render, the cache grows unbounded and every cache lookup walks an ever-growing map. **Check cache size at t=0 and t=10min — this is the most likely root cause.** A tracing wrapper around the cache (`get`, `set`, `size`) should be the very first instrumentation.
2. **Fisher mean re-computation on every render**: if `useMemo` dependency keys are array references that are recreated, Fisher mean runs every frame. Profile with React DevTools' "Profiler" tab.
3. **Redux state bloat** (largely addressed by Phase 6c Zustand migration, but verify): is `parsedData.treatmentData` or `parsedData.dirStatData` accumulating stale entries when files are loaded/unloaded? Inspect via DevTools across a session. Check serialization size of localStorage after 10 minutes of use. Note: Phase 6 ships before Phase 7, so this hypothesis may already be neutralized — re-check on the post-Phase-6 codebase.
4. **Detached DOM nodes from SVG rendering**: if graphs are unmounted without cleaning up, SVG subtrees leak. Check with Chrome Memory panel → Take Heap Snapshot → Filter "Detached HTMLElement".
5. **Zustand selector recomputation** (post-Phase 6): if Zustand selectors return new array references on every state read, downstream `useMemo` keys break. Check that selectors return stable references for unchanged data.
6. **IndexedDB/localStorage fragmentation**: reading a huge JSON blob from localStorage on every page navigation is synchronous and slow.
7. **Event listener leaks**: if `addEventListener` without matching `removeEventListener` in hotkey/resize/scroll handlers, listeners pile up. Grep for `addEventListener` without a cleanup.

### Investigation steps

1. Create a reproduction script in `e2e/repro/fisher-gc-lag.spec.ts` that drives the lag reliably (Playwright). This is not a passing test — it's a diagnostic tool.
2. Run Chrome DevTools Performance panel during the repro. Record a 60-second session.
3. Identify the long tasks. Attribute them to stack frames.
4. Take heap snapshots at t=0 and t=60s. Diff. Find the growing object class.
5. Trace back to the root cause from the hypothesis checklist.
6. Document findings in `.claude/development-roadmap/notes/phase-7a-fisher-gc-investigation.md`.

### Fix requirements

- Fix must eliminate the **cumulative** part of the lag. A 500-direction Fisher mean can legitimately take tens of milliseconds; that's fine. What's not fine is the same operation getting progressively slower over a session.
- Fix must be covered by a regression test: either a Phase 1 unit test that asserts memoization correctness, or a Phase 2 scenario that repeatedly triggers the operation and asserts stable render time.
- Fix is committed separately from any Track B or Track C work.

### Exit for Track A

- [ ] Root cause identified and documented.
- [ ] Fix landed and verified: a 10-minute Playwright session of repeated Fisher+GC operations shows stable (not growing) operation times.
- [ ] Regression test added to the suite.
- [ ] "Reload + clear localStorage" workaround no longer necessary.

---

## Track B — Bootstrap in Rust + WASM

Bootstrap and Monte Carlo tests (fold test, reversal test, bootstrap common mean) are the computations that most deserve native speed. They are tight numerical loops with no DOM or async dependency — perfect WASM targets.

### Native Language Decision: Rust

- **Toolchain**: `wasm-bindgen` + `wasm-pack` is the best WASM toolchain in the JS ecosystem. Auto-generates TypeScript bindings. No glue code to maintain.
- **Binary size**: Rust WASM is typically 2–3× smaller than Emscripten-produced C++ WASM for the same workload. Important for first-load time.
- **Memory safety**: borrow checker eliminates a class of bugs that would be disastrous in scientific code.
- **Linear algebra**: `nalgebra` covers everything PMTools uses (matrix ops, eigenvalue decomposition, matrix inversion). API is comparable to `numeric.js` but typed and faster.
- **No GC pauses**: WASM has no garbage collector; long-running bootstrap loops don't pause.
- **AssemblyScript rejected**: TypeScript-like syntax but compiles to a minimal WASM that's 2–5× slower than Rust on numerical workloads. Not worth the familiarity gain.
- **C++ rejected**: Emscripten produces larger binaries, the toolchain is more fragile, and Rust's value for numeric code is strictly higher.

### Scope

Rewrite in Rust + WASM:
1. The inner bootstrap loop (`drawBootstrap` + per-iteration Fisher mean).
2. `runFoldTest` (from Phase 1's extraction) — the unfolding iterations and matrix T scatter statistic.
3. `bootstrapCommonMeanTest` — resampling both populations, computing means.
4. `reversalTestClassic` bootstrap — driven by `bootstrapCommonMeanTest`.
5. `conglomeratesTest` bootstrap part if applicable.

The JS implementations in `src/core/statistics/` stay **as Phase 1 references only** — they exist so the Phase 1 test suite can cross-check the WASM outputs against an independent codebase. They are **not** a runtime fallback. WASM is universal in 2026; supporting two parallel runtime paths doubles the correctness work for zero real-world benefit.

### Structure

```
wasm/                              # Top-level directory, not inside src/
├── Cargo.toml
├── rust-toolchain.toml             # Pinned Rust version
├── src/
│   ├── lib.rs                      # wasm-bindgen exports
│   ├── bootstrap.rs                # Bootstrap inner loop
│   ├── fold_test.rs                # runFoldTest port
│   ├── reversal_test.rs            # Common mean bootstrap port
│   ├── fisher.rs                   # Fisher mean (shared helper)
│   ├── rng.rs                      # Seeded RNG matching Phase 1's JS version exactly
│   └── types.rs                    # Direction, cartesian, etc. — match TS types bit-for-bit
├── tests/                          # Rust-side unit tests that mirror Phase 1 JS tests
│   ├── fisher_parity.rs
│   ├── bootstrap_parity.rs
│   └── fold_test_parity.rs
├── README.md                       # Build instructions
└── pkg/                            # Generated by wasm-pack, gitignored
```

Build output (`pkg/pmtools_wasm.js` + `pkg/pmtools_wasm_bg.wasm`) is imported from `src/core/wasm/` via dynamic `import('pmtools-wasm')` so the WASM bundle is code-split and only loaded when needed.

### Determinism requirement

The RNG must be **bit-exact across Rust and JS for the integer state**, with floating-point outputs matching to within 1 ULP. Demanding "byte-for-byte" on FP outputs is wrong: V8's `Math.sin`/`Math.atan2`/`Math.acos` and LLVM's intrinsics use different polynomial approximations and are not guaranteed to agree on the last bit. Forcing exact equality on those would be impossible regardless of how the RNG is built.

Strategy:
1. **Choose an integer-state PRNG** (LCG, Xoshiro256++, or PCG) with a specification both implementations can target deterministically. Integer-state operations (mul, add, xor, shift, mod) are bit-exact across all engines and languages.
2. The PRNG produces a `u64` state and converts to `f64` only at the boundary where a uniform random in `[0, 1)` is needed. The conversion is the same on both sides (e.g., `(state >> 11) as f64 * 2^-53`).
3. Port the JS implementation to Rust first, then replace with a library only if the library produces the same integer state given the same seed.
4. A Rust-side unit test (`tests/rng_parity.rs`) runs the same seed through both Rust and (via FFI or a separate Node subprocess) JS, asserts:
   - Integer state sequence equality (exact).
   - `f64` uniform output sequence equality (exact, because it's a deterministic int→float conversion).
5. For higher-level computations (Fisher mean of bootstrap samples, fold-test scatter statistic): assert outputs match within 1 ULP across Rust and JS, **not** byte-for-byte.

Why this matters: Phase 1 tests depend on deterministic bootstrap inputs. If the RNG gives different integer sequences for the same seed, the Phase 1 tests fail. If the FP outputs differ by 1 ULP, that's tolerable and expected.

### Interface

Data crosses the WASM boundary as `Float64Array` only. Never objects, never strings (except for error codes as small ASCII strings).

```rust
#[wasm_bindgen]
pub fn run_fold_test(
    directions_xyz: &[f64],      // flat [x0, y0, z0, x1, y1, z1, ...]
    dip_strikes: &[f64],         // flat pairs
    num_iterations: u32,
    seed: u64,
) -> FoldTestResult;
```

All heavy work happens in one call. No chatter. Progress callbacks come from a **separate** mechanism (see Track D) — the main thread polls the worker for progress, not the WASM binary directly.

### Execution steps

1. Install `wasm-pack`. Document the prerequisite in the repo README.
2. Scaffold `wasm/` with an empty crate.
3. Port the RNG first. Verify parity with a Rust unit test and a Node-side test that shares seeds.
4. Port `fisher_mean`. Parity test against a Phase 1 fixture.
5. Port `drawBootstrap` and the inner Fisher loop.
6. Port `runFoldTest`.
7. Port `bootstrapCommonMeanTest`.
8. Wire the WASM module through Comlink-aware code in `src/workers/` (Track D).
9. Benchmark (Track C) before and after.

### Exit for Track B

- [ ] `wasm/` crate builds with `wasm-pack build --target web`.
- [ ] Rust-side parity tests: integer RNG state matches JS exactly; FP outputs of bootstrap computations match the JS reference within 1 ULP.
- [ ] Phase 1 tests pass when the WASM implementation runs the bootstrap path (the runtime path is WASM-only after this phase ships).
- [ ] Phase 1 reference tests against the JS implementations still pass (they remain in the codebase as reference, not as fallback).
- [ ] WASM is ≥ 3× faster than JS-in-worker for the bootstrap inner loop on realistic inputs. If less, investigate before declaring done (likely the workload is already memory-bound, not compute-bound).
- [ ] First-load impact measured: the WASM bundle is code-split and only loaded when a bootstrap test is triggered.

---

## Track C — Benchmark Everything and Optimize the Rest

Every other heavy computation gets measured and, where possible, optimized in plain JavaScript. The goal here is not 10× speedups; it's eliminating the 10× waste.

### Benchmark harness

**Tool**: `tinybench` (devDependency) — small, accurate, Vitest-compatible.

```
src/core/__benchmarks__/
├── pca.bench.ts
├── fisher.bench.ts
├── bootstrap.bench.ts               # JS baseline; WASM numbers added after Track B
├── foldTest.bench.ts
├── reversalTest.bench.ts
├── parser.bench.ts                   # parse a large xlsx with thousands of rows
├── vgp.bench.ts
├── graphFormatters.bench.ts          # dataToZijd, dataToStereo*, dataToMag over realistic inputs
├── baseline.md                       # Pre-optimization numbers, committed
├── after-workers.md                  # After Track D
├── after-wasm.md                     # After Track B
└── after-js-optimization.md          # After this track's JS improvements
```

### Workloads

1. **PCA** — single specimen, 20 demag steps. Sanity check.
2. **Fisher mean** — 100 / 500 / 2000 directions.
3. **Bootstrap common mean** — 1000 iterations × 100 directions.
4. **Fold test (bootstrap)** — 1000 iterations, 500 directions.
5. **Reversal test (bootstrap)** — 1000 iterations, 500 directions.
6. **Conglomerates test** — 500 directions.
7. **Large XLSX parse** — 5000 rows.
8. **`dataToStereoDIR`** — 500 directions, realistic formatting.
9. **`dataToZijd`** — 100 PMD steps, all three coordinate systems.

### Optimization patterns to apply (in order of usual impact)

1. **Kill repeated work**: if the same value is computed for every frame, memoize it with a stable key. Often fixes the real complaint.
2. **Preallocate arrays** for inner loops. `new Array(N)` once beats `arr.push()` N times in hot paths.
3. **Use typed arrays** (`Float64Array`, `Int32Array`) for large numeric buffers. V8 optimizes these aggressively.
4. **Flatten nested object structures** where they show up in hot loops. Direction `{x, y, z}` is fine; `{metadata: {coordinates: {x, y, z}}}` is not.
5. **Cache trig/log values** when the same angle is used repeatedly.
6. **Collapse passes**: if a loop runs over `directions` three times (filter → map → reduce), combine into one pass.
7. **Reuse buffers** across frames when possible.
8. **Don't JSON.stringify large objects** in logs or dev checks.

### Execution steps

1. Write all bench files. Commit baseline numbers.
2. Profile each workload with Chrome DevTools. Identify the obvious offenders.
3. Apply optimizations in separate commits, one optimization per commit, with the before/after benchmark numbers in the commit message.
4. Phase 1 tests catch any accidental correctness break.
5. Stop when no workload shows > 50 ms on realistic input, or when further optimization requires algorithmic changes (which are out of scope).

### Exit for Track C

- [ ] Every workload has a baseline benchmark committed.
- [ ] Every workload's after-optimization benchmark is documented.
- [ ] No workload exceeds 50 ms on the main thread for realistic input (and Track D ensures heavy workloads run off-main anyway).
- [ ] At least one optimization has a documented ≥ 2× speedup. If none do, the code was already efficient — fine, close the track.

---

## Track D — Web Workers via Comlink

Every heavy computation runs in a Web Worker, regardless of whether it's JS or WASM. This eliminates the "UI freezes during computation" class of bug at the architectural level.

**Tool**: Comlink — turns a Worker into a proxy object with async method calls. ~1 KB gzipped.

### Worker structure

```
src/workers/
├── pmtoolsWorker.ts            # Main worker entry point
├── pmtoolsWorker.types.ts      # Shared type contract
├── boundary.ts                 # Comlink wrapper
└── index.ts                    # Factory + lazy loading
```

The worker imports from `src/core/` (pure after Phase 4), and from `pmtools-wasm/pkg` (dynamic import, lazy-loaded on first use).

### Operations to run in the worker

1. `runFoldTest`.
2. `bootstrapCommonMeanTest` and `reversalTestClassic`.
3. `drawBootstrap` when called outside a test context.
4. `conglomeratesTest` when input is large (threshold: > 100 directions).
5. Large XLSX parsing (> 1000 rows, gated by file size).
6. **Conditional on Track A outcome**: Fisher mean + great-circle computation for the stereonet when direction count exceeds a threshold (e.g., > 300). If Track A reveals the issue was a stale `greatCircleCache` or a `useMemo` key bug rather than raw compute cost, worker offloading is **not needed here at all** — fixing the memoization is the right answer and adding a worker would just hide the bug. Decide after Track A finishes; document the decision in `phase-7a-fisher-gc-investigation.md`.

### Progress reporting

Bootstrap loops currently update progress counts via `React.Dispatch` callbacks inside the UI orchestrator. Comlink supports callbacks via `Comlink.proxy()`:
- Main thread passes a progress callback to the worker.
- Worker calls the callback every N iterations (throttled to avoid message flood).
- UI stays responsive because main thread is only doing lightweight state updates.

This replaces the current plumbing in the Phase 1-extracted `foldTestCore.ts` / `reversalTestCore.ts` orchestrators.

### Vite worker support

Vite has first-class worker support (`import Worker from './pmtoolsWorker?worker'`). No webpack hacks, no loader plugins. Works in dev and production builds. Since Phase 6 already put Vite in place, this is trivial.

### Determinism in workers

Workers are deterministic as long as the seed is passed in. The Rust RNG (Track B) and the JS RNG (`src/core/math/rng.ts` from Phase 4) produce identical outputs given the same seed. Phase 1 tests verify this property.

### Execution steps

1. Install `comlink`.
2. Create `src/workers/` structure.
3. Move `runFoldTest` call path into the worker. Update the UI orchestrator (formerly `foldTestBootstrap.ts`) to `await` the worker.
4. Same for `bootstrapCommonMeanTest`, `reversalTestClassic`, `conglomeratesTest`.
5. Gate large XLSX parsing behind a threshold that sends to the worker.
6. After Track A ships, evaluate moving Fisher/GC to the worker too.
7. Re-run benchmarks (Track C) with worker enabled. Record in `after-workers.md`.

### Exit for Track D

- [ ] Every bootstrap / Monte Carlo test runs in a Worker.
- [ ] Main thread never blocks > 50 ms during any computation triggered by a user interaction.
- [ ] Progress updates during long-running tests are smooth.
- [ ] Phase 1 tests pass with workers enabled.
- [ ] Phase 2 visual tests pass with workers enabled.

---

## Track E — SVG Graph Rendering Optimization

PMTools graphs are SVG and **stay SVG**. Users export SVG, that capability is non-negotiable, canvas/WebGL are off the table. The challenge: keep SVG smooth even when stereonets carry hundreds of points and great circles, when Zijderveld plots have many demag steps, and when interaction (hover, select, drag) triggers React re-renders.

This track is gated by Phase 5 (graphs are prop-driven and isolated in `src/graphs/`) and complements Track A (the cumulative lag fix) — Track A fixes the memory/state leak; Track E fixes the per-frame rendering cost on a healthy state.

### Symptoms to attack

1. **High point counts** (200–1000+ directions on a stereonet): React reconciliation walks every `<circle>` on every render, even when nothing changed.
2. **Many great circles** drawn on a stereonet: each is a long `<path>` string; recomputing the path on every render is expensive.
3. **Hover/select churn**: hovering one point can trigger a parent re-render that re-creates every child `<circle>`.
4. **Zijderveld with many demag steps**: same problem on a different graph.
5. **Tests in progress** (fold/reversal) that re-render the underlying graph during iteration progress updates.

### Optimization techniques (in order of usual impact, all SVG-preserving)

1. **Stable, memoized SVG subtrees**: wrap each layer (axes, grid, points, great circles, interpretation overlays) in `React.memo` with a stable props comparator. A hover on one point should re-render only the hover layer, not the points layer.
2. **Stable references for derived data**: if `dataToStereoDIR` returns a new array every call, every consumer breaks memo. Cache the formatter output by input identity in `src/core/graphs/`.
3. **Event delegation**: instead of one `onMouseEnter` per `<circle>`, attach one listener to the parent `<g>` and use `event.target` to identify the point. Cuts thousands of listener registrations to one.
4. **`<use>` and `<defs>` for repeated shapes**: define one `<symbol id="point">` and reference it with `<use href="#point" x=... y=...>`. Smaller DOM, smaller serialized SVG, faster initial paint. **Survives SVG export** because `<use>`/`<symbol>` is standard SVG.
5. **Path string optimization**: round coordinates to a sensible precision (3–4 decimal places — paleomag accuracy doesn't need 16 digits), drop redundant `M`/`L` commands, prefer relative coordinates where shorter. Smaller path strings = faster parse + smaller export.
6. **Batched updates during tests**: while a fold test is running, throttle progress-driven re-renders to e.g. 10 Hz instead of every iteration. The user can't see 1000 redraws per second anyway.
7. **`will-change` and CSS containment** on the graph root: tells the browser to isolate paint regions.
8. **Avoid SVG filters for hot layers**: filters force expensive GPU compositing. If a hover effect uses `<filter>`, replace with a CSS class swap on a sibling element.
9. **Strip pointer-events from purely decorative layers**: axes, grid, labels don't need pointer events. Setting `pointer-events="none"` on those layers shortcircuits hit testing.
10. **`shape-rendering="optimizeSpeed"` on dense layers**: hints the browser to skip antialiasing on the points layer when point count is high. Reverts to `auto` for layers where AA matters (axes, labels). Survives SVG export.

### Constraints (non-negotiable)

- **The output is always serializable SVG.** Every optimization must leave the live `<svg>` element in a state that, when serialized via `outerHTML`, gives the user the file they expect to export. Phase 1's SVG snapshot tests + Phase 2's visual tests are the gates.
- **No canvas, no WebGL, no off-DOM rendering.**
- **No removal of points** under the guise of "level of detail". If the user loaded 800 directions, the export shows 800 directions. Down-sampling for display only is acceptable **only if the export path bypasses the down-sample** — and even then it's risky enough to require explicit approval.
- **No third-party SVG rendering library.** Hand-tuned React + SVG, same as today.

### Execution steps

1. Build a benchmark scenario: stereonet with 500 directions + 50 great circles + interpretations. Capture a flame graph and a paint profile. Save baseline numbers to `.claude/development-roadmap/notes/phase-7e-graph-render-baseline.md`.
2. Apply optimizations from the list above, one per commit, with before/after numbers in the commit message.
3. After each optimization: Phase 2 visual regression must still pass byte-identical (or with a documented intentional diff like "rounded coordinates to 3 dp"); Phase 1 SVG snapshot tests must still pass.
4. SVG export round-trip test: `<svg>` → `outerHTML` → save to file → re-open as image → diff against baseline. Must always succeed.
5. Stop optimizing when no realistic scenario shows > 16 ms per frame (60 fps budget) on a mid-range laptop, or when further work requires removing SVG (which is forbidden).

### Exit for Track E

- [ ] Stereonet with 500 directions + 50 great circles renders at ≥ 60 fps during hover/select interaction.
- [ ] Zijderveld with 100 demag steps stays interactive (no jank during step selection).
- [ ] Fold/reversal test in-progress UI updates do not freeze the main thread.
- [ ] SVG export still produces the exact image the user sees on screen, byte-equivalent or visually identical (Phase 2 visual tests pass).
- [ ] No canvas, no WebGL, no rendering library introduced.
- [ ] All optimizations documented in `.claude/development-roadmap/notes/phase-7e-graph-render-optimizations.md` with before/after numbers.

---

## Overall Exit Criteria

- [ ] Track A: cumulative Fisher/GC lag eliminated; reload-to-fix workaround no longer needed.
- [ ] Track B: bootstrap-family computations run in Rust + WASM, integer RNG state bit-exact vs JS reference, FP outputs within 1 ULP, at least 3× faster than JS-in-worker. WASM is the runtime path; JS implementations remain only as Phase 1 references.
- [ ] Track C: every `src/core/` hot path benchmarked and optimized to the "no more obvious waste" level.
- [ ] Track D: every heavy computation runs in a Worker. Fisher/GC offloading decided based on Track A outcome (may be unnecessary if Track A reveals a memoization bug).
- [ ] Track E: SVG graph rendering smooth at high point counts; SVG export still byte-equivalent to on-screen render; no canvas, no WebGL.
- [ ] Phase 1 tests pass for the WASM bootstrap path AND for the JS reference path (both used as cross-checks).
- [ ] Phase 2 visual regression suite passes.
- [ ] `npm run verify && npm test && npx playwright test && npm run build` all green.
- [ ] Documentation updated: `wasm/README.md` explains the build process; `.claude/development-roadmap/notes/phase-7a-fisher-gc-investigation.md` documents the Track A fix with root cause; `phase-7e-graph-render-optimizations.md` lists every Track E optimization with numbers.

## Critical Files

### Files to create
- `src/core/__benchmarks__/` — entire tree.
- `src/workers/` — entire tree.
- `wasm/` — Rust crate at top level.
- `src/core/wasm/` — TypeScript side of the WASM binding (dynamic import wrapper).
- `.claude/development-roadmap/notes/phase-7a-fisher-gc-investigation.md`.
- `.claude/development-roadmap/notes/phase-7e-graph-render-baseline.md`.
- `.claude/development-roadmap/notes/phase-7e-graph-render-optimizations.md`.
- `e2e/repro/fisher-gc-lag.spec.ts` — lag repro harness for Track A.
- `e2e/repro/svg-render-stress.spec.ts` — high-point-count graph repro harness for Track E.

### Files to modify
- `package.json` — add `comlink`, `tinybench`, update scripts for `npm run bench`.
- `vite.config.ts` — worker configuration (usually just `{ format: 'es' }`), WASM loader.
- UI orchestrators (formerly `foldTestBootstrap.ts`, `reversalTestBootstrap.tsx`) — become thin wrappers around the worker.
- `src/core/statistics/foldTest.ts`, `reversalTest.ts` — the pure JS implementations stay as Phase 1 reference; the runtime path is WASM-only after this phase ships.
- Phase 1 test runner — parameterize so Phase 1 tests run once against the JS reference and once against WASM, asserting parity.
- `src/graphs/**` — Track E touches every graph component for SVG rendering optimizations. Phase 5's prop-driven shape stays.

### Files to delete
- None. Every addition is additive; JS reference implementations remain as Phase 1 references (not as runtime fallback).

### Files to leave alone
- `src/core/math/` — read only.
- `src/design-system/` — unaffected.

## Verification

Track A:
```bash
npx playwright test e2e/repro/fisher-gc-lag.spec.ts
# Before fix: lag grows over time.
# After fix: operation time stable over 10-minute session.
```

Track B:
```bash
cd wasm && wasm-pack build --target web
cargo test                           # Rust-side parity tests
npm test -- --run                    # JS tests, including WASM-mode runs
```

Track C:
```bash
npm run bench
diff src/core/__benchmarks__/baseline.md src/core/__benchmarks__/after-js-optimization.md
```

Track D:
```bash
npm run bench
npm start
# Manually load a 500-direction dataset, run fold test.
# Chrome DevTools Performance: main thread stays responsive, no long tasks > 50 ms.
```

## Risks

| Risk | Mitigation |
|---|---|
| Track A root cause is deeper than expected (e.g., needs Phase 6 Zustand first) | Already sequenced after Phase 6 — Redux bloat hypothesis benefits from the Zustand migration. The `greatCircleCache` is the top suspect and is independent of state layer; investigate it first. If still not fixed, escalate to a full state audit. |
| RNG parity: integer state | Use an integer-only PRNG (LCG/PCG/Xoshiro). Integer ops are bit-exact across engines. Cross-language test asserts integer state sequence equality. |
| RNG parity: floating-point outputs | FP intrinsics differ across V8/LLVM. Tolerance is 1 ULP, not byte-exact. Documented and tested. |
| WASM < 3× speedup | Investigate — likely memory-bound, not compute-bound. If confirmed, document the decision and don't ship WASM for that workload, but keep it for the workloads where the speedup does materialize. |
| Comlink overhead eats worker speedup | Amortize — one call per full bootstrap run, not per iteration. Throttle progress callbacks. |
| WASM bundle bloats first load | Code-split: dynamic `import('pmtools-wasm/pkg')` only when bootstrap is first triggered. |
| Rust toolchain adds maintenance burden | Document `wasm-pack` + Rust version in repo README. Pin via `rust-toolchain.toml`. |
| Parity tests break when JS reference is later optimized | Expected. Re-verify parity after every JS change to the bootstrap code path. Both implementations are reference-grade; neither is "true" absent the thesis. |
| Phase 1 test runner parameterization complicates test code | Worth it — having WASM-runtime and JS-reference both pass the same tests is the whole correctness story. |
| Track E SVG optimization breaks export | SVG export round-trip test on every commit; Phase 2 visual tests gate every change. Any optimization that changes serialized output is reviewed against the export use case before landing. |
| Track D worker offloading hides a Track A memoization bug | Track D Fisher/GC offloading is **conditional** on Track A's findings. If Track A says "it was a stale cache", Track D does not add a worker for that path. |

## Dependencies on Other Phases

- **Depends on Phase 1**: test suite and seeded integer-PRNG are the safety net for the WASM runtime path and the JS reference path.
- **Depends on Phase 2**: visual regression suite gates Track E SVG optimizations and catches any accidental graph rendering regression on any track.
- **Depends on Phase 4**: `src/core/` is pure and portable — prerequisite for workers and WASM.
- **Depends on Phase 5**: Track E touches `src/graphs/`, which only exists as a clean prop-driven library after Phase 5.
- **Depends on Phase 6**: Vite's worker support + Zustand's cleaner state management unblock both Track D and Track A.

## What Comes After Phase 7

Nothing in this roadmap. The modernization cycle ends here. Future work (new features, new graph types, new statistical tests, accessibility, mobile support) happens organically in separate sessions on top of the stable foundation the roadmap delivers.
