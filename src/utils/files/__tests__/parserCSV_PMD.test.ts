import { readFileSync } from 'fs';
import { basename, join } from 'path';
import parseCSV_PMD from '../parsers/parserCSV_PMD';
import { fixturePath, listInputs, loadExpected } from '../../../test-utils/referenceFixtures';

// `created` is a wall-clock timestamp (new Date()), non-deterministic by nature.
// Pin it so the reference captures only the stable, scientific part of the output.
const PINNED_CREATED = '1970-01-01T00:00:00.000Z';

const CSV_PMD_DIR = fixturePath('parsers', 'csv_pmd');

// Coverage lives in the fixture files, not in the code below: drop a new
// `<case>.csv` into real/ or synthetic/ and it is picked up automatically.
const fixtures = (['real', 'synthetic'] as const).flatMap((bucket) =>
  listInputs(join(CSV_PMD_DIR, bucket), ['.csv']).map((name) => join(bucket, name)),
);

describe('parseCSV_PMD — reference output', () => {
  it.each(fixtures)('%s', (relativePath) => {
    const inputFile = join(CSV_PMD_DIR, relativePath);
    const parsed = parseCSV_PMD(readFileSync(inputFile, 'utf8'), basename(relativePath));
    const { actual, expected } = loadExpected(`${inputFile}.expected.json`, {
      ...parsed,
      created: PINNED_CREATED,
    });
    expect(actual).toEqual(expected);
  });
});
