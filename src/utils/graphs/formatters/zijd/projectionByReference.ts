import { Projection, Reference } from "../../types";

const projectionByReference = (projection: Projection, reference: Reference) => {
  if (reference !== 'specimen') return projection;

  type GeographicalDirections = 'UP' | 'DOWN' | 'W' | 'E' | 'N' | 'S';

  const correspondingXYZ = {
    UP: '-z',
    DOWN: 'z',
    W: '-y',
    E: 'y',
    S: '-x',
    N: 'x',
  };

  const xyProjY = projection.y
    .split(', ')
    .map(direction => correspondingXYZ[direction as GeographicalDirections])
    .join(', ');

  const xyProjX = projection.x
  .split(', ')
  .map(direction => correspondingXYZ[direction as GeographicalDirections])
  .join(', ');
  
  return {y: xyProjY, x: xyProjX}; 
};

export default projectionByReference;