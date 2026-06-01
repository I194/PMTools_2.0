import Direction from './classes/Direction';
import { strangeRotation } from '../statistics/matrix';

/**
 * Rotates a single direction so that the given mean direction is moved to the
 * centre of the stereonet (declination 0, inclination 90). This is the exact
 * two-step rotation sequence behind the DIR "Center by mean" view.
 *
 * Shared by the on-screen stereonet formatter (dataToStereoDIR) and the
 * centered-export/table transform (centerDirectionsByMean) so the exported and
 * tabulated data always match the plotted dots — one rotation, one
 * implementation, no risk of the two drifting apart.
 *
 * The result is left UNROUNDED; callers round for display where they need to
 * (the stereonet keeps full precision for plotting, the export rounds to 0.1°).
 * @param {number} declination - direction declination, degrees
 * @param {number} inclination - direction inclination, degrees
 * @param {Direction} mean - the mean direction to centre on
 * @returns {[number, number]} rotated [declination, inclination], unrounded
 */
const centerDirectionOnMean = (
  declination: number,
  inclination: number,
  mean: Direction,
): [number, number] => {
  const directionVector = new Direction(declination, inclination, 1);
  const firstRotationDirection = new Direction(mean.declination, 0, 1);
  const secondRotationDirection = new Direction(0, mean.inclination - 90, 1);
  const firstRotation = strangeRotation(directionVector, firstRotationDirection);
  const secondRotation = strangeRotation(firstRotation, secondRotationDirection);
  return secondRotation.toArray();
};

export default centerDirectionOnMean;
