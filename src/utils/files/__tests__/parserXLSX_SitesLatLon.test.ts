import { readFileSync } from 'fs';
import parseXLSX_SitesLatLon from '../parsers/parserXLSX_SitesLatLon';
import { describeParserReferenceOutput } from '../../../test-utils/referenceFixtures';

// XLSX input is binary, so read each fixture as a Buffer (not UTF-8 text): the
// parser does `new Uint8Array(data)` before `XLSX.read(..., { type: 'array' })`.
describeParserReferenceOutput({
  parser: parseXLSX_SitesLatLon,
  fixtureDirectory: 'xlsx_sites_latlon',
  readInput: (absolutePath) => readFileSync(absolutePath),
});
