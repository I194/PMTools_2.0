import { calculateTolerance } from './tolerance';

type MatcherResult = { pass: boolean; message: () => string };

export function toBeCloseToArray(
  received: unknown,
  expectedArray: number[],
  precision: number = 6,
): MatcherResult {
  if (!Array.isArray(received)) {
    return {
      pass: false,
      message: () => `expected array, received ${typeof received}`,
    };
  }
  if (received.length !== expectedArray.length) {
    return {
      pass: false,
      message: () =>
        `array length mismatch: received ${received.length}, expected ${expectedArray.length}`,
    };
  }
  const toleranceValue = calculateTolerance(precision);
  for (let index = 0; index < expectedArray.length; index++) {
    const receivedValue = received[index];
    const expectedValue = expectedArray[index];
    if (
      typeof receivedValue !== 'number' ||
      Number.isNaN(receivedValue) ||
      Number.isNaN(expectedValue) ||
      Math.abs(receivedValue - expectedValue) > toleranceValue
    ) {
      return {
        pass: false,
        message: () =>
          `index ${index}: received ${receivedValue} not within ${toleranceValue} of expected ${expectedValue} (precision=${precision})`,
      };
    }
  }
  return { pass: true, message: () => 'arrays equal within tolerance' };
}
