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

// Acceptance tests for SCI-01 (`unfold` handed `correctBedding` a dip direction where it
// wanted a strike -- a 90-degree axis error) and for the `findBed` dip normalization that
// ships with it (queue tag NEW-A).
//
// The reference-output suite next door (`foldTestDeterministicCore.test.ts`) locks the exact
// numbers. This suite states the two properties those numbers are supposed to have, so a
// future refactor that quietly reintroduces either defect fails with a readable message
// rather than a diff of 21 floats:
//
//   1. PARITY -- PMTools' tau1 curve must track PmagPy's over the whole -50..150 % grid.
//   2. ROUND TRIP -- a bedding recovered by `findBed` must, when fed back through the
//      production untilting step, return the geographic direction to its stratigraphic one
//      at 100 %, AND travel the geologically correct short arc to get there. The 100 %
//      endpoint alone does NOT catch the NEW-A defect: an unnormalized dip in (180, 270)
//      lands on the right endpoint and is only wrong in between, which is exactly why it
//      survived in production behind a correct-looking full tilt correction.
//
// Comparisons are COMPONENT-WISE. `Coordinates.angle` would be the natural thing to compare,
// but it is an `acos` of a dot product that is the least informative measurement available at
// the two places this suite cares about most -- near-identical and near-antipodal vectors --
// so components it is.

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

/** Largest absolute difference between two vectors, component by component. */
const largestComponentDifference = (left: Coordinates, right: Coordinates) =>
  Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y), Math.abs(left.z - right.z));

describe('unfold against the PmagPy fold-test oracle', () => {
  // `synthetic_fold.pmagpy.json` is PmagPy 4.3.14's fold-test curve on the very same seeded,
  // synthetically folded dataset (scripts/gen_foldtest.py). The thesis gives the lambda1
  // criterion but fixes no bedding convention, so PmagPy is the oracle for the convention.
  const oracle = readFixture('synthetic_fold.pmagpy.json');
  const input = readFixture('synthetic_fold_saved_iteration.input.json');

  const vectors = (
    input.directions as Array<{ Dgeo: number; Igeo: number; Dstrat: number; Istrat: number }>
  ).map((direction) =>
    toVectorWithBedding(
      new Direction(direction.Dgeo, direction.Igeo, 1).toCartesian(),
      new Direction(direction.Dstrat, direction.Istrat, 1).toCartesian(),
    ),
  );

  const { index, taus } = unfold(vectors, 0);
  const oracleTau1ByPercent = new Map<number, number>(
    (oracle.tau1Curve as Array<{ untiltPercent: number; tau1: number }>).map((point) => [
      point.untiltPercent,
      point.tau1,
    ]),
  );

  // 5e-4, not tighter. The two implementations agree to ~1e-16 on unrounded input; the gap
  // here is the 0.1-degree rounding of the committed directions, amplified by the length of
  // the rotation, so it grows toward the ends of the grid (3e-7 at 0 %, 1.9e-4 at 150 %).
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

  it('finds the best unfolding near 100 %, not near 0 %', () => {
    // 98, not 100, is the finite-sample optimum of this N=18 draw -- PmagPy on a 1 % grid
    // also lands on 98 for unrounded input. The oracle's 100 % is its 10 %-grid answer.
    expect(index).toBe(98);
    expect(oracle.bestUntiltPercent).toBe(100);
    // Before SCI-01 this was -17: the fold test claimed the directions were already at their
    // tightest before any unfolding at all.
    expect(index).toBeGreaterThan(90);
  });
});

describe('findBed and the untilting step round trip', () => {
  // A direction well away from the poles, so nothing below sits on a stereographic degeneracy.
  const stratigraphic = new Direction(30, 50, 1).toCartesian();

  // `s` and `d` in a PMD header are a bedding strike and dip -- that is how the shipped tilt
  // correction reads them (`toReferenceCoordinates.ts:27` passes `metadata.s` to
  // `correctBedding` as its strike). The two real rows are the headers of files in the repo.
  // The dip >= 90 rows are hand-built: the only real archive files with a vertical bedding
  // are git-ignored, and the hand-typed synthetic PMDs are not an oracle for anything.
  const beddings: Array<{ description: string; strike: number; dip: number }> = [
    { description: 'real bedding, crimea2013_nrm_celsius_dialect_143.pmd (s=335, d=73)', strike: 335, dip: 73 }, // prettier-ignore
    { description: 'real bedding, examplePCA.pmd (s=51, d=76)', strike: 51, dip: 76 },
    { description: 'gently dipping bed', strike: 0, dip: 10 },
    { description: 'vertical bed, the boundary case', strike: 140, dip: 90 },
    { description: 'vertical bed at another strike', strike: 250, dip: 90 },
    { description: 'just past vertical', strike: 140, dip: 91 },
    { description: 'overturned bed', strike: 140, dip: 110 },
    { description: 'overturned bed at another strike', strike: 250, dip: 145 },
    { description: 'strongly overturned bed', strike: 0, dip: 170 },
  ];

  // Comfortably above the worst observed residual (1.5e-8, at an exactly vertical bed, where
  // `findBed`'s solve divides by a vanishing quantity) and far below any wrong answer: an
  // unnormalized overturned bedding misses the 50 % target by about 1.5, i.e. the far side of
  // the sphere.
  const COMPONENT_TOLERANCE = 1e-6;

  describe.each(beddings)('$description (strike $strike, dip $dip)', ({ strike, dip }) => {
    // Fold the tight stratigraphic direction down onto this bed to make a geographic one,
    // using PMTools' own tilt correction run backwards.
    const geographic = stratigraphic.correctBedding(strike, -dip);
    const vector = toVectorWithBedding(geographic, stratigraphic);

    it('recovers a bedding dip inside the geological [0, 180) range', () => {
      // The NEW-A regression, stated directly. An unnormalized `findBed` returns a dip in
      // (180, 270) here for roughly half of the dip >= 90 beddings.
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
      // Half the bedding dip about the bedding strike -- the geologically intended halfway
      // point. This is the assertion the 100 % one cannot make: both the normalized and the
      // unnormalized bedding hit the same endpoint, and only this one separates them.
      const halfUnfolded = untiltVectorAtPercentage(vector, 50);
      const halfwayByConstruction = geographic.correctBedding(strike, dip / 2);
      expect(largestComponentDifference(halfUnfolded, halfwayByConstruction)).toBeLessThan(
        COMPONENT_TOLERANCE,
      );
    });
  });

  it('would fail at 50 % for an overturned bed without the findBed normalization', () => {
    // Pinned so the intent of the case list above cannot be lost: these two beddings are the
    // ones that actually exercise NEW-A. Measured against the unnormalized `findBed`, each
    // returned a dip of 250 about the opposite strike and missed the 50 % target by ~1.5,
    // while still landing on the right 100 % endpoint to within 1e-15.
    const overturnedBeddings = [
      { strike: 140, dip: 110 },
      { strike: 250, dip: 110 },
    ];

    overturnedBeddings.forEach(({ strike, dip }) => {
      const geographic = stratigraphic.correctBedding(strike, -dip);
      const vector = toVectorWithBedding(geographic, stratigraphic);
      expect(vector.beddingDip).toBeCloseTo(dip, 6);
      expect(
        largestComponentDifference(
          untiltVectorAtPercentage(vector, 50),
          geographic.correctBedding(strike, dip / 2),
        ),
      ).toBeLessThan(COMPONENT_TOLERANCE);
    });
  });
});
