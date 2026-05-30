import calculateMCFaddenIncMean from '../calculation/calculateMCFaddenIncMean';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Input: { inclinations: number[] }. McFadden & Reid (1982) inclination-only Fisher mean.
// Two regimes are exercised:
//   - shallow (|mean inc| < 30): returns the gaussian mean early with r/k/a95/csd all 0;
//   - steep  (|mean inc| >= 30): runs the iterative maximum-likelihood estimate.
// Output is the fpars object { ginc, inc, n, r, k, a95, csd }.
describeComputationReferenceOutput({
  name: 'calculateMCFaddenIncMean',
  fixtureDirectory: 'mcfadden_inc_mean',
  invoke: (input) => calculateMCFaddenIncMean(input.inclinations),
});
