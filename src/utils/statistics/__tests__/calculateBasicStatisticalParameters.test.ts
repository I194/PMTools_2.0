import Direction from '../../graphs/classes/Direction';
import calculateBasicStatisticalParameters from '../calculation/calculateBasicStatisticalParameters';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Output bundles two Distribution instances (directionDistribution, poleDistribution) and a
// butlerDistribution. NOTE: butler fields lock as null — Distribution.R is never updated from
// its constructor 0, so getConfidenceInterval() divides by 0 → NaN → null. Locked as-is; see
// notes/found-bugs-todo.md.
describeComputationReferenceOutput({
  name: 'calculateBasicStatisticalParameters',
  fixtureDirectory: 'basic_statistical_parameters',
  invoke: (input) =>
    calculateBasicStatisticalParameters(
      input.directions.map(
        (direction: any) =>
          new Direction(direction.declination, direction.inclination, direction.length),
      ),
    ),
});
