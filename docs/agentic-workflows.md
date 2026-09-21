# Agentic Workflows in PMTools

The three-agent workflow in [three-agent-workflow.md](three-agent-workflow.md) used to be executed by hand: three terminals, files as the bridge, rules remembered by the model. Since September 2026 the same workflow runs inside one Claude Code session on a **harness**: subagents with fixed roles, hooks that enforce the rules deterministically, saved multi-agent workflows for the repeatable multi-step jobs, and a ledger that survives context resets. This document is the walkthrough. Everything it describes is checked into the repository.

Model policy (Ivan, September 2026): never Sonnet or Haiku on this project. The floor is Opus 5 for mechanical fact-gathering; reasoning, verification, implementation and orchestration run on Fable 5.1 or whatever is the newest, most capable model. The agent definitions pin this; bump them when a newer model appears.

## 1. What you see when a session starts

`.claude/hooks/session-start.sh` runs on every session start, resume, clear and compaction. It prints the current branch (with a warning if it is `main` or `dev`), the count of uncommitted changes, the last five commits, a per-track summary of the ledger, the active items, and the three rules that matter most. This is the "session startup checklist" from the old workflow doc, now automatic and impossible to forget.

## 2. The ledger: `.claude/progress.json`

One JSON file, five tracks (`science-fixes`, `ui-kit`, `visual-tests`, `performance`, `housekeeping`), one entry per planned item with an id (`SCI-03`, `UIK-04`, …), a title, a severity where it applies, a status, a PR number and a one-line note.

- Statuses: `todo` → `in-progress` → `pr-open` → `merged`, or `blocked` with the reason in `notes`.
- Agents update it when they start an item, when the PR opens and when it merges. Humans read it; the session-start hook prints it.
- Ids are referenced by the workflows (`investigate-found-bugs` takes `["SCI-01", "SCI-02"]`), by commit messages and by PR titles, so one id ties together the roadmap note, the ledger entry, the investigation report and the PR.
- It mirrors, it does not replace: the science items point at [found-bugs-todo.md](../.claude/development-roadmap/notes/found-bugs-todo.md), the UI kit items at [03a-ui-kit.md](../.claude/development-roadmap/03a-ui-kit.md).

This is the "feature list with pass/fail state" pattern from Anthropic's guide on long-running agents: state lives in a file, not in the conversation, so a fresh session can pick up exactly where the last one stopped.

## 3. Subagents: `.claude/agents/*.md`

A subagent is a Markdown file with YAML frontmatter (name, description, tools, model, effort, optional worktree isolation) and a system prompt. Claude picks one automatically when a task matches its description, or you name it: *"Use the science-reviewer subagent to review PR #36."* Each runs with its own context window, so the main conversation only receives the result. `/agents` lists and edits them.

| Agent | Role | Can edit? | Model / effort |
|---|---|---|---|
| `bug-investigator` | Reproduce, localize, prove a root cause; return an evidence-backed fix spec. Also maps UI defects to source. | No (`disallowedTools: Write, Edit`) | Fable / high |
| `science-reviewer` | Skeptical domain review of anything touching `src/utils/statistics`, parsers, converters or `*.expected.json`; thesis + PmagPy cross-checks; reference-flip discipline. | No | Fable / xhigh |
| `evaluator` | Drives the live app on `localhost:3000` through Playwright as a researcher would; smoke tests, `verify-fixes.md` verification, dark-mode audits; writes the scored report under `test-data/v{version}/`. | Report file only | Fable / medium |
| `generator` | Implements one ledger item on a feature branch: change, `npm run verify`, atomic commits, ledger update, `verify-fixes.md`. | Yes | Fable / high |
| `repo-hygienist` | Read-only repository health report: CI, stale PRs and branches, dependency drift, docs and ledger drift, harness health. Proposes commands, runs none. | No | Opus / medium |

How they compose with the old skills: `/evaluate`, `/generate`, `/plan-fixes` and `/write-verify` still exist as skills you invoke in the main session. The `evaluator` agent loads the `/evaluate` skill as its protocol; the `generator` agent follows `/generate`'s rules. The difference is isolation: an agent's exploration does not pollute your context, and several can run at once.

Parallelism rule for this repository: parallelize **investigation and evaluation** freely (they are read-only); serialize **landing**. One PR at a time, reviewed by Ivan, stays the rule. When several generators must write code at once (for example three UI kit primitives), give each its own git worktree (`isolation: worktree` in the agent call, or the `EnterWorktree` tool); worktrees live under `.claude/worktrees/` and are cleaned up automatically when unchanged.

## 4. Hooks: `.claude/settings.json` and `.claude/hooks/*.sh`

Hooks are shell scripts the harness runs at fixed points. They receive the tool call as JSON on stdin and answer with an exit code: `0` lets it through, `2` blocks it and feeds stderr back to Claude. They are deterministic, they run for subagents too, and they do not depend on the model remembering anything.

| Hook | Event | What it enforces |
|---|---|---|
| `session-start.sh` | SessionStart | Prints the startup checklist and the ledger summary (section 1). |
| `guard-git.sh` | PreToolUse on Bash | No commit, merge, rebase, cherry-pick or revert while on `main` or `dev`; no push to `main` or `dev` (explicit refspec, implicit target, or force); no "checkout main && …" chains. Feature branches are unaffected. |
| `guard-protected-paths.sh` | PreToolUse on Edit/Write | Blocks edits under `src/utils/statistics/**` and to `src/__tests__/fixtures/**/*.expected.json` unless `.claude/.science-unlock` exists. Test files under `__tests__/` stay editable. |
| `check-edited-file.sh` | PostToolUse on Edit/Write | For files under `src/`: Prettier formats the file in place, ESLint runs on `.ts`/`.tsx`; lint errors come straight back to Claude (exit 2) instead of surfacing at commit time. |
| `verify-on-stop.sh` | Stop | If source files changed since the last green run, runs `npm run verify` before the turn is allowed to end; on failure Claude keeps working on the errors. A fingerprint stamp avoids re-running when nothing changed, and `stop_hook_active` prevents loops. |

Practical notes:

- **The science unlock is deliberate friction, not security.** When Ivan approves a change to scientific logic or a reference flip in the conversation, run `touch .claude/.science-unlock`, do the work, then `rm` it. Both files are git-ignored. Nobody should create the unlock without that approval.
- **The git guard reads the command text.** A heredoc that merely *mentions* `git push origin main` is blocked like the real thing. Write such prose with the Write tool, or rephrase.
- **Hooks reload live** when `.claude/settings.json` changes (the settings watcher covers `.claude/`); the scripts themselves are read on every invocation. `/hooks` shows what is active; `"disableAllHooks": true` in `.claude/settings.local.json` switches them off for you alone.
- **Testing a hook** without a live tool call: pipe synthetic JSON into it, e.g.

  ```bash
  echo '{"tool_input":{"command":"git push origin main"}}' | CLAUDE_PROJECT_DIR=$PWD bash .claude/hooks/guard-git.sh; echo "exit=$?"
  ```

  A ready-made suite of these checks was used when the hooks were written; keep it in mind when you change a regex.

## 5. Saved workflows: `.claude/workflows/*.js`

A workflow is a small JavaScript script that orchestrates subagents deterministically: fan out, verify, merge, with loops and conditionals in code rather than in prose. Each script starts with an `export const meta = {...}` block, then uses `agent()`, `pipeline()`, `parallel()`, `phase()` and `log()`. Agents can be forced to return typed JSON through a `schema`, so the script can branch on their answers. Runs are resumable, and `/workflows` shows live progress.

Workflows spawn many agents and cost accordingly, so they only run when you ask for one explicitly: type `/pr-review`, or say *"run the investigate-found-bugs workflow for SCI-01 and SCI-02"*, or use the keyword `ultracode` in a prompt to make workflows the default for that turn.

| Workflow | What it does | Args | Output |
|---|---|---|---|
| `investigate-found-bugs` | One `bug-investigator` per bug from the found-bugs catalog (parallel, read-only) → three `science-reviewer` refuters per spec (root cause, fix, science) → a ranking pass. | `["SCI-01", "SCI-05"]` or none for all | `test-data/v{version}/science-fix-queue.md` plus the structured queue and a "needs decision" list |
| `dark-mode-audit` | One `evaluator` walks every page and modal in dark mode (serial: Playwright shares one browser) → one `bug-investigator` per defect maps it to `path:line` and proposes a token → a plan pass. Needs `npm start` running. | optional custom scope | `test-data/v{version}/dark-mode-audit.md`, screenshots under `dark-mode/`, a token plan |
| `pr-review` | Scope the diff → one reviewer per dimension (correctness, conventions, tests; plus `science-reviewer` when science paths changed and a UI lens when TSX/SCSS changed) → dedup → three refuters per finding. | `{ "base": "dev", "head": "HEAD" }` | Confirmed findings sorted by severity, plus what was refuted and why |

Anatomy of a workflow, so you can write the next one (for example `ui-kit-review`):

```js
export const meta = { name: 'example', description: 'one line', phases: [{ title: 'Find' }, { title: 'Verify' }] }
const FINDINGS = { type: 'object', properties: { findings: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] } } }, required: ['findings'] }
const VERDICT = { type: 'object', properties: { refuted: { type: 'boolean' } }, required: ['refuted'] }
const found = await agent('Find problems in …', { phase: 'Find', agentType: 'bug-investigator', schema: FINDINGS })
const verified = await pipeline(found.findings, (finding) =>
  parallel([1, 2, 3].map((n) => () => agent(`Try to refute: ${finding.title}`, { phase: 'Verify', schema: VERDICT })))
    .then((votes) => ({ ...finding, confirmed: votes.filter(Boolean).filter((v) => v.refuted).length < 2 })))
return verified.filter(Boolean).filter((finding) => finding.confirmed)
```

Rules of thumb baked into the three scripts: prefer `pipeline()` (no barrier between stages) over `parallel()` unless a stage really needs every result at once (dedup does); make verifiers try to *refute*; never pass `model: 'sonnet'`; `Date.now()` and `Math.random()` are unavailable inside scripts.

## 5b. When to use an agent team

Agent teams are the experimental Claude Code feature where a lead session spawns **teammates**: full sessions with persistent context, a shared task list, and direct messaging between them. Subagents answer once and vanish; workflows are one-way graphs; teammates keep talking. Teams cost significantly more tokens, cannot survive resume or rewind, and run in interactive sessions only.

Ivan's rule (September 2026): **the calculation-verification loop is the case for a team.** Any work where a generator changes numbers and a reviewer must cross-check them against PmagPy or the thesis, iterating until they agree (science fixes with reference flips, `SCI-*` items), is preferably done as a team of `generator`, `science-reviewer` and `evaluator` spawned from the definitions in `.claude/agents/`. Read-only fan-outs (investigation, PR review, audits, hygiene) stay on subagents and workflows.

- **Enable for this repository only**: `bash .claude/scripts/agent-teams.sh on` (or `/agent-teams on` inside Claude Code). It writes `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` into the git-ignored `.claude/settings.local.json`; restart the session. `off` and `status` do what they say.
- **The decision gate**: `.claude/hooks/remind-agent-teams.sh` runs on every prompt. When a prompt looks like verification work (PmagPy, thesis, `SCI-nn`, reference flip, fold/reversal test, Fisher, Butler, McFadden, "verify the calculation") and no decision was taken yet in the session, it opens a pending state and instructs Claude that its first action must be the question tool with three fixed options: enable teams and restart (or start a team now when the flag is already set), continue without a team, or "not verification work". A `PreToolUse` gate (`gate-agent-teams-decision.sh`) refuses every other tool until Claude records your answer with `bash .claude/scripts/agent-teams-decision.sh <choice>`; subagents are exempt, and a second prompt in the same session only gets a short nudge. Once you have decided, the session stays quiet. The gate never blocks the prompt itself, only the tools that would start work.
- **Escape hatch**: in a non-interactive session the question tool does not exist; Claude then records `continue-without-team` and says so. The pending state is the git-ignored file `.claude/.agent-teams-pending`; deleting it also clears the gate.
- **Before trusting the guards inside a team**: the docs do not state whether PreToolUse hooks fire for teammates. The first team session should try a blocked git command and a science-path edit from a teammate and confirm both are refused.
- **Start of a team session**: state the goal, name the three teammates, give the reviewer the fixture and PmagPy script paths, and make "reviewer approves" the completion condition of the task. Land the result as one PR, as always.

## 6. Cloud pieces (user-triggered, billed)

- **Routines** (`/schedule`): a saved prompt that runs on a schedule in the cloud. The natural first one is weekly repository hygiene: *"Act as the repo-hygienist agent defined in `.claude/agents/repo-hygienist.md` for I194/PMTools and post the report."* Creating a routine is Ivan's call; nothing in the repository creates one automatically.
- **Ultra review** (`/code-review ultra` or `/code-review ultra <PR#>`): a multi-agent cloud review of a branch or PR. Complementary to the `pr-review` workflow, which knows the project rules and the science lens.

## 7. Memory

Claude keeps an auto-memory directory per project outside the repository (`~/.claude/projects/-Users-i1948374-PMTools/memory/`). It holds the working rules Ivan has given (branching, one PR at a time, naming, model policy, wait for CI green) and pointers to ongoing work. Things that belong to the repository (structure, decisions, plans) go into `CLAUDE.md`, the roadmap and the ledger instead. gstack's `/learn` is a second, repository-scoped memory for codebase learnings.

## Playbooks

### A. A science fix (one `SCI-xx` item)

1. Start on `dev`: `git checkout dev && git pull`, then `git checkout -b fix/sci-03-cutoff-reset dev`.
2. If the item has not been investigated yet: *"run the investigate-found-bugs workflow for SCI-03"*. Read `test-data/v{version}/science-fix-queue.md`. If the spec landed in "needs decision", decide, then continue.
3. Ivan approves the change to scientific logic in the conversation. Then `touch .claude/.science-unlock`.
4. *"Use the generator subagent to implement SCI-03 from the science-fix queue."* It changes the code, regenerates exactly the affected references with `UPDATE_FIXTURES=1 npm test -- --watchAll=false <pattern>`, eyeballs them, commits with `fix(science): …`, updates the ledger, writes `verify-fixes.md`.
5. `rm .claude/.science-unlock`.
6. *"run the pr-review workflow"*; fix confirmed findings.
7. `npm start` in another terminal, then *"Use the evaluator subagent to verify test-data/v{version}/verify-fixes.md."*
8. Push the branch, `gh pr create --base dev`, wait for CI green (`gh pr checks`), wait for Ivan's review. One PR at a time.

### B. A UI kit primitive (one `UIK-xx` item)

Prerequisite: `src/ui-kit/SPEC.md` exists (UIK-01, Ivan). Then: branch from `dev` → generator implements one primitive with stories and tests → `pr-review` workflow (`ui` dimension fires automatically) → evaluator screenshots `/ui-kit` in both themes → PR → Ivan's visual review. To build three primitives at once, spawn three generators with `isolation: worktree`; still land them one PR at a time.

### C. Dark mode

`npm start`, then *"run the dark-mode-audit workflow"*. The report ranks defects and proposes the token that fixes each one; that list is the input to UIK-03 (tokens + the palette bridge into the existing MUI theme), and the workflow is re-run after UIK-03 lands to measure the delta.

### D. Weekly hygiene

*"Use the repo-hygienist subagent for a full report."* It proposes the exact `gh pr close` / `git push origin --delete` commands; Ivan runs the ones he agrees with. The same prompt is what a cloud routine would run.

### E. Reviewing an incoming PR

`git fetch origin pull/<n>/head:pr-<n>`, then *"run the pr-review workflow with head pr-<n>"*. For a big or risky PR add `/code-review ultra <n>`.

## First sessions, in order

1. Rebase and land PR #36 (`SCI-00`) as the warm-up: no new tooling, just the branch guard and the Stop hook doing their jobs.
2. `investigate-found-bugs` for the two red items (`SCI-01`, `SCI-02`); read the queue.
3. Land `SCI-01` (fold-test bedding fix) with playbook A. That PR is the first real reference flip.
4. Ivan writes `src/ui-kit/SPEC.md` (`UIK-01`) while agents run `dark-mode-audit` for the baseline.
5. `UIK-02` then `UIK-03`: scaffold, tokens, the palette bridge; re-run the audit for the delta.

## Troubleshooting

- **A hook blocked something legitimate.** Read the message: it names the script and the rule. For science paths, get approval and create the unlock file. For git, you are probably on `main`/`dev`. For a doc containing forbidden phrases, use the Write tool.
- **`npm run verify` keeps failing at Stop.** The hook only forces one continuation per stop; fix the reported errors, and the next stop passes. `cat .claude/.verify-stamp` shows the fingerprint of the last green run.
- **A workflow returned an empty result.** Read `journal.jsonl` in the run's transcript directory (the run id is in the tool result); resume with the same script path and `resumeFromRunId` after fixing the prompt.
- **The evaluator cannot reach the app.** `npm start` must be running; the evaluator reports `blocked` rather than starting servers.
- **An agent does not appear.** The agent registry is built when a session starts: a file added to `.claude/agents/` during a session is not spawnable until the next session (hooks, by contrast, reload live). `/agents` lists what loaded. Names must match the `name:` field and contain no colons.
