import numeric from 'numeric';
import Coordinates from '../graphs/classes/Coordinates';
import Direction from '../graphs/classes/Direction';
import { Matrix3x3, TMatrix } from './matrix';

// Modifies the eigen object in place and normalizes the eigenvalues to within [0, 1]
export const normalizeEigenValues = (eig: {lambda: any, E: any}) => {
  // Function normalizeEigenValues
  // Modifies the eigen object in place and normalizes the eigenvalues to within [0, 1]
  let trace = 0;

  // Get the trace of the matrix
  for (var i = 0; i < 3; i++) {
    trace += eig.lambda.x[i];
  }

  for (var i = 0; i < 3; i++) {
    eig.lambda.x[i] = eig.lambda.x[i] / trace;
  };
};

// Sorts eigenvalues and corresponding eigenvectors from highest to lowest
export const sortEigenvectors = (eig: {lambda: any, E: any}) => {
  // Function sortEigenvectors
  // sorts eigenvalues and corresponding eigenvectors from highest to lowest
  
  // Algorithm to sort eigenvalues and corresponding eigenvectors
  // as taken from the PmagPY library

  // Normalize eigenvalues (impure)
  normalizeEigenValues(eig);

  // finding of largest and smallest eigenvalue to determaine treir indexes
  const t1 = Math.max(...eig.lambda.x);
  const t3 = Math.min(...eig.lambda.x);
  const indexOfT1: number = eig.lambda.x.indexOf(t1);
  const indexOfT3: number = eig.lambda.x.indexOf(t3);
  // now we can determine middle eigenvalue index and find it
  const indexOfT2 = [1, 2, 3].filter(index => (index !== indexOfT1) && (index !== indexOfT3))[0];
  const t2 = eig.lambda.x[indexOfT2];

  // Sort eigenvectors
  return {
    v1: [eig.E.x[0][indexOfT1], eig.E.x[1][indexOfT1], eig.E.x[2][indexOfT1]] as [number, number, number],
    v2: [eig.E.x[0][indexOfT2], eig.E.x[1][indexOfT2], eig.E.x[2][indexOfT2]] as [number, number, number],
    v3: [eig.E.x[0][indexOfT3], eig.E.x[1][indexOfT3], eig.E.x[2][indexOfT3]] as [number, number, number],
    tau: [t1, t2, t3] as [number, number, number]
  };
};

export const getEigenvaluesFast = (T: Matrix3x3) => {

  /*
   * Function getEigenvaluesFast
   * Algorithm to find eigenvalues of a symmetric, real matrix.
   * We need to compute the eigenvalues for many (> 100.000) real, symmetric matrices (Orientation Matrix T).
   * Calling available libraries (Numeric.js) is much slower so we implement this algorithm instead.
   * Publication: O.K. Smith, Eigenvalues of a symmetric 3 × 3 matrix - Communications of the ACM (1961)
   * See https://en.wikipedia.org/wiki/Eigenvalue_algorithm#3.C3.973_matrices
   */
	
  // Calculate the trace of the orientation matrix
  // 3m is equal to the trace
  var m = (T[0][0] + T[1][1] + T[2][2]) / 3;
	
  // Calculate the sum of squares
  var p1 = Math.pow(T[0][1], 2) + Math.pow(T[0][2], 2) + Math.pow(T[1][2], 2);	
  var p2 = Math.pow((T[0][0] - m), 2) + Math.pow((T[1][1] - m), 2) + Math.pow((T[2][2] - m), 2) + 2 * p1;
	
  // 6p is equal to the sum of squares of elements
  var p = Math.sqrt(p2 / 6);
	
  // Identity Matrix I and empty storage matrix B
  var B = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  var I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
	
  for (var i = 0; i < 3; i++ ) {
    for (var k = 0; k < 3; k++) {
      B[i][k] = (1 / p) * (T[i][k] - m * I[i][k]);
    }
  }

  // Half determinant of matrix B.
  var r = 0.5 * numeric.det(B);
	
  var phi;
  if(r <= -1) {
    phi = Math.PI / 3;
  } else if(r >= 1) {
    phi = 0;
  } else {
    phi = Math.acos(r) / 3;
  }
	
  // Calculate the three eigenvalues
  var eig1 = m + 2 * p * Math.cos(phi);
  var eig3 = m + 2 * p * Math.cos(phi + (2 * Math.PI / 3));

  // Last eigenvector can be derived
  var eig2 = 3 * m - eig1 - eig3;
	
  // Normalize eigenvalues
  var tr = eig1 + eig2 + eig3;

  return {
    "t1": eig1 / tr,
    "t2": eig2 / tr,
    "t3": eig3 / tr
  }
};

export const makePrincipalComponents = (coords: Array<Coordinates>) => {
  let centerMass: [number, number, number] = [0, 0, 0];
  const vectors = coords.map(coord => coord.toArray())

  for (let i = 0; i < vectors.length; i++) {
    for (let j = 0; j < 3; j++) {
      centerMass[j] += vectors[i][j] / coords.length;
    };
  };

  for (let i = 0; i < vectors.length; i++) {
    for (let j = 0; j < 3; j++) {
      vectors[i][j] = vectors[i][j] - centerMass[j];
    };
  };

  const eig = sortEigenvectors(numeric.eig(TMatrix(vectors)));
  const principalDirection = new Coordinates(eig.v1[0], eig.v1[1], eig.v1[2]).toDirection();

  return principalDirection.flip();
};

export const splitPolarities = (
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
