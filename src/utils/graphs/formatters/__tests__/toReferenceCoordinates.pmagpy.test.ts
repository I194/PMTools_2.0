import { readFileSync } from 'fs';
import { join } from 'path';
import Coordinates from '../../classes/Coordinates';
import Direction from '../../classes/Direction';
import toReferenceCoordinates from '../toReferenceCoordinates';
import parsePMD from '../../../files/parsers/parserPMD';
import { IPmdData } from '../../../GlobalTypes';
import { fixturePath } from '../../../../test-utils/referenceFixtures';

// PB-01: specimen -> geographic -> stratigraphic against pmag.dogeo + pmag.dotilt (PmagPy 4.3.14).
// Oracle generator: scripts/oracle_pb01_reference_coordinates.py

type OracleResult = { geographic: [number, number]; stratigraphic: [number, number] };
type SyntheticCase = {
  name: string;
  xyz: [number, number, number];
  a: number;
  b: number;
  s: number;
  d: number;
  pmagpy: OracleResult;
};
type RealFile = { path: string; steps: Array<{ step: string; pmagpy: OracleResult }> };

const oracle = JSON.parse(
  readFileSync(fixturePath('part_b', 'pb01_reference_coordinates.pmagpy.json'), 'utf8'),
) as { synthetic: SyntheticCase[]; realFiles: RealFile[] };

// Pure rotations on unrounded inputs: only float noise separates the two sides.
const UNIT_VECTOR_TOLERANCE = 1e-12;

/** The store keeps the core plunge 90 - hade, not the hade written in the file (parsedData.ts:45). */
const toStoredMetadata = (fileMetadata: { a: number; b: number; s: number; d: number }) =>
  ({ ...fileMetadata, name: '', v: 0, b: 90 - fileMetadata.b }) as IPmdData['metadata'];

const largestUnitVectorDifference = (actual: Coordinates, expected: [number, number]) => {
  const actualUnit = actual.toUnit();
  const expectedUnit = new Direction(expected[0], expected[1], 1).toCartesian();
  return Math.max(
    Math.abs(actualUnit.x - expectedUnit.x),
    Math.abs(actualUnit.y - expectedUnit.y),
    Math.abs(actualUnit.z - expectedUnit.z),
  );
};

const expectParity = (
  metadata: IPmdData['metadata'],
  specimenVector: Coordinates,
  expected: OracleResult,
) => {
  const geographic = toReferenceCoordinates('geographic', metadata, specimenVector);
  const stratigraphic = toReferenceCoordinates('stratigraphic', metadata, specimenVector);
  expect(largestUnitVectorDifference(geographic, expected.geographic)).toBeLessThan(
    UNIT_VECTOR_TOLERANCE,
  );
  expect(largestUnitVectorDifference(stratigraphic, expected.stratigraphic)).toBeLessThan(
    UNIT_VECTOR_TOLERANCE,
  );
};

describe('toReferenceCoordinates against pmag.dogeo / pmag.dotilt', () => {
  it.each(oracle.synthetic.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    (_name, testCase) => {
      const [x, y, z] = testCase.xyz;
      expectParity(toStoredMetadata(testCase), new Coordinates(x, y, z), testCase.pmagpy);
    },
  );

  it.each(oracle.realFiles.map((realFile) => [realFile.path, realFile] as const))(
    'every step of %s, parsed by parsePMD',
    (path, realFile) => {
      const repositoryRoot = join(__dirname, '..', '..', '..', '..', '..');
      const parsed = parsePMD(readFileSync(join(repositoryRoot, path), 'utf8'), path).data;
      expect(parsed.steps.map((step) => step.step)).toEqual(
        realFile.steps.map((step) => step.step),
      );
      parsed.steps.forEach((step, index) => {
        expectParity(
          toStoredMetadata(parsed.metadata),
          new Coordinates(step.x, step.y, step.z),
          realFile.steps[index].pmagpy,
        );
      });
    },
  );

  it('leaves the specimen frame unchanged', () => {
    const vector = new Coordinates(0.3, -0.2, 0.9);
    const specimen = toReferenceCoordinates(
      'specimen',
      toStoredMetadata({ a: 226, b: 70, s: 51, d: 76 }),
      vector,
    );
    expect(specimen.toArray()).toEqual(vector.toArray());
  });
});
