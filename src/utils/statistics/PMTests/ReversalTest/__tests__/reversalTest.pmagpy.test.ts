import { readFileSync } from 'fs';
import { join } from 'path';
import reversalTestClassic from '../reversalTestClassic';
import reversalTestBootstrap from '../reversalTestBootstrap';
import reversalTestOldFashioned from '../reversalTestOldFashioned';
import { splitPolarities } from '../../../eigManipulations';
import { fisherMean } from '../../../calculation/calculateFisherMean';
import Direction from '../../../../graphs/classes/Direction';
import parseDIR from '../../../../files/parsers/parserDIR';
import parsePMM from '../../../../files/parsers/parserPMM';
import { IDirData, ReversalTestClassicResult } from '../../../../GlobalTypes';
import { fixturePath } from '../../../../../test-utils/referenceFixtures';
import { createSeededRandom } from '../../../../../test-utils/seededRandom';

// PB-10: reversal tests against PmagPy 4.3.14: pmag.flip, pmag.fisher_mean, pmag.angle, the
// McFadden & McElhinny (1990) eq. (15) critical angle, ipmag.reversal_test_MM1990 (Monte Carlo)
// and pmag.di_boot (the core of ipmag.common_mean_bootstrap).
// Oracle generator: scripts/oracle_pb10_reversal_test.py

type DeclinationInclination = [number, number];
type FisherSummary = { dec: number; inc: number; n: number; r: number; k: number };
type IpmagClassification = 'A' | 'B' | 'C' | 'indeterminate' | '';
type MonteCarlo = {
  criticalAngles: number[];
  mean: number;
  standardDeviation: number;
  firstRun: { seed: number; angle: number; criticalAngle: number; classification: string };
};
type ClassicCase = {
  name: string;
  source?: string;
  directions?: DeclinationInclination[];
  pmagpy: {
    reversedIndices: number[];
    normalMean: FisherSummary;
    reversedMean: FisherSummary;
    gamma: number;
    gammaCriticalEq15: number;
    ipmagClassification: IpmagClassification;
  };
  monteCarlo?: MonteCarlo;
};
type SplitDifferenceCase = {
  name: string;
  directions: DeclinationInclination[];
  pmagpy: { reversedIndices: number[] };
  centredAxisEmulation: { reversedIndices: number[] };
};
type ManualCase = {
  name: string;
  first: DeclinationInclination;
  n1: number;
  k1: number;
  second: DeclinationInclination;
  n2: number;
  k2: number;
  pmagpy: { gamma: number; gammaCriticalEq15: number; ipmagClassification: IpmagClassification };
};
type Bounds = Record<'x' | 'y' | 'z', [number, number]>;
type BootstrapCase = {
  name: string;
  source?: string;
  directions?: DeclinationInclination[];
  pmagpy: {
    bounds: { first: Bounds; second: Bounds };
    boundStandardDeviation1000: { first: Bounds; second: Bounds };
    exactBoundAtoms?: Record<'first' | 'second', Record<'x' | 'y' | 'z', [number[], number[]]>>;
  };
};

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb10_reversal_test.pmagpy.json'), 'utf8'),
) as {
  classic: ClassicCase[];
  splitDifferences: SplitDifferenceCase[];
  manual: ManualCase[];
  bootstrap: BootstrapCase[];
};

const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..', '..');
const ANGLE_TOLERANCE_DEGREES = 1e-9;
const RESULTANT_RELATIVE_TOLERANCE = 1e-12;
// ipmag's critical angle is a Monte Carlo estimate: one run is compared with eq. (15) within four
// standard deviations of that estimate over the oracle's ten seeds.
const MONTE_CARLO_STANDARD_DEVIATIONS = 4;
// PMTools draws 1000 bootstrap means with its own (seeded) RNG, PmagPy 5000 with numpy's: a bound
// may differ by its sampling error, here five standard deviations of a 1000-sample bound (spread of
// 100 seeded PmagPy runs; over 40 other JS seeds the largest deviation seen was about 4.2).
const BOOTSTRAP_STANDARD_DEVIATIONS = 5;
const BOOTSTRAP_SEED = 20261016;
// Bootstrap means of the same resample, computed by each side: float noise only.
const EXACT_ATOM_TOLERANCE = 1e-12;

// Current values of the recorded mismatches (the PmagPy side comes from the fixture).
const SINGLE_POLARITY_PMTOOLS_REVERSED_COUNT = 13;
const UNBALANCED_PMTOOLS_REVERSED_COUNT = 9;
const MONTE_CARLO_MISMATCH_CASE = 'antipodal, k 20 both, 15 N + 10 R';
const MONTE_CARLO_MISMATCH_PMTOOLS_CRITICAL_ANGLE = 13.121;
const MONTE_CARLO_MISMATCH_IPMAG_MEAN_CRITICAL_ANGLE = 12.435;

/** PMTools names: 'N/A' for a positive test with a critical angle above 20, '-' for a negative test. */
const toPMToolsClassification = (
  classification: IpmagClassification,
): ReversalTestClassicResult['classification'] => {
  if (classification === 'indeterminate') return 'N/A';
  if (classification === '') return '-';
  return classification;
};

const toDirData = (directions: DeclinationInclination[], name: string) =>
  ({
    name,
    interpretations: directions.map(([declination, inclination], index) => ({
      id: index + 1,
      label: `${index + 1}`,
      code: '',
      stepRange: '',
      stepCount: 0,
      Dgeo: declination,
      Igeo: inclination,
      Dstrat: declination,
      Istrat: inclination,
    })),
  }) as unknown as IDirData;

const loadDirData = (testCase: {
  name: string;
  source?: string;
  directions?: DeclinationInclination[];
}) => {
  if (!testCase.source) return toDirData(testCase.directions!, testCase.name);
  const text = readFileSync(join(repositoryRoot, testCase.source), 'utf8');
  return testCase.source.endsWith('.dir')
    ? parseDIR(text, testCase.source).data
    : parsePMM(text, testCase.source);
};

const toDirections = (dirData: IDirData) =>
  dirData.interpretations.map(
    (interpretation) => new Direction(interpretation.Dgeo, interpretation.Igeo, 1),
  );

/** Indices of the input directions that splitPolarities puts in the reversed group. */
const reversedIndicesOf = (directions: Direction[]) => {
  const { normalDirections } = splitPolarities(directions);
  return directions
    .map((direction, index) => (normalDirections.includes(direction) ? -1 : index))
    .filter((index) => index >= 0);
};

const declinationDifference = (first: number, second: number) =>
  Math.abs(((first - second + 540) % 360) - 180);

const expectRelativelyClose = (actual: number, expected: number, tolerance: number) =>
  expect(Math.abs(actual - expected) / Math.abs(expected)).toBeLessThan(tolerance);

const ipmagRuleFor = (gamma: number, gammaCritical: number) => {
  if (!(gamma <= gammaCritical)) return '-';
  if (gammaCritical < 5) return 'A';
  if (gammaCritical < 10) return 'B';
  if (gammaCritical < 20) return 'C';
  return 'N/A';
};

describe('reversalTestClassic against pmag.flip + pmag.fisher_mean + MM1990 eq. (15)', () => {
  describe.each(oracle.classic.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    (_name, testCase) => {
      const dirData = loadDirData(testCase);
      const directions = toDirections(dirData);
      const expected = testCase.pmagpy;

      it('splits the polarities like pmag.flip', () => {
        expect(reversedIndicesOf(directions)).toEqual(expected.reversedIndices);
      });

      it('has the pmag.fisher_mean means of both groups', () => {
        const { normalDirections, reversedDirections } = splitPolarities(directions);
        [
          [fisherMean(normalDirections), expected.normalMean],
          [fisherMean(reversedDirections), expected.reversedMean],
        ].forEach(([actualMean, expectedMean]) => {
          const actual = actualMean as ReturnType<typeof fisherMean>;
          const oracleMean = expectedMean as FisherSummary;
          expect(actual.N).toBe(oracleMean.n);
          expectRelativelyClose(actual.R!, oracleMean.r, RESULTANT_RELATIVE_TOLERANCE);
          expect(Math.abs(actual.direction.inclination - oracleMean.inc)).toBeLessThan(
            ANGLE_TOLERANCE_DEGREES,
          );
          expect(declinationDifference(actual.direction.declination, oracleMean.dec)).toBeLessThan(
            ANGLE_TOLERANCE_DEGREES,
          );
        });
      });

      it('has gamma, the eq. (15) critical angle and the classification', () => {
        const result = reversalTestClassic(dirData);
        expect(Math.abs(result.gamma - expected.gamma)).toBeLessThan(ANGLE_TOLERANCE_DEGREES);
        expect(Math.abs(result.gammaCritical - expected.gammaCriticalEq15)).toBeLessThan(
          ANGLE_TOLERANCE_DEGREES,
        );
        expect(result.classification).toBe(toPMToolsClassification(expected.ipmagClassification));
      });

      if (testCase.monteCarlo && testCase.name !== MONTE_CARLO_MISMATCH_CASE) {
        const monteCarlo = testCase.monteCarlo;
        it('agrees with ipmag.reversal_test_MM1990 (Monte Carlo critical angle and class)', () => {
          const result = reversalTestClassic(dirData);
          expect(Math.abs(result.gamma - monteCarlo.firstRun.angle)).toBeLessThan(
            ANGLE_TOLERANCE_DEGREES,
          );
          expect(Math.abs(result.gammaCritical - monteCarlo.firstRun.criticalAngle)).toBeLessThan(
            MONTE_CARLO_STANDARD_DEVIATIONS * monteCarlo.standardDeviation,
          );
          expect(result.classification).toBe(
            toPMToolsClassification(monteCarlo.firstRun.classification as IpmagClassification),
          );
        });
      }
    },
  );
});

describe('reversalTestOldFashioned against MM1990 eq. (15) with R = N - (N - 1) / k', () => {
  it.each(oracle.manual.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    (_name, testCase) => {
      const result = reversalTestOldFashioned(
        new Direction(testCase.first[0], testCase.first[1], 1),
        testCase.n1,
        testCase.k1,
        new Direction(testCase.second[0], testCase.second[1], 1),
        testCase.n2,
        testCase.k2,
      );
      expect(Math.abs(result.gamma - testCase.pmagpy.gamma)).toBeLessThan(ANGLE_TOLERANCE_DEGREES);
      expect(Math.abs(result.gammaCritical - testCase.pmagpy.gammaCriticalEq15)).toBeLessThan(
        ANGLE_TOLERANCE_DEGREES,
      );
      expect(result.classification).toBe(
        toPMToolsClassification(testCase.pmagpy.ipmagClassification),
      );
    },
  );

  // PMTools classifies with <= 5/10/20, ipmag with < 5/10/20; the critical angle lands on a grid of
  // acos outputs that skips 5, 10 and 20 exactly, so the two rules never disagree on a real result.
  it('applies the same class as the ipmag thresholds on every boundary case', () => {
    oracle.manual
      .filter((testCase) => testCase.name.startsWith('boundary'))
      .forEach((testCase) => {
        const result = reversalTestOldFashioned(
          new Direction(testCase.first[0], testCase.first[1], 1),
          testCase.n1,
          testCase.k1,
          new Direction(testCase.second[0], testCase.second[1], 1),
          testCase.n2,
          testCase.k2,
        );
        expect(result.classification).toBe(ipmagRuleFor(result.gamma, result.gammaCritical));
      });
  });
});

describe('reversalTestBootstrap against pmag.di_boot (ipmag.common_mean_bootstrap core)', () => {
  let randomSpy: jest.SpyInstance;
  afterEach(() => randomSpy?.mockRestore());

  const boundsOf = (values: number[]): [number, number] => {
    // Same indices as dataToReversalTest.ts and ipmag.common_mean_bootstrap.
    const sorted = [...values].sort((first, second) => first - second);
    return [sorted[Math.floor(0.025 * sorted.length)], sorted[Math.floor(0.975 * sorted.length)]];
  };

  it.each(oracle.bootstrap.map((testCase) => [testCase.name, testCase] as const))(
    '%s: 2.5 / 97.5 % bounds of the x, y, z bootstrap means',
    (_name, testCase) => {
      const random = createSeededRandom(BOOTSTRAP_SEED);
      randomSpy = jest.spyOn(Math, 'random').mockImplementation(random.next);
      const result = reversalTestBootstrap(loadDirData(testCase), 1000);

      (['x', 'y', 'z'] as const).forEach((component) => {
        (['first', 'second'] as const).forEach((population) => {
          const values = result[component][population];
          expect(values).toHaveLength(1000);
          const actualBounds = boundsOf(values);
          const expectedBounds = testCase.pmagpy.bounds[population][component];
          const spread = testCase.pmagpy.boundStandardDeviation1000[population][component];
          const atoms = testCase.pmagpy.exactBoundAtoms?.[population][component];
          [0, 1].forEach((side) => {
            // A four-direction group has 35 distinct resamples: the bound must then be one of the
            // bootstrap means that can occupy it (enumerated exactly by the oracle).
            const deviation = atoms
              ? Math.min(...atoms[side].map((atom) => Math.abs(actualBounds[side] - atom)))
              : Math.abs(actualBounds[side] - expectedBounds[side]);
            const allowed = atoms
              ? EXACT_ATOM_TOLERANCE
              : BOOTSTRAP_STANDARD_DEVIATIONS * spread[side];
            expect(deviation).toBeLessThanOrEqual(allowed);
          });
        });
      });
    },
  );
});

describe('recorded mismatches (Part B, not fixed)', () => {
  // splitPolarities takes the principal axis of the CENTRED vectors; pmag.flip (doprinc) takes
  // that of the uncentred orientation matrix. On a one-polarity or a dispersed, unbalanced set the
  // centred axis lies across the cluster and cuts it in two.
  it('MISMATCH PB-10-1: polarity split uses the centred principal axis (pmag.flip does not centre)', () => {
    const [singlePolarity, unbalanced] = oracle.splitDifferences;
    const sameSplit = (actual: number[], expected: number[], count: number) => {
      const complement = Array.from({ length: count }, (_, index) => index).filter(
        (index) => !expected.includes(index),
      );
      return (
        JSON.stringify(actual) === JSON.stringify(expected) ||
        JSON.stringify(actual) === JSON.stringify(complement)
      );
    };

    [singlePolarity, unbalanced].forEach((testCase) => {
      const directions = testCase.directions.map(
        ([declination, inclination]) => new Direction(declination, inclination, 1),
      );
      const reversedIndices = reversedIndicesOf(directions);
      expect(
        sameSplit(
          reversedIndices,
          testCase.centredAxisEmulation.reversedIndices,
          directions.length,
        ),
      ).toBe(true);
      expect(sameSplit(reversedIndices, testCase.pmagpy.reversedIndices, directions.length)).toBe(
        false,
      );
    });

    // PmagPy finds no reversed direction; PMTools splits the cluster and still reports a test.
    expect(singlePolarity.pmagpy.reversedIndices).toEqual([]);
    expect(reversedIndicesOf(toDirections(toDirData(singlePolarity.directions, '')))).toHaveLength(
      SINGLE_POLARITY_PMTOOLS_REVERSED_COUNT,
    );
    expect(unbalanced.pmagpy.reversedIndices).toHaveLength(1);
    expect(reversedIndicesOf(toDirections(toDirData(unbalanced.directions, '')))).toHaveLength(
      UNBALANCED_PMTOOLS_REVERSED_COUNT,
    );
  });

  // PMTools always uses the closed form of MM1990 eq. (15) (common precision); ipmag always
  // simulates Watson's V with each group's own k (MM1990 eqs. 18-19). On this set (sample k 17.8
  // against 30.6, N 15 against 10) the two critical angles part beyond Monte Carlo error.
  it('MISMATCH PB-10-2: eq. (15) critical angle differs from the ipmag Watson V simulation', () => {
    const testCase = oracle.classic.find(
      (classicCase) => classicCase.name === MONTE_CARLO_MISMATCH_CASE,
    )!;
    const monteCarlo = testCase.monteCarlo!;
    const result = reversalTestClassic(toDirData(testCase.directions!, testCase.name));

    expect(Math.abs(result.gammaCritical - testCase.pmagpy.gammaCriticalEq15)).toBeLessThan(
      ANGLE_TOLERANCE_DEGREES,
    );
    expect(result.gammaCritical).toBeCloseTo(MONTE_CARLO_MISMATCH_PMTOOLS_CRITICAL_ANGLE, 3);
    expect(monteCarlo.mean).toBeCloseTo(MONTE_CARLO_MISMATCH_IPMAG_MEAN_CRITICAL_ANGLE, 3);
    expect(Math.abs(result.gammaCritical - monteCarlo.firstRun.criticalAngle)).toBeGreaterThan(
      MONTE_CARLO_STANDARD_DEVIATIONS * monteCarlo.standardDeviation,
    );
    // The class is the same here (C); only the critical angle differs.
    expect(result.classification).toBe(
      toPMToolsClassification(monteCarlo.firstRun.classification as IpmagClassification),
    );
  });
});
