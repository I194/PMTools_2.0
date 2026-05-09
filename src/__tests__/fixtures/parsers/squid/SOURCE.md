# fixtures/parsers/squid — SOURCE

Fixtures for `parserSQUID` (`.squid` format — SQUID magnetometer instrument data).

## Layout

- `real/` — real `.squid` files curated from `test-data/potential-data/`.
- `synthetic/` — edge-case matrix including throws-on-empty / throws-on-invalid
  paths required by the parser's error branches, plus a synthetic ARM-block
  fixture that locks D5 truncation behavior independently of the real file.

## Real-file origins

| Filename | Origin | Edge cases covered |
|---|---|---|
| `khramov2026_70.squid` | `test-data/potential-data/squid-pmd/70.squid` (operator: khramov, 2026-01-18) | **D5 regression** — AF field values in Oersted (must be converted to mT, divide by 10), ARM-acquisition block at line 13 (must be silently truncated), bare `AF` first line as NRM (step name `M0` would be wrong, must resolve to `NRM`). Paired golden output: `parsers/pmd/real/khramov2026_70.pmd` (produced by R.V. Veselovsky's reference SQUID→PMD converter — domain-authority golden). |

`406c.squid` from `test-data/406c.squid` is intentionally not included in this
first PR — it covers only the `metadata.a >= 90` correction branch and adds
no new edge case beyond `khramov2026_70.squid`. It will be added when the
SQUID parser test suite is written in Step 4.

## Locked behaviors (parserSQUID)

These are policy decisions, not bugs. Tests in Step 4 lock them so future
refactors cannot regress them silently.

### Oersted → mT conversion for AF fields

SQUID magnetometer logs AF demagnetization fields in **Oersted** in the raw
file, not millitesla. PMTools displays/uses millitesla everywhere. The parser
divides the raw step value by 10 (1 Oe = 0.1 mT) before producing the
canonical step name. Confirmed with R.V. Veselovsky on 2026-05-09; this is
the original-converter behavior, restored in D5 fix.

### Silent ARM-block truncation

A `.squid` file may contain an ARM-acquisition block beginning with a line
whose first three characters are `ARM`. Everything from that line onwards
(including AF-of-ARM steps that follow) is a measurement-protocol artifact,
not data PMTools should display or analyze. Confirmed with R.V. Veselovsky
on 2026-05-09: silently drop the `ARM` line and every subsequent line.
No warning, no log message — this is normal for many real `.squid` files.

### Two-character step-symbol detection

`AF` (alternating field) and `ARM` both start with `A`. The parser
distinguishes them by comparing `line.slice(0, 2)` (`AF` vs `AR`), not just
the first character. Free side effect: a bare `AF` line (NRM measurement,
no field value) resolves to step name `NRM` instead of the previous-buggy
`M0`.

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._ Must include:

- A synthetic file with an ARM block to lock D5 truncation independently of
  `khramov2026_70.squid`.
- A synthetic file whose first metadata `a` parameter is < 90, to cover the
  `metadata.a < 90 ? +270 : -90` correction branch (real file has `a >= 90`).
- Throws-on-empty and throws-on-invalid (no data lines) paths.
