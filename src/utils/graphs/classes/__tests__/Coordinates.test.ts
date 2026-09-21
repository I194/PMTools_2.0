import Coordinates from '../Coordinates';
import Direction from '../Direction';

// SCI-22: Coordinates.angle used to take acos of an unclamped dot product. For identical or
// exactly antipodal vectors rounding pushes the dot product of the two unit vectors slightly
// beyond +/-1 (1.0000000000000002 to 1.0000000000000004), acos returns NaN, and every
// caller's `NaN > threshold` is false. Correct values (0 and 180) come from hand calculation:
// PmagPy's pmag.angle has the same unclamped arccos, so it is not an oracle here.
describe('Coordinates.angle', () => {
  // Only IEEE-exact operations are involved (sqrt(3), division, sum), no trigonometry on the
  // input side, so these two fail before the fix on every platform.
  it('returns exactly 0 for identical vectors', () => {
    expect(new Coordinates(1, 1, 1).angle(new Coordinates(1, 1, 1))).toBe(0);
  });

  it('returns exactly 180 for an antipodal vector of a different length', () => {
    expect(new Coordinates(1, 1, 1).angle(new Coordinates(-2, -2, -2))).toBe(180);
  });

  it('returns 90 for perpendicular vectors', () => {
    expect(new Coordinates(1, 0, 0).angle(new Coordinates(0, 3, 0))).toBe(90);
  });

  it('leaves a dot product that is already inside [-1, 1] untouched', () => {
    const first = new Direction(0, -86, 1).toCartesian();
    const second = new Direction(180, 85, 1).toCartesian();
    const unclampedAngle = Math.acos(first.toUnit().dot(second.toUnit())) * Coordinates.RADIANS;

    expect(first.angle(second)).toBe(unclampedAngle);
    expect(first.angle(second)).toBeCloseTo(179, 9);
  });

  it('still returns NaN for a zero-length vector', () => {
    expect(new Coordinates(0, 0, 0).angle(new Coordinates(1, 0, 0))).toBeNaN();
  });

  // Hand-picked directions overshoot only under one platform's trig rounding, so the
  // regression net is a sweep over every integer-degree direction. After the clamp the
  // results are not always exactly 0 / 180 (acos is ill-conditioned near +/-1: deviations
  // up to about 1.5e-6 degrees), hence toBeCloseTo with precision 5.
  it('is never NaN for a direction against itself or its exact antipode (integer-degree sweep)', () => {
    let notANumberCount = 0;
    let outOfRangeCount = 0;
    let largestSelfAngle = 0;
    let smallestAntipodeAngle = 180;

    for (let declination = 0; declination < 360; declination++) {
      for (let inclination = -90; inclination <= 90; inclination++) {
        const direction = new Direction(declination, inclination, 1);
        const antipode = new Direction((declination + 180) % 360, -inclination, 1);

        const selfAngle = direction.angle(direction);
        const antipodeAngle = direction.angle(antipode);

        if (Number.isNaN(selfAngle) || Number.isNaN(antipodeAngle)) {
          notANumberCount++;
          continue;
        }
        if (selfAngle < 0 || selfAngle > 180 || antipodeAngle < 0 || antipodeAngle > 180) {
          outOfRangeCount++;
        }
        largestSelfAngle = Math.max(largestSelfAngle, selfAngle);
        smallestAntipodeAngle = Math.min(smallestAntipodeAngle, antipodeAngle);
      }
    }

    expect(notANumberCount).toBe(0);
    expect(outOfRangeCount).toBe(0);
    expect(largestSelfAngle).toBeCloseTo(0, 5);
    expect(smallestAntipodeAngle).toBeCloseTo(180, 5);
  });
});
