import { IPmdData } from "../../../utils/files/fileManipulations";
import Coordinates from "../classes/Coordinates";
import { Reference } from "../types";
import toReferenceCoordinates from "./toReferenceCoordinates";

const dataToMag = (data: IPmdData, graphSize: number, reference: Reference) => {

  const steps = data.steps;
  const mag: Array<number> = [];
  const stepValues: Array<number> = [];

  steps.forEach((step) => {
    mag.push(step.mag);
    stepValues.push(+step.step.match(/\d+/)![0]);
  });

  const maxMag = Math.max(...mag);
  const maxStep = Math.max(...stepValues);
  const maxStepOrder = maxStep.toFixed(0).length - 1;
  const stepsCeil = Math.ceil(maxStep / Math.pow(10, maxStepOrder)) * Math.pow(10, maxStepOrder);
  
  const xyData: Array<[number, number]> = stepValues.map((step, index) => {
    const normalizedMAG = mag[index] / maxMag;
    const x = step * (graphSize / stepsCeil);
    const y = (1 - normalizedMAG) * graphSize;
    return [x, y]; // "x" is stepValue, "y" is normalizedMAG
  });

  const stepLabels: Array<string> = [];
  for (let i = 0; i <= stepsCeil; i += Math.pow(10, maxStepOrder)) {
    stepLabels.push(i.toString());
  };
  
  return { xyData, stepLabels, maxMag };

};

export default dataToMag;
