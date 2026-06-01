# fixtures/parsers/mdir — SOURCE

Fixtures for `parserMDIR` (`.mdir` — **deprecated** legacy DIR format).

This parser is scheduled for removal in a future cleanup phase. The fixture
suite here exists only to **lock current behavior** so the parser can be safely
removed without silently dropping support that some users rely on.

## Layout

- `real/` — none required (format is rarely seen in current data).
- `synthetic/` — built from the format spec to cover the existing parser's
  branches. No new edge cases beyond what current code handles.

The synthetic-only path is intentional and documented in the Phase 1 roadmap:
> `.mdir`: deprecated; build synthetic from spec to lock current behavior, mark
> legacy in `README.md`. No real-file requirement.

## Status

**Legacy, scheduled for removal.** Do not extend this fixture set.
