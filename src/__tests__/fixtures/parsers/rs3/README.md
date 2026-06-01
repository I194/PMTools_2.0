# Fixtures — `parseRS3`

Reference-output inputs for `src/utils/files/parsers/parserRS3.ts`.
Each `<file>.rs3` has a `<file>.rs3.expected.json` sibling (parser output, `created` pinned).
Regenerate: `UPDATE_FIXTURES=1 npm test -- --watchAll=false parserRS3`, then review the diff.

## Format
RS3 is **fixed-width**: orientation params are read from columns 74–122 of the metadata line, the
P1–P4 orientation flags from 110–122, and step fields by slice. Geographic/stratigraphic directions
are derived (`Direction` + `toReferenceCoordinates`).

## real/
| File | Origin | Notes |
|---|---|---|
| `polarural2012_iso8859_4-2.rs3` | `test-data/potential-data/2000-2014-ARCHIVE/2012-Polar Ural/MAG/rs3/4-2.rs3` | **D2 seed** — ISO-8859-1 (Latin-1): header `Step[°C]` has `°` = byte 0xB0. If FileReader decodes with the wrong charset, `°` → `U+FFFD` (cosmetic now; single code unit, no column shift). Orientation `P1=6 P2=0 P3=6 P4=0` (all 285 archive RS3 files share this). Paired with PMD `4-2.pmd` for a future converter round-trip. Its reference locks the current encoding-affected output as-is. |

## Deferred — synthetic matrix
Synthetic-from-spec fixtures must cover the orientation branches real files don't reach:
`P1/P3 == 3` (`b -= 90`), `== 9` (`b += 90`), `== 12` (no-op). Hand-building a fixed-width RS3 plus
its derived coordinate math is error-prone, so this is a follow-up. See found-bugs-todo.md.
