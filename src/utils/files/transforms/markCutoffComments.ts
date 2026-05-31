import { IDirData } from '../../GlobalTypes';
import Direction from '../../graphs/classes/Direction';
import { Reference } from '../../graphs/types';

/** Marker appended to the comment of directions rejected by the cutoff. */
export const CUTOFF_COMMENT_MARKER = 'CUT45';

/**
 * Returns a copy of the parsed DIR dataset where every direction whose angular
 * distance from the mean exceeds the cutoff angle has the "CUT45" marker
 * appended to its comment. The angular test mirrors the 45° cutoff drawn on the
 * DIR stereonet (DIRPage/Graphs.tsx). Directions are kept in place — none are
 * removed — so the export records which directions the cutoff rejected.
 * @param {IDirData} data - parsed directional data
 * @param {Direction} mean - mean direction the cutoff is measured from
 * @param {Reference} reference - which coordinates to test ('stratigraphic' uses Dstrat/Istrat, otherwise Dgeo/Igeo)
 * @param {number} cutoffAngle - cutoff angle in degrees (45 in the common case)
 * @returns {IDirData} a new dataset with CUT45 added to rejected directions' comments
 */
const markCutoffComments = (
  data: IDirData,
  mean: Direction,
  reference: Reference,
  cutoffAngle: number,
): IDirData => {
  const markedInterpretations = data.interpretations.map((interpretation) => {
    const [declination, inclination] =
      reference === 'stratigraphic'
        ? [interpretation.Dstrat, interpretation.Istrat]
        : [interpretation.Dgeo, interpretation.Igeo];
    const directionVector = new Direction(declination, inclination, 1);
    const isRejectedByCutoff = mean.angle(directionVector) > cutoffAngle;

    if (!isRejectedByCutoff || interpretation.comment.includes(CUTOFF_COMMENT_MARKER)) {
      return interpretation;
    }

    const comment = interpretation.comment
      ? `${interpretation.comment}; ${CUTOFF_COMMENT_MARKER}`
      : CUTOFF_COMMENT_MARKER;
    return { ...interpretation, comment };
  });

  return { ...data, interpretations: markedInterpretations };
};

export default markCutoffComments;
