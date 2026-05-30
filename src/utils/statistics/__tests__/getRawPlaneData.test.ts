import Direction from '../../graphs/classes/Direction';
import getRawPlaneData from '../calculation/getRawPlaneData';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Input: { direction: {declination, inclination, length}, angle?, angle2?, N? }.
// Output: an array of N Direction points (a great circle / small circle on the sphere).
// Fixtures use a small N so the reference is reviewable as a list of points; the default
// N=194 path is the same code, just denser.
describeComputationReferenceOutput({
  name: 'getRawPlaneData',
  fixtureDirectory: 'raw_plane_data',
  invoke: (input) =>
    getRawPlaneData(
      new Direction(
        input.direction.declination,
        input.direction.inclination,
        input.direction.length,
      ),
      input.angle,
      input.angle2,
      input.N,
    ),
});
