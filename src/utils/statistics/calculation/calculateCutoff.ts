import Direction from "../../graphs/classes/Direction";
import calculateBasicStatisticalParameters from "./calculateBasicStatisticalParameters";
import calculateVGP from "./calculateVGP";

const calculateCutoff = (directions: Direction[], cutoffType: '45' | 'vandamme') => {
  /*
   * Function doCutoff
   * Does no, the Vandamme or 45-cutoff
   */

  // Create a copy in memory
  const iterateDirections: (Direction & {rejected?: boolean})[] = [...directions];
  let cutoffValue = cutoffType === '45' ? 45 : 0;
  let index: number | undefined;
  let iterationsCount = 0;

  while (true) {
    let deltaSum = 0;

    // Calculate the poles & mean pole from the accepted group
    const { poleDistribution } = calculateBasicStatisticalParameters(iterateDirections);

    // Go over all all poles
    iterateDirections.forEach((direction, jndex) => {
      // Skip direction if it was previously rejected
      if (direction.rejected) return;
      const poleVGP = calculateVGP(direction.declination, direction.inclination, 0, 0);
      console.log('here', poleVGP)
      const pole = new Direction(poleVGP.poleLongitude, poleVGP.poleLatitude, 1);
      // const pole = site.poleFrom(literalToCoordinates(component.coordinates).toVector(Direction));

      // Find the angle between the mean VGP (mLon, mLat) and the particular VGP
      const poleMean = poleDistribution.getMeanDirection();
      const angleToMean = poleMean.toCartesian().angle(pole.toCartesian());

      // Capture the maximum angle from the mean and save its index
      console.log('what', angleToMean, cutoffValue, jndex, index);
      if (angleToMean > cutoffValue) {
        cutoffValue = angleToMean;
        index = jndex;
      }

      // Add to the sum of angles
      deltaSum += angleToMean ** 2;
    });

    // Calculate ASD (scatter) and optimum cutoff angle (A) (Vandamme, 1994)
    var ASD = Math.sqrt(deltaSum / (poleDistribution.N - 1));
    var A = 1.8 * ASD + 5;
    console.log('hey', cutoffValue, A, 45, index);
    // Vandamme cutoff
    if (cutoffType === "vandamme" && cutoffValue < A) break;

    // 45 Cutoff
    if (cutoffType === "45" && cutoffValue <= 45) break;

    // Set this direction to rejected
    if (index) iterateDirections[index].rejected = true;

    iterationsCount++;

    if (iterationsCount > 10) {
      console.log('Warning: cutoff calculation did not converge');
      break;
    }
  }

  return {
    directions: iterateDirections,
    cutoffValue,
    scatter: ASD,
    optimum: A
  };
};

export default calculateCutoff;

