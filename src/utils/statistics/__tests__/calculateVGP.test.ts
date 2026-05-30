import calculateVGP from '../calculation/calculateVGP';
import { describeComputationReferenceOutput } from '../../../test-utils/computationFixtures';

describeComputationReferenceOutput({
  name: 'calculateVGP',
  fixtureDirectory: 'vgp',
  invoke: (input) =>
    calculateVGP(
      input.declination,
      input.inclination,
      input.siteLatitude,
      input.siteLongitude,
      input.a95,
    ),
});
