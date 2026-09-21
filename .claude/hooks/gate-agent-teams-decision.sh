#!/usr/bin/env bash
# PreToolUse(*) hook — while .claude/.agent-teams-pending holds the current session id, only two things
# are allowed: the AskUserQuestion tool, and Bash running .claude/scripts/agent-teams-decision.sh.
# Everything else is refused (exit 2) so the decision cannot be skipped. Subagents are exempt (they
# cannot ask the user). Opened by remind-agent-teams.sh; closed by the decision script.
set -u
project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
pending="$project_dir/.claude/.agent-teams-pending"
[ -f "$pending" ] || exit 0
input="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0
session_id="$(printf '%s' "$input" | jq -r '.session_id // "unknown"')"
[ "$(cat "$pending")" = "$session_id" ] || exit 0
# subagent tool calls carry agent_id; they are not the one who must ask
[ -n "$(printf '%s' "$input" | jq -r '.agent_id // empty')" ] && exit 0

tool="$(printf '%s' "$input" | jq -r '.tool_name // empty')"
case "$tool" in
  AskUserQuestion) exit 0 ;;
  Bash)
    cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
    # the ENTIRE command must be one invocation of the decision script (no chaining, no extras)
    printf '%s' "$cmd" | grep -Eq '^[[:space:]]*bash[[:space:]]+"?[^[:space:]"]*\.claude/scripts/agent-teams-decision\.sh"?[[:space:]]+[a-z-]+[[:space:]]*$' && exit 0 ;;
esac
cat >&2 <<MSG
BLOCKED by .claude/hooks/gate-agent-teams-decision.sh: the agent-teams decision for this session is still pending, so "$tool" is not allowed yet.
First ask Ivan with the AskUserQuestion tool (options given in the [agent-teams gate] note), then record his answer:
  bash .claude/scripts/agent-teams-decision.sh <enable-and-restart|start-team|continue-without-team|not-verification-work>
If AskUserQuestion is unavailable in this session, record continue-without-team and say so in your reply.
MSG
exit 2
