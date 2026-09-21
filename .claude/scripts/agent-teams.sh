#!/usr/bin/env bash
# Enable / disable the experimental Claude Code "agent teams" feature for THIS repository only.
# It writes the env flag into .claude/settings.local.json (git-ignored, personal), so nothing
# changes for other clones or other projects. Takes effect on the next Claude Code session.
#
#   bash .claude/scripts/agent-teams.sh on      # enable
#   bash .claude/scripts/agent-teams.sh off     # disable
#   bash .claude/scripts/agent-teams.sh status  # show current state (default)
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/../.." && pwd)"
settings_file="${AGENT_TEAMS_SETTINGS_FILE:-$project_dir/.claude/settings.local.json}"
flag="CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"
action="${1:-status}"

command -v jq >/dev/null 2>&1 || { echo "jq is required (brew install jq)"; exit 1; }
[ -f "$settings_file" ] || printf '{}\n' >"$settings_file"
jq -e . "$settings_file" >/dev/null 2>&1 || { echo "$settings_file is not valid JSON; fix it first"; exit 1; }

current_file_value="$(jq -r --arg flag "$flag" '.env[$flag] // "unset"' "$settings_file")"
current_env_value="${!flag:-unset}"

case "$action" in
  on)
    tmp="$(mktemp)"
    jq --arg flag "$flag" '.env = (.env // {}) | .env[$flag] = "1"' "$settings_file" >"$tmp" && mv "$tmp" "$settings_file"
    echo "agent teams: ENABLED in $settings_file (env.$flag = \"1\")"
    echo "Restart Claude Code in this repository for it to take effect. Interactive sessions only."
    ;;
  off)
    tmp="$(mktemp)"
    jq --arg flag "$flag" 'if .env then .env |= del(.[$flag]) | (if .env == {} then del(.env) else . end) else . end' "$settings_file" >"$tmp" && mv "$tmp" "$settings_file"
    echo "agent teams: DISABLED in $settings_file (env.$flag removed)"
    echo "Restart Claude Code for it to take effect."
    ;;
  status)
    echo "settings file : $settings_file"
    echo "in settings   : $flag = $current_file_value"
    echo "in this shell : $flag = $current_env_value"
    if [ "$current_file_value" = "1" ] || [ "$current_env_value" = "1" ]; then
      echo "agent teams   : enabled (for new interactive sessions)"
    else
      echo "agent teams   : disabled  (run: bash .claude/scripts/agent-teams.sh on)"
    fi
    ;;
  *)
    echo "usage: bash .claude/scripts/agent-teams.sh [on|off|status]"; exit 1 ;;
esac
