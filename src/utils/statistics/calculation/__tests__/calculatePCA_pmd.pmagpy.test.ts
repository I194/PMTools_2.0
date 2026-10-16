import { readFileSync } from 'fs';
import { join } from 'path';
import Coordinates from '../../../graphs/classes/Coordinates';
import Direction from '../../../graphs/classes/Direction';
import parsePMD from '../../../files/parsers/parserPMD';
import { IPmdData, PMDStep } from '../../../GlobalTypes';
import calculateStatisticsPMD from '../../calculateStatisticsPMD';
import { fixturePath } from '../../../../test-utils/referenceFixtures';

// PB-03: calculatePCA_pmd, reached through calculateStatisticsPMD exactly as the PCA page calls it,
// against PmagPy 4.3.14 in the specimen frame. Oracle generator:
// scripts/oracle_pb03_pca_demagnetization.py

type FitMode = 'pca' | 'pca0' | 'gc' | 'gcn';
type OracleFit = { dec: number; inc: number; mad: number };
type OracleRange = {
  first: number;
  last: number;
  pca: OracleFit;
  pca0: OracleFit & { vectorMean: [number, number] };
  gc: OracleFit;
  gcn: OracleFit;
};
type RealFile = { path: string; stepLabels: string[]; ranges: OracleRange[] };
type SyntheticSpecimen = {
  name: string;
  steps: Array<[number, number, number]>;
  ranges: OracleRange[];
};

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb03_pca_demagnetization.pmagpy.json'), 'utf8'),
) as { realFiles: RealFile[]; synthetic: SyntheticSpecimen[] };

const MODES: FitMode[] = ['pca', 'pca0', 'gc', 'gcn'];

// Unrounded inputs on both sides; domean's cart2dir/dir2cart round trip leaves ~1e-10 deg at most.
const ANGLE_TOLERANCE_DEGREES = 1e-9;
// N=2 fits are rank-deficient: a zero eigenvalue comes back as float noise and sqrt turns it into
// a noise MAD (PMTools gc gives 7.9e-6 deg where PmagPy clamps to 0); both mean "no scatter".
const DEGENERATE_MAD_TOLERANCE_DEGREES = 1e-4;

const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..');

const loadRealFile = (path: string) =>
  parsePMD(readFileSync(join(repositoryRoot, path), 'utf8'), path).data;

const syntheticData = (specimen: SyntheticSpecimen): IPmdData => ({
  metadata: { name: specimen.name, a: 0, b: 90, s: 0, d: 0, v: 1 },
  steps: specimen.steps.map(
    ([x, y, z], index) =>
      ({ id: index + 1, step: `S${index + 1}`, x, y, z, comment: '' }) as PMDStep,
  ),
  format: 'synthetic',
  created: '',
});

const stepIDs = (first: number, last: number) =>
  Array.from({ length: last - first + 1 }, (_unused, index) => first + index);

/** Angle in degrees, via atan2 so it stays accurate near 0 and 180. */
const angleBetween = (first: Coordinates, second: Coordinates) =>
  Math.atan2(first.cross(second).length, first.dot(second)) * Coordinates.RADIANS;

const toVector = (declination: number, inclination: number) =>
  new Direction(declination, inclination, 1).toCartesian();

const expectParity = (data: IPmdData, mode: FitMode, range: OracleRange) => {
  const { component, MAD } = calculateStatisticsPMD(
    data,
    mode,
    stepIDs(range.first, range.last),
  ).rawStatistics;
  const expected = range[mode];
  const angle = angleBetween(component.edges, toVector(expected.dec, expected.inc));
  const madTolerance =
    range.last - range.first === 1 ? DEGENERATE_MAD_TOLERANCE_DEGREES : ANGLE_TOLERANCE_DEGREES;

  if (mode === 'pca' || mode === 'pca0') {
    // Lines: both sides orient v1 so that v1 . (first - last) >= 0, so the comparison is signed.
    expect(angle).toBeLessThan(ANGLE_TOLERANCE_DEGREES);
  } else {
    // Planes: the pole is an axis (DE-BFP and tauV carry no sign rule); PMTools pins z <= 0.
    expect(Math.min(angle, 180 - angle)).toBeLessThan(ANGLE_TOLERANCE_DEGREES);
    expect(component.edges.z).toBeLessThanOrEqual(0);
  }
  expect(Math.abs(MAD - expected.mad)).toBeLessThan(madTolerance);
};

const rangeCases = (ranges: OracleRange[]) =>
  ranges.flatMap((range) =>
    MODES.map((mode) => [`${mode} steps ${range.first}-${range.last}`, mode, range] as const),
  );

describe('calculatePCA_pmd against pmag.domean / pmag.Tmatrix + pmag.tauV', () => {
  describe.each(oracle.realFiles.map((realFile) => [realFile.path, realFile] as const))(
    '%s, parsed by parsePMD',
    (path, realFile) => {
      const data = loadRealFile(path);

      it('parses the steps the oracle read', () => {
        expect(data.steps.map((step) => step.step)).toEqual(realFile.stepLabels);
      });

      it.each(rangeCases(realFile.ranges))('%s', (_name, mode, range) => {
        expectParity(data, mode, range);
      });
    },
  );

  describe.each(oracle.synthetic.map((specimen) => [specimen.name, specimen] as const))(
    'synthetic %s',
    (_name, specimen) => {
      it.each(rangeCases(specimen.ranges))('%s', (_caseName, mode, range) => {
        expectParity(syntheticData(specimen), mode, range);
      });
    },
  );

  it('pca0 follows the thesis anchored PCA, not the DE-BFL-A vector mean (convention, not a mismatch)', () => {
    // PmagPy DE-BFL-A reports pmag.vector_mean as its direction; PMTools reports the principal
    // eigenvector of the origin-anchored fit as the thesis defines PCA0 (checked above against tauV).
    const realFile = oracle.realFiles[0];
    const range = realFile.ranges.find((candidate) => candidate.first === 12)!;
    const { component } = calculateStatisticsPMD(
      loadRealFile(realFile.path),
      'pca0',
      stepIDs(range.first, range.last),
    ).rawStatistics;
    const pmtoolsDirection = component.edges.toDirection();
    expect(pmtoolsDirection.declination).toBeCloseTo(9.705, 3);
    expect(pmtoolsDirection.inclination).toBeCloseTo(-29.9, 3);
    expect(range.pca0.vectorMean[0]).toBeCloseTo(17.552, 3);
    expect(range.pca0.vectorMean[1]).toBeCloseTo(-42.209, 3);
    expect(angleBetween(component.edges, toVector(...range.pca0.vectorMean))).toBeCloseTo(13.83, 2);
  });
});
