import Direction from '../../utils/graphs/classes/Direction';

export function makeDirection(
  declination: number,
  inclination: number,
  length: number = 1,
): Direction {
  return new Direction(declination, inclination, length);
}
