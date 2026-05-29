# Fixtures — `parseCSV_PMD`

Reference-output inputs for `src/utils/files/parsers/parserCSV_PMD.ts`.

Each `<file>.csv` has a committed `<file>.csv.expected.json` sibling — the parser's
output with the non-deterministic `created` timestamp pinned. The test
(`src/utils/files/__tests__/parserCSV_PMD.test.ts`) iterates every input in `real/`
and `synthetic/` automatically; adding a case is dropping a file here, not writing code.

Regenerate the references ONLY after an intentional behavior change, then review the diff:

```
UPDATE_FIXTURES=1 npm test -- --watchAll=false parserCSV_PMD
```

## CSV PMD format (as the parser reads it)

```
<title line — ignored>
<a>,<b>,<s>,<d>,<v>          # specimen metadata: 5 numbers, NO name (name comes from the file name)
<column header — ignored>
<step>,<Xc>,<Yc>,<Zc>,<MAG>,<Dg>,<Ig>,<Ds>,<Is>,<a95>[,comment]
...
```

## synthetic/
- `thermal_and_af.csv` — demagType inference: `T*` → thermal, `M*` → alternating field, `NRM` → undefined (key dropped).
- `comment_with_commas.csv` — locks the comment-comma quirk below.
- `crlf_line_endings.csv` / `cr_only_line_endings.csv` — D1 regression: parser splits on `\r\n`, `\r`, and `\n` alike.

## real/
Empty for now. The only on-disk `.csv` (`test-data/lab_results.csv`) is **DIR-format**,
not PMD — it belongs to `parseCSV_DIR`. Real CSV PMD fixtures must be produced by a
PMTools export run (Playwright); deferred to a follow-up. See
`.claude/development-roadmap/notes/found-bugs-todo.md`.

## Locked-as-is behavior (not bugs to fix here)
- **Comment commas are dropped.** `parserCSV_PMD.ts:26` does `line.replace(/\s+/g, ' ')` then
  `split(',')`, and rebuilds the comment by concatenating the trailing fields — so commas inside a
  comment are lost and whitespace runs collapse to single spaces. `outlier, re-measured, ok`
  parses to `outlier re-measured ok`. Current behavior since v1.x — locked by
  `comment_with_commas.csv`. See `.claude/development-roadmap/notes/found-bugs-todo.md` (D4-analogous).
