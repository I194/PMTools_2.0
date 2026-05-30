import * as XLSX from 'xlsx';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
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
 * Regenerate references ONLY after an intentional behavior change:
 *   UPDATE_FIXTURES=1 npm test -- --watchAll=false <pattern>
 * then eyeball the JSON before committing. Never regenerate just to go green.
 */

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

    it.each(cases)('$base → $converterName', async ({ inputFile, base, converterName }) => {
      const inputData = JSON.parse(readFileSync(join(root, inputFile), 'utf8'));
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
