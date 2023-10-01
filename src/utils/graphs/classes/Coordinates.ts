import Direction from "./Direction";
import { 
  Matrix3x3, 
  getRotationMatrix, 
  getRotationMatrixTransposed
} from "../../statistics/matrix";

class Coordinates {

  // Class Coordinates
  // Wrapper for Cartesian coordinates (x, y, z)
  static RADIANS = 180 / Math.PI;
  x: number;
  y: number;
  z: number;


  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  };

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  };
  
  get isNull() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  };

  get sum() {
    return this.x + this.y + this.z;
  };

  toUnit = () => {
    return new Coordinates(this.x / this.length, this.y / this.length, this.z / this.length);
  };

  toArray = () => {
    const array: [number, number, number] = [this.x, this.y, this.z];
    return array;
  };

  toDirection = () => {
    // returns cartesian coordinates as a direction vector on sphere
    // represented as pair [declination, inclination]

    let dec = Math.atan2(this.y, this.x);
    let inc = Math.asin(this.z / this.length);

    // Keep the vector (declination or longitude) between [0, 360]
    if (dec < 0) {
      dec += 2 * Math.PI;
    };

    return new Direction(
      dec * Coordinates.RADIANS,
      inc * Coordinates.RADIANS,
      this.length
    );
  };

  add = (coordinates: Coordinates) => {
    return new Coordinates(this.x + coordinates.x, this.y + coordinates.y, this.z + coordinates.z)
  };
  
  addAll = (factor: number) => {
    return new Coordinates(this.x + factor, this.y + factor, this.z + factor);
  }

  subtract = (coordinates: Coordinates) => {
    return new Coordinates(this.x - coordinates.x, this.y - coordinates.y, this.z - coordinates.z)
  };

  subtractAll = (factor: number) => {
    return new Coordinates(this.x - factor, this.y - factor, this.z - factor);
  }

  multiply = (coordinates: Coordinates) => {
    this.x *= coordinates.x; 
    this.y *= coordinates.y;
    this.z *= coordinates.z;
  };

  multiplyAll = (factor: number) => {
    return new Coordinates(this.x * factor, this.y * factor, this.z * factor);
  }

  divide = (coordinates: Coordinates) => {
    this.x /= coordinates.x; 
    this.y /= coordinates.y;
    this.z /= coordinates.z;
  };

  divideAll = (factor: number) => {
    return new Coordinates(this.x / factor, this.y / factor, this.z / factor);
  }

  dot = (coordinates: Coordinates) => {
    return this.x * coordinates.x + this.y * coordinates.y + this.z * coordinates.z;
  };

  cross = (coordinates: Coordinates) => {
    const newX = this.y * coordinates.z - coordinates.y * this.z;
    const newY = -this.x * coordinates.z + coordinates.x * this.z;
    const newZ = this.x * coordinates.y - coordinates.x * this.y;
    return new Coordinates(newX, newY, newZ);
  };

  reflect = () => {
    return new Coordinates(-this.x, -this.y, -this.z);
  };

  angle = (coordinates: Coordinates) => {
    return Math.acos(this.toUnit().dot(coordinates.toUnit())) * Coordinates.RADIANS;
  };

  // rotation methods below (метод correctBedding стоит вынести в отдельный класс для геологических координат)

  rotate = (rotationMatrix: Matrix3x3) => {
    // method Coordinates.rotate
    // Rotates itself against the rotation matrix
    // if you have a rotation matrix, then you can use this method

    const vector = this.toArray();
    const rotatedVector = [0, 0, 0];

    // Do the matrix multiplication
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        rotatedVector[i] += rotationMatrix[i][j] * vector[j];
      };
    };

    return new Coordinates(rotatedVector[0], rotatedVector[1], rotatedVector[2]);
  };

  rotateTo = (lambda: number, phi: number) => {
    // method Coordinates.rotateTo
    // Rotates a direction to lambda, phi (azimuth, plunge or declination and inclination in geological language)
    // expects than lambda and phi given in degrees 

    const azimuth = lambda / Coordinates.RADIANS;
    const plunge = phi / Coordinates.RADIANS;

    const rotationMatrix = getRotationMatrix(azimuth, plunge);

    return this.rotate(rotationMatrix);
  };

  rotateFrom = (lambda: number, phi: number) => {
    // method Coordinates.rotateFrom
    // Rotates a direction from lambda, phi (azimuth, plunge in geological language)
    // expects than lambda and phi given in degrees 

    // Convert to radians
    const azimuth = lambda / Coordinates.RADIANS;
    const plunge = phi / Coordinates.RADIANS;

    // Create the transposed rotation matrix
    var rotationMatrix = getRotationMatrixTransposed(azimuth, plunge);

    return this.rotate(rotationMatrix);
  };

  correctBedding = (strike: number, plunge: number) => {
    const dipDirection = strike + 90;

    // We can subtract the dip direction from the declination because
    // the inclination will not change (See Lisa Tauxe: 9.3 Changing coordinate systems; last paragraph)
    return this.rotateTo(-dipDirection, 90).rotateTo(0, 90 - plunge).rotateTo(dipDirection, 90);
  };

};

export default Coordinates;