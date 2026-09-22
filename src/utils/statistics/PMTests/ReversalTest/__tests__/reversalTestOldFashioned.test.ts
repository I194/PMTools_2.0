import reversalTestOldFashioned from '../reversalTestOldFashioned';
import Direction from '../../../../graphs/classes/Direction';

// The manual reversal form reports the RAW angle between the two typed means, with no
// inversion of the second one. Oracle: thesis Fig. 2.23 (p. 32), opposite-polarity input
// 215.5/-24.8 N 78 k 8.8 against 25.4/52.0 N 146 k 11.2 gives "gamma 151.73, gamma critical
// 6.52, Class: -". This is the form's existing convention, not the McFadden and McElhinny
// (1990) outcome for a true N/R pair (that would be gamma near 0 and a positive test).
describe('reversalTestOldFashioned', () => {
  it('reproduces the thesis Fig. 2.23 example', () => {
    const result = reversalTestOldFashioned(
      new Direction(215.5, -24.8, 1),
      78,
      8.8,
      new Direction(25.4, 52.0, 1),
      146,
      11.2,
    );

    expect(result.gamma).toBeCloseTo(151.73, 2);
    expect(result.gammaCritical).toBeCloseTo(6.52, 2);
    expect(result.classification).toBe('-');
    // The figure prints two decimals; these lock the hand calculation (R1 = 69.25,
    // R2 = 133.0535714, law of cosines) that reproduces it.
    expect(result.gamma).toBeCloseTo(151.7336281, 6);
    expect(result.gammaCritical).toBeCloseTo(6.5220881, 6);
  });

  // SCI-22: for exactly antipodal means gamma used to be NaN, `NaN > gammaCritical` is false,
  // and the form showed class A/B/C while 179 degrees gave '-'. With the clamp an exact
  // antipode continues the raw-angle convention above: gamma 180, class '-'. Swept over a
  // grid because a hand-picked pair overshoots only under one platform's trig rounding; no
  // exact equality because acos is ill-conditioned near -1 (deviations up to ~1.2e-6 degrees).
  it('reports gamma 180 and a negative test for exactly antipodal means', () => {
    let notANumberCount = 0;
    let wrongClassificationCount = 0;
    let smallestGamma = 180;

    for (let declination = 0; declination < 360; declination += 5) {
      for (let inclination = -90; inclination <= 90; inclination += 2) {
        const result = reversalTestOldFashioned(
          new Direction(declination, inclination, 1),
          20,
          50,
          new Direction((declination + 180) % 360, -inclination, 1),
          20,
          50,
        );

        if (Number.isNaN(result.gamma)) notANumberCount++;
        else smallestGamma = Math.min(smallestGamma, result.gamma);
        if (result.classification !== '-') wrongClassificationCount++;
      }
    }

    expect(notANumberCount).toBe(0);
    expect(wrongClassificationCount).toBe(0);
    expect(smallestGamma).toBeCloseTo(180, 5);
  });

  it('reports gamma 0 and keeps the class for identical means', () => {
    const result = reversalTestOldFashioned(
      new Direction(0, -86, 1),
      20,
      50,
      new Direction(0, -86, 1),
      20,
      50,
    );

    expect(result.gamma).toBeCloseTo(0, 5);
    expect(result.gammaCritical).toBeCloseTo(6.4627, 4);
    expect(result.classification).toBe('B');
  });
});
