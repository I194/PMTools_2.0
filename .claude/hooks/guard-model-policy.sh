#!/usr/bin/env bash
# PreToolUse(Agent|Task|Workflow) hook — Ivan's model cap (2026-10-16): Fable, Sonnet and Haiku are forbidden; no
# subagent may run above Opus 5.5 at high effort, until a newer Opus ships. Exit 2 blocks the call.
set -u
input="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0
project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
tool="$(printf '%s' "$input" | jq -r '.tool_name // empty')"

deny() {
  printf 'BLOCKED by .claude/hooks/guard-model-policy.sh: %s\nAllowed: model opus (Opus 5.5) only, never fable, sonnet or haiku; effort low|medium|high, never xhigh/max.\n' "$1" >&2
  exit 2
}
forbidden_model='fable|sonnet|haiku'
forbidden_effort='xhigh|max'

check_agent_definition() {
  local definition="$project_dir/.claude/agents/$1.md"
  [ -f "$definition" ] || return 0
  grep -Eiq "^model:[[:space:]]*.*($forbidden_model)" "$definition" && deny "agent '$1' is pinned to a forbidden model in $definition"
  grep -Eiq "^effort:[[:space:]]*($forbidden_effort)[[:space:]]*$" "$definition" && deny "agent '$1' is pinned to effort xhigh/max in $definition"
  return 0
}

case "$tool" in
  Agent|Task)
    model="$(printf '%s' "$input" | jq -r '.tool_input.model // empty')"
    effort="$(printf '%s' "$input" | jq -r '.tool_input.effort // empty')"
    agent_type="$(printf '%s' "$input" | jq -r '.tool_input.subagent_type // empty')"
    printf '%s' "$model" | grep -Eiq "$forbidden_model" && deny "subagent requested model '$model'"
    printf '%s' "$effort" | grep -Eiq "^($forbidden_effort)$" && deny "subagent requested effort '$effort'"
    [ -n "$agent_type" ] && check_agent_definition "$agent_type"
    ;;
  Workflow)
    script="$(printf '%s' "$input" | jq -r '.tool_input.script // empty')"
    script_path="$(printf '%s' "$input" | jq -r '.tool_input.scriptPath // empty')"
    saved_name="$(printf '%s' "$input" | jq -r '.tool_input.name // empty')"
    [ -n "$script_path" ] && [ -f "$script_path" ] && script="$script$(cat "$script_path")"
    [ -n "$saved_name" ] && [ -f "$project_dir/.claude/workflows/$saved_name.js" ] && script="$script$(cat "$project_dir/.claude/workflows/$saved_name.js")"
    printf '%s' "$script" | grep -Eiq "$forbidden_model" && deny "the workflow script names a forbidden model (fable, sonnet or haiku)"
    printf '%s' "$script" | grep -Eq "effort[\"']?[[:space:]]*:[[:space:]]*[\"']($forbidden_effort)[\"']" && deny "the workflow script requests effort xhigh/max"
    for agent_type in $(printf '%s' "$script" | grep -Eo "agentType[\"']?[[:space:]]*:[[:space:]]*[\"'][A-Za-z0-9_-]+" | grep -Eo "[A-Za-z0-9_-]+$"); do
      check_agent_definition "$agent_type"
    done
    ;;
esac
exit 0
