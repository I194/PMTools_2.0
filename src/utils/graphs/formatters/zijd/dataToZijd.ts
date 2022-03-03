import { IPmdData } from "../../../files/fileManipulations";
import Coordinates from "../../classes/Coordinates";
import { PCALines, Reference, StatisticsModePCA, TooltipDot } from "../../types";
import { RawStatisticsPCA } from "../../../GlobalTypes";
import toReferenceCoordinates from "../toReferenceCoordinates";
import createPCALines from "./pcaToZijd";
import Graphs from "../../../../pages/PCAPage/Graphs";

const dataToZijd = (
  data: IPmdData, 
  graphSize: number, 
  reference: Reference, 
  statistics: RawStatisticsPCA | null,
  unitCount: number
) => {
  const steps = data.steps;

  // annotations for dots ('id' field added right in the Data.tsx as dot index)
  const labels = steps.map((step) => step.step); 

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
    const maxEdgeCoord = Math.max(Math.abs(edges.x), Math.abs(edges.y), Math.abs(edges.z));
    const scaling = graphSize / maxEdgeCoord;
    rotatedCenterMass = toReferenceCoordinates(reference, data.metadata, centerMass).multiplyAll(graphSize / maxCoord);
    rotatedEdges = toReferenceCoordinates(reference, data.metadata, edges).multiplyAll(scaling);
  };

  const pcaLines = createPCALines(rotatedCenterMass, rotatedEdges, 'W, UP', graphSize);

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
