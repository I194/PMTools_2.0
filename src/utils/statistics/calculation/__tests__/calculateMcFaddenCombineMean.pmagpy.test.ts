import { readFileSync } from 'fs';
import { join } from 'path';
import Direction from '../../../graphs/classes/Direction';
import calculateMcFaddenMean from '../calculateMcFaddenCombineMean';
import calculateStatisticsDIR from '../../calculateStatisticsDIR';
import parseDIR from '../../../files/parsers/parserDIR';
import parseCSV_DIR from '../../../files/parsers/parserCSV_DIR';
import { IDirData, MeanDir, RawStatisticsDIR } from '../../../GlobalTypes';
import { fixturePath } from '../../../../test-utils/referenceFixtures';

// PB-07: combined mean of lines and great circles (McFadden & McElhinny 1988, DIR page MCFAD)
// against pmag.dolnp replayed at full precision (PmagPy 4.3.14); lines only -> pmag.fisher_mean.
// Oracle generator: scripts/oracle_pb07_mcfadden_combined_mean.py

const FRAMES = ['geographic', 'stratigraphic'] as const;
type Frame = (typeof FRAMES)[number];
type Row = { Dgeo: number; Igeo: number; Dstrat: number; Istrat: number; gcNormal: boolean };
type PmagpyFrame = {
  dec: number;
  inc: number;
  R: number;
  k: number | null; // null = dolnp 'inf'
  a95: number;
  csd: number | null;
  nTotal: number;
  nLines: number;
  nPlanes: number;
  a: number | null;
};
type OracleCase = {
  name: string;
  group: string;
  path?: string;
  rows: Row[];
  pmagpy: Record<Frame, PmagpyFrame>;
};

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb07_mcfadden_combined_mean.pmagpy.json'), 'utf8'),
) as { cases: OracleCase[] };

// Same closed-form algebra on 0.1-degree inputs: only float noise separates the two sides.
const UNIT_VECTOR_TOLERANCE = 1e-12;
const DEGREE_TOLERANCE = 1e-9;
// Recorded PMTools values below are printed to 6 decimals.
const RECORDED_UNIT_VECTOR_TOLERANCE = 1e-7;
const RECORDED_TOLERANCE = 1e-5;

const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..');
const caseNamed = (name: string) => {
  const found = oracle.cases.find((testCase) => testCase.name === name);
  if (!found) throw new Error(`fixture case missing: ${name}`);
  return found;
};
const hasCircles = (testCase: OracleCase) => testCase.rows.some((row) => row.gcNormal);

const toInterpretations = (rows: Row[]) =>
  rows.map((row, index) => ({
    ...row,
    id: index + 1,
    label: `row${index + 1}`,
    code: row.gcNormal ? 'GC' : 'Dir',
    stepRange: '',
    stepCount: 0,
    MADgeo: 0,
    Kgeo: 0,
    MADstrat: 0,
    Kstrat: 0,
    comment: '',
    demagType: undefined,
  })) as IDirData['interpretations'];

/** The live MCFAD path for a whole file: every row selected, none reversed (InterpretationSetter). */
const meanOfFile = (data: IDirData) => {
  const everyRow = data.interpretations.map((_row, index) => index + 1);
  return calculateStatisticsDIR(data, 'mcFad', everyRow, []).rawStatistics.mean;
};

const meanOf = (testCase: OracleCase): RawStatisticsDIR['mean'] => {
  if (testCase.path?.endsWith('.dir')) {
    const parsed = parseDIR(readFileSync(join(repositoryRoot, testCase.path), 'utf8'), 'file');
    return meanOfFile(parsed.data);
  }
  if (testCase.path?.endsWith('.csv')) {
    return meanOfFile(
      parseCSV_DIR(readFileSync(join(repositoryRoot, testCase.path), 'utf8'), 'file'),
    );
  }
  return calculateMcFaddenMean(toInterpretations(testCase.rows));
};

const unitVectorDifference = (actual: Direction, declination: number, inclination: number) => {
  const actualUnit = actual.toCartesian();
  const expectedUnit = new Direction(declination, inclination, 1).toCartesian();
  return Math.max(
    Math.abs(actualUnit.x - expectedUnit.x),
    Math.abs(actualUnit.y - expectedUnit.y),
    Math.abs(actualUnit.z - expectedUnit.z),
  );
};

const angleBetween = (actual: Direction, declination: number, inclination: number) => {
  const actualUnit = actual.toCartesian();
  const expectedUnit = new Direction(declination, inclination, 1).toCartesian();
  const cosine =
    actualUnit.x * expectedUnit.x + actualUnit.y * expectedUnit.y + actualUnit.z * expectedUnit.z;
  return (Math.acos(Math.min(1, Math.max(-1, cosine))) * 180) / Math.PI;
};

const expectRelativelyClose = (actual: number | undefined, expected: number, tolerance: number) => {
  expect(Math.abs((actual as number) - expected)).toBeLessThanOrEqual(
    tolerance * Math.max(1, Math.abs(expected)),
  );
};

const expectParity = (mean: MeanDir, expected: PmagpyFrame) => {
  expect(unitVectorDifference(mean.direction, expected.dec, expected.inc)).toBeLessThan(
    UNIT_VECTOR_TOLERANCE,
  );
  expect(Math.abs((mean.R as number) - expected.R)).toBeLessThan(UNIT_VECTOR_TOLERANCE);
  expectRelativelyClose(mean.k, expected.k as number, DEGREE_TOLERANCE);
  expect(Math.abs(mean.MAD - expected.a95)).toBeLessThan(DEGREE_TOLERANCE);
  expect(mean.N).toBe(expected.nTotal);
};

/** PMTools today, per frame: [declination, inclination, R, k, a95 (field MAD)]. */
type RecordedFrame = [number, number, number, number, number];
const expectRecorded = (mean: MeanDir, recorded: RecordedFrame) => {
  const [declination, inclination, R, k, a95] = recorded;
  expect(unitVectorDifference(mean.direction, declination, inclination)).toBeLessThan(
    RECORDED_UNIT_VECTOR_TOLERANCE,
  );
  expect(Math.abs((mean.R as number) - R)).toBeLessThan(RECORDED_TOLERANCE);
  expectRelativelyClose(mean.k, k, RECORDED_TOLERANCE);
  expect(Math.abs(mean.MAD - a95)).toBeLessThan(RECORDED_TOLERANCE);
};

/** PMTools values recorded on 2026-10-16 for every input that mixes lines and great circles. */
const RECORDED_PMTOOLS: Record<string, Record<Frame, RecordedFrame>> = {
  'directions_and_great_circles.input.json': {
    geographic: [336.621051, 36.69984, 4.996056, 760.626055, 2.981304],
    stratigraphic: [346.649819, 25.402346, 4.988659, 264.526086, 5.060245],
  },
  'directions_and_great_circles with the circles swapped': {
    geographic: [336.621051, 36.69984, 4.996056, 760.626055, 2.981304],
    stratigraphic: [346.724462, 24.657839, 4.988638, 264.042055, 5.064895],
  },
  'seeded 4: 1 line + 1 circle, mean 185.8/-29.3, kappa 200': {
    geographic: [183.836401, -28.66272, 1.998057, 257.37305, 52.261871],
    stratigraphic: [182.765613, 16.542571, 1.998065, 258.352139, 52.155171],
  },
  'seeded 5: 1 line + 1 circle, mean 147.2/-1.7, kappa 50': {
    geographic: [145.052897, 10.460293, 1.998634, 365.931118, 43.346047],
    stratigraphic: [130.57818, 23.251553, 1.998623, 362.992915, 43.530166],
  },
  'seeded 6: 1 line + 1 circle, mean 46.4/1.7, kappa 200': {
    geographic: [52.905321, -2.962702, 1.999643, 1401.708, 21.747747],
    stratigraphic: [53.763741, -7.959448, 1.999657, 1457.2205, 21.324468],
  },
  'seeded 7: 1 line + 1 circle, mean 350.0/19.9, kappa 50': {
    geographic: [341.05392, 12.616978, 1.999753, 2027.4176, 18.048719],
    stratigraphic: [339.621079, 6.072544, 1.99978, 2276.2156, 17.025909],
  },
  'seeded 8: 1 line + 4 circles, mean 115.5/-3.1, kappa 50': {
    geographic: [119.918025, 13.799681, 4.962412, 53.207831, 13.169621],
    stratigraphic: [121.25622, -7.08646, 4.96298, 54.024517, 13.068511],
  },
  'seeded 9: 1 line + 4 circles, mean 239.8/73.0, kappa 15': {
    geographic: [268.132056, 51.23993, 4.848322, 13.185809, 26.953419],
    stratigraphic: [285.945114, 10.361604, 4.841625, 12.628268, 27.572896],
  },
  'seeded 10: 1 line + 4 circles, mean 76.6/-46.7, kappa 200': {
    geographic: [82.01532, -49.764533, 4.984778, 131.387943, 8.350929],
    stratigraphic: [75.679314, -4.897041, 4.985224, 135.357484, 8.226984],
  },
  'seeded 11: 1 line + 4 circles, mean 251.1/4.5, kappa 200': {
    geographic: [249.24473, 2.624408, 4.99385, 325.210891, 5.300362],
    stratigraphic: [248.722251, -6.04769, 4.99409, 338.423465, 5.195668],
  },
  'seeded 12: 5 lines + 3 circles, mean 255.7/19.5, kappa 15': {
    geographic: [266.349594, 21.398203, 7.613836, 14.242668, 15.575613],
    stratigraphic: [240.728382, 41.80798, 7.614093, 14.252123, 15.57015],
  },
  'seeded 13: 5 lines + 3 circles, mean 145.6/3.1, kappa 15': {
    geographic: [147.395203, 3.169652, 7.683593, 17.382672, 14.026493],
    stratigraphic: [147.594906, 1.323693, 7.68422, 17.417172, 14.01195],
  },
  'declination wrap: lines across 0 + circle': {
    geographic: [359.510259, 40.64783, 3.999156, 2963.3058, 1.790512],
    stratigraphic: [359.510259, 40.64783, 3.999156, 2963.3058, 1.790512],
  },
  'near-vertical lines + circle': {
    geographic: [5.174689, 89.358231, 2.999903, 15528.2302, 1.160325],
    stratigraphic: [5.174689, 89.358231, 2.999903, 15528.2302, 1.160325],
  },
  'circle-dominated, wide dihedral angles': {
    geographic: [39.658014, 50.373918, 4.951343, 41.104429, 15.010246],
    stratigraphic: [39.658014, 50.373918, 4.951343, 41.104429, 15.010246],
  },
  'scattered, a < 0': {
    geographic: [201.450814, -54.199421, 2.361781, 2.35029, 180],
    stratigraphic: [201.450814, -54.199421, 2.361781, 2.35029, 180],
  },
};

const GRID_OPTIMUM_CASE =
  'lines around declination 0 + horizontal circle (optimum lies on the grid)';
const linesOnlyCases = oracle.cases.filter((testCase) => !hasCircles(testCase));
const greedyGridCases = (group: string) =>
  oracle.cases
    .filter((testCase) => testCase.group === group && hasCircles(testCase))
    .map((testCase) => [testCase.name, testCase] as const);

describe('calculateMcFaddenMean against pmag.dolnp', () => {
  it.each(linesOnlyCases.map((testCase) => [testCase.name, testCase] as const))(
    'lines only reduce to pmag.fisher_mean: %s',
    (_name, testCase) => {
      const mean = meanOf(testCase);
      FRAMES.forEach((frame) => {
        const expected = testCase.pmagpy[frame];
        expect(expected.nPlanes).toBe(0);
        expectParity(mean[frame], expected);
        expectRelativelyClose(mean[frame].csd, expected.csd as number, DEGREE_TOLERANCE);
      });
    },
  );

  it('lines + a circle whose MM88 point lies exactly on the 194-point grid', () => {
    const testCase = caseNamed(GRID_OPTIMUM_CASE);
    const mean = meanOf(testCase);
    FRAMES.forEach((frame) => {
      expect(testCase.pmagpy[frame].nPlanes).toBe(1);
      expectParity(mean[frame], testCase.pmagpy[frame]);
    });
  });

  it.each(oracle.cases.map((testCase) => [testCase.name, testCase] as const))(
    'N counts lines + circles: %s',
    (_name, testCase) => {
      const mean = meanOf(testCase);
      FRAMES.forEach((frame) => expect(mean[frame].N).toBe(testCase.pmagpy[frame].nTotal));
    },
  );

  it.each(
    oracle.cases
      .filter((testCase) => testCase.path)
      .map((testCase) => [testCase.path, testCase] as const),
  )('%s parses to the rows the oracle used', (path, testCase) => {
    const text = readFileSync(join(repositoryRoot, path as string), 'utf8');
    const data = path?.endsWith('.csv') ? parseCSV_DIR(text, 'file') : parseDIR(text, 'file').data;
    expect(
      data.interpretations.map(({ Dgeo, Igeo, Dstrat, Istrat, gcNormal }) => ({
        Dgeo,
        Igeo,
        Dstrat,
        Istrat,
        gcNormal,
      })),
    ).toEqual(testCase.rows);
  });
});

describe('recorded mismatches (Part B, not fixed)', () => {
  // SCI-23: PMTools picks each circle's point once, greedily, on a 194-point grid in row order;
  // dolnp iterates the closed-form closest point (vclose) until no point moves more than 0.1 deg.
  it('MISMATCH PB-07-1: locked fixture with great circles, greedy grid pass vs iterated MM88', () => {
    const testCase = caseNamed('directions_and_great_circles.input.json');
    const mean = meanOf(testCase);
    FRAMES.forEach((frame) => expectRecorded(mean[frame], RECORDED_PMTOOLS[testCase.name][frame]));
    expect(testCase.pmagpy.stratigraphic.dec).toBeCloseTo(346.687157, 5);
    expect(testCase.pmagpy.stratigraphic.inc).toBeCloseTo(25.038685, 5);
    expect(testCase.pmagpy.stratigraphic.k).toBeCloseTo(268.094163, 5);
    expect(testCase.pmagpy.stratigraphic.a95).toBeCloseTo(5.026361, 5);
    expect(testCase.pmagpy.geographic.inc).toBeCloseTo(36.658788, 5);
    expect(angleBetween(mean.stratigraphic.direction, 346.687157, 25.038685)).toBeGreaterThan(0.3);
  });

  it('MISMATCH PB-07-2: swapping the two circle rows moves the PMTools mean by 0.75 deg', () => {
    const original = caseNamed('directions_and_great_circles.input.json');
    const swapped = caseNamed('directions_and_great_circles with the circles swapped');
    const meanOriginal = meanOf(original).stratigraphic.direction;
    const meanSwapped = meanOf(swapped);
    FRAMES.forEach((frame) =>
      expectRecorded(meanSwapped[frame], RECORDED_PMTOOLS[swapped.name][frame]),
    );
    expect(meanOriginal.inclination - meanSwapped.stratigraphic.direction.inclination).toBeCloseTo(
      0.744507,
      5,
    );
    // dolnp's own 0.1-degree stop leaves it order-dependent too, but by under 0.01 deg.
    expect(swapped.pmagpy.stratigraphic.inc - original.pmagpy.stratigraphic.inc).toBeCloseTo(
      0.008569,
      5,
    );
  });

  describe.each(['1 line + 1 circle', '1 line + 4 circles', '5 lines + 3 circles', 'edge'])(
    'seeded and hand-made sets: %s',
    (group) => {
      const cases = greedyGridCases(group).filter(
        ([name]) => name !== GRID_OPTIMUM_CASE && name !== 'scattered, a < 0',
      );
      it.each(cases)(
        'MISMATCH PB-07-3: greedy grid pass vs iterated MM88, %s',
        (name, testCase) => {
          const mean = meanOf(testCase);
          FRAMES.forEach((frame) => {
            expectRecorded(mean[frame], RECORDED_PMTOOLS[name][frame]);
            const expected = testCase.pmagpy[frame];
            const gap = angleBetween(mean[frame].direction, expected.dec, expected.inc);
            expect(gap).toBeGreaterThan(0.02);
            expect(gap).toBeLessThan(10);
            // The grid search under-estimates the maximal resultant, so k is low on every case.
            expect(mean[frame].R as number).toBeLessThan(expected.R);
            expect(mean[frame].k as number).toBeLessThan(expected.k as number);
          });
        },
      );
    },
  );

  // PMTools keeps a95 = 180 for a < 0 (as pmag.fisher_mean does); dolnp takes arccos(-a).
  it('MISMATCH PB-07-4: a < 0 gives a95 = 180 in PMTools and arccos(-a) = 43.89 in dolnp', () => {
    const testCase = caseNamed('scattered, a < 0');
    const mean = meanOf(testCase);
    FRAMES.forEach((frame) => {
      expectRecorded(mean[frame], RECORDED_PMTOOLS[testCase.name][frame]);
      expect(mean[frame].MAD).toBe(180);
      expect(testCase.pmagpy[frame].a).toBeCloseTo(-0.720696, 5);
      expect(testCase.pmagpy[frame].a95).toBeCloseTo(43.888018, 5);
    });
  });

  // With no lines the first circle's point is the arg-max of |point| = 1 +- rounding noise, so the
  // PMTools direction is platform-dependent and only its noise-free outputs are asserted.
  it('MISMATCH PB-07-5: two circles and no lines, no seed and no N-prime clamp in PMTools', () => {
    ['circles only, nearly coincident', 'circles only, orthogonal poles'].forEach((name) => {
      const mean = meanOf(caseNamed(name));
      FRAMES.forEach((frame) => {
        expect(mean[frame].N).toBe(2);
        expect(mean[frame].k === 0 || Number.isNaN(mean[frame].k)).toBe(true);
        expect(mean[frame].MAD).toBeNaN();
      });
    });
    const nearlyCoincident = caseNamed('circles only, nearly coincident').pmagpy.geographic;
    expect(nearlyCoincident.dec).toBeCloseTo(158.205218, 5);
    expect(nearlyCoincident.inc).toBeCloseTo(-13.37391, 5);
    expect(nearlyCoincident.k).toBeCloseTo(962.108211, 5);
    expect(nearlyCoincident.a95).toBe(180);
    const orthogonal = caseNamed('circles only, orthogonal poles').pmagpy.geographic;
    expect(orthogonal.k).toBeNull();
    expect(orthogonal.a95).toBe(0);
  });

  it('MISMATCH PB-07-6: test-data/sample.dir codes every row GC, so MCFAD sees eight circles and no lines', () => {
    const testCase = caseNamed('test-data/sample.dir');
    const mean = meanOf(testCase);
    FRAMES.forEach((frame) => {
      expect(testCase.pmagpy[frame].nLines).toBe(0);
      expect(testCase.pmagpy[frame].nPlanes).toBe(8);
      expect(mean[frame].N).toBe(8);
      expect(Number.isFinite(mean[frame].direction.inclination)).toBe(true);
    });
    expect(testCase.pmagpy.geographic.dec).toBeCloseTo(287.891703, 5);
    expect(testCase.pmagpy.geographic.inc).toBeCloseTo(-40.971747, 5);
  });
});
