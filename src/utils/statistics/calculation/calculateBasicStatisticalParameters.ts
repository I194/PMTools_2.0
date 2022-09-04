import Direction from "../../graphs/classes/Direction";
import Distribution from "../../graphs/classes/Distribution";
import calculateButlerParameters from "./calculateButlerParameters";
import calculateVGP from "./calculateVGP";

const calculateBasicStatisticalParameters = (directions: (Direction & {rejected?: boolean})[]) => {

  /*
   * Function getStatisticalParameters
   * Returns statistical parameters based on on a directional distribution
   */

  // Create a fake site at 0, 0 since we only look at the distritbuion of VGPs and not the actual positions

  // Get the directions and pole for each vector
  const filteredDirections = directions.filter(direction => !direction.rejected);
  const poles = filteredDirections.map(direction => {
    const poleVGP = calculateVGP(direction.declination, direction.inclination, 0, 0);
    const pole = new Direction(poleVGP.poleLongitude, poleVGP.poleLatitude, 1);
    return pole;
  });

  const directionDistribution = new Distribution(directions);
  const poleDistribution = new Distribution(poles);

  // Butler parameters are a function of A95, the inclination (paleolatitude)
  const poleConfidence = poleDistribution.getConfidenceInterval();
  const directionDistMeanInc = directionDistribution.getMeanDirection().inclination;
  const butlerDistribution = calculateButlerParameters(poleConfidence, directionDistMeanInc);

  return {
    directionDistribution,
    poleDistribution,
    butlerDistribution
  };
};

export default calculateBasicStatisticalParameters;

