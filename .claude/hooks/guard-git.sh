#!/usr/bin/env bash
# PreToolUse(Bash) hook — enforces the branching rules (CLAUDE.md + feedback memory):
#   * never commit / merge / rebase / cherry-pick / revert while on main or dev
#   * never push to main or dev (pull requests only)
#   * never chain "checkout main|dev" with a history-writing command
# It is a speed bump for the agent, not a security boundary. Exit 2 blocks the command.
set -u
input="$(cat)"
command -v jq >/dev/null 2>&1 || exit 0
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
[ -z "$cmd" ] && exit 0
printf '%s' "$cmd" | grep -Eq '(^|[;&|(]|[[:space:]])git[[:space:]]' || exit 0

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
branch="$(git -C "$project_dir" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"

deny() {
  printf 'BLOCKED by .claude/hooks/guard-git.sh: %s\nCommand: %s\n' "$1" "$cmd" >&2
  exit 2
}
is_protected() { case "$1" in main|dev) return 0 ;; *) return 1 ;; esac; }

git_prefix='git[[:space:]]+(-C[[:space:]]+[^[:space:]]+[[:space:]]+)?'
terminator='([[:space:];&|)]|$)'
writes_history="${git_prefix}(commit|merge|rebase|cherry-pick|am|revert)${terminator}"
pushes="${git_prefix}push${terminator}"
switches_to_protected="${git_prefix}(checkout|switch)[[:space:]]+(main|dev)${terminator}"

# 0. "git checkout main && git merge ..." style chains
if printf '%s' "$cmd" | grep -Eq "$switches_to_protected" && printf '%s' "$cmd" | grep -Eq "$writes_history|$pushes"; then
  deny "this command switches to main/dev and then writes history or pushes. Work on a feature branch and open a PR."
fi

# 1. History-writing commands while on a protected branch
if printf '%s' "$cmd" | grep -Eq "$writes_history"; then
  is_protected "$branch" && deny "you are on '$branch'. Branch first: git checkout -b <type>/<topic> dev"
fi

# 2. Pushes
if printf '%s' "$cmd" | grep -Eq "$pushes"; then
  # explicit target ref main/dev: "git push origin main", "git push origin HEAD:dev", "git push -f origin +main"
  if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push[^;&|]*[[:space:]]\+?([^[:space:]:]+:)?(main|dev)([[:space:]]|$)'; then
    deny "pushing to main or dev directly is not allowed. Push the feature branch and open a PR to dev."
  fi
  # implicit target (no "<remote> <branch>") while on a protected branch
  if is_protected "$branch" \
     && ! printf '%s' "$cmd" | grep -Eq -- '--delete|[[:space:]]-d[[:space:]]' \
     && ! printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push[^;&|]*[[:space:]][^-[:space:]][^[:space:]]*[[:space:]][^-[:space:]][^[:space:]]*'; then
    deny "you are on '$branch' and this push has no explicit feature-branch refspec."
  fi
fi
exit 0
