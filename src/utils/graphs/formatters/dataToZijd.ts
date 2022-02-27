import { IPmdData } from "../../../utils/files/fileManipulations";
import Coordinates from "../classes/Coordinates";
import { PCALines, Reference, StatisticsModePCA, TooltipDot } from "../types";
import { StatisticsPCA } from "../../GlobalTypes";
import toReferenceCoordinates from "./toReferenceCoordinates";
import createPCALines from "./pcaToZijd";

const dataToZijd = (
  data: IPmdData, 
  graphSize: number, 
  reference: Reference, 
  statistics: StatisticsPCA | null,
  unitCount: number
) => {
  const steps = data.steps;

  // annotations for dots ('id' field added right in the Data.tsx as dot index)
  const labels = steps.map((step) => step.step); 

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
      dec: +direction.declination.toFixed(1),
      inc: +direction.inclination.toFixed(1),
      mag: step.mag.toExponential(2).toUpperCase(),
    };
  });

  // 1) rotate dots coords to reference direction 
  // 2) adjustment of rotated coords to fit graph size
  // 3) filling arrays of projected and directed data
  const rotatedCoords = steps.map((step) => {
    const xyz = new Coordinates(step.x, step.y, step.z);
    let inReferenceCoords = toReferenceCoordinates(reference, data.metadata, xyz);
    return inReferenceCoords;
  });

  const maxCoord = Math.max(...rotatedCoords.map((step) => Math.max(Math.abs(step.x), Math.abs(step.y), Math.abs(step.z))));
  const adjustedCoords = rotatedCoords.map((coords) => coords.multiplyAll(graphSize / (maxCoord)));

  const horizontalProjectionData: Array<[number, number]> = []; // "x" is Y, "y" is X 
  const verticalProjectionData: Array<[number, number]> = []; // "x" is Y, "y" is Z
  const directionalData: Array<[number, number]> = []; // dec, inc

  adjustedCoords.forEach((step) => {
    // depends on selected projection system
    const horX = step.x + graphSize;
    const horY = step.y + graphSize;
    const verX = step.x + graphSize;
    const verZ = step.z + graphSize;
    const direction = step.toDirection();

    horizontalProjectionData.push([horX, horY]);
    verticalProjectionData.push([verX, verZ]);
    directionalData.push([direction.declination, direction.inclination]);
  });

  // 'calculation' of unit label, using in Unit component
  const unitLabel = (maxCoord / unitCount).toExponential(2).toUpperCase();

  // pcaLines calculation  
  let rotatedCenterMass: Coordinates | null = null;
  let rotatedEdges: Coordinates | null = null;
  if (statistics) {
    const { centerMass, edges } = statistics.component;
    const maxStatCoord = Math.max(
      Math.abs(centerMass.x), Math.abs(centerMass.y), Math.abs(centerMass.z),
      Math.abs(edges.x), Math.abs(edges.y), Math.abs(edges.z),
    );
    rotatedCenterMass = toReferenceCoordinates(reference, data.metadata, centerMass)
      .multiplyAll(graphSize/maxStatCoord)
    rotatedEdges = toReferenceCoordinates(reference, data.metadata, edges)
      .multiplyAll(graphSize/maxStatCoord)
  };
  const pcaLines = createPCALines(rotatedCenterMass, rotatedEdges, 'W, UP', graphSize);

  console.log(pcaLines, statistics)
  
  return {
    horizontalProjectionData, 
    verticalProjectionData, 
    directionalData, 
    unitLabel,
    tooltipData,
    labels,
    pcaLines,
  };

};

export default dataToZijd;
