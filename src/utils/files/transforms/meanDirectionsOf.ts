import { StatisitcsInterpretationFromDIR } from '../../GlobalTypes';
import Direction from '../../graphs/classes/Direction';

/**
 * Reconstructs the geographic and stratigraphic Fisher mean directions from a
 * DIR statistics interpretation as Direction instances. Redux stores them as
 * plain objects (methods stripped on serialization), so callers that need the
 * Direction methods (rotation, angle) must rebuild them — this centralises that.
 * @param {StatisitcsInterpretationFromDIR | null} interpretation - current interpretation
 * @returns {{ geographic: Direction; stratigraphic: Direction } | null} means, or null when no mean exists
 */
const meanDirectionsOf = (
  interpretation: StatisitcsInterpretationFromDIR | null,
): { geographic: Direction; stratigraphic: Direction } | null => {
  const mean = interpretation?.rawData?.mean;
  if (!mean) return null;
  return {
    geographic: new Direction(
      mean.geographic.direction.declination,
      mean.geographic.direction.inclination,
      mean.geographic.direction.length,
    ),
    stratigraphic: new Direction(
      mean.stratigraphic.direction.declination,
      mean.stratigraphic.direction.inclination,
      mean.stratigraphic.direction.length,
    ),
  };
};

export default meanDirectionsOf;
