import calculatePCA_pmd from '../calculation/calculatePCA_pmd';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

// Input: { steps: [{x,y,z}], anchored, normalized, type }. PCA only reads x/y/z off each
// step, so the fixtures carry just those three fields (the real PMDStep has many more the
// computation ignores). The step vectors are real demagnetization subsets from
// src/assets/examples/examplePCA.pmd — a line-fit window (M020–M070) and the full curved
// path (M000–M130) for the great-circle/plane fit.
//
// Output: { component: { edges: Coordinates, centerMass: Coordinates }, intensity, MAD }.
// Cases cover the branches: directions vs planes, anchored vs center-of-mass, and the
// per-step magnitude normalization.
describeComputationReferenceOutput({
  name: 'calculatePCA_pmd',
  fixtureDirectory: 'pca_pmd',
  invoke: (input) => calculatePCA_pmd(input.steps, input.anchored, input.normalized, input.type),
});
