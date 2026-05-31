import calculateMcFaddenMean from '../calculation/calculateMcFaddenCombineMean';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Input: an array of interpretations (Dgeo/Igeo, Dstrat/Istrat + optional gcNormal).
// McFadden (1988) combined mean: interpretations flagged gcNormal:true are treated as
// great-circle normals and iteratively fitted against the set of direct observations; the
// rest are direct directions. Output: { geographic, stratigraphic }, each
// { direction, MAD (a95), k, R, N, csd }. Cases: a mixed set, and a directions-only set
// (no great circles → the plain Fisher combine path).
describeComputationReferenceOutput({
  name: 'calculateMcFaddenMean',
  fixtureDirectory: 'mcfadden_combine_mean',
  invoke: (input) => calculateMcFaddenMean(input),
});
