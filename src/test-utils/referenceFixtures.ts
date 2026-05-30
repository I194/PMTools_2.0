import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Reference-output test helpers (the "golden master" pattern, plainly named).
 *
 * Philosophy: test *code* stays tiny and is read once; test *cases* are data
 * files reviewed as data. A parser/converter/computation test loads each input
 * fixture, runs the function, and asserts the result deep-equals a committed
 * `<input>.expected.json` sibling — the reference output that locks current
 * behavior so a refactor cannot change it silently.
 *
 * Regenerate the references ONLY after an intentional behavior change:
 *   UPDATE_FIXTURES=1 npm test -- --watchAll=false <pattern>
 * then eyeball the JSON diff before committing. Never regenerate just to go green.
 */

/** Absolute path inside the committed fixtures tree (src/__tests__/fixtures/...). */
export const fixturePath = (...segments: string[]): string =>
  join(__dirname, '..', '__tests__', 'fixtures', ...segments);

/** Input fixture file names in `directory`, sorted (excludes references and docs). */
export const listInputs = (directory: string, extensions: string[]): string[] =>
  readdirSync(directory)
    .filter((name) => extensions.some((extension) => name.endsWith(extension)))
    .sort();

/**
 * Load the reference for `expectedFile` and return it next to the normalized
 * `rawResult`; under UPDATE_FIXTURES, (re)write the reference instead.
 *
 * `rawResult` is normalized through JSON (NaN -> null, undefined dropped) so the
 * in-memory value and the on-disk JSON compare equal. Returns both sides; the
 * caller does the single `expect(actual).toEqual(expected)` so this helper stays
 * free of test-framework globals.
 */
export const loadExpected = (
  expectedFile: string,
  rawResult: unknown,
): { actual: unknown; expected: unknown } => {
  const actual = JSON.parse(JSON.stringify(rawResult));
  if (process.env.UPDATE_FIXTURES) {
    writeFileSync(expectedFile, `${JSON.stringify(actual, null, 2)}\n`);
    return { actual, expected: actual };
  }
  return { actual, expected: JSON.parse(readFileSync(expectedFile, 'utf8')) };
};
