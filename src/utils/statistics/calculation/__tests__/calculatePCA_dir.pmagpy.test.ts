import { readFileSync } from 'fs';
import { join } from 'path';
import calculatePCA_dir from '../calculatePCA_dir';
import calculateStatisticsDIR from '../../calculateStatisticsDIR';
import parseDIR from '../../../files/parsers/parserDIR';
import parsePMM from '../../../files/parsers/parserPMM';
import Direction from '../../../graphs/classes/Direction';
import { IDirData } from '../../../GlobalTypes';
import { fixturePath } from '../../../../test-utils/referenceFixtures';

// PB-04: DIR-page GC mode (calculatePCA_dir) against pmag.doprinc (pole) and
// pmag.domean 'DE-BFP' (MAD), PmagPy 4.3.14. Oracle generator: scripts/oracle_pb04_pca_directions.py

type Frame = 'geographic' | 'stratigraphic';
type OracleFrame = {
  pole: [number, number];
  tau: [number, number, number];
  mad: number;
  coplanar: boolean;
  horizontalPole: boolean;
};
type FramesCase = {
  name: string;
  geographic: Array<[number, number]>;
  stratigraphic: Array<[number, number]>;
  pmagpy: Record<Frame, OracleFrame>;
};
type DispatcherCase = FramesCase & {
  path: string | null;
  rows?: Array<[number, number, number, number]>;
  selectedIds: number[];
  reversedIds: number[];
};
type DegenerateCase = {
  name: string;
  rows: Array<[number, number, number, number]>;
  selectedIds: number[];
  geographic: Array<[number, number]>;
  pmagpyMad: number;
};

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb04_pca_directions.pmagpy.json'), 'utf8'),
) as {
  synthetic: FramesCase[];
  edges: FramesCase[];
  dispatcher: DispatcherCase[];
  degenerate: DegenerateCase[];
};

const FRAMES: Frame[] = ['geographic', 'stratigraphic'];
// Same orientation matrix and eigen-sort on both sides: only float noise separates them.
const UNIT_VECTOR_TOLERANCE = 1e-12;
const MAD_TOLERANCE_DEGREES = 1e-9;
// Coplanar inputs: tau3 is ~1e-17 rounding noise on both sides, so MAD is atan(sqrt(noise)) ~ 1e-6 deg.
const COPLANAR_MAD_TOLERANCE_DEGREES = 1e-5;

const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..');

const toUnitVector = (direction: [number, number]) =>
  new Direction(direction[0], direction[1], 1).toCartesian().toArray();

const toRows = (rows: Array<[number, number, number, number]>): IDirData['interpretations'] =>
  rows.map(([Dgeo, Igeo, Dstrat, Istrat], index) => ({
    id: index + 1,
    label: `row${index + 1}`,
    code: 'DirPCA',
    stepRange: '',
    stepCount: 0,
    Dgeo,
    Igeo,
    Dstrat,
    Istrat,
    MADgeo: 0,
    Kgeo: 0,
    MADstrat: 0,
    Kstrat: 0,
    comment: '',
    demagType: undefined,
  }));

const toDirData = (rows: Array<[number, number, number, number]>): IDirData => ({
  name: 'synthetic.dir',
  interpretations: toRows(rows),
  format: 'DIR',
  created: '',
});

const framesToRows = (testCase: FramesCase) =>
  testCase.geographic.map(
    ([Dgeo, Igeo], index) =>
      [Dgeo, Igeo, ...testCase.stratigraphic[index]] as [number, number, number, number],
  );

const loadDirData = (path: string): IDirData => {
  const text = readFileSync(join(repositoryRoot, path), 'utf8');
  return path.endsWith('.pmm') ? parsePMM(text, path) : parseDIR(text, path).data;
};

/** Pole as a unit vector; the axis comparison only where the pole is horizontal (hemisphere undefined). */
const expectPoleParity = (pole: Direction, expected: OracleFrame) => {
  const actual = toUnitVector([pole.declination, pole.inclination]);
  const target = toUnitVector(expected.pole);
  const direct = Math.max(...actual.map((component, axis) => Math.abs(component - target[axis])));
  const antipodal = Math.max(
    ...actual.map((component, axis) => Math.abs(component + target[axis])),
  );
  expect(expected.horizontalPole ? Math.min(direct, antipodal) : direct).toBeLessThan(
    UNIT_VECTOR_TOLERANCE,
  );
};

const expectMadParity = (mad: number, expected: OracleFrame) => {
  const tolerance = expected.coplanar ? COPLANAR_MAD_TOLERANCE_DEGREES : MAD_TOLERANCE_DEGREES;
  expect(Math.abs(mad - expected.mad)).toBeLessThan(tolerance);
};

const expectFitParity = (
  result: ReturnType<typeof calculatePCA_dir>,
  expected: Record<Frame, OracleFrame>,
) => {
  FRAMES.forEach((frame) => {
    expectPoleParity(result[frame].direction, expected[frame]);
    expectMadParity(result[frame].MAD, expected[frame]);
  });
};

describe('calculatePCA_dir against pmag.doprinc / pmag.domean DE-BFP', () => {
  it.each(oracle.synthetic.map((testCase) => [testCase.name, testCase] as const))(
    'synthetic %s',
    (_name, testCase) => {
      expectFitParity(calculatePCA_dir(toRows(framesToRows(testCase))), testCase.pmagpy);
    },
  );

  it.each(oracle.edges.map((testCase) => [testCase.name, testCase] as const))(
    'edge: %s',
    (_name, testCase) => {
      expectFitParity(calculatePCA_dir(toRows(framesToRows(testCase))), testCase.pmagpy);
    },
  );

  it('reports the pole in the upper hemisphere (inc <= 0), where PmagPy reports the lower', () => {
    const sample = oracle.dispatcher[0];
    const result = calculatePCA_dir(toRows(framesToRows(sample)));
    expect(result.geographic.direction.inclination).toBeLessThan(0);
    expect(sample.pmagpy.geographic.pole[1]).toBeLessThan(0);
  });
});

describe('DIR-page GC mode through calculateStatisticsDIR (reversal + 0.1 deg rounding)', () => {
  it.each(oracle.dispatcher.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    (_name, testCase) => {
      const dirData = testCase.path ? loadDirData(testCase.path) : toDirData(testCase.rows!);
      const { rawStatistics, interpretation } = calculateStatisticsDIR(
        dirData,
        'gc',
        testCase.selectedIds,
        testCase.reversedIds,
      );
      // The directions PMTools fitted are exactly the ones the oracle was fed.
      expect(interpretation.directions.map(({ Dgeo, Igeo }) => [Dgeo, Igeo])).toEqual(
        testCase.geographic,
      );
      expect(interpretation.directions.map(({ Dstrat, Istrat }) => [Dstrat, Istrat])).toEqual(
        testCase.stratigraphic,
      );
      expectFitParity(rawStatistics.mean, testCase.pmagpy);

      // The table shows the raw values rounded to 0.1 deg; MAD has no hemisphere, so compare it directly.
      expect(interpretation.confidenceRadiusGeo).toBe(+testCase.pmagpy.geographic.mad.toFixed(1));
      expect(interpretation.confidenceRadiusStrat).toBe(
        +testCase.pmagpy.stratigraphic.mad.toFixed(1),
      );
      expect(interpretation.Kgeo).toBe(0);
      expect(interpretation.stepCount).toBe(testCase.selectedIds.length);
    },
  );

  it('sample.dir table row matches the rounded oracle (293.1 / -43.3 / 14.7, 300.3 / -53.8 / 13.7)', () => {
    const sample = oracle.dispatcher[0];
    const { interpretation } = calculateStatisticsDIR(
      loadDirData(sample.path!),
      'gc',
      sample.selectedIds,
      [],
    );
    const { geographic, stratigraphic } = sample.pmagpy;
    expect([interpretation.Dgeo, interpretation.Igeo]).toEqual(
      geographic.pole.map((angle) => +angle.toFixed(1)),
    );
    expect([interpretation.Dstrat, interpretation.Istrat]).toEqual(
      stratigraphic.pole.map((angle) => +angle.toFixed(1)),
    );
    expect([interpretation.Dgeo, interpretation.Igeo, interpretation.confidenceRadiusGeo]).toEqual([
      293.1, -43.3, 14.7,
    ]);
  });
});

describe('recorded mismatches (Part B, not fixed)', () => {
  // Rank-1 orientation matrix (all selected directions equal): every great circle through the
  // point fits exactly, so MAD should be 0 (PmagPy clamps); PMTools returns tau3/tau2 of rounding noise.
  it.each(oracle.degenerate.map((testCase) => [testCase.name, testCase] as const))(
    'MISMATCH PB-04-1: identical selected directions get a noise MAD instead of 0 (%s)',
    (_name, testCase) => {
      const { rawStatistics, interpretation } = calculateStatisticsDIR(
        toDirData(testCase.rows),
        'gc',
        testCase.selectedIds,
        [],
      );
      expect(interpretation.directions.map(({ Dgeo, Igeo }) => [Dgeo, Igeo])).toEqual(
        testCase.geographic,
      );
      expect(rawStatistics.mean.geographic.MAD).toBeGreaterThan(10);
      expect(interpretation.confidenceRadiusGeo).toBeGreaterThan(10);
      expect(testCase.pmagpyMad).toBe(0);
    },
  );
});
