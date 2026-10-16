import { readFileSync } from 'fs';
import { join } from 'path';
import calculateFisherMean from '../calculateFisherMean';
import calculateStatisticsDIR from '../../calculateStatisticsDIR';
import parseDIR from '../../../files/parsers/parserDIR';
import parsePMM from '../../../files/parsers/parserPMM';
import { IDirData, MeanDir } from '../../../GlobalTypes';
import { fixturePath } from '../../../../test-utils/referenceFixtures';

// PB-02: Fisher mean, k, a95, R, N, csd against pmag.fisher_mean (PmagPy 4.3.14).
// Oracle generator: scripts/oracle_pb02_fisher_mean.py

type PmagpyFisherMean = {
  dec: number;
  inc: number;
  n?: number;
  r?: number;
  k?: number | 'inf';
  alpha95?: number;
  csd?: number;
};
type FramePair = { geographic: PmagpyFisherMean; stratigraphic: PmagpyFisherMean };
type Comparison = 'all' | 'directionOnly' | 'statisticsOnly';
type LiveScenario = {
  name: string;
  selectedDirectionsIDs: number[];
  reversedDirectionsIDs: number[];
  pmagpy: FramePair;
};
type LiveSource = {
  source: string;
  parser: 'dir' | 'pmm' | null;
  rows: Array<[number, number, number, number]>;
  scenarios: LiveScenario[];
};
type SyntheticCase = {
  name: string;
  compare: Comparison;
  geographic: Array<[number, number]>;
  stratigraphic: Array<[number, number]>;
  pmagpy: FramePair;
};

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb02_fisher_mean.pmagpy.json'), 'utf8'),
) as {
  liveDirPath: LiveSource[];
  synthetic: SyntheticCase[];
};

const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..');
const ANGLE_TOLERANCE_DEGREES = 1e-9;
const RESULTANT_TOLERANCE = 1e-12;
// k = (N - 1) / (N - R) and csd = 81 / sqrt(k) amplify float noise in R by 1 / (N - R),
// so they are compared relatively (k reaches ~1e5 in the near-vertical case).
const RELATIVE_TOLERANCE = 1e-9;

const declinationDifference = (first: number, second: number) =>
  Math.abs(((first - second + 540) % 360) - 180);

/** PmagPy writes k as the string 'inf' when R == N; PMTools uses the number Infinity. */
const pmagpyKToNumber = (k: PmagpyFisherMean['k']) => (k === 'inf' ? Infinity : (k as number));

const expectRelativelyClose = (actual: number, expected: number) => {
  if (expected === Infinity || expected === 0) {
    expect(actual).toBe(expected);
    return;
  }
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThan(RELATIVE_TOLERANCE);
};

const expectFisherParity = (
  actual: MeanDir,
  expected: PmagpyFisherMean,
  comparison: Comparison = 'all',
) => {
  if (comparison !== 'statisticsOnly') {
    const [declination, inclination] = actual.direction.toArray();
    expect(Math.abs(inclination - expected.inc)).toBeLessThan(ANGLE_TOLERANCE_DEGREES);
    // Declination is undefined at the poles.
    if (Math.abs(expected.inc) < 90 - 1e-6) {
      expect(declinationDifference(declination, expected.dec)).toBeLessThan(
        ANGLE_TOLERANCE_DEGREES,
      );
    }
  }
  if (comparison === 'directionOnly') return;
  expect(actual.N).toBe(expected.n);
  expect(Math.abs((actual.R as number) - (expected.r as number))).toBeLessThan(RESULTANT_TOLERANCE);
  expect(Math.abs(actual.MAD - (expected.alpha95 as number))).toBeLessThan(ANGLE_TOLERANCE_DEGREES);
  expectRelativelyClose(actual.k as number, pmagpyKToNumber(expected.k));
  expectRelativelyClose(actual.csd as number, expected.csd as number);
};

const toInterpretations = (rows: Array<[number, number, number, number]>) =>
  rows.map(([Dgeo, Igeo, Dstrat, Istrat], index) => ({
    id: index + 1,
    label: `row ${index + 1}`,
    code: 'test',
    stepRange: 'T100-T600',
    stepCount: 5,
    Dgeo,
    Igeo,
    Dstrat,
    Istrat,
    MADgeo: 0,
    Kgeo: 0,
    MADstrat: 0,
    Kstrat: 0,
    comment: '',
    demagType: 'thermal' as const,
  }));

const loadLiveSource = (liveSource: LiveSource): IDirData => {
  if (liveSource.parser === null) {
    return {
      name: 'synthetic.dir',
      interpretations: toInterpretations(liveSource.rows),
      format: 'DIR',
      created: '',
    };
  }
  const fileText = readFileSync(join(repositoryRoot, liveSource.source), 'utf8');
  const parsed =
    liveSource.parser === 'dir'
      ? parseDIR(fileText, liveSource.source).data
      : parsePMM(fileText, liveSource.source);
  // The Python oracle parses the file itself; both sides must read the same numbers.
  expect(
    parsed.interpretations.map(({ Dgeo, Igeo, Dstrat, Istrat }) => [Dgeo, Igeo, Dstrat, Istrat]),
  ).toEqual(liveSource.rows);
  return parsed;
};

const toDisplayed = (value: number) => +value.toFixed(1);

describe('calculateFisherMean against pmag.fisher_mean', () => {
  describe('live DIR page path (calculateStatisticsDIR, mode fisher)', () => {
    const scenarios = oracle.liveDirPath.flatMap((liveSource) =>
      liveSource.scenarios.map(
        (scenario) => [`${liveSource.source}: ${scenario.name}`, liveSource, scenario] as const,
      ),
    );

    it.each(scenarios)('%s', (_name, liveSource, scenario) => {
      const { rawStatistics, interpretation } = calculateStatisticsDIR(
        loadLiveSource(liveSource),
        'fisher',
        scenario.selectedDirectionsIDs,
        scenario.reversedDirectionsIDs,
      );
      expectFisherParity(rawStatistics.mean.geographic, scenario.pmagpy.geographic);
      expectFisherParity(rawStatistics.mean.stratigraphic, scenario.pmagpy.stratigraphic);

      // The table shows a95 in the MADgeo/MADstrat columns and k in Kgeo/Kstrat, rounded to 0.1.
      const { geographic, stratigraphic } = scenario.pmagpy;
      expect(interpretation.stepCount).toBe(geographic.n);
      expect(interpretation.Igeo).toBe(toDisplayed(geographic.inc));
      expect(interpretation.Istrat).toBe(toDisplayed(stratigraphic.inc));
      expect(interpretation.confidenceRadiusGeo).toBe(toDisplayed(geographic.alpha95 as number));
      expect(interpretation.confidenceRadiusStrat).toBe(
        toDisplayed(stratigraphic.alpha95 as number),
      );
      expect(interpretation.Kgeo).toBe(toDisplayed(pmagpyKToNumber(geographic.k)));
      expect(interpretation.Kstrat).toBe(toDisplayed(pmagpyKToNumber(stratigraphic.k)));
      expect(declinationDifference(interpretation.Dgeo, toDisplayed(geographic.dec))).toBeLessThan(
        1e-9,
      );
      expect(
        declinationDifference(interpretation.Dstrat, toDisplayed(stratigraphic.dec)),
      ).toBeLessThan(1e-9);
    });
  });

  describe('synthetic and edge sets (unrounded, both frames)', () => {
    it.each(oracle.synthetic.map((testCase) => [testCase.name, testCase] as const))(
      '%s',
      (_name, testCase) => {
        const toRows = testCase.geographic.map(([Dgeo, Igeo], index) => {
          const [Dstrat, Istrat] = testCase.stratigraphic[index];
          return [Dgeo, Igeo, Dstrat, Istrat] as [number, number, number, number];
        });
        const mean = calculateFisherMean(toInterpretations(toRows));
        expectFisherParity(mean.geographic, testCase.pmagpy.geographic, testCase.compare);
        expectFisherParity(mean.stratigraphic, testCase.pmagpy.stratigraphic, testCase.compare);
      },
    );
  });
});
