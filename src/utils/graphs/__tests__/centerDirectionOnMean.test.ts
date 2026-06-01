import centerDirectionOnMean from '../centerDirectionOnMean';
import Direction from '../classes/Direction';

describe('centerDirectionOnMean', () => {
  it('moves a direction equal to the mean to the centre (inclination 90)', () => {
    const mean = new Direction(120, 40, 1);
    const [, inclination] = centerDirectionOnMean(120, 40, mean);
    expect(inclination).toBeCloseTo(90, 5);
  });

  it('is a rigid rotation — preserves the angle between two directions', () => {
    const mean = new Direction(120, 40, 1);
    const first = { declination: 100, inclination: 30 };
    const second = { declination: 200, inclination: 60 };

    const originalAngle = new Direction(first.declination, first.inclination, 1).angle(
      new Direction(second.declination, second.inclination, 1),
    );

    const [firstDeclination, firstInclination] = centerDirectionOnMean(
      first.declination,
      first.inclination,
      mean,
    );
    const [secondDeclination, secondInclination] = centerDirectionOnMean(
      second.declination,
      second.inclination,
      mean,
    );
    const centeredAngle = new Direction(firstDeclination, firstInclination, 1).angle(
      new Direction(secondDeclination, secondInclination, 1),
    );

    expect(centeredAngle).toBeCloseTo(originalAngle, 4);
  });

  it('returns the raw (unrounded) rotation — callers round for display', () => {
    // The export transform rounds to 0.1°; the shared helper must NOT, so the
    // stereonet keeps full plotting precision. This input lands off a 0.1° grid.
    const mean = new Direction(73, 41, 1);
    const [declination, inclination] = centerDirectionOnMean(188, 17, mean);
    const offGrid = (value: number) => Number(value.toFixed(1)) !== value;
    expect(offGrid(declination) || offGrid(inclination)).toBe(true);
  });

  // Independent oracle (does NOT compare against the helper itself): centering
  // moves the mean to the stereonet centre (0, 90), so every direction's angular
  // distance from the centre AFTER centering must equal its distance from the
  // mean BEFORE. This is a geometric necessity of any correct centering rotation,
  // so it catches axis-order / sign / offset regressions in the math itself —
  // e.g. an injected `[d + 7, i + 3]` fails this. It is the math backstop for the
  // agreement-only tests in dataToStereoDIR.test.ts.
  it('preserves each direction’s angular distance from the mean as distance from the centre', () => {
    const mean = new Direction(47, 23, 1);
    const centre = new Direction(0, 90, 1);
    const samples: Array<[number, number]> = [
      [10, 5],
      [120, 40],
      [250, -30],
      [300, 70],
      [47, 23], // equal to the mean → must land at the centre (distance 0)
    ];
    samples.forEach(([declination, inclination]) => {
      const distanceFromMean = mean.angle(new Direction(declination, inclination, 1));
      const [centeredDeclination, centeredInclination] = centerDirectionOnMean(
        declination,
        inclination,
        mean,
      );
      const distanceFromCentre = centre.angle(
        new Direction(centeredDeclination, centeredInclination, 1),
      );
      expect(distanceFromCentre).toBeCloseTo(distanceFromMean, 4);
    });
  });
});
