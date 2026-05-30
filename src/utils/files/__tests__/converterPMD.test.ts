import { download } from '../fileManipulations';
import { toPMD, toCSV_PMD, toXLSX_PMD } from '../converters/pmd';
import { describeConverterReferenceOutput } from '../../../test-utils/converterFixtures';

// Mock ONLY download() — the DOM side effect that emits the file — while keeping the
// real s2ab() the .xlsx converter relies on to turn its binary string into an
// ArrayBuffer. jest.mock is hoisted above the imports above, so the converters and
// the `download` binding here all resolve to this same jest.fn(); captureDownload
// (in the helper) reads the payload off it.
jest.mock('../fileManipulations', () => ({
  ...jest.requireActual('../fileManipulations'),
  download: jest.fn(),
}));

describeConverterReferenceOutput({
  group: 'pmd',
  download: download as unknown as jest.Mock,
  converters: { toPMD, toCSV_PMD, toXLSX_PMD },
});
