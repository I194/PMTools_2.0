# AI-Assisted Development Guide

This project uses [Claude Code](https://docs.anthropic.com/en/docs/claude-code) with two toolkits:

- **PMTools skills** — custom agents for the three-agent workflow (plan → generate → evaluate)
- **gstack** — general-purpose development skills (code review, debugging, browsing, safety)

## Prerequisites

- Node.js (see `.nvmrc` for version)
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed
- [bun](https://bun.sh) runtime (required by gstack)

### First-time setup

```bash
npm install                          # project dependencies
cd .claude/skills/gstack && ./setup  # build gstack binaries
```

If gstack skills stop working after a pull, re-run the setup command above.

---

## Daily Development

### Quick commands

```bash
npm start            # dev server on localhost:3000
npm run verify       # typecheck + lint + format (run after every change)
npm run build        # production build
```

### Starting a Claude Code session

Open a terminal in the project root and run `claude`. The agent reads `CLAUDE.md` automatically and knows the project structure, conventions, and available skills.

---

## Two Toolkits

### PMTools skills (`.claude/skills/`)

Custom agents designed specifically for this project. They understand paleomagnetic data formats, scientific computations, and the app's domain.

| Skill | What it does | When to use |
|-------|-------------|-------------|
| `/plan-fixes` | Reads bug reports from `.claude/issues/`, deduplicates, prioritizes, creates a work plan | After collecting user bug reports |
| `/generate` | Implements one fix/feature at a time with atomic commits and verification | When you have a spec or work plan to implement |
| `/evaluate` | Tests the live app via Playwright as a real user, produces bug reports with scores | After implementation, to verify quality |
| `/write-verify` | Generates a verification prompt from recent git changes | To bridge Generator → Evaluator |

### gstack skills (`.claude/skills/gstack/`)

General-purpose development skills. The most useful ones for this project:

| Skill | What it does | When to use |
|-------|-------------|-------------|
| `/browse` | Headless browser — navigate, click, screenshot any URL | Browsing docs, checking deployed site, research |
| `/review` | Code review against base branch | Before creating a PR |
| `/investigate` | Systematic debugging with root cause analysis | When a bug is hard to trace |
| `/careful` | Warns before destructive commands (rm -rf, force-push, etc.) | Working near production or sensitive code |
| `/freeze` | Locks edits to one directory | Debugging — prevents accidental changes elsewhere |
| `/guard` | `/careful` + `/freeze` combined | Maximum safety mode |
| `/unfreeze` | Removes the `/freeze` lock | When you're done with scoped work |
| `/health` | Code quality dashboard (types, lint, tests, dead code) | Periodic health checks |
| `/benchmark` | Page load times, Core Web Vitals, resource sizes | Before/after performance comparison |
| `/cso` | Security audit (OWASP Top 10, STRIDE, dependency scan) | Before major releases |
| `/retro` | Engineering retrospective from git history | End of sprint/week |
| `/learn` | Manage cross-session learnings | Review what the AI has learned about the codebase |
| `/gstack-upgrade` | Update gstack to latest version | When skills feel outdated |

Full list of all gstack skills is in `CLAUDE.md`.

---

## Workflows

### 1. Bug fix cycle (most common)

This is the three-agent workflow. Each agent runs in a **separate Claude Code session**. Context passes between them via files, not conversation history.

```
Bug reports          Work plan           Code + commits        Evaluation report
(.claude/issues/) → (workplan.md)    → (git history)       → (evaluation-report.md)
                     /plan-fixes         /generate              /evaluate
```

**Step by step:**

1. **Collect bug reports** — users submit issues as markdown files in `.claude/issues/{username}/issues.md`

2. **Plan** — open a Claude Code session:
   ```
   /plan-fixes
   ```
   Output: `test-data/v{version}/workplan-{date}.md`

3. **Generate** — open a new session, paste the work plan:
   ```
   /generate
   Implement fixes from this work plan: [paste or reference workplan file]
   ```
   The Generator works one fix at a time, runs `npm run verify` after each, and makes atomic commits.

4. **Bridge** — after the Generator finishes, create a verification prompt:
   ```
   /write-verify
   ```
   Output: `test-data/v{version}/verify-fixes.md`

5. **Evaluate** — start `npm start` in a separate terminal, then open a new Claude Code session:
   ```
   /evaluate [paste verification prompt or reference verify-fixes.md]
   ```
   Output: `test-data/v{version}/evaluation-report-{N}.md`

6. **Iterate** — if the Evaluator finds bugs, start a new Generator session with the bug report. Repeat steps 3-5 until quality is satisfactory.

### 2. New feature

1. **Plan** — enter plan mode and describe the feature:
   ```
   /plan
   Add a feature to export stereonet plots as high-resolution PNG images.
   ```
   Review and approve the spec.

2. **Generate** — paste the approved spec:
   ```
   /generate
   Implement this spec: [paste spec]
   ```

3. **Review** — before shipping, run a code review:
   ```
   /review
   ```

4. **Evaluate** — test the live app with `/evaluate`

### 3. Quick investigation

When something is broken and you need to understand why:

```
/investigate
The Zijderveld plot renders empty when loading .rs3 files with negative inclinations.
```

The investigator will trace the data flow, test hypotheses, and propose a fix with evidence.

### 4. Pre-release checklist

```
/health              # code quality score
/cso                 # security audit
/review              # code review
/evaluate            # full app QA
/benchmark           # performance baseline
```

---

## Important Rules

- **`console.log` is forbidden** — ESLint error, blocked by pre-commit hook
- **`npm run verify` must pass** after every change (typecheck + lint + format)
- **Do NOT modify scientific logic** in `utils/statistics/` without explicit request
- **Do NOT upgrade to React 18** — the app uses React 17's `ReactDOM.render` API
- **Evaluator uses Playwright MCP** (`mcp__playwright__*`), not gstack's `/browse`
- **Never kill browser processes** — Playwright manages its own Chrome instance
- **Commits**: lowercase imperative mood, `hotfix:` prefix for critical fixes

---

## File Conventions

| Directory | Purpose |
|-----------|---------|
| `.claude/issues/` | User bug reports (one folder per reporter) |
| `.claude/feature-requests-v{X}/` | Feature request documents |
| `test-data/v{version}/` | Work plans, evaluation reports, verification prompts |
| `test-data/` | Sample PMD/DIR files for testing |
| `docs/` | Developer documentation |

---

## Troubleshooting

**gstack skills not found or broken:**
```bash
cd .claude/skills/gstack && ./setup
```

**Evaluator can't connect to the app:**
Make sure `npm start` is running in a separate terminal before starting the Evaluator session.

**Playwright MCP not available:**
Check that `.claude/settings.local.json` has the Playwright MCP server configured.

**Pre-commit hook blocks commit:**
Usually `console.log` or a lint error. Run `npm run verify` to see the issue, fix it, then commit again.
