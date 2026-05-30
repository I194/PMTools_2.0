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
// normalized to sum 1. Input is a symmetric matrix with non-zero off-diagonals.
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
