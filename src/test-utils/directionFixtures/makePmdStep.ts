import type { PMDStep } from '../../utils/GlobalTypes';

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
