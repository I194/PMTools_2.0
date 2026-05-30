import Direction from '../../graphs/classes/Direction';
import {
  getRotationMatrix,
  getRotationMatrixTransposed,
  TMatrix,
  matrixMultiply,
  rotate3x3AroundY,
  rotate3x3AroundZ,
  strangeRotation,
} from '../matrix';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// matrix.ts is a bag of small pure helpers. Each gets its own fixture dir, all driven by the
// shared computation harness so they are tested identically. (nullVector/nullMatrix are
// constant zero fills — nothing to lock, so no fixtures.)

// getRotationMatrix(lambda, phi): Euler rotation matrix; inputs are radians.
describeComputationReferenceOutput({
  name: 'getRotationMatrix',
  fixtureDirectory: 'matrix_rotation_matrix',
  invoke: (input) => getRotationMatrix(input.lambda, input.phi),
});

// getRotationMatrixTransposed(lambda, phi): the transpose (inverse rotation).
describeComputationReferenceOutput({
  name: 'getRotationMatrixTransposed',
  fixtureDirectory: 'matrix_rotation_matrix_transposed',
  invoke: (input) => getRotationMatrixTransposed(input.lambda, input.phi),
});

// TMatrix(vectors): the orientation matrix (1/N) Σ vᵢ vᵢᵀ that underpins every PCA fit.
describeComputationReferenceOutput({
  name: 'TMatrix',
  fixtureDirectory: 'matrix_t_matrix',
  invoke: (input) => TMatrix(input.vectors),
});

// matrixMultiply(a, b): general matrix product (square and non-square cases).
describeComputationReferenceOutput({
  name: 'matrixMultiply',
  fixtureDirectory: 'matrix_multiply',
  invoke: (input) => matrixMultiply(input.a, input.b),
});

// rotate3x3AroundY(angle): rotation about Y; the angle is in degrees (divided by RADIANS).
describeComputationReferenceOutput({
  name: 'rotate3x3AroundY',
  fixtureDirectory: 'matrix_rotate_around_y',
  invoke: (input) => rotate3x3AroundY(input.angle),
});

// rotate3x3AroundZ(angle): rotation about Z; the angle is in degrees.
describeComputationReferenceOutput({
  name: 'rotate3x3AroundZ',
  fixtureDirectory: 'matrix_rotate_around_z',
  invoke: (input) => rotate3x3AroundZ(input.angle),
});

// strangeRotation(start, end): rotates the start direction onto end's frame (Y then Z),
// returning the resulting Direction.
describeComputationReferenceOutput({
  name: 'strangeRotation',
  fixtureDirectory: 'matrix_strange_rotation',
  invoke: (input) =>
    strangeRotation(
      new Direction(input.start.declination, input.start.inclination, input.start.length ?? 1),
      new Direction(input.end.declination, input.end.inclination, input.end.length ?? 1),
    ),
});
