import { FoldTestResult, IDirData } from "../../../GlobalTypes";
import Coordinates from "../../../graphs/classes/Coordinates";
import Direction from "../../../graphs/classes/Direction";
import { Reference } from "../../../graphs/types";
import { drawBootstrap } from "../../bootstrapManipulations";
import { getEigenvaluesFast } from "../../eigManipulations";
import { TMatrix } from "../../matrix";

type CoordsWithBeddingPars = {
  coordinates: Coordinates;
  beddingAzimuth: number; // azimuth = strike + 90 degrees
  beddingDip: number;
};

const foldTestBootstrap = (
  dataToAnalyze: IDirData,
  numberOfSimulations = 1000,
  setResult?: React.Dispatch<React.SetStateAction<FoldTestResult>>,
  setIsRunning?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Fold Test by L. Tauxe* and G.S. Watson, 1994
  // "We combine eigen analysis and parameter estimation techniques
  // for a newly constituted, more versatile fold test.
  // The method is automatic, requiring no assumptions about the polarity or distribution of data, and gives confidence
  // limits on the degree of unfolding required to produce the tightest grouping of data." (c) 
  // DOI: https://doi.org/10.1016/0012-821X(94)90006-X

  // Completes the classical foldtest but does a bootstrap on N randomly sampled data sets
  // Bootstrap takes a time to run, so you either pass a setResult function,
  // or result will be stored in LocalStorage as a stringified object named 'foldTestBootstrap'

  const numberOfSavedSimulations = numberOfSimulations / 20;

  const cutoffDataGeo: Array<CoordsWithBeddingPars> = [];
  const cutoffDataStrat: Array<CoordsWithBeddingPars> = [];

  dataToAnalyze.interpretations.forEach((interpretation) => {
    const directionGeo = new Direction(interpretation.Dgeo, interpretation.Igeo, 1);
    const directionStrat = new Direction(interpretation.Dstrat, interpretation.Istrat, 1);

    const cartesianGeo = directionGeo.toCartesian();
    const cartesianStrat = directionStrat.toCartesian();

    const bedPars = findBed(cartesianGeo, cartesianStrat);
    cutoffDataGeo.push({coordinates: cartesianGeo, beddingAzimuth: bedPars.azimuth, beddingDip: bedPars.dip});
    cutoffDataStrat.push({coordinates: cartesianStrat, beddingAzimuth: bedPars.azimuth, beddingDip: bedPars.dip});
  });

  // Combine all geographic components to a single array
  const vectors = [...cutoffDataGeo];

  const untilts: Array<number> = [];
  const savedBootstraps: Array<Array<{x: number, y: number}>> = [];

  // Save the unfolding of actual data
  savedBootstraps.push(unfold(vectors, 0).taus);

  // No bootstrap, only unfold the data

  let next: {
    (): { 
      untilts: number[]; 
      savedBootstraps: { x: number; y: number; }[][]; 
    } | undefined; 
    (): void; 
  };

  let iterationResult: {index: number, taus: Array<{x: number, y: number}>} = {index: 0, taus: []};
  let iteration: number = 0;

  // Asynchronous bootstrapping
  (next = () => {
    // Number of bootstraps were completed
    if (++iteration > numberOfSimulations) {
      if (setResult) setResult({untilts, savedBootstraps});
      else localStorage.setItem("foldTestBootstrap", JSON.stringify({untilts: untilts, bootstrap: savedBootstraps}))
      setIsRunning?.(false);
      return {untilts, savedBootstraps};
    };

    iterationResult = unfold(drawBootstrap(vectors), iteration);

    // Save the index of maximum untilting
    untilts.push(iterationResult.index);

    // Save the first N bootstraps
    if (iteration < numberOfSavedSimulations) savedBootstraps.push(iterationResult.taus);

    // Queue for next bootstrap iteration
    setTimeout(next);
  })();
};

export default foldTestBootstrap;


function findBed(cartesianCoordsGeo: Coordinates, cartesianCoordsStrat: Coordinates) {

  const degrad = 180 / Math.PI;
  let strike, striker, dip;

  const xg = cartesianCoordsGeo.x;
  const yg = cartesianCoordsGeo.y;
  const zg = cartesianCoordsGeo.z;

  const xs = cartesianCoordsStrat.x;
  const ys = cartesianCoordsStrat.y;
  const zs = cartesianCoordsStrat.z;

  // Step 1: Find strike (or strike+180deg) s.t. S.R = G.R
  if (ys == yg) {
    strike = 90;
    striker = strike / degrad;
  } else {
    const tanstrike = -(xs - xg) / (ys - yg)
    striker = Math.atan(tanstrike);
    strike = striker * degrad;
  };

  // Step 2: Rotate around z by -s
  const cosstrike = Math.cos(striker);
  const sinstrike = Math.sin(striker);
  const ysp = -sinstrike * xs + cosstrike * ys;
  const ygp = -sinstrike * xg + cosstrike * yg;
  let sindip, cosdip;
  
  // Step 3: Find rotation d around x which brings G to S
  if ((ygp == 0) && (zg == 0)) {
    sindip = 0;
    cosdip = 1;
  } else if (zg == 0) {
    sindip = -zs / ygp;
    cosdip = ysp / ygp;
  } else if (ygp == 0) {
    sindip = ysp/zg;
    cosdip = zs/zg;
  } else {
    sindip = (ysp / ygp - zs / zg) / (ygp / zg + zg / ygp);
    cosdip = (ysp - sindip * zg) / ygp;
  };

  dip = FNarcsin(sindip);

  if (cosdip < 0) dip = 180 - dip;
  if (dip < 0) {
    dip = -dip;
    strike += 180;
  };
  let azimuth = strike + 90; // here we changing from strike to azimuth
  if (azimuth < 0) azimuth += 360;
  if (azimuth > 360) azimuth -= 360;

  return {azimuth, dip};
};

export const FNarccos = (x: number) => {
  let arccos;
  if (x >= 1) arccos = 0;
  else if (x <= -1) arccos = 180;
  else arccos = -Math.atan(x / Math.sqrt(1 - x*x)) * (180 / Math.PI) + 90;
  return arccos;
};

export const FNarcsin = (x: number) => {
  return 90 - FNarccos(x);
};

const unfold = (
  vectors: Array<CoordsWithBeddingPars>,
  iteration: number
) => {
  // Function unfold
  // Unfolds a bunch of vectors following their bedding

  const eigenvaluesOfUnfoldedDirections = (
    vectors: Array<CoordsWithBeddingPars>, 
    unfoldingPercentage: number
  ) => {
    // Function eigenvaluesOfUnfoldedDirections
    // Returns the three eigenvalues of a cloud of vectors at a percentage of unfolding

    // Do the tilt correction on all points in pseudoDirections
    const tilts: Array<Coordinates> = vectors.map((vector) => (
      vector.coordinates.correctBedding(vector.beddingAzimuth, 1E-2 * unfoldingPercentage * vector.beddingDip)
    ));

    // Return the eigen values of a real, symmetrical matrix
    return getEigenvaluesFast(TMatrix(tilts.map(coords => coords.toArray())));
  };

  const unfoldingMin = -50;
  const unfoldingMax = 150;
  const numberOfSavedSimulations = 24;

  // Variable max to keep track of the maximum eigenvalue and its unfolding % index
  let max = 0;
  let index = 0;
  
  // Array to capture all maximum eigenvalues for one bootstrap over the unfolding range
  let taus: Array<{x: number, y: number}> = [];

  // For this particular random set of directions unfold from the specified min to max percentages
  // With increments of 10 degrees
  for (let unfoldingPercent = unfoldingMin; unfoldingPercent <= unfoldingMax; unfoldingPercent += 10) {
    // Calculate the eigenvalues
    const tau = eigenvaluesOfUnfoldedDirections(vectors, unfoldingPercent);

    // Save the first 24 bootstraps
    if (iteration < numberOfSavedSimulations) {
      taus.push({
        x: unfoldingPercent,
        y: tau.t1
      });
    };

    if (tau.t1 > max) {
      max = tau.t1;
      index = unfoldingPercent;
    };
  };

  // Hone in with a granularity of a single degree
  for (let unfoldingPercent = index - 9; unfoldingPercent <= index + 9; unfoldingPercent++) {
    // Only if within specified minimum and maximum bounds
    if (unfoldingPercent < unfoldingMin || unfoldingPercent > unfoldingMax) continue;

    // Calculate the eigenvalues
    const tau = eigenvaluesOfUnfoldedDirections(vectors, unfoldingPercent);

    // Save the maximum eigenvalue for this bootstrap and unfolding increment
    if (tau.t1 > max) {
      max = tau.t1;
      index = unfoldingPercent;
    };
  };

  return {
    index,
    taus
  };
}
