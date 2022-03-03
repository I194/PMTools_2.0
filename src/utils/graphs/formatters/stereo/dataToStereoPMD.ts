import { IPmdData } from "../../../files/fileManipulations";
import Coordinates from "../../classes/Coordinates";
import { MeanDirection, Reference, TooltipDot } from "../../types";
import toReferenceCoordinates from "../toReferenceCoordinates";
import { dirToCartesian2D } from "../../dirToCartesian";
import { RawStatisticsPCA } from "../../../GlobalTypes";
import { graphSelectedDotColor } from "../../../ThemeConstants";
import createSmallCircle from "./createSmallCircle";
 
const dataToStereoPMD = (
  data: IPmdData, 
  graphSize: number, 
  reference: Reference,
  statistics: RawStatisticsPCA | null,
) => {
  const steps = data.steps;

  // annotations for dots ('id' field added right in the Data.tsx as dot index)
  const labels = steps.map((step) => step.step);

  // 1) rotate dots coords to reference direction 
  // 2) filling arrays of directed and XY data
  const rotatedCoords = steps.map((step) => {
    const xyz = new Coordinates(step.x, step.y, step.z);
    let inReferenceCoords = toReferenceCoordinates(reference, data.metadata, xyz);
    return inReferenceCoords;
  });

  const directionalData: Array<[number, number]> = rotatedCoords.map((step) => {
    const direction = step.toDirection();
    return [direction.declination, direction.inclination];
  });

  const xyData: Array<[number, number]> = directionalData.map((di) => {
    const coords = dirToCartesian2D(di[0] - 90, di[1], graphSize);
    return [coords.x, coords.y];
  });

  // mean direction calculation
  let meanDirection: MeanDirection = null;
  if (statistics) {
    const meanDirData: [number, number] = toReferenceCoordinates(
      reference, data.metadata, statistics.component.edges
    ).toDirection().toArray();
    const meanXYData = dirToCartesian2D(meanDirData[0] - 90, meanDirData[1], graphSize);
    const confidenceCircleXYData = createSmallCircle(
      meanDirData[0], meanDirData[1],
      statistics.MAD, graphSize
    );

    const tooltip: TooltipDot = {
      title: 'Mean dot',
      dec: +meanDirData[0].toFixed(1),
      inc: +meanDirData[1].toFixed(1),
      mad: +statistics.MAD.toFixed(1),
      meanType: statistics.code,
    };

    meanDirection = {
      dirData: meanDirData,
      xyData: [meanXYData.x, meanXYData.y],
      confidenceCircle: {
        xyData: confidenceCircleXYData, 
        color: graphSelectedDotColor('mean')
      },
      tooltip,
    };
  };

  // tooltip data for each dot on graph
  const tooltipData: Array<TooltipDot> = steps.map((step, index) => {
    const xyz = new Coordinates(step.x, step.y, step.z);
    const direction = xyz.toDirection();
    return {
      id: index + 1,
      step: step.step,
      x: step.x,
      y: step.y,
      z: step.z,
      dec: +directionalData[index][0].toFixed(1),
      inc: +directionalData[index][1].toFixed(1),
      mag: step.mag.toExponential(2).toUpperCase(),
    };
  });
  
  return {
    directionalData, 
    xyData,
    tooltipData,
    labels,
    meanDirection,
  };
}

export default dataToStereoPMD;
