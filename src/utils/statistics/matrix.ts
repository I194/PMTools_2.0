export type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number],
];

export const getRotationMatrix = (lambda: number, phi: number) => { 
  // Function getRotationMatrix
  // Returns the rotation matrix (parameters are poorly named)
  // but this function is re-used througouth the application. It may be azimuth, plunge
  // or co-latitude, longitude of Euler pole
  // Note: we use actual core dip: Tauxe A3.12 uses the plunge of the lab arrow which is x - 90
  // Rewritten some of the cos -> sin using trig. identities and replacing (x - 90) with x

  const rotationMatrix: Matrix3x3 = [
    [Math.cos(lambda) * Math.sin(phi), -Math.sin(lambda), Math.cos(phi) * Math.cos(lambda)],
    [Math.sin(phi) * Math.sin(lambda), Math.cos(lambda), Math.sin(lambda) * Math.cos(phi)],
    [-Math.cos(phi), 0, Math.sin(phi)]
  ];

  return rotationMatrix;
};

export const getRotationMatrixTransposed = (lambda: number, phi: number) => {
  // Function getRotationMatrixTransposed
  // Returns the reversed rotation matrix (transpose)

  const matrix = getRotationMatrix(lambda, phi);
  const transposedMatrix: Matrix3x3 = [
    [matrix[0][0], matrix[1][0], matrix[2][0]],
    [matrix[0][1], matrix[1][1], matrix[2][1]],
    [matrix[0][2], matrix[1][2], matrix[2][2]],
  ]

  // Return the transposed matrix (inversed rotation)
  return transposedMatrix;
};

export const nullVector = () => {
  // Function nullVector
  // Returns an empty 1D vector
  const vector: [number, number, number] = [0, 0, 0];
  return vector;
};


export const nullMatrix = () => {
  // Function nullMatrix
  // Returns an empty 3D matrix

  return [nullVector(), nullVector(), nullVector()];
};

export const TMatrix = (vectors: Array<[number, number, number]>) => {
  // Function TMatrix
  // Returns the orientation matrix for a set of directions

  const orientationMatrix = nullMatrix();

  vectors.forEach((vector) => {
    for(var k = 0; k < 3; k++) {
      for(var l = 0; l < 3; l++) {
        orientationMatrix[k][l] += (vector[k] * vector[l]) / vectors.length;
      };
    };
  });

  return orientationMatrix;
};