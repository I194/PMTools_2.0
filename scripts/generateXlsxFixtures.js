/* eslint-disable no-console -- CLI generator: progress/preview output to stdout is intentional */
/**
 * generateXlsxFixtures.js
 *
 * Builds the binary `.xlsx` fixtures consumed by the `parserXLSX_*`
 * reference-output tests (Part A, PR 3 — see .claude/development-roadmap/).
 *
 * Each XLSX parser is a thin wrapper:
 *     XLSX.read(bytes) -> xlsx_to_csv(workbook) -> the matching CSV parser
 * so these fixtures deliberately mirror the already-reviewed CSV fixtures
 * (`csv_pmd`, `csv_dir`, `csv_sites_latlon`) cell-for-cell. Numbers are written
 * as native numeric cells and text as string cells — the same shape a real
 * Excel sheet (or PMTools' own `toXLSX_*` export) produces. Because the parsers
 * coerce every value with `+`/`Number`, the parsed output equals the matching
 * CSV fixture's output except for the `name`/`metadata.name` field (which echoes
 * the `.xlsx` filename). That makes each reference reviewable by diffing it
 * against its CSV sibling.
 *
 * One fixture exercises the only logic unique to the XLSX path: `xlsx_to_csv`
 * concatenates every sheet's CSV but skips empty ones (`if (csv.length)`). The
 * `with_empty_second_sheet` workbook adds a trailing empty sheet and must parse
 * identically to the single-sheet `thermal_and_af` fixture.
 *
 * CI never runs this script; the committed `.xlsx` files are read directly by
 * Jest. Regenerate only when a fixture's data changes:
 *     node scripts/generateXlsxFixtures.js
 * then regenerate and eyeball the references:
 *     UPDATE_FIXTURES=1 npm test -- --watchAll=false parserXLSX
 *     npm test -- --watchAll=false parserXLSX
 *
 * Pass `--print` to also dump the intermediate CSV each workbook yields through
 * `xlsx_to_csv`, so you can confirm what the CSV parser actually sees.
 */
const XLSX = require('xlsx');
const { writeFileSync, mkdirSync } = require('fs');
const { join, dirname } = require('path');

const fixturesRoot = join(__dirname, '..', 'src', '__tests__', 'fixtures', 'parsers');
const shouldPrintIntermediateCsv = process.argv.includes('--print');

// --- Source data, copied from the committed CSV fixtures -----------------------
// Numbers stay numeric, text stays string — exactly how a spreadsheet stores them.

// Mirrors csv_pmd/synthetic/thermal_and_af.csv
const pmdThermalAndAfRows = [
  ['PMTOOLS PMD ASCII FILE'],
  [0.0, 0.0, 220.0, 30.0, 11.0],
  ['PAL', 'Xc(Am2)', 'Yc(Am2)', 'Zc(Am2)', 'MAG(A/m)', 'Dg', 'Ig', 'Ds', 'Is', 'a95'],
  ['NRM', 1.0e-9, 2.0e-9, 3.0e-9, 3.74e-9, 45.0, 30.0, 40.0, 35.0, 1.5],
  ['T100', 0.9e-9, 1.8e-9, 2.7e-9, 3.37e-9, 44.5, 29.5, 39.5, 34.5, 1.8],
  ['T200', 0.7e-9, 1.4e-9, 2.1e-9, 2.62e-9, 43.0, 27.0, 38.0, 32.0, 2.4],
  ['M050', 0.5e-9, 1.0e-9, 1.5e-9, 1.87e-9, 42.0, 25.0, 37.0, 30.0, 3.0],
  ['M100', 0.3e-9, 0.6e-9, 0.9e-9, 1.12e-9, 40.0, 22.0, 35.0, 27.0, 4.1],
];

// Mirrors csv_dir/synthetic/normal_and_reversed.csv
const dirNormalAndReversedRows = [
  ['id', 'Code', 'StepRange', 'N', 'Dgeo', 'Igeo', 'Kgeo', 'MADgeo', 'Dstrat', 'Istrat', 'Kstrat', 'MADstrat', 'Comment'],
  ['SYN-01', 'DirOPCA', 'T300-T580', 8, 15.0, 52.0, 120.0, 4.5, 13.0, 48.0, 115.0, 4.7, 'normal polarity'],
  ['SYN-02', 'GC', 'T200-T560', 6, 190.0, -50.0, 90.0, 6.0, 188.0, -46.0, 86.0, 6.2, 'reversed polarity'],
  ['SYN-03', 'DirOPCA', 'T350-T620', 9, 9.8, 50.1, 102.3, 6.0, 7.4, 46.6, 97.8, 6.2, 'normal weak'],
];

// Mirrors csv_sites_latlon/synthetic/basic_sites.csv
const sitesBasicRows = [
  ['label', 'lat', 'lon'],
  ['Moscow', 55.75, 37.62],
  ['Sydney', -33.87, 151.21],
  ['Quito', 0.0, -78.47],
];

// --- Helpers -------------------------------------------------------------------

/** Build a workbook from `[{ name, rows }]`; `rows: []` yields an empty sheet. */
function buildWorkbook(sheetDefinitions) {
  const workbook = XLSX.utils.book_new();
  for (const { name, rows } of sheetDefinitions) {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  }
  return workbook;
}

/** Reproduce src/utils/files/subFunctions.ts `xlsx_to_csv` for review/printing. */
function workbookToCsv(workbook) {
  const parts = [];
  workbook.SheetNames.forEach((sheetName) => {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
    if (csv.length) parts.push(csv);
  });
  return parts.join('\n');
}

function writeFixture(relativePath, workbook) {
  const absolutePath = join(fixturesRoot, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  const binary = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  writeFileSync(absolutePath, binary);
  if (shouldPrintIntermediateCsv) {
    // Round-trip through a real read so the dump reflects what the parser sees.
    const reread = XLSX.read(new Uint8Array(binary), { type: 'array' });
    console.log(`\n===== ${relativePath} =====`);
    console.log(workbookToCsv(reread));
  }
  console.log(`wrote ${relativePath}`);
}

// --- Fixtures ------------------------------------------------------------------

writeFixture(
  join('xlsx_pmd', 'synthetic', 'thermal_and_af.xlsx'),
  buildWorkbook([{ name: 'data', rows: pmdThermalAndAfRows }]),
);

writeFixture(
  join('xlsx_pmd', 'synthetic', 'with_empty_second_sheet.xlsx'),
  buildWorkbook([
    { name: 'data', rows: pmdThermalAndAfRows },
    { name: 'notes', rows: [] },
  ]),
);

writeFixture(
  join('xlsx_dir', 'synthetic', 'normal_and_reversed.xlsx'),
  buildWorkbook([{ name: 'data', rows: dirNormalAndReversedRows }]),
);

writeFixture(
  join('xlsx_sites_latlon', 'synthetic', 'basic_sites.xlsx'),
  buildWorkbook([{ name: 'data', rows: sitesBasicRows }]),
);
