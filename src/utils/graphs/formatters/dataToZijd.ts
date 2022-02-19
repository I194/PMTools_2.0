import { IPmdData } from "../../../utils/files/fileManipulations";
import Coordinates from "../classes/Coordinates";
import Direction from "../classes/Direction";
import { Reference } from "../types";
import toReferenceCoordinates from "./toReferenceCoordinates"

const dataToZijd = (data: IPmdData, graphSize: number, reference: Reference) => {

  const steps = data.steps;

  const factor = Math.min(...steps.map((step) => new Coordinates(step.x, step.y, step.z).length));

  const resizedCoords = steps.map((step) => {
    const xyz = new Coordinates(step.x, step.y, step.z);
    const inReferenceCoords = toReferenceCoordinates(reference, data.metadata, xyz);
    const normalizedCoords = inReferenceCoords.multiplyAll(1 / factor);
    return normalizedCoords;
  });

  const maxCoord = Math.max(...resizedCoords.map((step) => Math.max(Math.abs(step.x), Math.abs(step.y), Math.abs(step.z))));
  const adjustedCoords = resizedCoords.map((coords) => coords.multiplyAll(graphSize / (maxCoord)));

  const horizontalProjectionData: Array<[number, number]> = []; // "x" is Y, "y" is X 
  const verticalProjectionData: Array<[number, number]> = []; // "x" is Y, "y" is Z
  const directionalData: Array<[number, number]> = []; // dec, inc

  adjustedCoords.forEach((step) => {
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
