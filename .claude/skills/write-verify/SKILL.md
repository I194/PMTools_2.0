---
name: write-verify
description: Creates a verify-fixes.md prompt for the Evaluator based on recent changes
---

Look at the recent work done in this repository and create a verification prompt for the Evaluator agent.

## Steps

1. Read `package.json` to get the current version
2. Run `git log --oneline -20` and `git diff main...HEAD --stat` to understand what changed
3. If `$ARGUMENTS` references an evaluation report, read it to understand what bugs were fixed
4. Otherwise, infer what needs testing from the git history and changed files
5. Save to `test-data/v{version}/verify-fixes.md`

## Output format

The file must be a ready-to-paste prompt for `/evaluate` — specific, with concrete reproduction steps for each fix or feature. The Evaluator will follow these steps literally.

Example:
```markdown
Verify recent fixes:

1. **Error boundary for malformed data**: Create a .dir file with shifted columns. Upload on DIR page. Should show error fallback, not crash. "Clear data and reload" button should recover the app.
2. **Translation key fix**: Go to /why-pmtools → "Graphs and diagrams" section. All 3 lines should show translated text.
3. **No console spam**: Open DevTools console, load sample.pmd on PCA page, click around. Zero contentEditable / Fragment / key / Redux warnings.
```

## Context

$ARGUMENTS
