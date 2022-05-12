import numeric from 'numeric';
import Direction from "../../../graphs/classes/Direction";
import { ReversalTestClassicResult } from '../../../GlobalTypes';
import { FNarccos } from '../FoldTest/foldTestBootstrap';

const reversalTestOldFashioned = (
  direction1: Direction,
  N1: number,
  K1: number,
  direction2: Direction,
  N2: number,
  K2: number,
) => {
  // Classical reversal test for two populations of directions.
  // P. L. McFadden and M. W. McElhinny, 1990
  // but without auto-split of polarities
  [N1, N2, K1, K2] = [+N1, +N2, +K1, +K2];

  const R1 = N1 - ((N1 - 1) / K1);
  const R2 = N2 - ((N2 - 1) / K2);

  const probability = 0.05;

  const gamma = direction1.angle(direction2);
  // equation (15) in McFadden and McElhinny, 1990
  const gammaCritical = Math.acos(1 - (((N1 + N2 - R1 - R2) * (R1 + R2)) / (R1 * R2)) * (Math.pow((1 / probability), (1 / (N1 + N2 - 2))) - 1)) * Direction.RADIANS;

  let classification: 'A' | 'B' | 'C' | 'N/A' | '-' = "N/A";
  if (gammaCritical <= 5) classification = "A";
  else if (gammaCritical > 5 && gammaCritical <= 10) classification = "B";
  else if (gammaCritical > 10 && gammaCritical <= 20) classification = "C";
  if (gamma > gammaCritical) classification = "-";

  const result: ReversalTestClassicResult = {
    gamma,
    gammaCritical,
    classification,
  };

  return result;
};

export default reversalTestOldFashioned;
