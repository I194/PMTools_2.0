import centerDirectionsByMean from '../transforms/centerDirectionsByMean';
import Direction from '../../graphs/classes/Direction';
import { IDirData } from '../../GlobalTypes';

type Interpretation = IDirData['interpretations'][number];

const makeInterpretation = (overrides: Partial<Interpretation>): Interpretation => ({
  id: 1,
  label: 'S1',
  code: '',
  stepRange: '0-100',
  stepCount: 5,
  Dgeo: 0,
  Igeo: 0,
  Dstrat: 0,
  Istrat: 0,
  MADgeo: 2,
  Kgeo: 50,
  MADstrat: 2,
  Kstrat: 50,
  comment: '',
  demagType: 'thermal',
  ...overrides,
});

const makeData = (interpretations: Interpretation[]): IDirData => ({
  name: 'test',
  interpretations,
  format: 'DIR',
  created: '',
});

describe('centerDirectionsByMean', () => {
  it('moves a direction equal to the mean to the centre (inclination 90)', () => {
    const geographicMean = new Direction(120, 40, 1);
    const stratigraphicMean = new Direction(300, 10, 1);
    const data = makeData([makeInterpretation({ Dgeo: 120, Igeo: 40, Dstrat: 300, Istrat: 10 })]);

    const [centered] = centerDirectionsByMean(
      data,
      geographicMean,
      stratigraphicMean,
    ).interpretations;

    expect(centered.Igeo).toBeCloseTo(90, 1);
    expect(centered.Istrat).toBeCloseTo(90, 1);
  });

  it('preserves the angle between two directions (rotation is rigid)', () => {
    const geographicMean = new Direction(120, 40, 1);
    const stratigraphicMean = new Direction(120, 40, 1);
    const firstDirection = { Dgeo: 100, Igeo: 30 };
    const secondDirection = { Dgeo: 200, Igeo: 60 };
    const data = makeData([
      makeInterpretation({ id: 1, ...firstDirection, Dstrat: 100, Istrat: 30 }),
      makeInterpretation({ id: 2, ...secondDirection, Dstrat: 200, Istrat: 60 }),
    ]);

    const originalAngle = new Direction(firstDirection.Dgeo, firstDirection.Igeo, 1).angle(
      new Direction(secondDirection.Dgeo, secondDirection.Igeo, 1),
    );

    const [first, second] = centerDirectionsByMean(
      data,
      geographicMean,
      stratigraphicMean,
    ).interpretations;
    const centeredAngle = new Direction(first.Dgeo, first.Igeo, 1).angle(
      new Direction(second.Dgeo, second.Igeo, 1),
    );

    // tolerance 0.5° absorbs the 0.1° rounding applied to each coordinate
    expect(centeredAngle).toBeCloseTo(originalAngle, 0);
  });

  it('rotates geographic and stratigraphic coordinates about their own means', () => {
    const geographicMean = new Direction(120, 40, 1);
    const stratigraphicMean = new Direction(40, 70, 1);
    const data = makeData([makeInterpretation({ Dgeo: 120, Igeo: 40, Dstrat: 40, Istrat: 70 })]);

    const [centered] = centerDirectionsByMean(
      data,
      geographicMean,
      stratigraphicMean,
    ).interpretations;

    // each coordinate set, equal to its own mean, lands at the centre
    expect(centered.Igeo).toBeCloseTo(90, 1);
    expect(centered.Istrat).toBeCloseTo(90, 1);
  });

  it('preserves every field other than D/I and returns a new object', () => {
    const geographicMean = new Direction(10, 20, 1);
    const stratigraphicMean = new Direction(10, 20, 1);
    const original = makeInterpretation({
      id: 7,
      label: 'sample-7',
      code: 'fisher',
      comment: 'keep me',
      MADgeo: 3.4,
      Kgeo: 88,
      Dgeo: 55,
      Igeo: 12,
      Dstrat: 55,
      Istrat: 12,
    });
    const data = makeData([original]);

    const result = centerDirectionsByMean(data, geographicMean, stratigraphicMean);
    const [centered] = result.interpretations;

    expect(centered.label).toBe('sample-7');
    expect(centered.code).toBe('fisher');
    expect(centered.comment).toBe('keep me');
    expect(centered.MADgeo).toBe(3.4);
    expect(centered.Kgeo).toBe(88);
    // original input is untouched (pure function)
    expect(data.interpretations[0].Dgeo).toBe(55);
    expect(result).not.toBe(data);
  });

  it('rounds recomputed declination/inclination to one decimal place', () => {
    const geographicMean = new Direction(73, 41, 1);
    const stratigraphicMean = new Direction(73, 41, 1);
    const data = makeData([makeInterpretation({ Dgeo: 188, Igeo: 17, Dstrat: 188, Istrat: 17 })]);

    const [centered] = centerDirectionsByMean(
      data,
      geographicMean,
      stratigraphicMean,
    ).interpretations;

    const hasAtMostOneDecimal = (value: number) => Number(value.toFixed(1)) === value;
    expect(hasAtMostOneDecimal(centered.Dgeo)).toBe(true);
    expect(hasAtMostOneDecimal(centered.Igeo)).toBe(true);
    expect(hasAtMostOneDecimal(centered.Dstrat)).toBe(true);
    expect(hasAtMostOneDecimal(centered.Istrat)).toBe(true);
  });
});
