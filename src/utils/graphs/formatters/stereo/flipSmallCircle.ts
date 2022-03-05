import Direction from "../../classes/Direction";

const flipSmallCircle = (
  inclination: number, 
  ellipse: Array<Direction>
) => {
  // Function flipEllipse
  // Flips an ellipse to the other side of the if it has a sign other than the mean value

  const splitEllipse: Array<Direction | null> = [];
  let sign = 0;

  // Go over all the points on the ellipse
  ellipse.forEach((point, index) => {
    let pointSign = Math.sign(point.inclination);

    if (sign !== pointSign) splitEllipse.push(null);
    // Do not rotate when negative & negative or positive & positive
    if (pointSign !== Math.sign(inclination)) point.declination += 180;
    // Add the point again
    splitEllipse.push(point);

    sign = pointSign;
  });

  return splitEllipse;
};

export default flipSmallCircle;
