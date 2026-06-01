import type { IDirData } from '../../utils/GlobalTypes';

export function makeDirData(overrides: Partial<IDirData> = {}): IDirData {
  return {
    name: 'TEST',
    interpretations: [],
    format: 'dir',
    created: '2026-04-27',
    ...overrides,
  };
}
