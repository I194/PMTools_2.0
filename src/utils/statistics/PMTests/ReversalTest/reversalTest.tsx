import numeric from 'numeric';
import { IDirData, ReversalTestResult } from "../../../GlobalTypes";
import Direction from "../../../graphs/classes/Direction";
import { makePrincipalComponents } from "../../eigManipulations";
import { generateDirectionsBootstrap } from "../../bootstrapManipulations";

type Props = {
  dataToAnalyze: IDirData;
  numberOfSimulations?: number;
  setResult?: React.Dispatch<React.SetStateAction<{
    untilts: Array<number>;
    savedBootstraps: Array<Array<{x: number, y: number}>>;
  }>>;
};

const reversalTestBootstrap = ({
  dataToAnalyze,
  numberOfSimulations = 1000,
  setResult,
}: Props) => {
  // Conduct a reversal test using bootstrap statistics (Tauxe, 2010) to
  // determine whether two populations of directions could be from an antipodal
  // common mean.

  const directions = dataToAnalyze.interpretations.map((direction) => (
    new Direction(direction.Dgeo, direction.Igeo, 1)
  ));

  const { normalDirections, reversedDirections} = flipData(directions);

  const result = bootstrapCommonMeanTest(normalDirections, reversedDirections, numberOfSimulations);

  return result;
};

export default reversalTestBootstrap;

const flipData = (
  data: Array<Direction>, 
) => {
  const principalDirection = makePrincipalComponents(data.map(dir => dir.toCartesian()));

  const normalDirections: Array<Direction> = [];
  const reversedDirections: Array<Direction> = [];
  const combinedDirections: Array<Direction> = [];

  data.forEach((direction) => {
    const angle = direction.angle(principalDirection);
    const { declination, inclination } = direction;
    if (angle > 90) {
      let flippedDec = (declination - 180) % 360;
      if (flippedDec < 0) flippedDec += 360;
      let flippedInc = -inclination;
      const flippedDir = new Direction(flippedDec, flippedInc, 1);
      reversedDirections.push(flippedDir);
      combinedDirections.push(flippedDir);
    } else {
      normalDirections.push(direction);
      combinedDirections.push(direction);
    };
  });

  return { normalDirections, reversedDirections, combinedDirections };

};

export const  bootstrapCommonMeanTest = (
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

  const comparisons: ReversalTestResult = {
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

