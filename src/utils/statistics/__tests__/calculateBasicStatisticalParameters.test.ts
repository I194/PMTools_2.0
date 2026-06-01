import Direction from '../../graphs/classes/Direction';
import calculateBasicStatisticalParameters from '../calculation/calculateBasicStatisticalParameters';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Output bundles two Distribution instances (directionDistribution, poleDistribution) and a
// butlerDistribution. NOTE: butler fields lock as null — Distribution.R is never updated from
// its constructor 0, so getConfidenceInterval() divides by 0 → NaN → null. Locked as-is; see
// notes/found-bugs-todo.md.
//
// An input direction may carry `rejected: true` (the flag calculateCutoff stamps): the function
// keeps it in directionDistribution but excludes it from the poles, so poleDistribution.N is one
// smaller. The adapter threads that flag through so the with_rejected_direction fixture locks it.
describeComputationReferenceOutput({
  name: 'calculateBasicStatisticalParameters',
  fixtureDirectory: 'basic_statistical_parameters',
  invoke: (input) =>
    calculateBasicStatisticalParameters(
      input.directions.map((direction: any) => {
        const built: Direction & { rejected?: boolean } = new Direction(
          direction.declination,
          direction.inclination,
          direction.length,
        );
        if (direction.rejected) built.rejected = true;
        return built;
      }),
    ),
});
