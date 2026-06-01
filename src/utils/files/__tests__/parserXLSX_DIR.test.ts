import { readFileSync } from 'fs';
import parseXLSX_DIR from '../parsers/parserXLSX_DIR';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

// XLSX input is binary, so read each fixture as a Buffer (not UTF-8 text): the
// parser does `new Uint8Array(data)` before `XLSX.read(..., { type: 'array' })`.
describeParserReferenceOutput({
  parser: parseXLSX_DIR,
  fixtureDirectory: 'xlsx_dir',
  readInput: (absolutePath) => readFileSync(absolutePath),
});
