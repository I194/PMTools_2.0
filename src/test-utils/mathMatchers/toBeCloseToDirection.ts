import { calculateTolerance } from './tolerance';

type MatcherResult = { pass: boolean; message: () => string };

type DirectionLike = {
  declination: number;
  inclination: number;
  length?: number;
};

export function toBeCloseToDirection(
  received: unknown,
  expectedDirection: DirectionLike,
  precision: number = 6,
): MatcherResult {
  if (
    typeof received !== 'object' ||
    received === null ||
    typeof (received as { declination?: unknown }).declination !== 'number' ||
    typeof (received as { inclination?: unknown }).inclination !== 'number'
  ) {
    return {
      pass: false,
      message: () => 'expected Direction-like object with declination/inclination numbers',
    };
  }
  const receivedDirection = received as DirectionLike;
  const toleranceValue = calculateTolerance(precision);
  const fieldsToCompare: Array<keyof DirectionLike> = ['declination', 'inclination'];
  if (expectedDirection.length !== undefined) fieldsToCompare.push('length');
  for (const fieldName of fieldsToCompare) {
    const receivedFieldValue = receivedDirection[fieldName];
    const expectedFieldValue = expectedDirection[fieldName];
    if (
      typeof receivedFieldValue !== 'number' ||
      typeof expectedFieldValue !== 'number' ||
      Number.isNaN(receivedFieldValue) ||
      Number.isNaN(expectedFieldValue) ||
      Math.abs(receivedFieldValue - expectedFieldValue) > toleranceValue
    ) {
      return {
        pass: false,
        message: () =>
          `field "${String(fieldName)}": received ${receivedFieldValue} not within ${toleranceValue} of expected ${expectedFieldValue} (precision=${precision})`,
      };
    }
  }
  return { pass: true, message: () => 'directions equal within tolerance' };
}
