import { PCALines, Projection } from "../types";
import Coordinates from "../classes/Coordinates";

const createPCALines = (
  centerMass: Coordinates | null,
  coordinates: Coordinates | null,
  projection: Projection, 
  graphSize: number,
) => {
  if (!centerMass || !coordinates) return null;

  const coordsByProjection = {
    'W, UP': {
      hor: {
        x1: centerMass.x + coordinates.x, 
        y1: centerMass.y + coordinates.y,
        x2: centerMass.x - coordinates.x,
        y2: centerMass.y - coordinates.y
      },
      ver: {
        x1: centerMass.x + coordinates.x, 
        y1: centerMass.z + coordinates.z,
        x2: centerMass.x - coordinates.x,
        y2: centerMass.z - coordinates.z
      }
    },
    'N, UP': {
      hor: {
        x1: centerMass.y + coordinates.y, 
        y1: centerMass.x + coordinates.x,
        x2: centerMass.y - coordinates.y,
        y2: centerMass.x - coordinates.x
      },
      ver: {
        x1: centerMass.y + coordinates.y, 
        y1: -centerMass.z - coordinates.z,
        x2: centerMass.y - coordinates.y,
        y2: -centerMass.z + coordinates.z
      }
    },
    'N, N': {
      hor: {
        x1: centerMass.y + coordinates.y, 
        y1: centerMass.x + coordinates.x,
        x2: centerMass.y - coordinates.y,
        y2: centerMass.x - coordinates.x
      },
      ver: {
        x1: -centerMass.z - coordinates.z,
        y1: centerMass.x + coordinates.x,
        x2: -centerMass.z + coordinates.z,
        y2: centerMass.x - coordinates.x
      }
    },
  };

  const pcaLines: PCALines = {
    horX: [coordsByProjection[projection].hor.x1 + graphSize, coordsByProjection[projection].hor.x2 + graphSize],
    horY: [coordsByProjection[projection].hor.y1 + graphSize, coordsByProjection[projection].hor.y2 + graphSize],
    verX: [coordsByProjection[projection].ver.x1 + graphSize, coordsByProjection[projection].ver.x2 + graphSize],
    verY: [coordsByProjection[projection].ver.y1 + graphSize, coordsByProjection[projection].ver.y2 + graphSize],
  };

  return pcaLines;
};

export default createPCALines;