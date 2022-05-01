import { dirToCartesian2D } from "../dirToCartesian";
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
        Math.tan(this.inclination / Direction.RADIANS) / 2
      ) * Direction.RADIANS
    );
  };

  toArray = () => {
    const dirArr: [number, number] = [this.declination, this.inclination];
    return dirArr;
  };

  toCartesian = () => {
    // dec as lat and inc as lon
    const dec = this.declination / Direction.RADIANS;
    const inc = this.inclination / Direction.RADIANS;

    const x = this.length * Math.cos(dec) * Math.cos(inc);
    const y = this.length * Math.sin(dec) * Math.cos(inc);
    const z = this.length * Math.sin(inc);

    return new Coordinates(x, y, z);
  };

  toCartesian2DForGraph = (graphSize: number) => {
    const [pointDec, pointInc] = this.toArray();
    const coords = dirToCartesian2D(pointDec - 90, pointInc, graphSize);
    const res: [number, number] = [coords.x, coords.y];
    return res;
  };

  angle = (direction: Direction) => {
    return this.toCartesian().angle(direction.toCartesian());
  };

}

export default Direction;
