#!/usr/bin/env bash
# PostToolUse(Edit|Write|MultiEdit) hook — immediate feedback on every source edit:
#   * Prettier formats the file in place (same as the lint-staged pre-commit step, just earlier)
#   * ESLint errors are sent straight back to Claude (exit 2) so they get fixed now, not at commit time
# Full typecheck+lint+format runs once per turn in the Stop hook (verify-on-stop.sh).
set -u
input="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0
file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // empty')"
[ -z "$file_path" ] && exit 0

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
rel="${file_path#"$project_dir"/}"
case "$rel" in src/*) ;; *) exit 0 ;; esac
case "$rel" in *.ts|*.tsx|*.scss|*.json) ;; *) exit 0 ;; esac
[ -f "$project_dir/$rel" ] || exit 0
cd "$project_dir" || exit 0

ignored="$(npx --no-install prettier --file-info "$rel" 2>/dev/null | jq -r '.ignored // false')"
if [ "$ignored" != "true" ]; then
  npx --no-install prettier --write "$rel" >/dev/null 2>&1 || true
fi

case "$rel" in
  *.ts|*.tsx)
    if ! lint_output="$(npx --no-install eslint "$rel" 2>&1)"; then
      printf 'ESLint reported errors in %s (PostToolUse hook .claude/hooks/check-edited-file.sh). Fix them before moving on:\n%s\n' "$rel" "$lint_output" >&2
      exit 2
    fi ;;
esac
exit 0
