import { IDirData } from '../../GlobalTypes';
import Direction from '../../graphs/classes/Direction';
import centerDirectionOnMean from '../../graphs/centerDirectionOnMean';

/**
 * Rotates a single direction so that the given mean direction is moved to the
 * centre of the stereonet (declination 0, inclination 90), rounding the result
 * to 0.1°. Delegates to the shared centerDirectionOnMean helper — the same
 * rotation dataToStereoDIR uses for the on-screen "Center by mean" view — so
 * exported data matches what the user sees.
 * @param {number} declination - direction declination, degrees
 * @param {number} inclination - direction inclination, degrees
 * @param {Direction} mean - the mean direction to centre on
 * @returns {[number, number]} rotated [declination, inclination], rounded to 0.1°
 */
const centerDirectionAboutMean = (
  declination: number,
  inclination: number,
  mean: Direction,
): [number, number] => {
  const [rotatedDeclination, rotatedInclination] = centerDirectionOnMean(
    declination,
    inclination,
    mean,
  );
  return [+rotatedDeclination.toFixed(1), +rotatedInclination.toFixed(1)];
};

/**
 * Returns a copy of the parsed DIR dataset with every direction rotated so the
 * Fisher mean sits at the centre of the stereonet — the data equivalent of the
 * "Center by mean" graph toggle. Geographic coordinates (Dgeo/Igeo) are rotated
 * about the geographic mean and stratigraphic coordinates (Dstrat/Istrat) about
 * the stratigraphic mean. Every other field is preserved untouched; only the
 * declination/inclination pairs change.
 * @param {IDirData} data - parsed directional data
 * @param {Direction} geographicMean - mean direction in geographic coordinates
 * @param {Direction} stratigraphicMean - mean direction in stratigraphic coordinates
 * @returns {IDirData} a new dataset with recomputed D/I
 */
const centerDirectionsByMean = (
  data: IDirData,
  geographicMean: Direction,
  stratigraphicMean: Direction,
): IDirData => {
  const centeredInterpretations = data.interpretations.map((interpretation) => {
    const [Dgeo, Igeo] = centerDirectionAboutMean(
      interpretation.Dgeo,
      interpretation.Igeo,
      geographicMean,
    );
    const [Dstrat, Istrat] = centerDirectionAboutMean(
      interpretation.Dstrat,
      interpretation.Istrat,
      stratigraphicMean,
    );
    return { ...interpretation, Dgeo, Igeo, Dstrat, Istrat };
  });

  return { ...data, interpretations: centeredInterpretations };
};

export default centerDirectionsByMean;
