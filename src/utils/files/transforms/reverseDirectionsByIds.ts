import { IDirData } from '../../GlobalTypes';
import Direction from '../../graphs/classes/Direction';

/**
 * Returns a copy of the parsed DIR dataset with the polarity of the listed
 * directions reversed (both geographic and stratigraphic coordinates), matching
 * what the DIR table and stereonet show for reversed directions. Directions not
 * in the list are left untouched. D/I are rounded to 0.1° as elsewhere.
 * @param {IDirData} data - parsed directional data
 * @param {number[]} reversedDirectionsIDs - ids of directions to flip
 * @returns {IDirData} a new dataset with the listed directions reversed
 */
const reverseDirectionsByIds = (data: IDirData, reversedDirectionsIDs: number[]): IDirData => {
  if (!reversedDirectionsIDs.length) return data;

  const interpretations = data.interpretations.map((interpretation) => {
    if (!reversedDirectionsIDs.includes(interpretation.id)) return interpretation;
    const geographic = new Direction(interpretation.Dgeo, interpretation.Igeo, 1).reversePolarity();
    const stratigraphic = new Direction(
      interpretation.Dstrat,
      interpretation.Istrat,
      1,
    ).reversePolarity();
    return {
      ...interpretation,
      Dgeo: +geographic.declination.toFixed(1),
      Igeo: +geographic.inclination.toFixed(1),
      Dstrat: +stratigraphic.declination.toFixed(1),
      Istrat: +stratigraphic.inclination.toFixed(1),
    };
  });

  return { ...data, interpretations };
};

export default reverseDirectionsByIds;
