# PMTools 2.0

Web application for paleomagnetic data analysis. Fully client-side (no server), all data processed in the browser.
- Domain: pmtools.ru | Deploy: GitHub Pages
- Bilingual: Russian and English (i18next)

## Agent Behavior

At the end of every response, suggest 1-3 relevant next steps the user could take using the available skills and workflows described in [docs/ai-assisted-development.md](docs/ai-assisted-development.md). Match suggestions to context: if the user just fixed a bug, suggest `/evaluate`; if they just finished a feature, suggest `/review` then `/evaluate`; if they're exploring a problem, suggest `/investigate`. Keep suggestions brief — one line each.

## Quick Commands

```bash
npm start            # dev server on localhost:3000
npm run build        # production build (CI=false suppresses warnings-as-errors)
npm run typecheck    # type check without emit
npm run lint         # ESLint check on src/
npm run format:check # Prettier formatting check
npm run verify       # typecheck + lint + format:check (single command)
```

## Verification (run after every change)

```bash
npm run verify    # must pass with 0 errors
npm run build     # must succeed
```

## Architecture

```
src/
├── App/                    # Root component, routing, theme
├── pages/                  # Route-level pages
│   ├── PCAPage             # PCA analysis (main working page)
│   ├── DIRPage             # Directional statistics
│   ├── MainPage            # Landing page
│   ├── WhyPMToolsPage      # About the project
│   ├── AuthorsAndHistory   # Authors
│   └── NotFoundPage        # 404
├── components/
│   ├── AppGraphs/          # SVG graphs: Zijderveld, Stereo, Mag, VGP, FoldTest, ReversalTest
│   ├── AppLogic/           # Business logic: DataTables, Tools, VGP, Settings, Navigation
│   ├── Common/             # Shared UI components
│   └── Layouts/            # Page layout wrappers
├── services/
│   ├── store/              # Redux store (configureStore + thunk), typed hooks
│   └── reducers/           # RTK slices: appSettings, parsedData, pcaPage, dirPage
├── utils/
│   ├── statistics/         # Scientific computations
│   │   ├── calculation/    # PCA, Fisher mean, McFadden, VGP, Butler, cutoff, bootstrap
│   │   └── PMTests/        # Fold test, Reversal test, Conglomerates test
│   ├── graphs/             # Graph math: projections, great circles, SVG export
│   ├── files/              # File parsers and converters
│   │   └── parsers/        # PMD, DIR, RS3, SQUID, CSV, XLSX, MDIR, PMM (12 parsers)
│   ├── GlobalTypes.ts      # Central type definitions (PMDStep, IPmdData, IDirData, VGPData, etc.)
│   └── GlobalHooks.ts      # App-wide React hooks
├── locales/                # Translations (ru/, en/)
└── data/                   # changelog.ts
```

### Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | MainPage | Landing page |
| `/why-pmtools` | WhyPMToolsPage | About the project |
| `/authors-and-history` | AuthorsAndHistory | Authors and history |
| `/app/pca` | PCAPage | PCA demagnetization analysis |
| `/app/dir` | DIRPage | Directional statistics |

### Redux Slices

- **appSettings** — colorMode, hotkeys
- **parsedData** — treatmentData (IPmdData[]), dirStatData (IDirData[]), siteData
- **pcaPage** — reference, projection, selectedStepsIDs, statisticsMode, interpretations
- **dirPage** — vgpData, reference, selectedDirectionsIDs, statisticsMode, interpretations

### Supported File Formats

PMD: `.pmd`, `.pmm`, `.rs3`, `.squid`, `.csv`, `.xlsx`
DIR: `.dir`, `.mdir`, `.csv`, `.xlsx`
Sites: `.csv`, `.xlsx` (Lat/Lon)

## Domain Concepts

- **PMD** — Paleomagnetic Demagnetization data (specimen measurements at demagnetization steps)
- **DIR** — Directional statistics (collection of interpreted directions from PCA)
- **PCA** — Principal Component Analysis (fitting lines/planes to demagnetization data)
- **Fisher statistics** — directional mean on a sphere
- **VGP** — Virtual Geomagnetic Pole (converting site directions to pole positions)
- **Coordinate systems**: specimen, geographic, stratigraphic (tilt-corrected)
- **Projections**: Zijderveld (orthogonal), stereographic (equal-area)

## Code Conventions

- TypeScript strict mode, target ES5
- React 17 (ReactDOM.render, NOT createRoot)
- Redux Toolkit: slices in `services/reducers/`, typed hooks in `services/store/hooks.ts`
- MUI v5 for UI components
- SCSS modules for styling (e.g., `App.module.scss`)
- i18next: translations in `public/locales/{ru,en}/`
- PascalCase for components, camelCase for utils
- Commits: lowercase imperative, `hotfix:` prefix for critical fixes
- `numeric` npm package for matrix operations (eigenvalue decomposition for PCA)
- `console.log` is forbidden — ESLint treats it as an error, blocked by pre-commit hook and CI

## Gotchas

- `CI=false` in build script — CRA treats warnings as errors in CI; this disables that
- tsconfig excludes "node-modules" (typo, but works because include only covers "src")
- Service worker is registered (serviceWorkerRegistration.register())
- `.env` contains only `REACT_APP_VERSION=$npm_package_version`
- GitHub Actions uses Node version from `.nvmrc` (22.10.0)

## Do Not

- Do NOT upgrade to React 18 without explicit request (breaking: ReactDOM.render API)
- Do NOT remove `CI=false` from build script
- Do NOT modify `.env`
- Do NOT add server-side code — this is a fully client-side application
- Do NOT modify scientific logic in `utils/statistics/` without explicit request

## 3-Agent Workflow

See [docs/three-agent-workflow.md](docs/three-agent-workflow.md) for the Planner / Generator / Evaluator workflow.
See [docs/ai-assisted-development.md](docs/ai-assisted-development.md) for the full AI-assisted development guide (includes gstack).

## gstack

Vendored in `.claude/skills/gstack/`. If gstack skills aren't working, run `cd .claude/skills/gstack && ./setup` to rebuild.

Use `/browse` for general web browsing. Never use `mcp__claude-in-chrome__*` tools.
**Exception:** The `/evaluate` skill (PMTools Evaluator) uses Playwright MCP (`mcp__playwright__*`) for domain-specific QA — this is intentional and must not be replaced by gstack's `/qa`.

### PMTools-specific rules
- **Primary QA tool**: `/evaluate` — it understands PMD/DIR files, Zijderveld plots, Fisher statistics, and the three-agent workflow. Use it for all PMTools app testing.
- **gstack `/qa` and `/qa-only`**: Use only for testing external sites or non-PMTools pages.
- **`/review`**: Use for pre-landing code review (complementary to `/evaluate`).
- **`/investigate`**: Use for systematic debugging with root cause analysis.

### Recommended gstack skills
- `/browse` — headless browser for web browsing
- `/review` — code review before shipping
- `/investigate` — systematic debugging
- `/careful`, `/freeze`, `/guard`, `/unfreeze` — safety guardrails
- `/learn` — cross-session memory for the codebase
- `/benchmark` — performance measurement
- `/health` — code quality dashboard
- `/cso` — security audit
- `/retro` — engineering retrospective
- `/gstack-upgrade` — self-updater

### All available gstack skills
`/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`.
