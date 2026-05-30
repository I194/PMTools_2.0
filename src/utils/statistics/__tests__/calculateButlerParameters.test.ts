import calculateButlerParameters from '../calculation/calculateButlerParameters';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// `confidence` is the angular 95% confidence — its real call site
// (calculateBasicStatisticalParameters) passes RADIANS (Distribution.getConfidenceInterval
// returns radians), despite the in-code comment saying "degrees". Fixtures match the real
// contract. See notes/found-bugs-todo.md for the inclination unit inconsistency this locks.
describeComputationReferenceOutput({
  name: 'calculateButlerParameters',
  fixtureDirectory: 'butler',
  invoke: (input) => calculateButlerParameters(input.confidence, input.inclination),
});
