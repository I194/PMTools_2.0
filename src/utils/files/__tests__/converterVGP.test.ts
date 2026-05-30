import { download } from '../fileManipulations';
import { toVGP, toCSV_VGP, toXLSX_VGP, toGPML } from '../converters/vgp';
import { describeConverterReferenceOutput } from '../../../test-utils/converterFixtures';

// Mock ONLY download() (see converterPMD.test.ts) — keep the real s2ab() for .xlsx.
jest.mock('../fileManipulations', () => ({
  ...jest.requireActual('../fileManipulations'),
  download: jest.fn(),
}));

describeConverterReferenceOutput({
  group: 'vgp',
  download: download as unknown as jest.Mock,
  converters: { toVGP, toCSV_VGP, toXLSX_VGP, toGPML },
});
