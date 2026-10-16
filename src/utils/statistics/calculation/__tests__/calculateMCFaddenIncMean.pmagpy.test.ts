import { readFileSync } from 'fs';
import { join } from 'path';
import calculateMCFaddenIncMean from '../calculateMCFaddenIncMean';
import parseDIR from '../../../files/parsers/parserDIR';
import parsePMM from '../../../files/parsers/parserPMM';
import { fixturePath } from '../../../../test-utils/referenceFixtures';

// PB-06: inclination-only mean (McFadden & Reid 1982) against pmag.doincfish (PmagPy 4.3.14).
// This verifies DEAD code: calculateMCFaddenIncMean has no production importer (no UI mode calls it)
// and ledger SCI-20 approves deleting it; the parity is recorded for that decision.
// Oracle generator: scripts/oracle_pb06_inclination_only_mean.py

type PmagpyResult = {
  n: number;
  ginc: number;
  inc: number;
  r: number;
  k: number | null;
  alpha95: number | null;
  csd: number | null;
  fTerm: number | null;
  stdout: string;
  alpha95WithoutFTerm?: number;
};
type OracleCase = { name: string; inclinations: number[]; pmagpy: PmagpyResult };
type RealFileCase = OracleCase & {
  file: string;
  column: 'Igeo' | 'Istrat';
  minimumAbsoluteInclination?: number;
};
type InclinationOnlyMean = {
  ginc: number;
  inc: number;
  n: number;
  r: number;
  k: number;
  a95: number;
  csd: number;
};

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb06_inclination_only_mean.pmagpy.json'), 'utf8'),
) as { cases: OracleCase[]; realFiles: RealFileCase[]; singleAndDegenerate: OracleCase[] };

const caseNamed = (name: string) => {
  const found = [...oracle.cases, ...oracle.realFiles, ...oracle.singleAndDegenerate].find(
    (testCase) => testCase.name === name,
  );
  if (!found) throw new Error(`fixture case "${name}" is missing`);
  return found;
};

const PER_TEST_TIMEOUT_MS = 5000;
// Gaussian mean of |inc|: only summation order differs (PMTools adds value / N, numpy sums then divides).
const GAUSSIAN_MEAN_TOLERANCE = 1e-9;
// Both sides search a 0.01 deg grid, but PmagPy's grid starts at colatitude 0 and keeps the point
// before the sign change, while PMTools's grid starts at 90 - ginc and keeps the point after it.
const MEAN_INCLINATION_TOLERANCE = 0.02;
// r, k, csd are then evaluated at colatitudes up to 0.02 deg apart, which moves C by about
// |S| * 3.5e-4 and k by that over N - C (largest for tight, small sets). Observed worst relative
// differences over all sets: 4.9e-4 (k), 2.5e-4 (csd), 2.3e-5 (r).
const RELATIVE_TOLERANCE_AFTER_GRID = 2e-3;
const WALK_ITERATION_CAP = 20000;

/**
 * Capped copy of the root walk in calculateMCFaddenIncMean.ts:68-84. That walk has no iteration
 * cap, and a Jest timeout cannot interrupt a synchronous loop, so every input is checked here
 * before the live function is called.
 */
const pmtoolsWalkTerminates = (inclinations: number[]) => {
  const absolute = inclinations.map((value) => Math.abs(value));
  const count = absolute.length;
  if (count < 2) return true;
  const gaussianMean = absolute.reduce((sum, value) => sum + value / count, 0);
  if (gaussianMean < 30) return true;
  const rad = Math.PI / 180;
  const sumCos = absolute.reduce((sum, value) => sum + Math.cos((90 - value) * rad), 0);
  const sumSin = absolute.reduce((sum, value) => sum + Math.sin((90 - value) * rad), 0);
  const misfit = (colatitude: number) =>
    count * Math.cos(colatitude) +
    (Math.pow(Math.sin(colatitude), 2) - Math.pow(Math.cos(colatitude), 2)) * sumCos -
    2 * Math.sin(colatitude) * Math.cos(colatitude) * sumSin;
  let colatitude = (90 - gaussianMean) * rad;
  let epsilon = misfit(colatitude);
  let direction = gaussianMean;
  for (let iteration = 0; iteration < WALK_ITERATION_CAP; iteration++) {
    if (direction > 0) colatitude -= 0.01 * rad;
    if (direction < 0) colatitude += 0.01 * rad;
    const previous = epsilon;
    epsilon = misfit(colatitude);
    if (Math.abs(epsilon) > Math.abs(previous)) direction = -direction;
    if (epsilon * previous < 0) return true;
  }
  return false;
};

const runPmtools = (inclinations: number[]) => {
  if (!pmtoolsWalkTerminates(inclinations)) {
    throw new Error('input would hang calculateMCFaddenIncMean; it must not be in the fixture');
  }
  return calculateMCFaddenIncMean(inclinations) as InclinationOnlyMean;
};

const expectRelativeClose = (actual: number, expected: number) => {
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(
    RELATIVE_TOLERANCE_AFTER_GRID * Math.abs(expected),
  );
};

/** Every output both sides share, except a95 (recorded mismatch PB-06-1). */
const expectParity = (inclinations: number[], expected: PmagpyResult) => {
  const actual = runPmtools(inclinations);
  expect(actual.n).toBe(expected.n);
  // ginc is compared by magnitude: its sign is the walk-reversal artefact of PB-06-3.
  expect(Math.abs(Math.abs(actual.ginc) - expected.ginc)).toBeLessThan(GAUSSIAN_MEAN_TOLERANCE);
  if (expected.ginc < 30) {
    // Shallow branch on both sides: the Gaussian mean is returned with zero statistics
    // (PmagPy omits the alpha95 key here, PMTools returns 0).
    expect(actual.inc).toBe(actual.ginc);
    expect(Math.abs(actual.inc - expected.inc)).toBeLessThan(GAUSSIAN_MEAN_TOLERANCE);
    expect([actual.r, actual.k, actual.a95, actual.csd]).toEqual([0, 0, 0, 0]);
    expect([expected.r, expected.k, expected.csd, expected.alpha95]).toEqual([0, 0, 0, null]);
    return;
  }
  expect(Math.abs(actual.inc - expected.inc)).toBeLessThan(MEAN_INCLINATION_TOLERANCE);
  expectRelativeClose(actual.r, expected.r);
  expectRelativeClose(actual.k, expected.k as number);
  expectRelativeClose(actual.csd, expected.csd as number);
};

describe('calculateMCFaddenIncMean (dead code) against pmag.doincfish', () => {
  it.each(oracle.cases.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    (_name, testCase) => expectParity(testCase.inclinations, testCase.pmagpy),
    PER_TEST_TIMEOUT_MS,
  );

  it.each(oracle.realFiles.map((realFile) => [realFile.name, realFile] as const))(
    '%s, parsed by the live parser',
    (_name, realFile) => {
      const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..');
      const text = readFileSync(join(repositoryRoot, realFile.file), 'utf8');
      const parsed = realFile.file.endsWith('.pmm')
        ? parsePMM(text, realFile.file)
        : parseDIR(text, realFile.file).data;
      const minimum = realFile.minimumAbsoluteInclination ?? 0;
      const inclinations = parsed.interpretations
        .map((interpretation) => interpretation[realFile.column])
        .filter((inclination) => Math.abs(inclination) >= minimum);
      expect(inclinations).toEqual(realFile.inclinations);
      expectParity(inclinations, realFile.pmagpy);
    },
    PER_TEST_TIMEOUT_MS,
  );

  it(
    'keeps polarity out of the mean on both sides (all-negative input equals all-positive)',
    () => {
      const positive = caseNamed('Part A steep_inclinations');
      const negative = caseNamed('all-negative copy of Part A steep');
      expect(runPmtools(negative.inclinations)).toEqual(runPmtools(positive.inclinations));
      expect(negative.pmagpy).toEqual(positive.pmagpy);
    },
    PER_TEST_TIMEOUT_MS,
  );

  it(
    'zero-scatter [60, 60] is degenerate (not comparable): PmagPy k = inf, PMTools steps off the root',
    () => {
      const degenerate = caseNamed('N=2 zero scatter');
      const actual = runPmtools(degenerate.inclinations);
      expect(degenerate.pmagpy.inc).toBe(60);
      expect(degenerate.pmagpy.k).toBeNull();
      expect(Math.abs(actual.inc - degenerate.pmagpy.inc)).toBeLessThan(MEAN_INCLINATION_TOLERANCE);
      expect(actual.k).toBeGreaterThan(1e6);
    },
    PER_TEST_TIMEOUT_MS,
  );

  describe('recorded mismatches (Part B, not fixed)', () => {
    it(
      'MISMATCH PB-06-1: a95 omits the F(2, N-1) term (SCI-07)',
      () => {
        // Grids coincide on the docstring example, so PMTools a95 equals PmagPy's f = 0 value exactly.
        const docstring = caseNamed('pmag.doincfish docstring example');
        const docstringActual = runPmtools(docstring.inclinations);
        expect(docstringActual.a95).toBeCloseTo(0.9442088603977558, 9);
        expect(docstringActual.a95).toBeCloseTo(docstring.pmagpy.alpha95WithoutFTerm as number, 9);
        expect(docstring.pmagpy.alpha95).toBeCloseTo(5.2624335914496125, 9);
        expect(docstring.pmagpy.fTerm).toBeCloseTo(4.2565, 9);

        const steep = caseNamed('Part A steep_inclinations');
        expect(runPmtools(steep.inclinations).a95).toBeCloseTo(0.45455971579100235, 9);
        expect(steep.pmagpy.alpha95).toBeCloseTo(6.730309902305326, 9);

        const twoValues = caseNamed('N=2 distinct');
        expect(runPmtools(twoValues.inclinations).a95).toBeCloseTo(0.39000677625065605, 9);
        expect(twoValues.pmagpy.alpha95).toBeCloseTo(76.50816731643489, 9);

        [...oracle.cases, ...oracle.realFiles]
          .filter((testCase) => testCase.pmagpy.alpha95 !== null)
          .forEach((testCase) => {
            expect(runPmtools(testCase.inclinations).a95).toBeLessThan(
              testCase.pmagpy.alpha95 as number,
            );
          });
      },
      PER_TEST_TIMEOUT_MS,
    );

    it(
      'MISMATCH PB-06-2: N=1 throws a TypeError where PmagPy returns the single value (SCI-08)',
      () => {
        const steep = caseNamed('N=1 steep');
        expect(() => calculateMCFaddenIncMean(steep.inclinations)).toThrow(TypeError);
        expect(steep.pmagpy).toMatchObject({ n: 1, ginc: 60, inc: 60, r: 1, k: null });

        const shallow = caseNamed('N=1 shallow');
        expect(() => calculateMCFaddenIncMean(shallow.inclinations)).toThrow(TypeError);
        expect(shallow.pmagpy).toMatchObject({ n: 1, ginc: 20, inc: 20, r: 0, k: 0 });
      },
      PER_TEST_TIMEOUT_MS,
    );

    it(
      'MISMATCH PB-06-3: ginc comes back negative whenever the root walk reversed direction',
      () => {
        const docstring = caseNamed('pmag.doincfish docstring example');
        expect(runPmtools(docstring.inclinations).ginc).toBeCloseTo(-61.24, 9);
        expect(docstring.pmagpy.ginc).toBeCloseTo(61.24, 9);

        const sampleDir = caseNamed('test-data/sample.dir Igeo');
        expect(runPmtools(sampleDir.inclinations).ginc).toBeCloseTo(-39.5125, 9);
        expect(sampleDir.pmagpy.ginc).toBeCloseTo(39.5125, 9);

        const exampleDir = caseNamed('exampleDIR.pmm Igeo');
        expect(runPmtools(exampleDir.inclinations).ginc).toBeCloseTo(-41.98303571428572, 9);
        expect(exampleDir.pmagpy.ginc).toBeCloseTo(41.98303571428572, 9);
      },
      PER_TEST_TIMEOUT_MS,
    );
  });
});
