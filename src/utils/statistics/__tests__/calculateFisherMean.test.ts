import calculateFisherMean from '../calculation/calculateFisherMean';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Input fixture is the array of interpretations the function reads (only
// Dgeo/Igeo/Dstrat/Istrat are used); output is { geographic, stratigraphic } MeanDir.
describeComputationReferenceOutput({
  name: 'calculateFisherMean',
  fixtureDirectory: 'fisher_mean',
  invoke: (input) => calculateFisherMean(input),
});
