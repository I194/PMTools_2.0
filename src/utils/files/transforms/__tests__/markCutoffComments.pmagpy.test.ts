import { readFileSync } from 'fs';
import { join } from 'path';
import markCutoffComments, { CUTOFF_COMMENT_MARKER } from '../markCutoffComments';
import Direction from '../../../graphs/classes/Direction';
import calculateFisherMean from '../../../statistics/calculation/calculateFisherMean';
import parseDIR from '../../parsers/parserDIR';
import parsePMM from '../../parsers/parserPMM';
import { IDirData } from '../../../GlobalTypes';
import { fixturePath } from '../../../../test-utils/referenceFixtures';

// PB-08: the fixed 45° cutoff of the DIR page (DIRPage/Graphs.tsx, export via markCutoffComments)
// against pmag.fisher_mean + pmag.angle (PmagPy 4.3.14). Oracle generator: scripts/oracle_pb08_cutoff.py

type ReferenceFrame = 'geographic' | 'stratigraphic';
type VandammeReference = {
  cutoff: number;
  angularStandardDeviation: number;
  rejectedIndices: number[];
} | null;
type OracleResult = {
  mean: [number, number];
  angles: Array<number | null>;
  rejectedIndices: number[];
  smallestDistanceToCutoff: number;
  vandamme: VandammeReference;
};
type Dataset = {
  name: string;
  path?: string;
  reference?: ReferenceFrame;
  directions: Array<[number, number]>;
  pmagpy: OracleResult;
};

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb08_cutoff.pmagpy.json'), 'utf8'),
) as {
  cutoffAngle: number;
  realFiles: Dataset[];
  synthetic: Dataset[];
  edges: Dataset[];
  exactBoundary: Dataset;
};

const CUTOFF_ANGLE = 45;
const UNIT_VECTOR_TOLERANCE = 1e-12;
const ANGLE_TOLERANCE = 1e-9;
// acos is ill-conditioned at 0° and 180°: one ulp of the dot product moves the angle by ~1e-6°.
const ANGLE_TOLERANCE_NEAR_0_OR_180 = 1e-5;
const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..');

const largestUnitVectorDifference = (actual: Direction, expected: [number, number]) => {
  const actualUnit = actual.toCartesian().toUnit();
  const expectedUnit = new Direction(expected[0], expected[1], 1).toCartesian();
  return Math.max(
    Math.abs(actualUnit.x - expectedUnit.x),
    Math.abs(actualUnit.y - expectedUnit.y),
    Math.abs(actualUnit.z - expectedUnit.z),
  );
};

/**
 * The tested reference gets the directions; the other reference gets their antipodes, so reading
 * the wrong columns would reject everything. Odd rows carry a comment to check both marker formats.
 */
const toDirData = (directions: Array<[number, number]>, reference: ReferenceFrame): IDirData => ({
  name: 'synthetic',
  format: 'DIR',
  created: '1970-01-01T00:00:00.000Z',
  interpretations: directions.map(([declination, inclination], index) => {
    const antipode = new Direction(declination, inclination, 1).reversePolarity();
    const [geographic, stratigraphic] =
      reference === 'geographic'
        ? [[declination, inclination], antipode.toArray()]
        : [antipode.toArray(), [declination, inclination]];
    return {
      id: index + 1,
      label: `direction ${index + 1}`,
      code: 'DirPCA',
      stepRange: 'T20-T600',
      stepCount: 5,
      Dgeo: geographic[0],
      Igeo: geographic[1],
      Dstrat: stratigraphic[0],
      Istrat: stratigraphic[1],
      MADgeo: 0,
      Kgeo: 0,
      MADstrat: 0,
      Kstrat: 0,
      comment: index % 2 === 1 ? 'note' : '',
      demagType: 'thermal',
    };
  }),
});

const directionsIn = (data: IDirData, reference: ReferenceFrame): Array<[number, number]> =>
  data.interpretations.map((interpretation) =>
    reference === 'stratigraphic'
      ? [interpretation.Dstrat, interpretation.Istrat]
      : [interpretation.Dgeo, interpretation.Igeo],
  );

/** Runs the live cutoff the way the DIR page does: Fisher mean of the same directions, 45°. */
const runLiveCutoff = (data: IDirData, reference: ReferenceFrame) => {
  const mean = calculateFisherMean(data.interpretations)[reference].direction;
  const marked = markCutoffComments(data, mean, reference, CUTOFF_ANGLE);
  const rejectedIndices = marked.interpretations
    .map((interpretation, index) =>
      interpretation.comment === data.interpretations[index].comment ? -1 : index,
    )
    .filter((index) => index >= 0);
  const angles = directionsIn(data, reference).map(([declination, inclination]) =>
    mean.angle(new Direction(declination, inclination, 1)),
  );
  return { mean, marked, rejectedIndices, angles };
};

const expectAnglesClose = (actual: number[], expected: Array<number | null>) => {
  actual.forEach((angle, index) => {
    const expectedAngle = expected[index] as number;
    const nearSingularity = expectedAngle < 1e-3 || expectedAngle > 180 - 1e-3;
    expect(Math.abs(angle - expectedAngle)).toBeLessThan(
      nearSingularity ? ANGLE_TOLERANCE_NEAR_0_OR_180 : ANGLE_TOLERANCE,
    );
  });
};

const expectParity = (data: IDirData, reference: ReferenceFrame, expected: OracleResult) => {
  const { mean, marked, rejectedIndices, angles } = runLiveCutoff(data, reference);
  expect(largestUnitVectorDifference(mean, expected.mean)).toBeLessThan(UNIT_VECTOR_TOLERANCE);
  expect(expected.angles.every((angle) => angle !== null)).toBe(true);
  expectAnglesClose(angles, expected.angles);
  // A set comparison is only fair when no direction sits within the angle tolerance of 45°.
  expect(expected.smallestDistanceToCutoff).toBeGreaterThanOrEqual(ANGLE_TOLERANCE);
  expect(rejectedIndices).toEqual(expected.rejectedIndices);
  rejectedIndices.forEach((index) => {
    const originalComment = data.interpretations[index].comment;
    expect(marked.interpretations[index].comment).toBe(
      originalComment ? `${originalComment}; ${CUTOFF_COMMENT_MARKER}` : CUTOFF_COMMENT_MARKER,
    );
  });
};

const parseRealFile = (path: string): IDirData => {
  const text = readFileSync(join(repositoryRoot, path), 'utf8');
  return path.endsWith('.pmm') ? parsePMM(text, path) : parseDIR(text, path).data;
};

describe('markCutoffComments (45° cutoff) against pmag.fisher_mean + pmag.angle', () => {
  it('the fixture was generated for the same fixed 45° cutoff', () => {
    expect(oracle.cutoffAngle).toBe(CUTOFF_ANGLE);
  });

  it.each(oracle.realFiles.map((dataset) => [dataset.name, dataset] as const))(
    '%s, parsed by the live parser',
    (_name, dataset) => {
      const reference = dataset.reference as ReferenceFrame;
      const parsed = parseRealFile(dataset.path as string);
      expect(directionsIn(parsed, reference)).toEqual(dataset.directions);
      expectParity(parsed, reference, dataset.pmagpy);
    },
  );

  describe.each(['geographic', 'stratigraphic'] as const)('%s reference', (reference) => {
    it.each(
      [...oracle.synthetic, ...oracle.edges].map((dataset) => [dataset.name, dataset] as const),
    )('%s', (_name, dataset) => {
      expectParity(toDirData(dataset.directions, reference), reference, dataset.pmagpy);
    });
  });

  it('a direction exactly 45° from the mean: both sides land within float noise of 45 (tie, no set compared)', () => {
    const { directions, pmagpy } = oracle.exactBoundary;
    const { mean, angles } = runLiveCutoff(toDirData(directions, 'geographic'), 'geographic');
    expect(largestUnitVectorDifference(mean, pmagpy.mean)).toBeLessThan(UNIT_VECTOR_TOLERANCE);
    [3, 4].forEach((index) => {
      expect(Math.abs(angles[index] - CUTOFF_ANGLE)).toBeLessThan(ANGLE_TOLERANCE);
      expect(Math.abs((pmagpy.angles[index] as number) - CUTOFF_ANGLE)).toBeLessThan(
        ANGLE_TOLERANCE,
      );
    });
  });

  it('INFORMATIVE (not a mismatch): PMTools uses a single-pass fixed 45° cutoff, not the iterative variable cutoff of pmag.dovandamme (Vandamme 1994)', () => {
    const datasetsWithVandamme = [...oracle.realFiles, ...oracle.synthetic].filter(
      (dataset) => dataset.pmagpy.vandamme !== null,
    );
    const differing = datasetsWithVandamme.filter((dataset) => {
      const reference = dataset.reference ?? 'geographic';
      const data = dataset.path
        ? parseRealFile(dataset.path)
        : toDirData(dataset.directions, reference);
      const { rejectedIndices } = runLiveCutoff(data, reference);
      expect(rejectedIndices).toEqual(dataset.pmagpy.rejectedIndices);
      return (
        JSON.stringify(rejectedIndices) !== JSON.stringify(dataset.pmagpy.vandamme?.rejectedIndices)
      );
    });
    // exampleDIR.pmm (unflipped, bimodal): fixed 45° rejects 100 of 224, Vandamme's 64.6° rejects 80.
    const exampleGeographic = oracle.realFiles.find(
      (dataset) => dataset.name === 'src/assets/examples/exampleDIR.pmm (geographic)',
    ) as Dataset;
    expect(exampleGeographic.pmagpy.rejectedIndices).toHaveLength(100);
    expect(exampleGeographic.pmagpy.vandamme?.cutoff).toBeCloseTo(64.63, 2);
    expect(exampleGeographic.pmagpy.vandamme?.rejectedIndices).toHaveLength(80);
    expect(differing.length).toBeGreaterThan(0);
  });
});
