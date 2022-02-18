import { IPmdData } from "../../../utils/files/fileManipulations";
import Coordinates from "../classes/Coordinates";

const dataToZijd = (data: IPmdData['steps'], graphSize: number) => {

  const normalizedCoords = data.map((step) => {
    const xyz = new Coordinates(step.x, step.y, step.z);
    return xyz.toUnit().multiplyAll(graphSize);
  });

  const horizontalProjectionData: Array<[number, number]> = []; // "x" is Y, "y" is X
  const verticalProjectionData: Array<[number, number]> = []; // "x" is Y, "y" is Z

  // const horizontalProjectionData: Array<[number, number]> = []; // "x" is X, "y" is -Y
  // const verticalProjectionData: Array<[number, number]> = []; // "x" is X, "y" is -Z

  normalizedCoords.forEach((coords) => {
    horizontalProjectionData.push([coords.x + graphSize, coords.y + graphSize]);
    verticalProjectionData.push([coords.x + graphSize, coords.z + graphSize]);
  });
  
  return {horizontalProjectionData, verticalProjectionData};

};

export default dataToZijd;
