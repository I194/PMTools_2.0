import Direction from "../../../classes/Direction";
import { dirToCartesian2D } from "../../../dirToCartesian";
import createConfidenceEllipse from "./createConfidenceEllipse";
import flipGreatCircle from "./flipGreatCircle";
import flipSmallCircle from "./flipSmallCircle";

const createStereoPlaneData = (
  direction: Direction, 
  graphSize: number,
  angle?: number, 
  angle2?: number, 
  N?: number
) => {
  // Function createStereoPlaneData
  // Returns plane data (small or big circle xyData)

  const [dec, inc] = direction.toArray();

  const rotateEllipse = (x: Direction) => {
    // Function 	Data::rotateEllipse
    // Rotates each point on an ellipse (plane) to the correct direction
    return x.toCartesian().rotateTo(dec, inc).toDirection();
  };

  if (!N) N = 194;

  // No angle is passed: assume a plane (angle = 90)
  if (!angle) angle = 90;
  if (!angle2) angle2 = angle;

  const ellipse = createConfidenceEllipse(angle, angle2, N).map(rotateEllipse);

  // Flip the ellipse when requested. Never flip great circles (angle = 90)
  
  // if (angle === 90) {
  //   return flipSmallCircle(inc, ellipse);
  // } else {
  //   return flipGreatCircle(ellipse);
  // };

  const xyData: Array<[number, number]> = ellipse.map((point) => {
    const [pointDec, pointInc] = point.toArray();
    const coords = dirToCartesian2D(pointDec - 90, pointInc, graphSize);
    return [coords.x, coords.y];
  });

  return xyData;
};

export default createStereoPlaneData;
