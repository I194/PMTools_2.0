#!/usr/bin/env bash
# PreToolUse(Edit|Write|MultiEdit|NotebookEdit) hook — the harness-level version of two CLAUDE.md rules:
#   * "Do NOT modify scientific logic in utils/statistics/ without explicit request"
#   * golden references (*.expected.json) are never regenerated without justification
# Exit 2 blocks the tool call and feeds stderr back to Claude.
# Unlock for one session (only after Ivan explicitly approved the change): touch .claude/.science-unlock
set -u
input="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0
file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')"
[ -z "$file_path" ] && exit 0

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${file_path#"$project_dir"/}"

# Golden references first: they live under src/__tests__/ but are NOT freely editable tests.
is_protected=0
case "$rel" in src/__tests__/fixtures/*.expected.json) is_protected=1 ;; esac
# Tests themselves are the safety net; adding or editing them is always allowed.
if [ "$is_protected" = 0 ]; then
  case "$rel" in *"/__tests__/"*) exit 0 ;; esac
  case "$rel" in src/utils/statistics/*) is_protected=1 ;; esac
fi

case "$is_protected" in
  1)
    [ -f "$project_dir/.claude/.science-unlock" ] && exit 0
    cat >&2 <<MSG
BLOCKED by .claude/hooks/guard-protected-paths.sh — "$rel" is a protected path.
  - src/utils/statistics/** is scientific logic. CLAUDE.md forbids changing it without Ivan's explicit request.
  - *.expected.json files are golden references. They change only through UPDATE_FIXTURES=1 npm test
    after an intentional, approved behavior change, and the new numbers must be eyeballed and justified.
If Ivan has explicitly approved this change in this conversation, unlock the current session with
  touch .claude/.science-unlock
then retry. Remove the file when the approved work is done (rm .claude/.science-unlock).
MSG
    exit 2 ;;
esac
exit 0
