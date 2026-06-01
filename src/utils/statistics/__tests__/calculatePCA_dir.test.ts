import calculatePCA_dir from '../calculation/calculatePCA_dir';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Input: an array of interpretations; the computation reads only Dgeo/Igeo and Dstrat/Istrat
// (directions from test-data/sample.dir). It fits the smallest-eigenvalue eigenvector (TAU3,
// the great-circle pole) in each coordinate system. Output: { geographic, stratigraphic },
// each { direction, MAD }.
describeComputationReferenceOutput({
  name: 'calculatePCA_dir',
  fixtureDirectory: 'pca_dir',
  invoke: (input) => calculatePCA_dir(input),
});
