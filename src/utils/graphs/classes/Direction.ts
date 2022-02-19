import Coordinates from "./Coordinates";

class Direction {
  // Class Direction
  // Wrapper for 3d vectors (magnetic directions in most cases)
  static RADIANS = 180 / Math.PI;
  declination: number;
  inclination: number;
  length: number;

  constructor(declination: number, inclination: number, length: number) {
    this.declination = declination;
    this.inclination = inclination;
    this.length = length;
  };

  get paleoLatitude() {
    return (
      Math.atan(
        Math.tan(this.inclination * Direction.RADIANS) / 2
      ) / Direction.RADIANS
    );
  };

  toArray = () => {
    return new Array(this.declination, this.inclination);
  };

  toCartesian = () => {
    const dec = this.declination / Direction.RADIANS;
    const inc = this.inclination / Direction.RADIANS;
    console.log(dec, this.declination, inc, this.inclination, Direction.RADIANS)
    console.log(Math.cos(dec), Math.sin(dec), Math.cos(inc), Math.sin(inc), this.length);

    const x = this.length * Math.cos(dec) * Math.cos(inc);
    const y = this.length * Math.sin(dec) * Math.cos(inc);
    const z = this.length * Math.sin(inc);

    return new Coordinates(x, y, z);
  };

  angle = (direction: Direction) => {
    return this.toCartesian().angle(direction.toCartesian());
  };

}

export default Direction;
