import Coordinates from "../../graphs/classes/Coordinates";
import Direction from "../../graphs/classes/Direction";
import createConfidenceEllipse from '../../graphs/formatters/stereo/createPlaneData/createConfidenceEllipse';

const getRawPlaneData = (
  direction: Direction, 
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

  return ellipse;
};

export default getRawPlaneData;
