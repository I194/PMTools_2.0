# Development Roadmap — Notes

This directory holds working notes, baselines, and decision records produced **during** roadmap execution. Each phase writes specific files here as referenced from its phase doc.

## Expected files

| File | Owner phase | Purpose |
|---|---|---|
| `phase-1-coverage-baseline.txt` | Phase 1 | Coverage snapshot before testing work begins, used as the floor for later phases. |
| `phase-3-token-sweep-log.md` | Phase 3 | Log of SCSS files migrated to design tokens (mechanical sweep). |
| `phase-4-coverage-baseline.txt` | Phase 4 | Coverage snapshot before computation isolation, must not drop. |
| `phase-6a-vite-migration-notes.md` | Phase 6a | Vite/Vitest migration gotchas and resolutions. |
| `phase-6c-zustand-persistence-migration.md` | Phase 6c | localStorage migration code design (one-time read-old-write-new). |
| `phase-6e-oxlint-decision.md` | Phase 6e | Oxlint adoption decision (go / no-go) with reasoning. |
| `phase-7a-fisher-gc-investigation.md` | Phase 7 Track A | Root-cause investigation for cumulative Fisher/GC lag. |
| `phase-7-bench-baseline.md` | Phase 7 Track C | Benchmark numbers before any optimization. |
| `phase-7-bench-after-*.md` | Phase 7 Track C | Benchmark numbers after each optimization track. |
| `phase-7e-graph-render-baseline.md` | Phase 7 Track E | Baseline render times for high-point-count SVG graph scenarios. |
| `phase-7e-graph-render-optimizations.md` | Phase 7 Track E | Per-optimization before/after numbers for SVG render perf. |
| `phase-5d-axes-and-data-audit.md` | Phase 5 sub-phase 5d | Audit of all drawing primitives in `AxesAndData` files before extraction. |

## Rules

- These files are committed to the repo, not gitignored. They are project history.
- Files are append-only after a phase completes — never rewrite history of a previous phase.
- Markdown only. No screenshots in this folder; put those in `e2e/__snapshots__/` or attach to a PR description.
