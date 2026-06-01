import { readFileSync } from 'fs';
import parseXLSX_PMD from '../parsers/parserXLSX_PMD';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

// XLSX input is binary, so read each fixture as a Buffer (not UTF-8 text): the
// parser does `new Uint8Array(data)` before `XLSX.read(..., { type: 'array' })`.
describeParserReferenceOutput({
  parser: parseXLSX_PMD,
  fixtureDirectory: 'xlsx_pmd',
  readInput: (absolutePath) => readFileSync(absolutePath),
});
