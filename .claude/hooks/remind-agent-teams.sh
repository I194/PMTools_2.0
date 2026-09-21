#!/usr/bin/env bash
# UserPromptSubmit hook — Ivan's rule (2026-09-05): work that needs the calculation-verification loop
# (cross-checking computations against PmagPy / the thesis; science fixes with reference flips) is
# preferably done by an agent team. When such a prompt arrives and no decision was taken this session,
# this hook opens a "decision pending" state (.claude/.agent-teams-pending) and tells Claude that its
# FIRST action must be AskUserQuestion with a fixed set of options. gate-agent-teams-decision.sh
# (PreToolUse) then refuses every other tool until .claude/scripts/agent-teams-decision.sh records
# Ivan's answer. Once per session; never blocks the prompt itself.
set -u
input="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0
prompt="$(printf '%s' "$input" | jq -r '.prompt // empty')"
session_id="$(printf '%s' "$input" | jq -r '.session_id // "unknown"')"
[ -z "$prompt" ] && exit 0

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
pending="$project_dir/.claude/.agent-teams-pending"
done_marker="$project_dir/.claude/.agent-teams-reminded"

# Decision already recorded in this session -> silent.
if [ -f "$done_marker" ] && [ "$(head -1 "$done_marker")" = "$session_id" ]; then exit 0; fi

# Decision still pending from an earlier prompt in this session -> short nudge only.
if [ -f "$pending" ] && [ "$(cat "$pending")" = "$session_id" ]; then
  echo "[agent-teams gate] The agent-teams decision is still pending. Your first action must be AskUserQuestion (see the earlier note), unless Ivan's message just now states his choice; in that case record it with: bash .claude/scripts/agent-teams-decision.sh <enable-and-restart|start-team|continue-without-team|not-verification-work>"
  exit 0
fi

pattern='pmagpy|fix\(science\)|science[- ]fix|reference[- ]flip|expected\.json|\bSCI-[0-9]+|cross-?check|verif(y|ication)[^.]{0,40}(calculation|computation|formula|number)|thesis|fold[- ]test|reversal[- ]test|butler|mcfadden|fisher mean'
matched="$(printf '%s' "$prompt" | grep -oiE "$pattern" | head -1 || true)"
[ -z "$matched" ] && exit 0

printf '%s' "$session_id" >"$pending"

if [ "${CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS:-}" = "1" ]; then
  options='1. "Start an agent team now (Recommended)" — spawn generator + science-reviewer + evaluator from .claude/agents/ for this task. 2. "Continue without a team" — subagents and workflows only. 3. "Not verification work" — false positive, proceed normally.'
  keys='start-team | continue-without-team | not-verification-work'
  state='ENABLED in this environment'
else
  options='1. "Enable agent teams and restart (Recommended)" — run bash .claude/scripts/agent-teams.sh on, then tell Ivan to restart Claude Code and re-send this prompt. 2. "Continue without a team" — subagents and workflows only. 3. "Not verification work" — false positive, proceed normally.'
  keys='enable-and-restart | continue-without-team | not-verification-work'
  state='NOT enabled in this environment (CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS is unset)'
fi

cat <<MSG
[agent-teams gate — hooks remind-agent-teams.sh + gate-agent-teams-decision.sh] This prompt looks like calculation-verification work (matched "$matched"). Ivan's standing rule: this loop is preferably run by an agent team (docs/agentic-workflows.md, section 5b). Agent teams are $state.
YOUR FIRST ACTION MUST BE the AskUserQuestion tool (header "Agent team", single select) with exactly these options, in this order: $options
Every other tool is blocked by a PreToolUse gate until you record Ivan's answer by running: bash .claude/scripts/agent-teams-decision.sh <$keys>
Then act on it: enable-and-restart -> run the enable script, ask Ivan to restart and re-send the prompt, stop; start-team -> spawn the team with this task; the other two -> proceed. If AskUserQuestion is unavailable (non-interactive session), record continue-without-team and state that assumption in your reply. This gate opens once per session.
MSG
exit 0
