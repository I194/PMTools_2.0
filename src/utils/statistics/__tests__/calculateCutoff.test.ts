import Direction from '../../graphs/classes/Direction';
import calculateCutoff from '../calculation/calculateCutoff';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Input: { directions: [{declination, inclination, length}], cutoffType: 'vandamme' | '45' }.
// The function adds a `rejected` flag to cut directions, so the reference records which
// directions were rejected plus cutoffValue/scatter/optimum.
describeComputationReferenceOutput({
  name: 'calculateCutoff',
  fixtureDirectory: 'cutoff',
  invoke: (input) =>
    calculateCutoff(
      input.directions.map(
        (direction: any) =>
          new Direction(direction.declination, direction.inclination, direction.length),
      ),
      input.cutoffType,
    ),
});
