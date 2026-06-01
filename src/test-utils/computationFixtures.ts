import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fixturePath, loadExpected } from './referenceFixtures';

/**
 * Reference-output test helpers for the *pure computations* in
 * `src/utils/statistics/` (Fisher mean, VGP, Butler, cutoff, …) — the same
 * golden-master philosophy as `referenceFixtures.ts` (parsers) and
 * `converterFixtures.ts` (converters): test *code* stays tiny, test *cases* are
 * data files reviewed as data.
 *
 * The difference from the parser harness is the input. A parser eats a file; a
 * computation eats typed arguments — often class instances (`Direction`,
 * `Coordinates`) that JSON cannot express directly. So each test supplies an
 * `invoke(input)` adapter that maps a plain, reviewable `*.input.json` into the
 * function's real arguments (constructing those classes, spreading scalars) and
 * returns the result. The harness then serializes the result, rounds its floats
 * to 7 sig figs (via `loadExpected`, absorbing cross-platform trig noise — every
 * function here is trig-heavy), and compares to the committed `*.expected.json`.
 *
 * Class instances serialize cleanly: `Direction`/`Coordinates`/`Distribution`
 * carry their methods as arrow-function fields (dropped by JSON.stringify) and
 * their derived quantities as prototype getters (also not own-enumerable), so a
 * serialized instance is exactly its data fields — e.g. a `Direction` becomes
 * `{declination, inclination, length}`. NaN/Infinity become `null` (JSON), which
 * is how degenerate/buggy branches surface in a reference.
 *
 * Adding a case = dropping one `*.input.json` into the function's fixture dir and
 * regenerating. Regenerate references ONLY after an intentional behavior change:
 *   UPDATE_FIXTURES=1 npm test -- --watchAll=false <pattern>
 * then eyeball the JSON before committing. Never regenerate just to go green.
 */

/**
 * Below this magnitude a value is treated as a mathematical zero and snapped to 0.
 *
 * Why this is needed on top of `loadExpected`'s 7-sig-fig rounding: these
 * computations produce genuine zeros via trig of right angles — e.g. a great
 * circle (the default `getRawPlaneData` plane) crosses the equator, so some
 * inclinations are mathematically 0 but evaluate to ~1e-15 float noise. Relative
 * rounding keeps 7 sig figs *of that noise* (2.687556e-15), which differs between
 * macOS and the Linux CI runner — the exact cross-platform flake the harness
 * fights elsewhere. An absolute floor catches the zero regime that relative
 * rounding can't: 1e-9 is ~10^6 above the ~1e-15 noise yet ~10^8 below any
 * meaningful paleomagnetic quantity (degrees, k, dp/dm are all >> 1e-9), so no
 * real signal is ever snapped. Scoped to this harness so the committed
 * parser/converter references (whose outputs never sit at the noise floor) stay
 * byte-for-byte as locked. Also normalizes -0 to 0.
 */
const ABSOLUTE_ZERO_EPSILON = 1e-9;

/** Recursively snap near-zero numbers to 0; everything else untouched. */
const snapNearZero = (value: any): any => {
  if (typeof value === 'number') return Math.abs(value) < ABSOLUTE_ZERO_EPSILON ? 0 : value;
  if (Array.isArray(value)) return value.map(snapNearZero);
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const key of Object.keys(value)) out[key] = snapNearZero(value[key]);
    return out;
  }
  return value;
};

interface ComputationReferenceOptions {
  /** Fixture subdirectory under `src/__tests__/fixtures/computations/` (e.g. `'vgp'`). */
  fixtureDirectory: string;
  /** Maps a parsed `*.input.json` into the function's result (builds classes, spreads args). */
  invoke: (input: any) => unknown;
  /** describe() label — the function under test (e.g. `'calculateVGP'`). */
  name: string;
}

/**
 * Define a complete reference-output suite for one pure computation in a single
 * call. Reads every `*.input.json` in `fixtures/computations/<fixtureDirectory>/`,
 * runs it through `invoke`, and asserts the result deep-equals the committed
 * `<input>.expected.json` sibling.
 */
export const describeComputationReferenceOutput = ({
  fixtureDirectory,
  invoke,
  name,
}: ComputationReferenceOptions): void => {
  const root = fixturePath('computations', fixtureDirectory);
  // Mirror the parser harness's missing-dir guard: a forgotten fixture dir yields
  // the clear "no fixtures" failure below instead of a raw ENOENT from readdirSync.
  const inputFiles = existsSync(root)
    ? readdirSync(root)
        .filter((file) => file.endsWith('.input.json'))
        .sort()
    : [];

  describe(`${name} — reference output`, () => {
    if (inputFiles.length === 0) {
      it('has at least one input fixture', () => {
        throw new Error(
          `No *.input.json in src/__tests__/fixtures/computations/${fixtureDirectory}`,
        );
      });
      return;
    }

    it.each(inputFiles)('%s', (inputFile) => {
      const base = inputFile.slice(0, -'.input.json'.length);
      const input = JSON.parse(readFileSync(join(root, inputFile), 'utf8'));
      // Normalize through JSON first (NaN/Infinity -> null, undefined dropped, class
      // instances -> their data fields), then snap the noise-floor zeros before
      // loadExpected applies its 7-sig-fig rounding and compares.
      const normalized = snapNearZero(JSON.parse(JSON.stringify(invoke(input))));
      const { actual, expected } = loadExpected(join(root, `${base}.expected.json`), normalized);
      expect(actual).toEqual(expected);
    });
  });
};
