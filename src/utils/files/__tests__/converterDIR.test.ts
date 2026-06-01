import { download } from '../fileManipulations';
import { toDIR, toPMM, toCSV_DIR, toXLSX_DIR } from '../converters/dir';
import { describeConverterReferenceOutput } from '../../../test-utils/converterFixtures';

// Mock ONLY download() (see converterPMD.test.ts) — keep the real s2ab() for .xlsx.
jest.mock('../fileManipulations', () => ({
  ...jest.requireActual('../fileManipulations'),
  download: jest.fn(),
}));

describeConverterReferenceOutput({
  group: 'dir',
  download: download as unknown as jest.Mock,
  converters: { toDIR, toPMM, toCSV_DIR, toXLSX_DIR },
});
