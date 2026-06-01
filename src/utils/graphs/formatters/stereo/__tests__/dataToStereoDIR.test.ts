import dataToStereoDIR from '../dataToStereoDIR';
import reverseDirectionsByIds from '../../../../files/transforms/reverseDirectionsByIds';
import centerDirectionsByMean from '../../../../files/transforms/centerDirectionsByMean';
import Direction from '../../../classes/Direction';
import { IDirData, RawStatisticsDIR } from '../../../../GlobalTypes';

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

const geographicMean = new Direction(30, 50, 1);
const stratigraphicMean = new Direction(200, 20, 1);
const statistics: RawStatisticsDIR = {
  code: 'fisher',
  mean: {
    geographic: { direction: geographicMean, MAD: 5 },
    stratigraphic: { direction: stratigraphicMean, MAD: 5 },
  },
};

const data = makeData([
  makeInterpretation({ id: 1, Dgeo: 12, Igeo: 34, Dstrat: 18, Istrat: 28 }),
  makeInterpretation({ id: 2, Dgeo: 222, Igeo: -10, Dstrat: 210, Istrat: -5 }),
  makeInterpretation({ id: 3, Dgeo: 95, Igeo: 60, Dstrat: 88, Istrat: 51 }),
]);

const graphSize = 250;
const noneHidden: number[] = [];

// These lock the invariant the feature exists for: the dots the stereonet plots
// and the data the table/export produce come from the same transforms (now via
// the shared centerDirectionOnMean + reverseDirectionsByIds), so they cannot
// drift apart.
describe('dataToStereoDIR — plotted coords match the export transforms', () => {
  it('reversal only: plotted geographic coords equal reverseDirectionsByIds', () => {
    const reversedIDs = [2];
    const { directionalData } = dataToStereoDIR(
      data,
      graphSize,
      'geographic',
      noneHidden,
      reversedIDs,
      false,
      statistics,
      false,
    );
    const expected = reverseDirectionsByIds(data, reversedIDs).interpretations;
    directionalData.forEach(([declination, inclination], index) => {
      expect(+declination.toFixed(1)).toBe(expected[index].Dgeo);
      expect(+inclination.toFixed(1)).toBe(expected[index].Igeo);
    });
  });

  it('center-by-mean: plotted geographic coords equal centerDirectionsByMean', () => {
    const { directionalData } = dataToStereoDIR(
      data,
      graphSize,
      'geographic',
      noneHidden,
      [],
      true,
      statistics,
      false,
    );
    const expected = centerDirectionsByMean(
      data,
      geographicMean,
      stratigraphicMean,
    ).interpretations;
    directionalData.forEach(([declination, inclination], index) => {
      expect(+declination.toFixed(1)).toBe(expected[index].Dgeo);
      expect(+inclination.toFixed(1)).toBe(expected[index].Igeo);
    });
  });

  it('reversal + center-by-mean together match reverse-then-center', () => {
    const reversedIDs = [2];
    const { directionalData } = dataToStereoDIR(
      data,
      graphSize,
      'geographic',
      noneHidden,
      reversedIDs,
      true,
      statistics,
      false,
    );
    const expected = centerDirectionsByMean(
      reverseDirectionsByIds(data, reversedIDs),
      geographicMean,
      stratigraphicMean,
    ).interpretations;
    directionalData.forEach(([declination, inclination], index) => {
      expect(+declination.toFixed(1)).toBe(expected[index].Dgeo);
      expect(+inclination.toFixed(1)).toBe(expected[index].Igeo);
    });
  });

  it('stratigraphic reference: plotted strat coords equal the strat transform', () => {
    const { directionalData } = dataToStereoDIR(
      data,
      graphSize,
      'stratigraphic',
      noneHidden,
      [],
      true,
      statistics,
      false,
    );
    const expected = centerDirectionsByMean(
      data,
      geographicMean,
      stratigraphicMean,
    ).interpretations;
    directionalData.forEach(([declination, inclination], index) => {
      expect(+declination.toFixed(1)).toBe(expected[index].Dstrat);
      expect(+inclination.toFixed(1)).toBe(expected[index].Istrat);
    });
  });

  // The four assertions above lock plot↔export AGREEMENT (both route through the
  // shared centerDirectionOnMean). This one is an INDEPENDENT geometric oracle so
  // a regression in the centering math itself is also caught here: after
  // centering, each plotted dot must sit as far from the stereonet centre (0, 90)
  // as the raw direction was from the mean.
  it('centered plot positions match an independent oracle (distance-to-centre == distance-to-mean)', () => {
    const { directionalData } = dataToStereoDIR(
      data,
      graphSize,
      'geographic',
      noneHidden,
      [],
      true,
      statistics,
      false,
    );
    const centre = new Direction(0, 90, 1);
    directionalData.forEach(([declination, inclination], index) => {
      const raw = data.interpretations[index];
      const distanceFromMean = geographicMean.angle(new Direction(raw.Dgeo, raw.Igeo, 1));
      const distanceFromCentre = centre.angle(new Direction(declination, inclination, 1));
      expect(distanceFromCentre).toBeCloseTo(distanceFromMean, 3);
    });
  });
});
