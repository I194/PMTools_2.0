import Coordinates from "../../../classes/Coordinates";

const createConfidenceEllipse = (
  dDx: number, 
  dIx: number, 
  pointsNumber: number
) => {
  // Function createConfidenceEllipse
  // Returns confidence ellipse around up North

  dDx = dDx / Coordinates.RADIANS;
  dIx = dIx / Coordinates.RADIANS;
  const vectors = [];
  const iPoint = (pointsNumber - 1) / 2;

  // Create a circle around the pole with angle confidence
  for (let i = 0; i < pointsNumber; i++) {
    const psi = i * Math.PI / iPoint;
    const x = Math.sin(dIx) * Math.cos(psi);
    const y = Math.sin(dDx) * Math.sin(psi);
    // Resulting coordinate
    let z = Math.sqrt(1 - Math.pow(x, 2) - Math.pow(y, 2));

    if (isNaN(z)) z = 0;

    vectors.push(new Coordinates(x, y, z).toDirection());
  };

  return vectors;
}

export default createConfidenceEllipse;
