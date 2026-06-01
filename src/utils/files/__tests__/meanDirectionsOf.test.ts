import meanDirectionsOf from '../transforms/meanDirectionsOf';
import Direction from '../../graphs/classes/Direction';
import { StatisitcsInterpretationFromDIR } from '../../GlobalTypes';

// Redux serializes the stored mean, stripping the Direction methods — the mean
// arrives as a plain { declination, inclination, length } object. We simulate
// that here (a plain object cast to Direction) so the test reflects the real
// shape meanDirectionsOf has to rebuild from.
const plainDirection = (declination: number, inclination: number, length = 1): Direction =>
  ({ declination, inclination, length }) as unknown as Direction;

const makeInterpretation = (
  geographic: Direction,
  stratigraphic: Direction,
): StatisitcsInterpretationFromDIR =>
  ({
    rawData: {
      code: 'fisher',
      mean: {
        geographic: { direction: geographic, MAD: 3 },
        stratigraphic: { direction: stratigraphic, MAD: 3 },
      },
    },
  }) as unknown as StatisitcsInterpretationFromDIR;

describe('meanDirectionsOf', () => {
  it('returns null when the interpretation is null', () => {
    expect(meanDirectionsOf(null)).toBeNull();
  });

  it('returns null when the interpretation carries no mean', () => {
    const interpretation = { rawData: undefined } as unknown as StatisitcsInterpretationFromDIR;
    expect(meanDirectionsOf(interpretation)).toBeNull();
  });

  it('reconstructs both geographic and stratigraphic means with the stored D/I/length', () => {
    const interpretation = makeInterpretation(
      plainDirection(120, 40, 1),
      plainDirection(300, 10, 1),
    );

    const means = meanDirectionsOf(interpretation);

    expect(means).not.toBeNull();
    expect(means?.geographic.declination).toBe(120);
    expect(means?.geographic.inclination).toBe(40);
    expect(means?.stratigraphic.declination).toBe(300);
    expect(means?.stratigraphic.inclination).toBe(10);
  });

  it('rebuilds real Direction instances whose methods work (the reason it exists)', () => {
    // input means are plain objects (no methods), as they come back from Redux
    const interpretation = makeInterpretation(plainDirection(0, 90), plainDirection(0, 90));

    const means = meanDirectionsOf(interpretation);

    expect(means?.geographic).toBeInstanceOf(Direction);
    expect(means?.stratigraphic).toBeInstanceOf(Direction);
    // a direction at the centre is 10° from one at inclination 80 — method is callable
    expect(means?.geographic.angle(new Direction(0, 80, 1))).toBeCloseTo(10, 1);
  });
});
