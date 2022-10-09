import { IDirData, RawStatisticsDIR } from "../../GlobalTypes";
import Coordinates from "../../graphs/classes/Coordinates";
import Direction from "../../graphs/classes/Direction";

const calculateFisherMean = (
  selectedDirections: IDirData['interpretations']
) => {
  const DirectionsGeo = selectedDirections.map(direction => new Direction(direction.Dgeo, direction.Igeo, 1));
  const DirectionsStrat = selectedDirections.map(direction => new Direction(direction.Dstrat, direction.Istrat, 1))

  const res: RawStatisticsDIR['mean'] = {
    geographic: fisherMean(DirectionsGeo),
    stratigraphic: fisherMean(DirectionsStrat),
  };
  
  return res;
};

export const fisherMean = (
  directions: Array<Direction>,
) => {

  /*
  Calculates the Fisher mean and associated parameter from a di_block
  Parameters
  ----------
  directions : list of Directions
  Returns
  -------
  fpars : dictionary containing the Fisher mean and statistics
      dec : mean declination
      inc : mean inclination
      r : resultant vector length
      n : number of data points
      k : Fisher k value
      csd : Fisher circular standard deviation
      alpha95 : Fisher circle of 95% confidence
  -------
  credit : PmagPY module for Python 3 [*Modified by I194]
  */

  let R = 0, Xbar = [0, 0, 0], X = [];
  const N = directions.length;

  for (let i = 0; i < directions.length; i++) {
    const xyz = directions[i].toCartesian();
    X.push([xyz.x, xyz.y, xyz.z]);
    for (let j = 0; j < 3; j++) Xbar[j] += X[i][j];
  };

  for (let j = 0; j  < 3; j++) R += Math.pow(Xbar[j], 2);
  R = Math.sqrt(R);

  for (let j = 0; j  < 3; j++) Xbar[j] /= R;

  const meanDirection = new Coordinates(Xbar[0], Xbar[1], Xbar[2]).toDirection();
  let k = 0, csd = 0;
  if (N != R) {
    k = (N - 1) / (N - R);
    csd = 81 / Math.sqrt(k);
  } else {
    k = Infinity;
    csd = 0;
  };

  const b = Math.pow(20, (1./(N - 1.))) - 1;
  let a = 1 - b * (N - R) / R;
  if (a < -1) a = -1;
  let a95 = Math.acos(a) * Coordinates.RADIANS;
  if (a < 0) a95 = 180;

  const res = {
    direction: meanDirection,
    MAD: a95,
    k,
    N,
    R,
    csd,
  };
  
  // const res = {
  //   dec: dir.declination, 
  //   inc: dir.inclination, 
  //   n: N, 
  //   r: R, 
  //   k, 
  //   a95,
  //   csd
  // };

  return res;
};

export default calculateFisherMean;