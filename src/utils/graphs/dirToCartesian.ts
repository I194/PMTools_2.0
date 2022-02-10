const degreesToRadians = (degrees: number) => {
  return degrees * Math.PI / 180;
}

const radiansToDegrees = (radians: number) => {
  return radians * 180 / Math.PI;
}

const projectInclination = (inc: number, type: 'equalArea' | 'equalAngle') => {

  /*
   * Function projectInclination
   * Converts the inclination to a project inclination (equal area; equal angle)
   * used in the equal area projection plots
   */

  // Value can be treated as being absolute since the
  // lower & upper hemisphere are both being projected
  inc = Math.abs(inc);
  switch(type) {
    case 'equalArea':
      return 90 - (Math.sqrt(2) * 90 * Math.sin(Math.PI * (90 - inc) / 360));
    case 'equalAngle':
      return 90 - (90 * Math.tan(Math.PI * (90 - inc) / 360));
    default:
      throw new Error('Unknown projection type');
  }

}

const dirToCartesian3D = (i: number, d: number, r: number) => {
  d = degreesToRadians(d);
  i = degreesToRadians(i);
  const x = +(r * Math.cos(i) * Math.cos(d)).toFixed(2);
  const y = +(r * Math.cos(i) * Math.sin(d)).toFixed(2);
  const z = +(r * Math.sin(i)).toFixed(2);
  return {x, y, z};
};

const dirToCartesian2D = (inclination: number, declination: number, graphWidth: number) => {
  const theta = degreesToRadians(declination);
  const radius = ((90 - Math.abs(inclination)) / 90) * (graphWidth / 2);
  const x = +(radius * Math.cos(theta)).toFixed(2);
  const y = +(radius * Math.sin(theta)).toFixed(2);
  return {x, y};
};

export {
  degreesToRadians,
  radiansToDegrees, 
  dirToCartesian3D, 
  dirToCartesian2D,
  projectInclination
};