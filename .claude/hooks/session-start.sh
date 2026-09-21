#!/usr/bin/env bash
# SessionStart hook — prints the startup checklist from docs/three-agent-workflow.md
# so every session (and every subagent that reads this context) starts from the same facts.
# stdout goes into Claude's context: keep it short.
project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$project_dir" || exit 0

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
dirty="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"

echo "## PMTools session start (hook: .claude/hooks/session-start.sh)"
echo "Branch: $branch | uncommitted changes: $dirty"
case "$branch" in
  main|dev) echo "WARNING: on '$branch'. Rule: branch from dev, PR to dev. Run: git checkout -b <type>/<topic> dev" ;;
esac
echo "Recent commits:"
git log --oneline -5 2>/dev/null | sed 's/^/  /'

ledger=".claude/progress.json"
if [ -f "$ledger" ] && command -v jq >/dev/null 2>&1; then
  echo "Progress ledger ($ledger, updated $(jq -r '.updated' "$ledger")):"
  jq -r '.tracks | to_entries[] | "  \(.key): " + ([.value.items[] | .status] | group_by(.) | map("\(.[0]) \(length)") | join(", "))' "$ledger"
  active="$(jq -r '.tracks | to_entries[] | .value.items[] | select(.status == "in-progress" or .status == "pr-open") | "  - [\(.id)] \(.title) — \(.status)\(if .pr then " (PR #\(.pr))" else "" end)"' "$ledger")"
  if [ -n "$active" ]; then echo "Active items:"; echo "$active"; fi
fi

echo "Rules: one PR at a time; npm run verify after every change (a Stop hook enforces it);"
echo "src/utils/statistics/** and *.expected.json are locked by a hook until Ivan approves (touch .claude/.science-unlock)."
exit 0
