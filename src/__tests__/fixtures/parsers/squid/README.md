# fixtures/parsers/squid — README

Fixtures for `parserSQUID` (`.squid` format — SQUID magnetometer instrument data).

## Layout

- `real/` — real `.squid` files curated from `test-data/potential-data/`.
- `synthetic/` — edge-case matrix including throws-on-empty / throws-on-invalid
  paths required by the parser's error branches, plus a synthetic ARM-block
  fixture that locks D5 truncation behavior independently of the real file.

## Real-file origins

| Filename | Origin | Edge cases covered |
|---|---|---|
| `khramov2026_70.squid` | `test-data/potential-data/squid-pmd/70.squid` (operator: khramov, 2026-01-18) | **Locks D5 fix** — AF field values converted from Oersted to mT (÷10), ARM-acquisition block silently truncated at line 13, bare `AF` first line resolves to `M000` (matches RV-converter golden, not the previous-buggy `M0`). Paired golden output: `parsers/pmd/real/khramov2026_70.pmd` (produced by R.V. Veselovsky's reference SQUID→PMD converter — domain-authority golden). Verified by `src/utils/files/__tests__/parserSQUID.test.ts`. |

`406c.squid` from `test-data/406c.squid` is intentionally not included in this
first PR — it covers only the `metadata.a >= 90` correction branch and adds
no new edge case beyond `khramov2026_70.squid`. It will be added when the
SQUID parser test suite is written in Step 4.

## Locked behaviors (parserSQUID)

Policy decisions confirmed with R.V. Veselovsky on 2026-05-09 and locked by
`src/utils/files/__tests__/parserSQUID.test.ts` (Phase 1 D5 fix).

### Oersted → mT conversion for AF fields

SQUID magnetometer logs AF demagnetization fields in **Oersted** in the raw
file, not millitesla. PMTools displays/uses millitesla everywhere. The parser
divides the raw step value by 10 (1 Oe ≈ 0.1 mT, RV-converter convention)
and zero-pads to 3 digits — `100 Oe` becomes `M010`, `750 Oe` becomes `M075`.

### Silent ARM-block truncation

A `.squid` file may contain an ARM-acquisition block beginning with a line
whose first three characters are `ARM`. Everything from that line onwards
(including AF-of-ARM steps that follow) is a measurement-protocol artifact,
not data PMTools should display or analyze. The parser silently drops the
`ARM` line and every subsequent line — no warning, no log message. This is
normal for many real `.squid` files.

### Step-symbol detection (two-character for AF/ARM)

`AF` (alternating field) and `ARM` both start with `A`. The parser
distinguishes them by checking the first three characters for `ARM` (truncate)
and the first two for `AF` (alternating field). The bare `AF` first line
(zero-field NRM measurement) resolves to `M000` — `Oe→mT` of zero, plus the
3-digit zero-padding — matching RV-converter output. The previous parser
(pre-D5) produced `M0` for this line, breaking step-name sortability.

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._ Must include:

- A synthetic file with an ARM block to lock D5 truncation independently of
  `khramov2026_70.squid`.
- A synthetic file whose first metadata `a` parameter is < 90, to cover the
  `metadata.a < 90 ? +270 : -90` correction branch (real file has `a >= 90`).
- Throws-on-empty and throws-on-invalid (no data lines) paths.
