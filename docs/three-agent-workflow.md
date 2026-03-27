# Three-Agent Workflow Guide

This workflow splits AI-assisted development into three specialized roles: **Planner**, **Generator**, and **Evaluator**. The separation of generation and evaluation is a powerful lever — it's much easier to teach a separate evaluator to be skeptical than to make a generator critique itself.

> Based on [Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) by Anthropic.

## Overview

```
 ┌──────────┐    spec    ┌───────────┐   code    ┌───────────┐
 │ Planner  │ ────────→  │ Generator │ ────────→ │ Evaluator │
 │ (Plan    │            │ (Main     │           │ (Separate │
 │  mode)   │            │  session) │  ←──────  │  session) │
 └──────────┘            └───────────┘  feedback  └───────────┘
```

Each agent runs in a **separate Claude Code session**. Context is passed between them via files (specs, code, progress log), not conversation history.

---

## Agent 1: Planner

**Role:** Takes a brief task description (1–4 sentences) and expands it into a full product specification with acceptance criteria. Deliberately avoids technical implementation details so that planning mistakes don't cascade into code.

**How to run:**

1. Open a new Claude Code session in the PMTools directory
2. Enter Plan mode:
   ```
   /plan
   ```
3. Describe your task:
   ```
   Add a feature to export stereonet plots as high-resolution PNG images
   with a configurable DPI setting in the export dialog.
   ```
4. The Planner will:
   - Explore the codebase to understand current export capabilities
   - Ask clarifying questions if needed
   - Produce a specification with:
     - User-facing behavior description
     - Acceptance criteria (what "done" looks like)
     - Edge cases and constraints
     - Which pages/components are affected
5. Review and approve the plan

**Output:** A specification file or approved plan that the Generator will follow.

---

## Agent 2: Generator

**Role:** Implements features one at a time following the Planner's specification. Has full access to git, makes atomic commits, and runs verification after every change.

**How to run:**

1. Open a new Claude Code session in the PMTools directory
2. Paste the spec from the Planner and instruct:
   ```
   Implement the following feature spec. Work on one acceptance criterion
   at a time. After each change, run `npm run verify`. Make atomic git
   commits. Log your progress in claude-progress.txt.

   [paste spec here]
   ```
3. The Generator will:
   - Read `claude-progress.txt` and `git log` to understand current state
   - Implement one acceptance criterion at a time
   - Run `npm run verify` after each change (typecheck + lint + format)
   - Make atomic git commits with descriptive messages
   - Update `claude-progress.txt` with what was accomplished
   - Leave code in a merge-ready state

**Session startup checklist (for multi-session work):**
```
1. Read claude-progress.txt for context from previous sessions
2. Read git log --oneline -20 for recent changes
3. Run npm run verify to confirm clean state
4. Pick up the next incomplete item
```

**Output:** Working code committed to git, progress log updated.

---

## Agent 3: Evaluator

**Role:** Tests the live application through Playwright MCP as a real user would. Finds bugs, assesses quality, and provides structured feedback to the Generator.

**Prerequisites:**
- Dev server running: `npm start` (localhost:3000)
- Playwright MCP configured (already set up in `.mcp.json`)

**How to run:**

1. Start the dev server in a terminal:
   ```bash
   npm start
   ```
2. Open a **new** Claude Code session in the PMTools directory
3. Give the Evaluator its instructions:

   ```
   You are an Evaluator agent. The dev server is running on localhost:3000.

   Test the following feature: [describe what was implemented]

   Steps to test:
   1. Navigate to localhost:3000/app/pca
   2. Upload the file test-data/sample.pmd using the file drop zone
   3. Verify that Zijderveld, stereographic, and magnetization graphs render
   4. [add specific steps for the feature being tested]

   After testing, provide a structured evaluation:

   ## Bug Report
   List any bugs found with steps to reproduce.

   ## Scores (1-5)
   - Design quality: visual consistency, spacing, colors
   - Functionality: do all actions work correctly
   - Technical quality: no console errors, fast rendering
   - UX: clear navigation, user feedback on actions

   ## Summary
   Overall assessment and priority recommendations.
   ```

4. The Evaluator will use Playwright MCP tools to:
   - Navigate to pages (`browser_navigate`)
   - Take snapshots (`browser_snapshot`) to see the current UI state
   - Click elements (`browser_click`)
   - Fill inputs (`browser_type`)
   - Take screenshots with `--caps vision` for visual inspection
5. Collect the Evaluator's feedback

**Output:** A structured bug report with scores and recommendations.

---

## Passing Feedback Back

After the Evaluator produces its report, start a new Generator session (or continue an existing one) and paste the feedback:

```
The Evaluator found the following issues after testing. Fix them one at a
time, running `npm run verify` after each fix.

[paste Evaluator's bug report here]
```

Repeat the Generator → Evaluator cycle until the Evaluator gives satisfactory scores.

---

## Test Data

Sample files for the Evaluator to use during testing are in `test-data/`:

| File | Format | Use Case |
|------|--------|----------|
| `sample.pmd` | PMD (thermal) | Load on PCA page, verify graphs render, test PCA line fitting |
| `sample.dir` | DIR | Load on DIR page, verify stereo plot and Fisher statistics |

See `test-data/README.md` for expected results from each file.

---

## Tips

- **Context reset > compaction.** A full context reset with state passed via files works better than summarizing history on the fly. That's why each agent runs in a separate session.
- **Evaluation criteria improve generation.** Even before the first Evaluator run, having explicit quality criteria makes the Generator produce better code.
- **Keep sessions focused.** One feature per Generator session. Don't try to implement everything at once.
- **The Evaluator catches edge cases.** It tests as a real user and finds things the Generator misses — broken layouts, missing feedback, slow rendering.
- **Progress file is the memory bridge.** `claude-progress.txt` is how agents share state across sessions. Keep it updated.

---

## Quick Reference

| Agent | Mode | Trigger | Key Output |
|-------|------|---------|------------|
| Planner | `/plan` in Claude Code | New feature request | Spec with acceptance criteria |
| Generator | Normal Claude Code session | Spec from Planner | Committed code + progress log |
| Evaluator | Normal Claude Code session + Playwright MCP | After Generator finishes | Bug report + quality scores |
