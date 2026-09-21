#!/usr/bin/env bash
# Stop hook — "npm run verify must pass after every change" (CLAUDE.md), enforced by the harness:
# when source files changed since the last green verification, run typecheck + lint + format:check.
# On failure exit 2: Claude does not stop, it sees the errors and fixes them.
# stop_hook_active guards against loops: we force at most one continuation per stop.
set -u
input="$(cat)"
if command -v jq >/dev/null 2>&1 && [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
  exit 0
fi
project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$project_dir" || exit 0

watched="src package.json tsconfig.json"
# shellcheck disable=SC2086
[ -z "$(git status --porcelain -- $watched 2>/dev/null)" ] && exit 0

stamp_file=".claude/.verify-stamp"
# shellcheck disable=SC2086
fingerprint="$( { git diff HEAD -- $watched; git ls-files --others --exclude-standard -- src | while read -r path; do printf '%s\n' "$path"; cat "$path"; done; } 2>/dev/null | shasum | cut -d' ' -f1)"
if [ -f "$stamp_file" ] && [ "$(cat "$stamp_file")" = "$fingerprint" ]; then
  exit 0
fi

log="$(mktemp)"
if npm run verify >"$log" 2>&1; then
  printf '%s' "$fingerprint" >"$stamp_file"
  rm -f "$log"
  exit 0
fi
{
  echo "npm run verify FAILED (Stop hook .claude/hooks/verify-on-stop.sh). Fix these before finishing the turn:"
  tail -n 60 "$log"
} >&2
rm -f "$log"
exit 2
