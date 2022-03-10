import { PCALines, Projection } from "../../types";
import Coordinates from "../../classes/Coordinates";

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

  const yProj = projection.y;

  const pcaLines: PCALines = {
    horX: [coordsByProjection[yProj].hor.x1 + graphSize, coordsByProjection[yProj].hor.x2 + graphSize],
    horY: [coordsByProjection[yProj].hor.y1 + graphSize, coordsByProjection[yProj].hor.y2 + graphSize],
    verX: [coordsByProjection[yProj].ver.x1 + graphSize, coordsByProjection[yProj].ver.x2 + graphSize],
    verY: [coordsByProjection[yProj].ver.y1 + graphSize, coordsByProjection[yProj].ver.y2 + graphSize],
  };

  return pcaLines;
};

export default createPCALines;