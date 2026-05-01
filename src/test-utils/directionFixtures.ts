import Direction from '../utils/graphs/classes/Direction';
import type { IPmdData, IDirData, PMDStep } from '../utils/GlobalTypes';

type DirInterpretation = IDirData['interpretations'][number];

export function makeDirection(
  declination: number,
  inclination: number,
  length: number = 1,
): Direction {
  return new Direction(declination, inclination, length);
}

export function makePmdStep(overrides: Partial<PMDStep> = {}): PMDStep {
  return {
    id: 0,
    step: 'NRM',
    x: 0,
    y: 0,
    z: 0,
    mag: 0,
    Dgeo: 0,
    Igeo: 0,
    Dstrat: 0,
    Istrat: 0,
    a95: 0,
    comment: '',
    demagType: undefined,
    ...overrides,
  };
}

export function makePmdData(overrides: Partial<IPmdData> = {}): IPmdData {
  return {
    metadata: { name: 'TEST', a: 0, b: 0, s: 0, d: 0, v: 1 },
    steps: [],
    format: 'pmd',
    created: '2026-04-27',
    ...overrides,
  };
}

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

export function makeDirData(overrides: Partial<IDirData> = {}): IDirData {
  return {
    name: 'TEST',
    interpretations: [],
    format: 'dir',
    created: '2026-04-27',
    ...overrides,
  };
}
