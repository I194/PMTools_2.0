#!/usr/bin/env bash
# Records Ivan's answer to the agent-teams question and closes the PreToolUse gate for this session.
#   bash .claude/scripts/agent-teams-decision.sh <enable-and-restart|start-team|continue-without-team|not-verification-work>
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/../.." && pwd)"
pending="$project_dir/.claude/.agent-teams-pending"
done_marker="$project_dir/.claude/.agent-teams-reminded"
choice="${1:-}"
case "$choice" in
  enable-and-restart|start-team|continue-without-team|not-verification-work) ;;
  *) echo "usage: agent-teams-decision.sh <enable-and-restart|start-team|continue-without-team|not-verification-work>"; exit 1 ;;
esac
if [ ! -f "$pending" ]; then echo "no agent-teams decision is pending"; exit 0; fi
session_id="$(cat "$pending")"
printf '%s\n%s\n' "$session_id" "$choice" >"$done_marker"
rm -f "$pending"
echo "agent-teams decision recorded for this session: $choice (gate closed)"
case "$choice" in
  enable-and-restart) echo "Next: bash .claude/scripts/agent-teams.sh on ; then Ivan restarts Claude Code and re-sends the prompt." ;;
  start-team) echo "Next: spawn the team (generator + science-reviewer + evaluator from .claude/agents/) with the task." ;;
esac
