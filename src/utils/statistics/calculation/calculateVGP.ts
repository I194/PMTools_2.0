import Direction from '../../graphs/classes/Direction';

const calculateVGP = (
  declination: number, 
  inclination: number, 
  siteLatitude: number, 
  siteLongitude: number,
  a95?: number, 
) => {
  // calculates pole from a given direction and dp/dm paramaters if a95 provided
  // the as poleFrom method in paleomagnetism.org Site class
  const direction = new Direction(declination, inclination, 1);
  const paleoLatitude = direction.paleoLatitude;
  const [declinationRad, inclinationRad, siteLatitudeRad, siteLongitudeRad, paleoLatitudeRad] = [
    declination * Math.PI / 180,
    inclination * Math.PI / 180,
    siteLatitude * Math.PI / 180,
    siteLongitude * Math.PI / 180,
    paleoLatitude * Math.PI / 180
  ];
  // const p = 0.5 * Math.PI - Math.atan(Math.tan(inclination) / 2);
  // const poleLatitude = Math.asin(Math.sin(siteLatitude) * Math.cos(p) + Math.cos(siteLatitude) * Math.sin(p) * Math.cos(declination)) * Direction.RADIANS;
  // const beta = Math.asin((Math.sin(p) * Math.sin(declination) / Math.cos(poleLatitude))) * Direction.RADIANS;
  // const poleLatitudeRad = Math.asin(Math.sin(siteLatitudeRad) * Math.sin(paleoLatitudeRad) + Math.cos(siteLatitudeRad) * Math.cos(paleoLatitudeRad) * Math.cos(declinationRad));
  const poleLatitudeRad = Math.asin(Math.sin(siteLatitudeRad) * Math.sin(paleoLatitudeRad) + Math.cos(siteLatitudeRad) * Math.cos(paleoLatitudeRad) * Math.cos(declinationRad));
  const poleLatitude = poleLatitudeRad * Direction.RADIANS;
  const shipunovConstant = Math.acos(
    (Math.sin(paleoLatitudeRad) - Math.sin(poleLatitudeRad) * Math.sin(siteLatitudeRad)) /
    (Math.cos(siteLatitudeRad) * Math.cos(poleLatitudeRad))
  ) * Direction.RADIANS;
  // const psiRad = Math.acos(Math.sin(paleoLatitudeRad) * Math.sin(declinationRad) / Math.cos(poleLatitudeRad));
  // const psi = psiRad * Direction.RADIANS;
  // let poleLongitude = psi + siteLongitude;
  // if ((Math.sin(paleoLatitudeRad) < Math.sin(siteLatitudeRad) * Math.sin(poleLatitudeRad))) {
  //   poleLongitude = 180 - psi + siteLongitude;
  // }
  // // Bind the plate longitude between [0, 360]
  // if (poleLongitude < 0) {
  //   poleLongitude += 360;
  // }
  let poleLongitude = shipunovConstant + siteLongitude;
  if (Math.sin(declinationRad) < 0) poleLongitude -= 2 * shipunovConstant;

  let [dp, dm]: (number | undefined)[] = [undefined, undefined];
  if (a95) {
    dp = 2 * a95 / (1  + 3 * Math.pow(Math.sin(inclinationRad), 2));
    dm = a95 * Math.cos(paleoLatitudeRad) / Math.cos(inclinationRad);
  }

  const res: {
    poleLatitude: number,
    poleLongitude: number,
    paleoLatitude: number,
    dp?: number,
    dm?: number,
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