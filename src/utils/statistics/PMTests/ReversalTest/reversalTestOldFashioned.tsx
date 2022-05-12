import numeric from 'numeric';
import Direction from "../../../graphs/classes/Direction";
import { splitPolarities } from "../../eigManipulations";
import { fisherMean } from '../../calculation/calculateFisherMean';

type Props = {
  dataToAnalyze: {
    direction1: Direction,
    N1: number,
    K1: number,
    direction2: Direction,
    N2: number,
    K2: number,
  };
};

const reversalTestOldFashioned = ({
  dataToAnalyze,
}: Props) => {
  // Classical reversal test for two populations of directions.
  // P. L. McFadden and M. W. McElhinny, 1990
  // but without auto-split of polarities

  const { direction1, direction2, N1, N2, K1, K2 } = dataToAnalyze;

  const R1 = N1 - (N1 - 1) / K1;
  const R2 = N2 - (N2 - 1) / K2;

  const probability = 0.05;

  const gamma = direction1.angle(direction2);
  // equation (15) in McFadden and McElhinny, 1990
  const gammaCritical = Math.acos(1 - (N1 + N2 - R1 - R2) * (R1 + R2) / (R1 * R2) * (Math.pow((1 / probability), (1 / (N1 + N2 - 2))) - 1));
 
  let classification = "N/A";
  if (gammaCritical <= 5) classification = "A";
  else if (gammaCritical > 5 && gammaCritical <= 10) classification = "B";
  else if (gammaCritical > 10 && gammaCritical <= 20) classification = "C";

  return {
    gamma,
    gammaCritical,
    classification,
  };
};

export default reversalTestOldFashioned;
