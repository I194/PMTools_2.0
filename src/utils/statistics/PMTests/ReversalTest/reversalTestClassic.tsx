import numeric from 'numeric';
import { IDirData } from "../../../GlobalTypes";
import Direction from "../../../graphs/classes/Direction";
import { splitPolarities } from "../../eigManipulations";
import { fisherMean } from '../../calculation/calculateFisherMean';

type Props = {
  dataToAnalyze: IDirData;
};

const reversalTestClassic = ({
  dataToAnalyze,
}: Props) => {
  // Classical reversal test for two populations of directions.
  // P. L. McFadden and M. W. McElhinny, 1990

  const directions = dataToAnalyze.interpretations.map((direction) => (
    new Direction(direction.Dgeo, direction.Igeo, 1)
  ));

  const { normalDirections, reversedDirections} = splitPolarities(directions);

  const fisherNormal = fisherMean(normalDirections);
  const fisherReversed = fisherMean(reversedDirections);

  const N1 = fisherNormal.N;
  const R1 = fisherNormal.R;
  const N2 = fisherReversed.N;
  const R2 = fisherReversed.R;

  const probability = 0.05;

  const gamma = fisherNormal.direction.angle(fisherReversed.direction);
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

export default reversalTestClassic;
