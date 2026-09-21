# Phase 3a — Custom UI Kit (build it first)

## Context

September 2026 decision (Ivan): **MUI goes away, replaced by a custom in-house UI kit.** Not because of bundle size or fashion, but because MUI's constraints, feel and look are wrong for PMTools, and because Ivan has built UI kits in big-tech settings and knows the shape of the result he wants. Consequences for this roadmap:

- The kit is **built first, in isolation**, as a complete, tested, documented layer in `src/ui-kit/`. Nothing in the app migrates during 3a.
- [03-ui-migration.md](03-ui-migration.md) becomes **3b**: the migration of pages and AppLogic onto the kit, followed by the removal of MUI and Emotion. It starts only when 3a's exit criteria are met.
- **Design decisions are Ivan's.** Tokens, naming, component API conventions, visual language: he writes them into `src/ui-kit/SPEC.md` (template below). Agents scaffold, implement against the spec, test, document and audit. An agent that is unsure about a design question asks; it does not improvise a design system.
- Phase 2 (visual regression) is not a prerequisite for 3a. The kit is new code with no behavior to protect, and its showcase route (`/ui-kit`) becomes the first deterministic screenshot target. Phase 2 must cover the *app pages* before 3b starts.

The old roadmap already forbade Tailwind, TanStack and DataGrid libraries. This document adds: **no MUI in new code**, and Radix is an *open decision* (D2 below), not a given.

## Goal

`src/ui-kit/` complete in isolation:

1. Design tokens as CSS custom properties, light and dark, switched with `data-theme` on `<html>`, no React context.
2. Every primitive the app needs (inventory below), each with types, an SCSS module that uses only tokens, a showcase entry, and tests.
3. Inline SVG icons replacing the 29 `@mui/icons-material` imports.
4. A hand-built `DataTable` on native `<table>` covering every pattern the 12 DataGrid instances use.
5. A `/ui-kit` showcase route rendering every primitive in every variant and state, in both themes.
6. ESLint boundaries so the kit stays the only UI import surface and no MUI can enter new code.

## Non-goals (3a)

- No app migration, no MUI removal (that is 3b).
- No visual redesign of the *app* yet; the kit defines the visual language, the app adopts it in 3b.
- No accessibility audit beyond the per-primitive minimums in the definition of done.
- No new dependencies unless D2 lands on Radix for the overlay primitives.

## Inventory (measured on `dev` at v2.6.5, 2026-09-04)

What the kit must replace. Refresh with the command at the end of this section before planning a wave.

| MUI component | Import sites | Kit primitive |
|---|---|---|
| `Button` | 49 | `Button` |
| `Typography` | 36 | `Text` / `Heading` / `Label` |
| `IconButton` | 12 | `IconButton` |
| `Tooltip` | 11 | `Tooltip` |
| `TextField` | 8 | `TextField`, `NumberField` |
| `MenuItem` + `Menu` + `MenuList` | 8 + 3 + 1 | `DropdownMenu` |
| `Divider` | 7 | `Divider` |
| `Input`, `InputBase`, `InputLabel`, `FormControl`, `FormControlLabel` | 3 + 1 + 2 + 2 + 2 | `TextField`, `FormRow` |
| `ButtonGroup` | 3 | `ButtonGroup` |
| `Paper`, `Box` | 2 + 1 | `Surface`, `Stack` |
| `Tabs` + `Tab` | 1 + 1 | `Tabs` |
| `Switch`, `Checkbox`, `Select` | 1 each | `Switch`, `Checkbox`, `Select` |
| `Modal`, `Popover`, `Popper`, `ClickAwayListener`, `Grow` | 1 each | `Dialog`, `Popover` |
| `ListItem`, `ListItemText` | 1 each | `DropdownMenu` items |
| `@mui/material/styles` (`useTheme`, `styled`, `createTheme`) | 74 | tokens + `useTheme()` reading `data-theme` |
| inline `sx={{ ... }}` props | 107 | SCSS modules + tokens |
| `@mui/icons-material/*` | 29 distinct icons | `src/ui-kit/icons/` |
| `@mui/x-data-grid` | 28 files, 12 grid instances | `DataTable` |

Theming today: `createTheme({ palette: { mode } })` in `src/App/App.tsx` and nothing else. Six SCSS modules carry hand-patched `_dark` classes. Hardcoded colors in SCSS: `#212121` ×23, `#000` ×20, `#119dff` ×9, `#fff` ×6, plus a handful of `#9933ff`, `#474c50`, `#ce93d8`, `#ffb74d`. This is why dark mode looks unfinished: there is no token layer, so every component guesses.

Refresh the inventory:

```bash
grep -rhoE "from '@mui/material/[A-Za-z]+'|import \{[^}]+\} from '@mui/material'" src --include='*.tsx' --include='*.ts' \
  | sed -E "s/.*'@mui\/material\/([A-Za-z]+)'/\1/; s/import \{([^}]+)\} from '@mui\/material'/\1/" \
  | tr ',' '\n' | sed 's/^ *//; s/ *$//' | grep -v '^$' | sort | uniq -c | sort -rn
grep -rhoE "@mui/icons-material/[A-Za-z]+" src | sort -u | wc -l
grep -rl "@mui/x-data-grid" src | wc -l
grep -rn "sx={{" src --include='*.tsx' | wc -l
grep -rhoE "#[0-9a-fA-F]{3,6}\b" src --include='*.scss' | sort | uniq -c | sort -rn | head
```

## Decisions

| # | Decision | Status |
|---|---|---|
| D1 | Directory is `src/ui-kit/`; the deliverable is called "the UI kit". 03-ui-migration.md was renamed accordingly. | decided |
| D2 | **Radix headless primitives inside the kit?** Default: hand-rolled everything. Radix (`react-dialog`, `react-popover`, `react-select`) is allowed *only* inside `src/ui-kit/` and *only* for focus trapping and positioning if hand-rolling proves costly. Never exported, never imported by app code. | **open — Ivan** |
| D3 | Styling: SCSS modules + CSS custom properties. No CSS-in-JS. Emotion leaves with MUI. | decided |
| D4 | Theme switching: `document.documentElement.dataset.theme = 'light' \| 'dark'`, persisted in `localStorage.colorMode` (existing key), anti-flash inline script in `public/index.html`. No `ThemeProvider`. | decided |
| D5 | Icons: one inline SVG React component per icon under `src/ui-kit/icons/`, `currentColor` fill, `size` prop. | decided |
| D6 | Tables: hand-built on native `<table>`. Virtualization hand-rolled; a tiny single-purpose lib only if profiling forces it. Never TanStack. | decided |
| D7 | Showcase route `/ui-kit` ships in the production build (tiny, lazy-loaded, unlinked). It is the visual-regression target and the place to reproduce UI bugs. | decided (revisit if size matters) |
| D8 | Component API conventions live in `src/ui-kit/SPEC.md`, written by Ivan before UIK-04 starts. | pending (UIK-01) |
| D9 | Model policy for agents on this track: Fable-class for implementation and review; nothing below Opus 5. | decided |

## Structure

```
src/ui-kit/
├── SPEC.md                        # Ivan's design contract (UIK-01) — tokens, naming, API rules
├── README.md                      # How to use the kit; one example per primitive
├── index.ts                       # Public barrel — the ONLY import surface for app code
├── tokens/
│   ├── colors.scss                # light + dark palettes as CSS custom properties
│   ├── spacing.scss               # 4px scale
│   ├── typography.scss
│   ├── radii.scss
│   ├── shadows.scss
│   ├── z-index.scss
│   ├── motion.scss
│   └── index.scss                 # @forward all tokens
├── theme/
│   ├── theme.scss                 # :root {} and [data-theme="dark"] {}
│   ├── theme.ts                   # token names as TS constants, useTheme(), setTheme()
│   └── antiFlash.ts               # inline-script source used by public/index.html
├── primitives/
│   ├── Button/                    # Button.tsx, Button.module.scss, Button.types.ts, Button.stories.tsx, Button.test.tsx, index.ts
│   ├── IconButton/
│   ├── ButtonGroup/
│   ├── Text/                      # Text, Heading, Label
│   ├── Divider/
│   ├── Stack/
│   ├── Surface/
│   ├── TextField/
│   ├── NumberField/
│   ├── Checkbox/
│   ├── Switch/
│   ├── Select/
│   ├── Tabs/
│   ├── Tooltip/
│   ├── Dialog/
│   ├── Popover/
│   ├── DropdownMenu/
│   └── DataTable/                 # see 03-ui-migration.md "Tier 3" for the hook-based architecture
├── patterns/
│   ├── FormRow/
│   ├── ToolbarButton/
│   └── FileDropzone/              # wraps react-dropzone behind the kit API
├── icons/
│   ├── Visibility.tsx ... (29)
│   └── index.ts
├── showcase/
│   ├── ShowcasePage.tsx           # route /ui-kit; iterates the registry, renders each story in both themes
│   ├── registry.ts                # every *.stories.tsx registers here
│   └── Showcase.module.scss
└── utils/
    ├── classNames.ts              # tiny clsx replacement
    ├── composeRefs.ts
    └── useControllableState.ts
```

`*.stories.tsx` is a local convention (a default export of named story functions), not Storybook. The showcase page and the snapshot tests both read the same stories, so a story written once serves three purposes: documentation, screenshots, and a Jest snapshot.

## Execution plan (one PR per step, one Generator session per PR)

Ledger ids are in `.claude/progress.json` (track `ui-kit`).

| Step | Ledger | What lands | Who |
|---|---|---|---|
| 0 | UIK-01 | `src/ui-kit/SPEC.md`: token scale and naming, color roles, typography scale, component API conventions (`variant` / `size` / `tone` props, controlled vs uncontrolled policy, ref forwarding, `className` passthrough, a11y minimums), motion rules, dark/light rules. | **Ivan** (agents may draft the template, Ivan decides) |
| 1 | UIK-02 | Scaffold the tree above with empty barrels; ESLint `no-restricted-imports` overrides: inside `src/ui-kit/**` ban `@mui/*`, `@emotion/*`, `@mui/x-data-grid`; repo-wide ban `@tanstack/*` and `tailwindcss`; `/ui-kit` lazy route + empty showcase page; `npm run verify` green. | generator |
| 2 | UIK-03 | Tokens + `theme.scss` + `theme.ts` + anti-flash script. **Strangler bridge**: `src/App/App.tsx`'s `createTheme` reads its palette from the tokens, so the existing MUI app immediately gets consistent dark-mode colors while nothing else changes. Run the `dark-mode-audit` workflow before (baseline) and after (delta). | generator + evaluator |
| 3 | UIK-04 | Wave 1 primitives by usage count: `Button`, `IconButton`, `ButtonGroup`, `Text`/`Heading`/`Label`, `Divider`, `Stack`, `Surface`. | generator, one PR per primitive or per small group |
| 4 | UIK-05 | Wave 2: `TextField`, `NumberField`, `Checkbox`, `Switch`, `Select`, `Tabs`, `Tooltip`. | generator |
| 5 | UIK-06 | Wave 3 overlays: `Dialog`, `Popover`, `DropdownMenu`. Blocked on D2. | Ivan decides D2, then generator |
| 6 | UIK-07 | Icons: 29 inline SVG components + index. | generator |
| 7 | UIK-08 | `DataTable` primitive with the hook architecture from 03-ui-migration.md; showcase stories reproduce each of the 12 existing grid patterns with sample data from `test-data/`. | generator |
| 8 | UIK-09 | Phase 3b: migration per 03-ui-migration.md, then MUI/Emotion removal sweep. | generator, evaluator, pr-review workflow |

### Definition of done for every primitive

- `Component.tsx` with a typed props interface in `Component.types.ts`; full descriptive names (project rule).
- `Component.module.scss` that references **only** tokens: `grep -nE "#[0-9a-fA-F]{3,8}|rgba?\(|[0-9]+px" Component.module.scss` returns nothing outside `var(--...)` references and documented exceptions (1px borders are a documented exception).
- `Component.stories.tsx` covering every variant × size × state (default, hover, focus-visible, active, disabled, loading, error where applicable) and registered in the showcase.
- `Component.test.tsx`: renders every story in both themes with `@testing-library/react` and snapshots the resulting HTML; keyboard interaction tests for anything focusable (Enter/Space activate, Escape closes, arrow keys move within menus/tabs).
- Exported from `src/ui-kit/index.ts`; documented in `src/ui-kit/README.md` with one example.
- No `@mui`, `@emotion`, or `@radix-ui` import unless D2 explicitly allows it for this primitive.
- `npm run verify`, `npm test -- --watchAll=false`, `npm run build` green.

## Working with agents on this phase

- **Ivan** owns `SPEC.md` and every design decision; he reviews each PR visually on `/ui-kit`.
- **generator** (subagent) implements one ledger item per session/PR, updates the ledger, writes `test-data/v{version}/verify-fixes.md`.
- **pr-review** (workflow) runs on every kit PR; its `ui` dimension checks token discipline, dark mode, hotkeys and i18n.
- **evaluator** (subagent) screenshots `/ui-kit` in both themes for the PR description, and runs the `dark-mode-audit` workflow around UIK-03.
- Parallelism: several primitives can be built at once by generators in **worktrees** (`isolation: worktree`), but they are *landed* one PR at a time, in the order Ivan reviews them.
- A future `ui-kit-review` workflow (judge panel: accessibility, API consistency, theming, SCSS hygiene, then adversarial verification) can be copied from `.claude/workflows/pr-review.js` once wave 1 exists and there is something to judge.

## Exit criteria (3a)

- [ ] `src/ui-kit/SPEC.md` exists and every primitive references the section it implements.
- [ ] Every primitive in the inventory table exists with the definition of done above.
- [ ] `/ui-kit` renders every story in both themes with no console errors.
- [ ] Jest snapshot tests cover every story; Playwright screenshot baselines exist for `/ui-kit` in both themes (this is Phase 2's first deliverable).
- [ ] ESLint boundaries in place: kit code cannot import MUI/Emotion; repo cannot import TanStack/Tailwind.
- [ ] The strangler bridge (UIK-03) shipped: the MUI app reads its palette from the tokens; dark-mode audit shows no `critical` or `major` defects left on app pages.
- [ ] D2 decided and recorded here.
- [ ] Zero changes to `src/utils/`, `src/services/` and the app pages other than the `/ui-kit` route and the palette bridge.

## Risks

| Risk | Mitigation |
|---|---|
| The kit drifts from what the app actually needs | Inventory drives the waves; DataTable stories reproduce the 12 real grids with real data. |
| Design decisions made by an agent instead of Ivan | SPEC.md is a hard prerequisite for UIK-04; the generator stops and asks on anything the spec does not cover. |
| Overlay primitives (focus trap, positioning, portals) eat the schedule | D2 escape hatch: Radix inside the kit only. |
| Snapshot tests become noise | Snapshot the story HTML with class names, not computed styles; regenerate only after Ivan's visual review of `/ui-kit`. |
| 3b starts before Phase 2 covers app pages | Exit criteria of 3a require the `/ui-kit` baselines; 3b's first step is the app-page baselines. |
