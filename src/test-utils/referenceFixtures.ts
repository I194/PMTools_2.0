import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { basename, join } from 'path';

/**
 * Reference-output test helpers (the "golden master" pattern, plainly named).
 *
 * Philosophy: test *code* stays tiny and is read once; test *cases* are data
 * files reviewed as data. A parser test loads each input fixture, runs the
 * parser, and asserts the result deep-equals a committed `<input>.expected.json`
 * sibling — the reference output that locks current behavior so a refactor cannot
 * change it silently.
 *
 * Regenerate the references ONLY after an intentional behavior change:
 *   UPDATE_FIXTURES=1 npm test -- --watchAll=false <pattern>
 * then eyeball the JSON diff before committing. Never regenerate just to go green.
 */

/**
 * The single non-deterministic field every parser stamps: `created: new Date()...`.
 * Pinned to one constant here (not per test file) so the reference captures only
 * the stable, scientific part of the output. This is the ONE place it lives.
 */
const PINNED_CREATED = '1970-01-01T00:00:00.000Z';

/**
 * Significant figures kept when a reference value is a float. Some parsers
 * (RS3, SQUID) derive geographic/stratigraphic directions through trig
 * (Math.sin/atan2), which is NOT bit-identical across platforms — macOS and the
 * Linux CI runner disagree in the ~15th–16th digit. Rounding to 10 sig figs sits
 * far above that platform noise yet far below any meaningful paleomagnetic
 * precision (~0.1°), so the reference is stable cross-platform. It is a no-op for
 * the already-short values parsers read verbatim (e.g. Dgeo from toFixed(1)).
 */
const SIGNIFICANT_DIGITS = 10;

/** Round a single number to SIGNIFICANT_DIGITS significant figures. */
const roundToSignificant = (value: number): number =>
  Number.isFinite(value) && value !== 0 ? Number(value.toPrecision(SIGNIFICANT_DIGITS)) : value;

/** Recursively round every number in a JSON-shaped value; strings/bools untouched. */
const roundFloatsDeep = (value: any): any => {
  if (typeof value === 'number') return roundToSignificant(value);
  if (Array.isArray(value)) return value.map(roundFloatsDeep);
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const key of Object.keys(value)) out[key] = roundFloatsDeep(value[key]);
    return out;
  }
  return value;
};

/** Absolute path inside the committed fixtures tree (src/__tests__/fixtures/...). */
export const fixturePath = (...segments: string[]): string =>
  join(__dirname, '..', '__tests__', 'fixtures', ...segments);

/** Input fixture file names in `directory`, sorted (excludes references and docs). */
export const listInputs = (directory: string, extensions: string[]): string[] =>
  readdirSync(directory)
    .filter((name) => extensions.some((extension) => name.endsWith(extension)))
    .sort();

/**
 * Compare against — or, under UPDATE_FIXTURES, (re)write — the reference file.
 *
 * `rawResult` is normalized through JSON (NaN -> null, undefined dropped) and its
 * floats are rounded to SIGNIFICANT_DIGITS so the in-memory value and the on-disk
 * JSON compare equal across platforms. Returns both sides; the caller does the
 * single `expect(actual).toEqual(expected)` so this primitive stays free of
 * test-framework globals.
 */
export const loadExpected = (
  expectedFile: string,
  rawResult: unknown,
): { actual: unknown; expected: unknown } => {
  const actual = roundFloatsDeep(JSON.parse(JSON.stringify(rawResult)));
  if (process.env.UPDATE_FIXTURES) {
    writeFileSync(expectedFile, `${JSON.stringify(actual, null, 2)}\n`);
    return { actual, expected: actual };
  }
  return { actual, expected: JSON.parse(readFileSync(expectedFile, 'utf8')) };
};

/** Pin the volatile `created` timestamp; leave everything else untouched. */
const pinCreated = (result: any): any =>
  result && typeof result === 'object' && 'created' in result
    ? { ...result, created: PINNED_CREATED }
    : result;

/** A fixture input is any file that is not a reference, a doc, or a dotfile. */
const isInputFile = (name: string): boolean =>
  !name.endsWith('.expected.json') && !name.endsWith('.md') && !name.startsWith('.');

interface ParserReferenceOptions {
  /** The parser under test: `(data, name) => result`. */
  parser: (data: any, name: string) => unknown;
  /** Fixture subdirectory under `src/__tests__/fixtures/parsers/` (e.g. `'csv_pmd'`). */
  fixtureDirectory: string;
  /** describe() label. Defaults to the parser's function name. */
  name?: string;
  /** How to read an input file. Defaults to UTF-8 text; XLSX passes a binary reader. */
  readInput?: (absolutePath: string) => unknown;
  /** Normalize the result before comparison. Defaults to pinning `created`. */
  normalizeResult?: (result: any) => any;
}

/**
 * Define a complete reference-output suite for a parser in one call. Every parser
 * test is identical except for these options, so they all share this exact loop —
 * adding a case is dropping a file into the fixture's `real/` or `synthetic/`.
 */
export const describeParserReferenceOutput = ({
  parser,
  fixtureDirectory,
  name = parser.name,
  readInput = (absolutePath) => readFileSync(absolutePath, 'utf8'),
  normalizeResult = pinCreated,
}: ParserReferenceOptions): void => {
  const root = fixturePath('parsers', fixtureDirectory);
  const inputs = (['real', 'synthetic'] as const).flatMap((bucket) =>
    readdirSync(join(root, bucket))
      .filter(isInputFile)
      .sort()
      .map((file) => join(bucket, file)),
  );

  describe(`${name} — reference output`, () => {
    if (inputs.length === 0) {
      it('has at least one fixture', () => {
        throw new Error(`No fixtures in src/__tests__/fixtures/parsers/${fixtureDirectory}`);
      });
      return;
    }
    it.each(inputs)('%s', (relativePath) => {
      const inputFile = join(root, relativePath);
      const result = parser(readInput(inputFile), basename(relativePath));
      const { actual, expected } = loadExpected(
        `${inputFile}.expected.json`,
        normalizeResult(result),
      );
      expect(actual).toEqual(expected);
    });
  });
};
