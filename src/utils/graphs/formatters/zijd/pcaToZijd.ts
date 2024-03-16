import { PCALines, Projection } from "../../types";
import Coordinates from "../../classes/Coordinates";
import axesLabelsByProjection from "./stepByProjection";

const createPCALines = (
  centerMass: Coordinates | null,
  coordinates: Coordinates | null,
  projection: Projection, 
  graphSize: number,
) => {
  if (!centerMass || !coordinates) return null;

  const axesLabels = axesLabelsByProjection(projection);
  // домножаем на -1 по оси Y, ибо в .svg ось Y отсчитывается сверху вниз, а не снизу вверх, как в декартовых координатах
  const horX = axesLabels.xAxis[0];
  const horY = axesLabels.yAxis[0];
  const verX = axesLabels.xAxis[1];
  const verY = axesLabels.yAxis[1];

  // растягиваем по всему графику
  // coordinates = coordinates.multiplyAll(10);

  const coords = {
    hor: {
      x1: horX.sign * centerMass[horX.axisName] + coordinates[horX.axisName], 
      y1: -horY.sign * centerMass[horY.axisName] + coordinates[horY.axisName],
      x2: horX.sign * centerMass[horX.axisName] - coordinates[horX.axisName], 
      y2: -horY.sign * centerMass[horY.axisName] - coordinates[horY.axisName],
    },
    ver: {
      x1: verX.sign * centerMass[verX.axisName] + coordinates[verX.axisName],
      y1: -verY.sign * centerMass[verY.axisName] + coordinates[verY.axisName],
      x2: verX.sign * centerMass[verX.axisName] - coordinates[verX.axisName],
      y2: -verY.sign * centerMass[verY.axisName] - coordinates[verY.axisName],
    }
  };
  
  let pcaLines: PCALines = {
    horX: [coords.hor.x1 + graphSize, coords.hor.x2 + graphSize],
    horY: [coords.hor.y1 + graphSize, coords.hor.y2 + graphSize],
    verX: [coords.ver.x1 + graphSize, coords.ver.x2 + graphSize],
    verY: [coords.ver.y1 + graphSize, coords.ver.y2 + graphSize],
  };

  // это костыль, не знаю почему без него неправильно. Но без него правда неправильно. Пока что.
  if (projection.y !== 'W, UP') {
    pcaLines.horX = [coords.hor.x2 + graphSize, coords.hor.x1 + graphSize];
  };

  // pcaLines.horX = pcaLines.horX.map(edges => edges / 10 ) as [number, number];
  // pcaLines.horY = pcaLines.horY.map(edges => edges / 10 ) as [number, number];

  return pcaLines;
};

export default createPCALines;