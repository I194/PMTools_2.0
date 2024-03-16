import Direction from "../../../classes/Direction";
import createConfidenceEllipse from "./createConfidenceEllipse";
import splitCircle from "./splitCircle";

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

  const splittedEllipse = splitCircle(ellipse);

  const xyData: Array<[number, number]> = ellipse.map(point => point.toCartesian2DForGraph(graphSize));
  const xyDataNeg: Array<[number, number]> = splittedEllipse.negative.map(point => point.toCartesian2DForGraph(graphSize));
  const xyDataPos: Array<[number, number]> = splittedEllipse.positive.map(point => point.toCartesian2DForGraph(graphSize));

  return {
    all: xyData,
    neg: xyDataNeg,
    pos: xyDataPos,
  };
};

export default createStereoPlaneData;
