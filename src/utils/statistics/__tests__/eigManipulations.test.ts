import Coordinates from '../../graphs/classes/Coordinates';
import Direction from '../../graphs/classes/Direction';
import {
  getEigenvaluesFast,
  sortEigenvectors,
  normalizeEigenValues,
  makePrincipalComponents,
  splitPolarities,
} from '../eigManipulations';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// getEigenvaluesFast(T): closed-form eigenvalues (O.K. Smith 1961) of a symmetric 3x3,
// normalized to sum 1. Cases cover all three phi-branches of the closed form: a generic
// matrix with non-zero off-diagonals takes the acos branch (distinct eigenvalues, r in
// (-1, 1)); the two diagonal degenerate matrices have repeated eigenvalues that drive r
// onto its guard branches — prolate diag(4,1,1) → r >= 1 (phi = 0), oblate diag(4,4,1) →
// r <= -1 (phi = pi/3). Their m and p are exact integers, so r lands on 1 / -1 with no
// float noise and the guard fires identically on every platform.
describeComputationReferenceOutput({
  name: 'getEigenvaluesFast',
  fixtureDirectory: 'eig_eigenvalues_fast',
  invoke: (input) => getEigenvaluesFast(input.matrix),
});

// sortEigenvectors(eig): takes a numeric.eig-shaped object { lambda: { x }, E: { x } } and
// returns { v1, v2, v3, tau } ordered high→low (vᵢ is the column of E for the i-th eigenvalue).
// Input supplies the raw eigenvalue array + the E matrix (eigenvectors as columns); the adapter
// wraps them so the sort is exercised in isolation, no numeric.eig dependency. NOTE: the
// function normalizes the eigenvalues IN PLACE, so the adapter hands it fresh copies each call.
describeComputationReferenceOutput({
  name: 'sortEigenvectors',
  fixtureDirectory: 'eig_sort_eigenvectors',
  invoke: (input) =>
    sortEigenvectors({
      lambda: { x: (input.lambda as number[]).slice() },
      E: { x: (input.E as number[][]).map((row) => row.slice()) },
    }),
});

// normalizeEigenValues(eig): scales eig.lambda.x to sum 1 — IN PLACE, returning void (the
// plan flags this mutation as a refactor target). The adapter builds a fresh eig, runs it,
// and returns the mutated eigenvalue array so the reference locks the normalization.
describeComputationReferenceOutput({
  name: 'normalizeEigenValues',
  fixtureDirectory: 'eig_normalize_eigenvalues',
  invoke: (input) => {
    const eig = { lambda: { x: (input.lambda as number[]).slice() }, E: { x: [] as number[][] } };
    normalizeEigenValues(eig);
    return eig.lambda.x;
  },
});

// makePrincipalComponents(coords): principal direction of a set of Coordinates (mean removed,
// largest-eigenvalue eigenvector), flipped to the upper hemisphere. Output is a Direction.
describeComputationReferenceOutput({
  name: 'makePrincipalComponents',
  fixtureDirectory: 'eig_principal_components',
  invoke: (input) =>
    makePrincipalComponents(
      (input.vectors as number[][]).map(
        (vector) => new Coordinates(vector[0], vector[1], vector[2]),
      ),
    ),
});

// splitPolarities(data): splits Directions by polarity against the principal axis. Output:
// { normalDirections, reversedDirections, combinedDirections } (reversed entries flipped).
describeComputationReferenceOutput({
  name: 'splitPolarities',
  fixtureDirectory: 'eig_split_polarities',
  invoke: (input) =>
    splitPolarities(
      (
        input.directions as Array<{ declination: number; inclination: number; length?: number }>
      ).map(
        (direction) =>
          new Direction(direction.declination, direction.inclination, direction.length ?? 1),
      ),
    ),
});

// SCI-22: an exact antipode of the principal direction used to get a NaN angle, `NaN > 90` is
// false, so it stayed in the normal group and [n, n, antipode] split 3/0. For [(0,6), (0,6),
// (180,-6)] PmagPy's doprinc + flip gives 2 and 1, but PmagPy is not an oracle for the sweep
// (pmag.angle is also an unclamped arccos and pmag.flip mis-splits 433 of these 5832 inputs);
// the oracle is geometric: an exact antipode is 180 degrees from n and must land in the other
// group. Which group holds the pair depends on the hemisphere of the principal direction, so
// only the sizes are locked; hand-picked inputs overshoot only under one platform's trig
// rounding, hence a sweep (72 declinations x 81 inclinations = 5832).
describe('splitPolarities with an exact antipode', () => {
  it('separates the antipode from the two identical directions for every swept direction', () => {
    let wrongSplitCount = 0;

    for (let declination = 0; declination < 360; declination += 5) {
      for (let inclination = -80; inclination <= 80; inclination += 2) {
        const direction = new Direction(declination, inclination, 1);
        const antipode = new Direction((declination + 180) % 360, -inclination, 1);

        const { normalDirections, reversedDirections } = splitPolarities([
          direction,
          new Direction(declination, inclination, 1),
          antipode,
        ]);

        const groupSizes = [normalDirections.length, reversedDirections.length].sort(
          (first, second) => first - second,
        );
        if (groupSizes[0] !== 1 || groupSizes[1] !== 2) wrongSplitCount++;
      }
    }

    expect(wrongSplitCount).toBe(0);
  });
});
