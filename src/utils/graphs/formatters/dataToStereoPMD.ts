import { IPmdData } from "../../../utils/files/fileManipulations";
import Coordinates from "../classes/Coordinates";
import { Reference, TooltipDot } from "../types";
import toReferenceCoordinates from "./toReferenceCoordinates";
import { dirToCartesian2D } from "../dirToCartesian";
 
const dataToStereoPMD = (data: IPmdData, graphSize: number, reference: Reference) => {

  const steps = data.steps;

  const labels = steps.map((step) => step.step);

  const tooltipData: Array<TooltipDot> = steps.map((step, index) => {
    const xyz = new Coordinates(step.x, step.y, step.z);
    const direction = xyz.toDirection();
    return {
      id: index + 1,
      step: step.step,
      x: step.x,
      y: step.y,
      z: step.z,
      dec: +direction.declination.toFixed(1),
      inc: +direction.inclination.toFixed(1),
      mag: step.mag.toExponential(2).toUpperCase(),
    };
  })

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
  })
  
  return {
    directionalData, 
    xyData,
    tooltipData,
    labels,
  };
}

export default dataToStereoPMD;
