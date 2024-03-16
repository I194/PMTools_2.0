import { IDirData, RawStatisticsDIR } from "../../GlobalTypes";
import Coordinates from "../../graphs/classes/Coordinates";
import Direction from "../../graphs/classes/Direction";
import getRawPlaneData from "./getRawPlaneData";

const calculateMcFaddenMean = (
  selectedDirections: IDirData['interpretations']
) => {
  let AllDirectionsGeo: {directions: Array<Direction>, gcNormals: Array<Direction>} = {directions: [], gcNormals: []};
  let AllDirectionsStrat: {directions: Array<Direction>, gcNormals: Array<Direction>} = {directions: [], gcNormals: []};

  selectedDirections.forEach(direction => {
    const dirGeo = new Direction(direction.Dgeo, direction.Igeo, 1);
    const dirStrat = new Direction(direction.Dstrat, direction.Istrat, 1);
    if (direction.gcNormal) {
      AllDirectionsGeo.gcNormals.push(dirGeo);
      AllDirectionsStrat.gcNormals.push(dirStrat);
    } else {
      AllDirectionsGeo.directions.push(dirGeo);
      AllDirectionsStrat.directions.push(dirStrat);
    };
  });

  const res: RawStatisticsDIR['mean'] = {
    geographic: mcFaddenCombineMean(AllDirectionsGeo.gcNormals, AllDirectionsGeo.directions),
    stratigraphic: mcFaddenCombineMean(AllDirectionsStrat.gcNormals, AllDirectionsStrat.directions),
  };
  
  return res;
};

const calcRvector = (
  dirs: Array<Direction>
) => {
  let R = 0;
  let Xbar = [0, 0, 0];
  let X: Array<[number, number, number]> = [];

  dirs.forEach((direction, i) => {
    const xyz = direction.toCartesian();
    X.push([xyz.x, xyz.y, xyz.z]);
    for (let j = 0; j < 3; j++) Xbar[j] += X[i][j];
  });

  for (let j = 0; j  < 3; j++) R += Math.pow(Xbar[j], 2);

  return {r: Math.sqrt(R), xbar: Xbar};
};

const mcFaddenCombineMean = (
  directionsGC: Array<Direction>,
  directionsDirs: Array<Direction>,
) => {
  const bestGCdirs: Array<{
    direction: Direction; 
    r: number; 
    circle: number; 
    dirIndex: number;
  }> = [];
  const newDirData = directionsDirs.slice();

  directionsGC.forEach((direction, i) => {
    // for each normal direction...
    const gcPath = getRawPlaneData(direction);

    const bestGCdir = {
      direction: new Direction(0, 0, 0), 
      r: 0, 
      circle: i, 
      dirIndex: -1
    };

    gcPath.forEach((gcPathDirection, k) => {
      if (!gcPathDirection) return;

      const dirs = newDirData.slice();
      dirs.push(gcPathDirection);
      const testR = calcRvector(dirs); // test on best direction

      if (testR.r > bestGCdir.r) {
        bestGCdir.r = testR.r;
        bestGCdir.dirIndex = k;
      };
    });

    bestGCdir.direction = gcPath[bestGCdir.dirIndex];
    newDirData.push(bestGCdir.direction);

    bestGCdirs.push(bestGCdir);
  });

  const M = directionsDirs.length;
  const N = directionsGC.length;

  const dirs = directionsDirs.slice();
  bestGCdirs.forEach(gcDir => {
    dirs.push(gcDir.direction);
  });

  var rVector = calcRvector(dirs);
  var R = rVector.r, Xbar = rVector.xbar;

  // standard Fisher statistics
  for (let j = 0; j  < 3; j++) Xbar[j] /= R;
  const meanDirection = new Coordinates(Xbar[0], Xbar[1], Xbar[2]).toDirection();

  const k = (2 * M + N - 2) / (2 * (M + N - R));
  const csd = 81 / Math.sqrt(k);

  const Q = M + N / 2;
  const b = Math.pow((1 / 0.05), (1 / (Q - 1))) - 1;
  let a = 1 - (((Q - 1) / (k * R)) * b);
  if (a < -1) a = -1;
  let a95 = Math.acos(a) * Coordinates.RADIANS;
  if (a < 0) a95 = 180;

  // const fpars = {
  //   dec: dir.declination, 
  //   inc: dir.inclination, 
  //   n: (N + M), 
  //   r: R, 
  //   k,
  //   a95, 
  //   csd
  // };
  // return fpars;
  
  const res = {
    direction: meanDirection,
    MAD: a95,
    k,
    R,
    N: M + N,
    csd
  };

  return res;
};

export default calculateMcFaddenMean;
