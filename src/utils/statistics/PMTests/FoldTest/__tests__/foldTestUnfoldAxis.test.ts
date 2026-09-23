import { readFileSync } from 'fs';
import { join } from 'path';
import Coordinates from '../../../../graphs/classes/Coordinates';
import Direction from '../../../../graphs/classes/Direction';
import { fixturePath } from '../../../../../test-utils/referenceFixtures';
import {
  CoordsWithBeddingPars,
  findBed,
  unfold,
  untiltVectorAtPercentage,
} from '../foldTestBootstrap';

// SCI-01: PmagPy parity of the unfolding curve, and short-arc unfolding for overturned beds.

const foldUnfoldFixtures = fixturePath('computations', 'fold_unfold');

const readFixture = (fileName: string) =>
  JSON.parse(readFileSync(join(foldUnfoldFixtures, fileName), 'utf8'));

/** Rebuilds the production setup: cartesian geographic vector + bedding from `findBed`. */
const toVectorWithBedding = (
  geographic: Coordinates,
  stratigraphic: Coordinates,
): CoordsWithBeddingPars => {
  const bedding = findBed(geographic, stratigraphic);
  return {
    coordinates: geographic,
    beddingAzimuth: bedding.azimuth,
    beddingDip: bedding.dip,
  };
};

const readVectors = (fileName: string) =>
  (
    readFixture(fileName).directions as Array<{
      Dgeo: number;
      Igeo: number;
      Dstrat: number;
      Istrat: number;
    }>
  ).map((direction) =>
    toVectorWithBedding(
      new Direction(direction.Dgeo, direction.Igeo, 1).toCartesian(),
      new Direction(direction.Dstrat, direction.Istrat, 1).toCartesian(),
    ),
  );

/** Largest absolute difference between two vectors, component by component. */
const largestComponentDifference = (left: Coordinates, right: Coordinates) =>
  Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y), Math.abs(left.z - right.z));

describe('unfold against the PmagPy fold-test oracle', () => {
  const oracle = readFixture('synthetic_fold.pmagpy.json');
  const { index, taus } = unfold(readVectors('synthetic_fold_saved_iteration.input.json'), 0);
  const oracleTau1ByPercent = new Map<number, number>(
    (oracle.tau1Curve as Array<{ untiltPercent: number; tau1: number }>).map((point) => [
      point.untiltPercent,
      point.tau1,
    ]),
  );

  // Not tighter: the 0.1-degree rounding of the committed directions grows with rotation length.
  const PMAGPY_TOLERANCE = 5e-4;

  it('reports a tau1 for every percentage the oracle covers', () => {
    expect(taus.map((point) => point.x)).toEqual([...oracleTau1ByPercent.keys()]);
  });

  it.each(Array.from(oracleTau1ByPercent.keys()))(
    'matches PmagPy tau1 at %i %% unfolding',
    (percent) => {
      const actual = taus.find((point) => point.x === percent)!.y;
      expect(Math.abs(actual - oracleTau1ByPercent.get(percent)!)).toBeLessThan(PMAGPY_TOLERANCE);
    },
  );

  it('finds the best unfolding at the PmagPy 1 % grid optimum', () => {
    expect(index).toBe(98);
  });

  it('finds the PmagPy optimum for a fold with an overturned limb', () => {
    // PmagPy 4.3.14, 1 % grid: test-data/v2.6.6/sci-01/oracle.json
    expect(unfold(readVectors('overturned_limb.input.json'), 24).index).toBe(101);
  });
});

describe('findBed and the untilting step round trip', () => {
  const stratigraphic = new Direction(30, 50, 1).toCartesian();

  // Without the dip > 180 normalization the 91, 110 and 145 rows fail.
  const beddings: Array<{ description: string; strike: number; dip: number }> = [
    { description: 'real bedding, crimea2013_nrm_celsius_dialect_143.pmd (s=335, d=73)', strike: 335, dip: 73 }, // prettier-ignore
    { description: 'real bedding, examplePCA.pmd (s=51, d=76)', strike: 51, dip: 76 },
    { description: 'gently dipping bed', strike: 0, dip: 10 },
    { description: 'vertical bed', strike: 140, dip: 90 },
    { description: 'vertical bed at another strike', strike: 250, dip: 90 },
    { description: 'just past vertical', strike: 140, dip: 91 },
    { description: 'overturned bed', strike: 140, dip: 110 },
    { description: 'overturned bed at another strike', strike: 250, dip: 110 },
    { description: 'strongly overturned bed', strike: 250, dip: 145 },
    { description: 'nearly upside-down bed', strike: 0, dip: 170 },
  ];

  // Worst correct residual is 1.5e-8 (vertical bed); a long-arc miss is ~1.5.
  const COMPONENT_TOLERANCE = 1e-6;

  describe.each(beddings)('$description (strike $strike, dip $dip)', ({ strike, dip }) => {
    const geographic = stratigraphic.correctBedding(strike, -dip);
    const vector = toVectorWithBedding(geographic, stratigraphic);

    it('recovers a bedding dip inside [0, 180)', () => {
      expect(vector.beddingDip).toBeGreaterThanOrEqual(0);
      expect(vector.beddingDip).toBeLessThan(180);
    });

    it('returns the geographic direction to the stratigraphic one at 100 % unfolding', () => {
      const fullyUnfolded = untiltVectorAtPercentage(vector, 100);
      expect(largestComponentDifference(fullyUnfolded, stratigraphic)).toBeLessThan(
        COMPONENT_TOLERANCE,
      );
    });

    it('takes the short arc at 50 % unfolding', () => {
      const halfUnfolded = untiltVectorAtPercentage(vector, 50);
      const halfwayByConstruction = geographic.correctBedding(strike, dip / 2);
      expect(largestComponentDifference(halfUnfolded, halfwayByConstruction)).toBeLessThan(
        COMPONENT_TOLERANCE,
      );
    });
  });
});
