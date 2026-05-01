// Custom Jest matchers for paleomagnetic data comparisons.
// Registered globally via src/setupTests.ts.

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeCloseToArray(expected: number[], precision?: number): R;
      toBeCloseToDirection(
        expected: { declination: number; inclination: number; length?: number },
        precision?: number,
      ): R;
    }
  }
}

const tolerance = (precision: number): number => Math.pow(10, -precision) / 2;

expect.extend({
  toBeCloseToArray(received: unknown, expected: number[], precision: number = 6) {
    if (!Array.isArray(received)) {
      return {
        pass: false,
        message: () => `expected array, received ${typeof received}`,
      };
    }
    if (received.length !== expected.length) {
      return {
        pass: false,
        message: () =>
          `array length mismatch: received ${received.length}, expected ${expected.length}`,
      };
    }
    const tol = tolerance(precision);
    for (let i = 0; i < expected.length; i++) {
      const r = received[i];
      const e = expected[i];
      if (typeof r !== 'number' || Math.abs(r - e) > tol) {
        return {
          pass: false,
          message: () =>
            `index ${i}: received ${r} not within ${tol} of expected ${e} (precision=${precision})`,
        };
      }
    }
    return { pass: true, message: () => 'arrays equal within tolerance' };
  },

  toBeCloseToDirection(
    received: unknown,
    expected: { declination: number; inclination: number; length?: number },
    precision: number = 6,
  ) {
    if (
      typeof received !== 'object' ||
      received === null ||
      typeof (received as { declination?: unknown }).declination !== 'number' ||
      typeof (received as { inclination?: unknown }).inclination !== 'number'
    ) {
      return {
        pass: false,
        message: () => `expected Direction-like object with declination/inclination numbers`,
      };
    }
    const r = received as { declination: number; inclination: number; length?: number };
    const tol = tolerance(precision);
    const fields: Array<keyof typeof expected> = ['declination', 'inclination'];
    if (expected.length !== undefined) fields.push('length');
    for (const f of fields) {
      const re = r[f];
      const ex = expected[f];
      if (typeof re !== 'number' || typeof ex !== 'number' || Math.abs(re - ex) > tol) {
        return {
          pass: false,
          message: () =>
            `field "${String(f)}": received ${re} not within ${tol} of expected ${ex} (precision=${precision})`,
        };
      }
    }
    return { pass: true, message: () => 'directions equal within tolerance' };
  },
});

export {};
