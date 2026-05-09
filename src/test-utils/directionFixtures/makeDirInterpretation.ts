import type { IDirData } from '../../utils/GlobalTypes';

type DirInterpretation = IDirData['interpretations'][number];

export function makeDirInterpretation(
  overrides: Partial<DirInterpretation> = {},
): DirInterpretation {
  return {
    id: 0,
    label: 'A',
    code: '',
    stepRange: '0-10',
    stepCount: 10,
    Dgeo: 0,
    Igeo: 0,
    Dstrat: 0,
    Istrat: 0,
    MADgeo: 1,
    Kgeo: 100,
    MADstrat: 1,
    Kstrat: 100,
    comment: '',
    demagType: undefined,
    ...overrides,
  };
}
