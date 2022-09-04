import Direction from "../../graphs/classes/Direction";

const calculateButlerParameters = (confidence: number, inclination: number) => {

  /*
   * Function calculateButlerParameters
   * Returns butler parameters for a distribution
   * takes confidence and inclination in degrees!
   */

  // Convert to radians
  const A95 = confidence;
  const direction = new Direction(0, inclination, 1);
  const paleoLatitude = direction.paleoLatitude;

  // The errors are functions of paleolatitude
  const dDx = Math.asin(Math.sin(A95) / Math.cos(paleoLatitude));
  const dIx = 2 * A95 / (1 + 3 * Math.pow(Math.sin(paleoLatitude), 2));

  // Calculate the minimum and maximum Paleolatitude from the error on the inclination
  const palatMax = Math.atan(0.5 * Math.tan(inclination + dIx));
  const palatMin = Math.atan(0.5 * Math.tan(inclination - dIx));

  return {
    dDx,
    dIx,
    palatMin,
    palatMax
  };
};

export default calculateButlerParameters;

