import type { IPmdData } from '../../utils/GlobalTypes';

export function makePmdData(overrides: Partial<IPmdData> = {}): IPmdData {
  return {
    metadata: { name: 'TEST', a: 0, b: 0, s: 0, d: 0, v: 1 },
    steps: [],
    format: 'pmd',
    created: '2026-04-27',
    ...overrides,
  };
}
