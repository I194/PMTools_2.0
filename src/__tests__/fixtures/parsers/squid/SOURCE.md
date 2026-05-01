# fixtures/parsers/squid — SOURCE

Fixtures for `parserSQUID` (`.squid` format — SQUID magnetometer instrument data).

## Layout

- `real/` — real `.squid` files. Known sources:
  - `test-data/406c.squid`
  - `.claude/issues/*` user-reported tickets: `a11-19.squid`, `10bg136b.squid`,
    `406c.squid` (and any newer issues)
- `synthetic/` — edge-case matrix including the throws-on-empty / throws-on-invalid
  paths required by the parser's error branches.

## Real-file origins

_Populated in Phase 1 Step 0.6._

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._
