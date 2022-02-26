import numeric from 'numeric';

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
