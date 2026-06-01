import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
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
 * Linux CI runner disagree in the last 1–2 digits of a double (~15th–16th sig fig).
 *
 * Rounding to 7 sig figs sits ~8 digits above that platform noise, so the residual
 * chance of two platforms straddling a rounding boundary is ~10^(7-15) = 1e-8 per
 * value — negligible even across hundreds of fixtures. Yet 7 sig figs is still
 * ~0.0001° on a direction, ~1000× finer than any meaningful paleomagnetic precision
 * (~0.1°), and the digits it drops are themselves trig/reassociation noise, not
 * signal. A no-op for the short values parsers read verbatim (e.g. Dgeo from toFixed(1)).
 */
const SIGNIFICANT_DIGITS = 7;

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
  if (!existsSync(expectedFile)) {
    throw new Error(
      `Missing reference ${basename(expectedFile)} — generate it with ` +
        `UPDATE_FIXTURES=1 npm test, then eyeball the JSON before committing.`,
    );
  }
  // `expected` is read raw and is NOT re-rounded: on-disk references are always
  // written through the rounded `actual` path above, so they already sit at
  // SIGNIFICANT_DIGITS. Never hand-edit floats in a *.expected.json file.
  return { actual, expected: JSON.parse(readFileSync(expectedFile, 'utf8')) };
};

/**
 * Pin the volatile `created` timestamp wherever a parser stamps it, then leave
 * everything else untouched. Most parsers return a bare data object with a
 * top-level `created` (e.g. `parseCSV_PMD`, `parseRS3`); the ParseResult-wrapped
 * parsers (`parsePMD`, and the parserDIR/SQUID migrations planned next) nest it
 * under `data`. Pinning both shapes keeps every parser test on the same 3-line
 * default. A no-op when neither field is present, so existing references are
 * untouched. Never mutates the input.
 */
const pinCreated = (result: any): any => {
  if (!result || typeof result !== 'object') return result;
  let pinned = result;
  if ('created' in pinned) {
    pinned = { ...pinned, created: PINNED_CREATED };
  }
  if (pinned.data && typeof pinned.data === 'object' && 'created' in pinned.data) {
    pinned = { ...pinned, data: { ...pinned.data, created: PINNED_CREATED } };
  }
  return pinned;
};

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
  const inputs = (['real', 'synthetic'] as const).flatMap((bucket) => {
    const bucketDir = join(root, bucket);
    // Skip a bucket whose directory doesn't exist (easy to forget when adding a
    // new parser) so the empty-inputs guard below gives a clear message instead
    // of readdirSync throwing a raw ENOENT mid-collection.
    if (!existsSync(bucketDir)) return [];
    return readdirSync(bucketDir)
      .filter(isInputFile)
      .sort()
      .map((file) => join(bucket, file));
  });

  describe(`${name} — reference output`, () => {
    if (inputs.length === 0) {
      it('has at least one fixture', () => {
        throw new Error(`No fixtures in src/__tests__/fixtures/parsers/${fixtureDirectory}`);
      });
      return;
    }
    it.each(inputs)('%s', (relativePath) => {
      const inputFile = join(root, relativePath);
      // basename is the parser's `name` arg, which some parsers (PMM, RS3) echo
      // into their output — so a fixture's filename is load-bearing: renaming a
      // file means regenerating its reference. Keep fixture names stable.
      const result = parser(readInput(inputFile), basename(relativePath));
      const { actual, expected } = loadExpected(
        `${inputFile}.expected.json`,
        normalizeResult(result),
      );
      expect(actual).toEqual(expected);
    });
  });
};
