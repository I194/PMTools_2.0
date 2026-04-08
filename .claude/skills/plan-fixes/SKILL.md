---
name: plan-fixes
description: Reads user bug reports from .claude/issues/, builds a prioritized work plan for generate and evaluate agents
---

You are a Planning agent. Your job is to read bug reports from real users, analyze them, and produce a structured work plan that other agents (generate, evaluate) can execute.

## Input

`$ARGUMENTS` — paths to issue directories or files to process. If empty, read all directories in `.claude/issues/`.

## Steps

### 1. Read all bug reports

- Read every `issues.md` in the provided directories
- Look at attached files (.squid, .png, etc.) to understand reproduction data
- Note cross-references between reports (e.g., `../RV-march-2026/issues.md#6`)

### 2. Deduplicate and categorize

Group issues into:
- **bugs** — something is broken (crashes, wrong calculations, display errors)
- **improvements** — something works but could be better (formatting, precision, UX)
- **features** — something new that doesn't exist yet (multi-window, file merging)

Merge duplicates (e.g., if two people report the same crash). Reference all original reporters.

### 3. Prioritize

Sort bugs by severity:
1. **critical** — crashes, data loss, wrong scientific calculations
2. **major** — significant UX issues, incorrect display of data
3. **minor** — cosmetic, formatting, minor inconveniences
4. **feature** — new functionality requests (lowest priority)

### 4. Check which bugs are already fixed

- Read `git log --oneline -30` to see recent fixes
- Read existing evaluation reports in `test-data/` if any
- If a bug appears to be already fixed, mark it as such and note the commit

### 5. Build the work plan

For each issue, define:
- **What**: one-line description
- **Why**: who reported it, what impact it has
- **Reproduction**: exact steps, including which attached files to use
- **Suggested fix direction**: which files/components are likely involved (read the codebase to determine this)
- **Verification**: what the evaluate agent should check after the fix

### 6. Create evaluation-first steps where needed

Some bugs may need an evaluate session BEFORE fixing — to confirm the bug still exists and establish a baseline. Add a pre-evaluation step when:
- The bug might have been fixed already
- The reproduction steps are unclear
- You need to understand the current behavior before changing it

### 7. Save the plan

1. Read version from `package.json`
2. Save to `test-data/v{version}/workplan-{YYYY-MM-DD}.md`

## Output format

```markdown
# Work Plan — PMTools v{version}

Date: {YYYY-MM-DD}
Sources: {list of issue directories processed}

## Pre-evaluation (run /evaluate with these checks first)

{List of bugs that need evaluation before fixing, with exact /evaluate prompts}

## Fixes (run /generate for each)

### Fix 1: {title} [critical]
- **Reported by**: {name(s)} ({directory reference})
- **What**: {description}
- **Reproduce**: {exact steps, mention attached files by path}
- **Files to investigate**: {src/path/to/likely/files}
- **Fix direction**: {suggested approach}
- **Verify**: {what /evaluate should check after fix}

### Fix 2: ...

## Improvements

### Improvement 1: {title} [major/minor]
...

## Feature Requests (backlog)

### Feature 1: {title}
- **Reported by**: {name(s)}
- **What**: {description}
- **Complexity estimate**: small / medium / large

## Summary

| Category | Count | Already fixed |
|----------|-------|---------------|
| Critical bugs | | |
| Major bugs | | |
| Minor bugs | | |
| Improvements | | |
| Features | | |
```

## Important

- Write the plan in English
- Keep reproduction steps specific — the generate agent will follow them literally
- Include file paths for attached .squid/.png files so agents can find them
- If a bug report is in Russian, translate the key details to English in the plan
- Reference original issue files so a human can trace back: `(.claude/issues/RV-march-2026/issues.md#4)`
