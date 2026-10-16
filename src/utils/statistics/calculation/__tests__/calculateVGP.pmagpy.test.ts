import { readFileSync } from 'fs';
import { join } from 'path';
import calculateVGP from '../calculateVGP';
import { fisherMean } from '../calculateFisherMean';
import Direction from '../../../graphs/classes/Direction';
import parsePMM from '../../../files/parsers/parserPMM';
import parseDIR from '../../../files/parsers/parserDIR';
import { IDirData } from '../../../GlobalTypes';
import { fixturePath } from '../../../../test-utils/referenceFixtures';

// PB-05: calculateVGP against pmag.dia_vgp + pmag.plat, and the VGP mean pole (fisherMean on
// [plon, plat], VGP/Graphs.tsx) against pmag.fisher_mean (PmagPy 4.3.14).
// Oracle generator: scripts/oracle_pb05_vgp.py

/** [declination, inclination, site latitude, site longitude, a95] */
type VgpInput = [number, number, number, number, number];
/** [pole longitude, pole latitude, paleolatitude, dp, dm] */
type VgpOutput = [number, number, number, number, number];
type PointCase = { name: string; input: VgpInput; pmagpy: VgpOutput };
type OracleMean = {
  plon: number;
  plat: number;
  a95?: number;
  k?: number | null;
  n?: number;
  r?: number;
  csd?: number;
};
type RealFileScenario = {
  path: string;
  site: string;
  siteLatitude: number;
  siteLongitude: number;
  reversedIds: number[];
  inputs: Array<[number, number, number]>;
  pmagpy: VgpOutput[];
  meanPole: OracleMean;
};

const oracle = JSON.parse(readFileSync(fixturePath('part_b', 'pb05_vgp.pmagpy.json'), 'utf8')) as {
  synthetic: PointCase[];
  meridianSweep: { siteLongitude: number; a95: number; rows: number[][] };
  degenerate: PointCase[];
  mismatches: PointCase[];
  realFiles: RealFileScenario[];
  poleSets: Array<{ name: string; poles: Array<[number, number]>; pmagpy: OracleMean }>;
};

const DEGREE_TOLERANCE = 1e-9;
// On the site meridian PMTools takes acos of a ratio next to +-1 (calculateVGP.ts:30-34), which
// loses ~1e-5 deg; 1e-4 deg is still 1000x below the 0.1 deg the table shows.
const MERIDIAN_LONGITUDE_TOLERANCE = 1e-4;
// Fisher k = (N - 1) / (N - R) amplifies the float noise of R, so k is compared relatively.
const RELATIVE_K_TOLERANCE = 1e-9;

const longitudeDifference = (first: number, second: number) =>
  Math.abs(((((first - second) % 360) + 540) % 360) - 180);

const isOnSiteMeridian = (declination: number) => declination % 180 === 0;

/** calculateVGP with dp/dm undefined -> 0, as VGPmodalContent.tsx:78-79 shows them. */
const runCalculateVGP = ([
  declination,
  inclination,
  siteLatitude,
  siteLongitude,
  a95,
]: VgpInput) => {
  const vgp = calculateVGP(declination, inclination, siteLatitude, siteLongitude, a95);
  return [vgp.poleLongitude, vgp.poleLatitude, vgp.paleoLatitude, vgp.dp || 0, vgp.dm || 0];
};

const expectLatitudesAndOvalParity = (actual: number[], expected: VgpOutput) => {
  [1, 2, 3, 4].forEach((index) => {
    expect(Math.abs(actual[index] - expected[index])).toBeLessThan(DEGREE_TOLERANCE);
  });
};

const expectVgpParity = (actual: number[], expected: VgpOutput) => {
  expect(actual[0]).toBeGreaterThanOrEqual(0);
  expect(actual[0]).toBeLessThanOrEqual(360);
  expect(longitudeDifference(actual[0], expected[0])).toBeLessThan(DEGREE_TOLERANCE);
  expectLatitudesAndOvalParity(actual, expected);
};

const meanPoleOf = (poles: number[][]) =>
  fisherMean(poles.map(([longitude, latitude]) => new Direction(longitude, latitude, 1)));

const expectMeanPoleParity = (poles: number[][], expected: OracleMean) => {
  const mean = meanPoleOf(poles);
  expect(longitudeDifference(mean.direction.declination, expected.plon)).toBeLessThan(
    DEGREE_TOLERANCE,
  );
  expect(Math.abs(mean.direction.inclination - expected.plat)).toBeLessThan(DEGREE_TOLERANCE);
  if (expected.n === undefined) return; // PmagPy returns only dec/inc for N < 2: not comparable
  expect(mean.N).toBe(expected.n);
  expect(Math.abs(mean.R! - expected.r!)).toBeLessThan(DEGREE_TOLERANCE);
  expect(Math.abs(mean.MAD - expected.a95!)).toBeLessThan(DEGREE_TOLERANCE);
  expect(Math.abs(mean.csd! - expected.csd!)).toBeLessThan(DEGREE_TOLERANCE);
  if (expected.k === null) expect(mean.k).toBe(Infinity);
  else expect(Math.abs(mean.k! / expected.k! - 1)).toBeLessThan(RELATIVE_K_TOLERANCE);
};

const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..');

/** The rows VGPmodalContent.calculateVGPs feeds to calculateVGP (geographic; geo == strat here). */
const uiInputsFor = (scenario: RealFileScenario): VgpInput[] => {
  const text = readFileSync(join(repositoryRoot, scenario.path), 'utf8');
  const parsed: IDirData = scenario.path.endsWith('.pmm')
    ? parsePMM(text, scenario.path)
    : parseDIR(text, scenario.path).data;
  return parsed.interpretations.map((interpretation) => {
    let direction = new Direction(interpretation.Dgeo, interpretation.Igeo, 1);
    if (scenario.reversedIds.includes(interpretation.id)) {
      direction = direction.reversePolarity();
    }
    return [
      +direction.declination.toFixed(1),
      +direction.inclination.toFixed(1),
      scenario.siteLatitude,
      scenario.siteLongitude,
      interpretation.MADgeo,
    ];
  });
};

const scenarioName = (scenario: RealFileScenario) =>
  `${scenario.path} at ${scenario.site}${scenario.reversedIds.length ? ', reversed' : ''}`;

const scenarioHasMeridianRow = (scenario: RealFileScenario) =>
  scenario.inputs.some(([declination]) => isOnSiteMeridian(declination));

const sweepCases = oracle.meridianSweep.rows.map((row) => ({
  input: [row[0], row[1], row[2], oracle.meridianSweep.siteLongitude, oracle.meridianSweep.a95],
  pmagpy: row.slice(3) as VgpOutput,
  actual: runCalculateVGP([
    row[0],
    row[1],
    row[2],
    oracle.meridianSweep.siteLongitude,
    oracle.meridianSweep.a95,
  ]),
}));

describe('calculateVGP against pmag.dia_vgp / pmag.plat', () => {
  it.each(oracle.synthetic.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    (_name, testCase) => {
      expectVgpParity(runCalculateVGP(testCase.input), testCase.pmagpy);
    },
  );

  it.each(oracle.realFiles.map((scenario) => [scenarioName(scenario), scenario] as const))(
    'every direction of %s, parsed and preprocessed as the VGP modal does',
    (_name, scenario) => {
      const inputs = uiInputsFor(scenario);
      expect(
        inputs.map(([declination, inclination, , , a95]) => [declination, inclination, a95]),
      ).toEqual(scenario.inputs);
      inputs.forEach((input, index) => {
        const actual = runCalculateVGP(input);
        // Longitude on the site meridian is recorded in MISMATCH PB-05-3.
        if (isOnSiteMeridian(input[0]))
          expectLatitudesAndOvalParity(actual, scenario.pmagpy[index]);
        else expectVgpParity(actual, scenario.pmagpy[index]);
      });
    },
  );

  it('declination exactly 0/180/360: every finite pole longitude and every latitude agree', () => {
    sweepCases.forEach(({ actual, pmagpy }) => expectLatitudesAndOvalParity(actual, pmagpy));
    // Pole at |latitude| 90 has no longitude on either side: not comparable.
    const longitudeDifferences = sweepCases
      .filter(({ actual, pmagpy }) => Number.isFinite(actual[0]) && Math.abs(pmagpy[1]) < 89.999)
      .map(({ actual, pmagpy }) => longitudeDifference(actual[0], pmagpy[0]));
    expect(longitudeDifferences.length).toBeGreaterThan(sweepCases.length / 2);
    expect(Math.max(...longitudeDifferences)).toBeLessThan(MERIDIAN_LONGITUDE_TOLERANCE);
  });

  // Site or pole at a geographic pole: longitude is undefined, both sides pick a convention.
  it.each(oracle.degenerate.map((testCase) => [testCase.name, testCase] as const))(
    'not comparable in longitude, latitudes and oval agree: %s',
    (_name, testCase) => {
      expectLatitudesAndOvalParity(runCalculateVGP(testCase.input), testCase.pmagpy);
    },
  );
});

describe('VGP mean pole (fisherMean on [plon, plat]) against pmag.fisher_mean', () => {
  it.each(oracle.poleSets.map((poleSet) => [poleSet.name, poleSet] as const))(
    '%s',
    (_name, poleSet) => {
      expectMeanPoleParity(poleSet.poles, poleSet.pmagpy);
    },
  );

  it.each(
    oracle.realFiles
      .filter((scenario) => !scenarioHasMeridianRow(scenario))
      .map((scenario) => [scenarioName(scenario), scenario] as const),
  )('mean of the VGPs of %s', (_name, scenario) => {
    const poles = uiInputsFor(scenario).map((input) => runCalculateVGP(input).slice(0, 2));
    expectMeanPoleParity(poles, scenario.meanPole);
  });
});

describe('recorded mismatches (Part B, not fixed)', () => {
  const mismatchCase = (name: string) =>
    oracle.mismatches.find((testCase) => testCase.name === name)!;

  it('MISMATCH PB-05-1: pole longitude is NaN for declination exactly 180 (unclamped acos)', () => {
    const testCase = mismatchCase('declination 180 on the site meridian');
    const actual = runCalculateVGP(testCase.input);
    expect(actual[0]).toBeNaN();
    expect(testCase.pmagpy[0]).toBeCloseTo(40, 9);
    expectLatitudesAndOvalParity(actual, testCase.pmagpy);
  });

  it('MISMATCH PB-05-2: NaN pole longitudes across the declination 0/180/360 sweep', () => {
    const notANumberCases = sweepCases.filter(({ actual }) => Number.isNaN(actual[0]));
    expect(notANumberCases.length).toBeGreaterThan(0);
    notANumberCases.forEach(({ pmagpy }) => expect(Number.isFinite(pmagpy[0])).toBe(true));
    expect(
      notANumberCases.some(({ input }) => input[0] === 0) &&
        notANumberCases.some(({ input }) => input[0] === 180) &&
        notANumberCases.some(({ input }) => input[0] === 360),
    ).toBe(true);
  });

  it('MISMATCH PB-05-3: exampleDIR.pmm ZH29 (Dg 360.0) gives a NaN pole and a NaN mean pole', () => {
    oracle.realFiles.filter(scenarioHasMeridianRow).forEach((scenario) => {
      expect(scenario.path).toBe('src/assets/examples/exampleDIR.pmm');
      const inputs = uiInputsFor(scenario);
      const meridianIndex = inputs.findIndex(([declination]) => isOnSiteMeridian(declination));
      expect(inputs[meridianIndex][0]).toBe(360);
      expect(runCalculateVGP(inputs[meridianIndex])[0]).toBeNaN();
      expect(scenario.pmagpy[meridianIndex][0]).toBeCloseTo(217.62, 9);

      const mean = meanPoleOf(inputs.map((input) => runCalculateVGP(input).slice(0, 2)));
      expect(mean.direction.declination).toBeNaN();
      expect(mean.direction.inclination).toBeNaN();
      expect(mean.MAD).toBeNaN();
      expect(Number.isFinite(scenario.meanPole.plon)).toBe(true);
      expect(Number.isFinite(scenario.meanPole.a95!)).toBe(true);
    });
    expect(oracle.realFiles.filter(scenarioHasMeridianRow)).toHaveLength(2);
  });

  it('MISMATCH PB-05-4: pole longitude is not reduced below 360 (site longitude 350)', () => {
    const testCase = mismatchCase('site longitude 350 in the 0..360 convention');
    const actual = runCalculateVGP(testCase.input);
    expect(actual[0]).toBeCloseTo(494.694995, 6);
    expect(testCase.pmagpy[0]).toBeCloseTo(134.694995, 6);
    expect(longitudeDifference(actual[0], testCase.pmagpy[0])).toBeLessThan(DEGREE_TOLERANCE);
    expectLatitudesAndOvalParity(actual, testCase.pmagpy);
  });

  it.each(['inclination exactly 90', 'inclination exactly -90'])(
    'MISMATCH PB-05-5: dm is a95 instead of 2 a95 at %s',
    (name) => {
      const testCase = mismatchCase(name);
      const actual = runCalculateVGP(testCase.input);
      const a95 = testCase.input[4];
      expect(actual[4]).toBeCloseTo(a95, 9);
      expect(testCase.pmagpy[4]).toBeCloseTo(2 * a95, 9);
      expect(actual[3]).toBeCloseTo(testCase.pmagpy[3], 9);
      expect(longitudeDifference(actual[0], testCase.pmagpy[0])).toBeLessThan(DEGREE_TOLERANCE);
      expect(Math.abs(actual[1] - testCase.pmagpy[1])).toBeLessThan(DEGREE_TOLERANCE);
    },
  );
});
