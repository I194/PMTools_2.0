import numeric from "numeric";
import { IDirData, IPmdData, RawStatisticsDIR } from "../../GlobalTypes";
import Coordinates from "../../graphs/classes/Coordinates";
import { TMatrix } from "../matrix";
import { sortEigenvectors } from "../eigManipulations";
import Direction from "../../graphs/classes/Direction";
import { Reference } from "../../graphs/types";

const calculatePCA_dir = (
  selectedDirections: IDirData['interpretations'],
) => {
  
  // Function calculatePCA
  // Does a PCA calculation on the selected directions

  const res: RawStatisticsDIR['mean'] = {
    geographic: pcaByReference(selectedDirections, 'geographic'),
    stratigraphic: pcaByReference(selectedDirections, 'stratigraphic'),
  };

  return res;
};

const pcaByReference = (
  selectedDirections: IDirData['interpretations'],
  reference: Reference,
) => {
  const refLabel = reference === 'geographic' ? 'geo' : 'strat';

  const centerMass: [number, number, number] = [0, 0, 0];

  const vectors: Array<[number, number, number]> = selectedDirections.map(direction => {
    const cartesianDir = new Direction(direction[`D${refLabel}`], direction[`I${refLabel}`], 1).toCartesian();
    const { x, y, z } = cartesianDir;
    const factor = 1; // эти вектора всегда единичные, этот множитель чисто для лучшей читабельности кода
    return [x / factor, y / factor, z / factor];
  });

  // Vector of first & last step
  const firstVector = new Coordinates(...vectors[0]);
  const lastVector = new Coordinates(...vectors[vectors.length - 1]);

  // When anchoring we mirror the points and add them
  // in opposite case need to transform to the center of mass
  // So, in GC and GCn mode anchor is always true 
  vectors.push(...vectors);

  // Library call (numeric.js) to get the eigenvector / eigenvalues
  const eig = sortEigenvectors(numeric.eig(TMatrix(vectors)));

  const centerMassCoordinates = new Coordinates(...centerMass);
  const directionVector = firstVector.subtract(lastVector);
  const intensity = directionVector.length;

  let vectorTAU3 = new Coordinates(...eig.v3); // eigenvector for planes
  let MAD = 0;

  if (vectorTAU3.z > 0) vectorTAU3 = vectorTAU3.reflect();

  const meanDirection = vectorTAU3.toDirection();

  // Calculation of maximum angle of deviation
  const s1 = Math.sqrt((eig.tau[2] / eig.tau[1]) + (eig.tau[2] / eig.tau[0]));
  MAD = (Math.atan(s1) * Coordinates.RADIANS) || 0;

  return {
    direction: meanDirection,
    MAD
  };
};

export default calculatePCA_dir;
