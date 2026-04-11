# Phase 2 — Visual Regression Tests

## Context

Phase 1 establishes correctness for the scientific core. Phase 2 establishes a visual safety net before the UI stops being stable. The MUI migration (Phase 3), the graph library extraction (Phase 5), and the architecture rewrite (Phase 6) all touch rendering paths. Without visual regression tests, either something breaks silently or every change forces slow manual QA.

PMTools already uses Playwright via the custom `/evaluate` skill (see `CLAUDE.md`), so the browser-automation infrastructure is partially in place. This phase installs Playwright as a first-class devDependency with a proper `playwright.config.ts`.

## Goal

Build a visual regression suite that:
1. **Protects graph rendering** — Zijderveld, Stereo, Mag, VGP, FoldTest, ReversalTest — via deterministic SVG snapshots.
2. **Protects full-page layouts** — main page, PCA page, DIR page, VGP modal, settings, changelog — via pixel screenshots.
3. **Runs in CI** and posts visual diffs on failures.
4. **Is deterministic**: seeded RNG, fixed viewport, frozen time, animations disabled.

## Non-Goals

- No user-interaction end-to-end testing — that's `/evaluate` territory.
- No accessibility audits (separate future work, out of this roadmap).
- No cross-browser matrix — Chromium only. Firefox/WebKit added later only if real user reports justify it.

## Strategy: Two Layers

### Layer 1: SVG string snapshots (primary)

All graphs are SVG generated inside React. Snapshot the serialized SVG markup, not the pixel output.

**Why SVG snapshots beat pixel screenshots for graphs:**
- Deterministic — no font antialiasing, no GPU driver variance.
- Human-readable diffs — you see which path or coordinate changed, not a mystery pixel cloud.
- Fast — no browser needed, runs as a unit test in Jest.
- Small — a few KB per snapshot vs hundreds of KB for PNGs.

**How:**
- Render each graph component in Jest with `@testing-library/react` against a deterministic fixture.
- Use `document.querySelector('svg').outerHTML` (normalized) as the snapshot target.
- Save to `__snapshots__/` next to the test file.
- Golden data comes from `src/__tests__/fixtures/graphs/` (created in Phase 1).
- Seeded RNG (Phase 1's `seededRng.ts`) for bootstrap-driven graphs.

### Layer 2: Playwright page screenshots (secondary)

Full-page screenshots for a small, deliberate set of "money shots":
- Main page (light + dark).
- `/app/pca` empty state.
- `/app/pca` with `examplePCA.pmd` loaded.
- `/app/pca` with a computed PCA interpretation shown.
- `/app/dir` with `exampleDIR.pmm` loaded.
- VGP modal open.
- Settings modal open.
- Changelog modal open.

Target: ≤ 10 pages × 2 themes = ≤ 20 baselines.

**Determinism rules:**
- Fixed viewport `1440×900`.
- Fonts inlined as base64 in CSS (avoid FOIT/FOUT flakes).
- `page.addInitScript` freezes `Date.now()` and `Math.random()` before React mounts.
- CSS animations disabled via `* { animation-duration: 0s !important; transition-duration: 0s !important; }` injected at page load.
- `waitForLoadState('networkidle')` plus an app-specific `data-ready="true"` attribute on `<body>` for sync.
- Baselines generated and compared exclusively on Linux (Ubuntu-latest). Local macOS runs are allowed but only Linux baselines are committed.

## Tools

- **Playwright** (`@playwright/test`) — screenshot capture, diffing, HTML reporter.
- **pixelmatch** — used internally by Playwright's `toHaveScreenshot`, no direct config.
- **Jest built-in snapshots** (`toMatchSnapshot`) for SVG strings. No extra dep.
- **No Percy / Chromatic / Applitools** — cloud services add cost, privacy concerns, and are unnecessary for a solo project.

## Fixture Reuse

All data fixtures come from Phase 1's `src/__tests__/fixtures/` tree — **no new fixtures created in Phase 2**. If a visual test needs a scenario not yet covered, the fixture goes into Phase 1's tree with proper `SOURCE.md` (thesis / PmagPy / literature), not into Phase 2.

This keeps scientific capital in one place and ensures visual tests are driven by the same numbers as unit tests.

## Execution Order

### Step 0 — Infrastructure
1. `npm install --save-dev @playwright/test`.
2. `npx playwright install chromium`.
3. Create `playwright.config.ts` at repo root:
   - `testDir: 'e2e'`
   - `use: { viewport: { width: 1440, height: 900 }, locale: 'en-US' }`
   - `projects: [{ name: 'chromium-light' }, { name: 'chromium-dark' }]`
   - `expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.001 } }`
4. Create `e2e/` directory next to `src/`.
5. Create `e2e/fixtures/app.ts` — Playwright fixture that starts the dev server, navigates, waits for the app-ready signal.
6. Add app-ready signal: `document.body.setAttribute('data-ready', 'true')` in `App.tsx` after initial hydration.
7. Create `e2e/fixtures/determinism.ts`: freeze `Date.now`, seed `Math.random`, disable animations.
8. Update CI to install Playwright browsers and run `npx playwright test` after Jest tests pass.
9. Create `src/__tests__/helpers/svgSnapshot.ts` — normalize SVG (strip inter-tag whitespace, collapse adjacent spaces) before `toMatchSnapshot`.
10. Create `src/__tests__/helpers/renderGraph.ts` — wraps graph components in a mock Redux `Provider` with a deterministic initial state. **This is throwaway code that gets deleted in Phase 5/6**: Phase 5 makes graphs prop-driven (no Provider needed), and Phase 6 finishes the state migration. Phase 6's exit criteria explicitly require this file to be gone — it should not survive the modernization.

### Step 1 — SVG snapshot tests for each graph component
One test file per graph, colocated under a `__tests__/` directory next to the component:

1. `ZijdGraph` — 3 snapshots: specimen / geographic / stratigraphic coordinates.
2. `StereoGraph` (PMD) — 2 snapshots: with and without interpretations.
3. `MagGraph` — 2 snapshots: thermal + AF demagnetization.
4. `StereoGraphDIR` — 3 snapshots: raw directions / Fisher mean / with cutoff.
5. `StereoGraphVGP` — 2 snapshots: single-coordinate / both coordinates.
6. `FoldTestGraph` — 1 seeded snapshot.
7. `ReversalTestGraph` — 1 seeded snapshot.

Each test uses a Phase 1 fixture and asserts the normalized SVG against a saved snapshot. Bootstrap-driven graphs use Phase 1's `seededRng.ts`.

### Step 2 — Playwright page screenshots
1. `e2e/main-page.spec.ts` — light + dark.
2. `e2e/pca-empty.spec.ts` — light + dark.
3. `e2e/pca-loaded.spec.ts` — programmatically drop `examplePCA.pmd` via the dropzone, wait for `data-ready`, screenshot.
4. `e2e/pca-interpreted.spec.ts` — load file, click PCA, wait, screenshot.
5. `e2e/dir-loaded.spec.ts`.
6. `e2e/vgp-modal.spec.ts`.
7. `e2e/settings-modal.spec.ts`.
8. `e2e/changelog-modal.spec.ts`.

### Step 3 — CI integration
1. Add a GitHub Actions job `visual-tests` that runs after `unit-tests`.
2. Upload the Playwright HTML report as an artifact on failure.
3. Upload diff PNGs (`test-results/*.png`) on failure.
4. Fail the build on any visual mismatch.

### Step 4 — Baselines
1. Generate baseline PNGs on Linux (via Docker if working from macOS) — `npx playwright test --update-snapshots`.
2. Commit baselines under `e2e/__snapshots__/`.
3. Document in `e2e/README.md`: how to regenerate, how to decide whether a diff is intentional, how to accept or reject a change.

## Exit Criteria

- [ ] Every file in `src/components/AppGraphs/` has an SVG snapshot test covering at least the default state.
- [ ] Interpretation states (with computed results) are snapshot-tested for Zijd, Stereo, StereoDIR.
- [ ] 8 Playwright page specs exist, each with light + dark baselines.
- [ ] CI runs both Jest visual tests and Playwright visual tests and fails on any diff.
- [ ] `e2e/README.md` documents the regeneration workflow.
- [ ] Five consecutive CI runs on main show no flakes.

## Critical Files

### Files to create
- `playwright.config.ts`
- `e2e/` — specs, fixtures, helpers, snapshots.
- `e2e/fixtures/app.ts`, `e2e/fixtures/determinism.ts`, `e2e/README.md`.
- `src/components/AppGraphs/*/__tests__/*.visual.test.tsx` — one per graph.
- `src/__tests__/helpers/svgSnapshot.ts`
- `src/__tests__/helpers/renderGraph.ts` (throwaway, removed in Phase 6).

### Files to modify
- `src/App/App.tsx` — add `document.body.setAttribute('data-ready', 'true')` after mount.
- `.github/workflows/react-build-and-deploy.yml` — add `visual-tests` job.
- `.gitignore` — ignore `test-results/`, `playwright-report/`.
- `package.json` — add `@playwright/test` devDependency and `test:visual` / `test:e2e` scripts.

### Files to leave alone
- `src/utils/graphs/` — math unchanged.

## Reused Code

- Phase 1 fixtures under `src/__tests__/fixtures/`.
- Phase 1 `seededRng.ts` for bootstrap-driven graphs.
- Existing `src/assets/examples/examplePCA.pmd`, `exampleDIR.pmm` for Playwright "load real data" flows.

## Verification

```bash
npm run test:visual              # Jest SVG snapshots
npx playwright test              # Playwright screenshots
npx playwright show-report       # on failure
```

After the phase:
- CI shows two green checks: unit tests + visual tests.
- Intentional visual changes regenerated with `--update-snapshots` after eyeballing the diff report.

## Risks

| Risk | Mitigation |
|---|---|
| Graphs coupled to Redux (all except FoldTest/Reversal) | `renderGraph` helper wraps components in a mock Redux Provider. Deleted in Phase 6. |
| Font rendering differences across OS | CI runs Linux only; baselines are Linux only. Docker image documented for macOS dev. |
| Flaky screenshots from animation | Global `animation-duration: 0s` injection; wait for `data-ready`. |
| Snapshot churn during Phase 3 MUI migration | Expected. Intentional diffs regenerated via `--update-snapshots` after visually inspecting the report. |
| SVG snapshots too sensitive to whitespace | `svgSnapshot.ts` normalizes output before snapshotting. |
| Playwright cache bloats CI | Pin Playwright version; cache `~/.cache/ms-playwright` keyed by `package-lock.json`. |

## Dependencies on Other Phases

- **Depends on Phase 1**: fixture tree must exist.
- **Feeds Phase 3**: MUI migration uses page screenshots as the acceptance signal.
- **Feeds Phase 5**: graph library extraction uses SVG snapshots as the "nothing visually changed" check.
- **Feeds Phase 6**: state rewrite needs the safety net.
