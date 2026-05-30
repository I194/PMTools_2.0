import * as XLSX from 'xlsx';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { IDirData, IPmdData, IVGPData } from '../utils/GlobalTypes';
import { xlsx_to_csv } from '../utils/files/subFunctions';
import { fixturePath, loadExpected } from './referenceFixtures';

/**
 * Reference-output test helpers for the file *converters* (the serialize side of
 * the parsers). Same golden-master philosophy as `referenceFixtures.ts`: test
 * *code* stays tiny, test *cases* are data files reviewed as data.
 *
 * A converter is `async (parsedData) => Promise<void>` — it does NOT return the
 * serialized output, it hands it to `download()` (a DOM side effect). So the test
 * must (1) mock `download` to capture its first argument, then (2) compare that
 * captured payload to a committed reference.
 *
 * What gets locked (per converter, per input): `{ filename, type, eol, lines }`.
 * Splitting the serialized text into `lines` makes the reference reviewable line
 * by line instead of as one escaped blob, and `eol` records the line-ending regime
 * so a CRLF→LF regression is still caught. Binary (.xlsx) payloads are decoded back
 * through the very `xlsx_to_csv` bridge the matching parser uses — locking the
 * reviewable cell text, not the non-deterministic zip bytes.
 *
 * Caveat — float rounding does NOT reach converter output. `loadExpected` rounds
 * floats to 7 sig figs to absorb cross-platform trig noise, but converters emit
 * numbers already baked into strings (`toFixed`, exponential, SheetJS formatting), so
 * every digit here is locked verbatim. That is fine today (inputs are exact decimals
 * and the formatters are deterministic), but a future fixture that pushes a
 * trig-derived or long-fraction value through string output would NOT be shielded —
 * check such a value for macOS↔Linux stability before locking it.
 *
 * Regenerate references ONLY after an intentional behavior change:
 *   UPDATE_FIXTURES=1 npm test -- --watchAll=false <pattern>
 * then eyeball the JSON before committing. Never regenerate just to go green.
 */

/**
 * Compile-time witnesses anchoring the fixture-row key lists to the live types.
 * `Record<keyof T, true>` fails `npm run typecheck` the instant T gains, loses, or
 * renames a field, so these lists cannot silently fall out of sync with
 * IPmdData/IDirData/IVGPData. `assertRowShape` (below) then validates every parsed
 * `*.input.json` row against them at runtime — catching a fixture that drifts from
 * the type (missing / renamed / typo'd field). Both halves are needed because the
 * types extend an index signature (`IObjectKeys`), which defeats a plain
 * `: IPmdData` annotation, and `JSON.parse` is `any` regardless.
 */
const PMD_STEP_KEYS: Record<keyof IPmdData['steps'][number], true> = {
  id: true,
  step: true,
  x: true,
  y: true,
  z: true,
  mag: true,
  Dgeo: true,
  Igeo: true,
  Dstrat: true,
  Istrat: true,
  a95: true,
  comment: true,
  demagType: true,
};

const DIR_INTERPRETATION_KEYS: Record<keyof IDirData['interpretations'][number], true> = {
  id: true,
  label: true,
  code: true,
  gcNormal: true,
  stepRange: true,
  stepCount: true,
  Dgeo: true,
  Igeo: true,
  Dstrat: true,
  Istrat: true,
  MADgeo: true,
  Kgeo: true,
  MADstrat: true,
  Kstrat: true,
  comment: true,
  demagType: true,
};

const VGP_KEYS: Record<keyof IVGPData['vgps'][number], true> = {
  id: true,
  label: true,
  dec: true,
  inc: true,
  a95: true,
  lat: true,
  lon: true,
  poleLatitude: true,
  poleLongitude: true,
  paleoLatitude: true,
  dp: true,
  dm: true,
  age: true,
  plateId: true,
};

interface RowShape {
  /** Pull the array of row objects the converters in this group iterate. */
  rows: (input: any) => unknown;
  /** Every key the row type declares (from the compile-time witness above). */
  allKeys: string[];
  /** Subset of `allKeys` the type marks optional (`?`), so absence is allowed. */
  optionalKeys: string[];
}

/** Per-group row shape, keyed by the same `group` the test files pass. */
const ROW_SHAPE: Record<string, RowShape> = {
  pmd: { rows: (input) => input.steps, allKeys: Object.keys(PMD_STEP_KEYS), optionalKeys: [] },
  dir: {
    rows: (input) => input.interpretations,
    allKeys: Object.keys(DIR_INTERPRETATION_KEYS),
    optionalKeys: ['gcNormal'],
  },
  vgp: { rows: (input) => input.vgps, allKeys: Object.keys(VGP_KEYS), optionalKeys: [] },
};

/** Throw if any row in a parsed fixture has a missing required or unknown key. */
const assertRowShape = (input: any, shape: RowShape, fixtureName: string): void => {
  const rows = shape.rows(input);
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`${fixtureName}: expected a non-empty array of rows for this converter group`);
  }
  const allowed = new Set(shape.allKeys);
  const required = shape.allKeys.filter((key) => !shape.optionalKeys.includes(key));
  rows.forEach((row: any, index) => {
    const missing = required.filter((key) => !(key in row));
    const unknown = Object.keys(row).filter((key) => !allowed.has(key));
    if (missing.length || unknown.length) {
      throw new Error(
        `${fixtureName} row ${index} drifted from the type shape — ` +
          `missing [${missing.join(', ') || 'none'}], unknown [${unknown.join(', ') || 'none'}]. ` +
          `Fix the fixture, or — if the type changed on purpose — update the *_KEYS witness in converterFixtures.ts.`,
      );
    }
  });
};

/** Run an async converter and return the payload it passed to the mocked download(). */
export const captureDownload = async (
  download: jest.Mock,
  run: () => Promise<void>,
): Promise<{ payload: string | ArrayBuffer; filename: string; type: string }> => {
  download.mockClear();
  await run();
  expect(download).toHaveBeenCalledTimes(1);
  // Mirrors the shared download(payload, filename, mimeType) signature in
  // fileManipulations.ts — every converter calls it positionally in that order.
  const [payload, filename, type] = download.mock.calls[0];
  return { payload, filename, type };
};

/** Which line-ending regime the serialized text uses (locked so CRLF→LF is caught). */
const detectLineEnding = (text: string): 'CRLF' | 'LF' | 'CR' | 'none' =>
  /\r\n/.test(text) ? 'CRLF' : /\n/.test(text) ? 'LF' : /\r/.test(text) ? 'CR' : 'none';

/**
 * Turn a captured download payload into reviewable text. Text converters hand a
 * string straight through; binary (.xlsx) converters hand an ArrayBuffer, which we
 * decode with the same XLSX.read → xlsx_to_csv bridge the parsers use. The raw zip
 * bytes are intentionally NOT locked: they embed a non-deterministic timestamp and
 * aren't human-reviewable.
 */
const decodePayload = (payload: string | ArrayBuffer): string =>
  typeof payload === 'string'
    ? payload
    : xlsx_to_csv(XLSX.read(new Uint8Array(payload), { type: 'array' }));

interface ConverterReferenceOptions {
  /** Fixture subdirectory under `src/__tests__/fixtures/converters/` (e.g. `'pmd'`). */
  group: string;
  /** The mocked `download` (jest.fn) shared with the converter under test. */
  download: jest.Mock;
  /** The converters under test, keyed by name (used in the describe/test labels). */
  converters: Record<string, (parsedData: any) => Promise<void>>;
  /** describe() label. Defaults to the group name. */
  name?: string;
}

/**
 * Define a complete reference-output suite for a group of converters in one call.
 * Reads every `*.input.json` in `fixtures/converters/<group>/` (each a parsed
 * IPmdData/IDirData/IVGPData), runs each converter on it, and compares the captured
 * download payload to `<input>.<converter>.expected.json`. Adding a case = dropping
 * one `*.input.json` into the group dir and regenerating.
 */
export const describeConverterReferenceOutput = ({
  group,
  download,
  converters,
  name = group,
}: ConverterReferenceOptions): void => {
  const root = fixturePath('converters', group);
  const inputFiles = readdirSync(root)
    .filter((file) => file.endsWith('.input.json'))
    .sort();

  describe(`${name} converters — reference output`, () => {
    if (inputFiles.length === 0) {
      it('has at least one input fixture', () => {
        throw new Error(`No *.input.json in src/__tests__/fixtures/converters/${group}`);
      });
      return;
    }

    const cases = inputFiles.flatMap((inputFile) => {
      const base = inputFile.slice(0, -'.input.json'.length);
      return Object.keys(converters).map((converterName) => ({ inputFile, base, converterName }));
    });

    const shape = ROW_SHAPE[group];

    it.each(cases)('$base → $converterName', async ({ inputFile, base, converterName }) => {
      const inputData = JSON.parse(readFileSync(join(root, inputFile), 'utf8'));
      // Guard the fixture against type drift before feeding it to the converter:
      // a renamed/removed field in IPmdData/IDirData/IVGPData would otherwise leave
      // these tests green on an input that no real parser could ever produce.
      if (shape) assertRowShape(inputData, shape, inputFile);
      const { payload, filename, type } = await captureDownload(download, () =>
        converters[converterName](inputData),
      );
      const text = decodePayload(payload);
      const value = {
        filename,
        type,
        eol: detectLineEnding(text),
        lines: text.split(/\r\n|\r|\n/),
      };
      const { actual, expected } = loadExpected(
        join(root, `${base}.${converterName}.expected.json`),
        value,
      );
      expect(actual).toEqual(expected);
    });
  });
};
