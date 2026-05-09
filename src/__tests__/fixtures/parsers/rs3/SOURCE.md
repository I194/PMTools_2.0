# fixtures/parsers/rs3 — SOURCE

Fixtures for `parserRS3` (`.rs3` format).

## Layout

- `real/` — real `.rs3` files curated from `test-data/potential-data/`.
- `synthetic/` — synthetic-from-spec, required to cover orientation-parameter
  branches `P1 ∈ {3, 9, 12}` that real files don't reach.

## Real-file origins

| Filename | Origin | Edge cases covered |
|---|---|---|
| `polarural2012_iso8859_4-2.rs3` | `test-data/potential-data/2000-2014-ARCHIVE/2012-Polar Ural/MAG/rs3/4-2.rs3` | **D2 regression seed** — ISO-8859-1 (Latin-1) encoding: header line contains `Step[°C]` where `°` is byte 0xB0. Current parser slices a JS string assumed already-decoded; if FileReader is invoked with the wrong encoding, `°` becomes `U+FFFD`. Cosmetic for now (single-byte 0xB0 maps to one U+FFFD code unit, no column shift), high-severity if any future parser uses 0xB0 as a delimiter. Cross-link: paired with PMD file `4-2.pmd` from the same site — useful for converters round-trip when added. Orientation params: `P1=6 P2=0 P3=6 P4=0` (all 285 RS3 files in the archive share this — synthetic fixtures must cover the other branches). |

More RS3 fixtures (additional Polar Ural + Crimea sites) will be added in
follow-up PRs as the Step 4 parser test suite needs them.

## Synthetic-fixture matrix

_Populated in Phase 1 Step 4._ Must include:

- Files exercising each `P1`/`P3` orientation correction branch:
  `if (P1 == 3 && P3 == 3) ... b -= 90`
  `if (P1 == 9 && P3 == 9) ... b += 90`
  `if (P1 == 12 && P3 == 12) ... b = b` (no-op, but a documented branch)
  Real files only cover the `P1 == 6 && P3 == 6` branch.
