import Coordinates from "./Coordinates";
import Direction from "./Direction";

class Distribution {
  static RADIANS = 180 / Math.PI;
  directions: Direction[];
  // Fisher parameters
  R: number;
  N: number;

  constructor(directions: Direction[]) {
    this.directions = directions;
    this.R = 0;
    this.N = directions.length;
  };

  getMeanDirection = () => {
    // calculates the mean direction by finding arifmethic mean cartesian coords of a distribution of directions
    // const [xSum, ySum, zSum] = this.directions
    //   .map(direction => direction.toCartesian().toArray())
    //   .reduce((acc, curr) => {
    //     return [acc[0] + curr[0], acc[1] + curr[1], acc[2] + curr[2]];
    //   }, [0, 0, 0]);
    var xSum = 0;
    var ySum = 0
    var zSum = 0;

    this.directions.map(vector => vector.toCartesian()).forEach(function(coordinates) {

      xSum += coordinates.x;
      ySum += coordinates.y;
      zSum += coordinates.z;

    });
    return new Coordinates(xSum, ySum, zSum).toDirection();
  };

  getDispersion = () => {
    return (this.N - 1) / (this.N - this.R);
  };

  getConfidenceInterval = (confidence: number = 95) => {
    // calculates the confidence interval for a distribution of directions
    const probability = 0.01 * (100 - confidence);
    return Math.acos(1 - (Math.pow((1 / probability), (1 / (this.N - 1))) - 1) * (this.N - this.R) / this.R) / Distribution.RADIANS;
  };

  transformCox = (lambda: number) => {
    // Transform small dispersion (k) to (K) following Cox 1970
    const dispersion = this.getDispersion();
    return 0.5 * dispersion * (5 + 3 * Math.sin(lambda) ** 2) / ((1 + 3 * (Math.sin(lambda) ** 2)) ** 2);
  };

  transformCreer = (lambda: number) => {
    // Transform small dispersion (k) to (K) following Creer 1962
    const dispersion = this.getDispersion();
    return 0.5 * dispersion * (5 - 3 * Math.sin(lambda) ** 2) / (1 + 3 * Math.sin(lambda) ** 2);
  };

  calculatePoleDistribution = () => ({
    confidenceMin: 12 * this.N ** -0.4,
    confidenceMax: 82 * this.N ** -0.63,
  });

  calculateDirectionDistribution = () => {
    const lambda = this.getMeanDirection().paleoLatitude;
    return {
      cox: this.transformCox(lambda),
      creer: this.transformCreer(lambda),
    };
  };
};

export default Distribution;

