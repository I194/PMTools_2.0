import Direction from '../../graphs/classes/Direction';

const calculateVGP = (
  declination: number, 
  inclination: number, 
  a95: number, 
  siteLatitude: number, 
  siteLongitude: number
) => {

  const direction = new Direction(declination, inclination, 1);
  const p = 0.5 * Math.PI - Math.atan(Math.tan(inclination) / 2);
  const poleLatitude = Math.asin(Math.sin(siteLatitude) * Math.cos(p) + Math.cos(siteLatitude) * Math.sin(p) * Math.cos(declination));
  const beta = Math.asin((Math.sin(p) * Math.sin(declination) / Math.cos(poleLatitude)));

  let poleLongitude = siteLongitude + beta;
  if ((Math.cos(p) - Math.sin(poleLatitude) * Math.sin(siteLatitude)) < 0) {
    poleLongitude = siteLongitude + Math.PI - beta;
  }
  // Bind the plate longitude between [0, 360]
  if (poleLongitude < 0) {
    poleLongitude += 2 * Math.PI;
  }

  const paleoLatitude = direction.paleoLatitude;
  const dp = 2 * a95 / (1  + 3 * Math.pow(Math.cos(inclination), 2));
  const dm = a95 * Math.sin(p) / Math.cos(inclination);

  const res: {
    poleLatitude: number,
    poleLongitude: number,
    paleoLatitude: number,
    dp: number,
    dm: number,
  } = {
    poleLatitude,
    poleLongitude,
    paleoLatitude,
    dp,
    dm,
  };

  return res;
};

export default calculateVGP;