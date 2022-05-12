import numeric from 'numeric';
import { IDirData, CommonMeanTestBootstrapResult } from "../../../GlobalTypes";
import Direction from "../../../graphs/classes/Direction";
import { splitPolarities } from "../../eigManipulations";
import { generateDirectionsBootstrap } from "../../bootstrapManipulations";

const reversalTestBootstrap = (
  dataToAnalyze: IDirData,
  numberOfSimulations = 1000,
  setIsRunning?: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Conduct a reversal test using bootstrap statistics (Tauxe, 2010) to
  // determine whether two populations of directions could be from an antipodal
  // common mean.

  const directions = dataToAnalyze.interpretations.map((direction) => (
    new Direction(direction.Dgeo, direction.Igeo, 1)
  ));

  const { normalDirections, reversedDirections} = splitPolarities(directions);

  const result = bootstrapCommonMeanTest(normalDirections, reversedDirections, numberOfSimulations);
  setIsRunning?.(false);

  return result;
};

export default reversalTestBootstrap;

export const bootstrapCommonMeanTest = (
  firstDistribution: Array<Direction>,
  secondDistribution: Array<Direction>,
  numberOfSimulations = 1000, 
) => {
  // Conduct a bootstrap test (Tauxe, 2010) for a common mean on two declination, inclination data sets. 
  // Plots are generated of the cumulative distributions
  // of the Cartesian coordinates of the means of the pseudo-samples 
  // (one for x, one for y and one for z). 
  // If the 95 percent confidence bounds for each component overlap, the two directions are not significantly different.

  const firstDirections = generateDirectionsBootstrap(firstDistribution, numberOfSimulations);
  const firstCartesian = numeric.transpose(firstDirections.map(dir => dir.toCartesian().toArray()));
  const [ x1, y1, z1 ] = firstCartesian;

  const secondDirections = generateDirectionsBootstrap(secondDistribution, numberOfSimulations);
  const secondCartesian = numeric.transpose(secondDirections.map(dir => dir.toCartesian().toArray()));
  const [ x2, y2, z2 ] = secondCartesian;

  const comparisons: CommonMeanTestBootstrapResult = {
    x: {
      first: x1,
      second: x2,
    },
    y: {
      first: y1,
      second: y2,
    },
    z: {
      first: z1,
      second: z2,
    },
  };

  return comparisons;
};

