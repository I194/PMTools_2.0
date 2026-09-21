---
name: agent-teams
description: Enable, disable or show the status of the experimental Claude Code agent-teams feature for this repository (writes the env flag into .claude/settings.local.json). Usage — /agent-teams on | off | status
---

Run the repository script with the argument the user gave (default `status`):

```bash
bash .claude/scripts/agent-teams.sh $ARGUMENTS
```

Report its output verbatim. If the action was `on` or `off`, remind the user that the change applies to the **next** Claude Code session in this repository (interactive sessions only; `-p` mode and the SDK do not support teams), and that resume/rewind drop a running team.

Background on when a team is preferable and when subagents or workflows are the better tool: `docs/agentic-workflows.md`, section "When to use an agent team".
