import { IPmdData } from "../../../utils/files/fileManipulations";
import Coordinates from "../classes/Coordinates";
import Direction from "../classes/Direction";
import { Reference } from "../types";
import toReferenceCoordinates from "./toReferenceCoordinates"

const dataToZijd = (data: IPmdData, graphSize: number, reference: Reference) => {

  const steps = data.steps;

  const coords = steps.map((step) => {
    const xyz = new Coordinates(step.x, step.y, step.z);
    const normalizedCoords = xyz.toUnit().multiplyAll(graphSize);
    const inReferenceCoords = toReferenceCoordinates(reference, data.metadata, normalizedCoords);
    return inReferenceCoords;
  });

  const horizontalProjectionData: Array<[number, number]> = []; // "x" is Y, "y" is X 
  const verticalProjectionData: Array<[number, number]> = []; // "x" is Y, "y" is Z
  const directionalData: Array<[number, number]> = []; // dec, inc

  coords.forEach((step) => {
    const horX = step.x + graphSize;
    const horY = step.y + graphSize;
    const verX = step.x + graphSize;
    const verZ = step.z + graphSize;
    const direction = step.toDirection();

    horizontalProjectionData.push([horX, horY]);
    verticalProjectionData.push([verX, verZ]);
    directionalData.push([direction.declination, direction.inclination]);
  });
  
  return {horizontalProjectionData, verticalProjectionData, directionalData};

};

export default dataToZijd;
