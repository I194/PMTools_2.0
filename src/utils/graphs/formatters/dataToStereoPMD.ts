import { IPmdData } from "../../../utils/files/fileManipulations";
import Coordinates from "../classes/Coordinates";
import { Reference } from "../types";
import toReferenceCoordinates from "./toReferenceCoordinates";
import { dirToCartesian2D } from "../dirToCartesian";
 
const dataToStereoPMD = (data: IPmdData, graphSize: number, reference: Reference) => {
  const steps = data.steps;

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
  
  return {directionalData, xyData};
}

export default dataToStereoPMD;
