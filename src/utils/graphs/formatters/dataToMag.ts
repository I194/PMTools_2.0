import { IPmdData } from "../../../utils/files/fileManipulations";
import Coordinates from "../classes/Coordinates";
import { Reference, TooltipDot } from "../types";
import toReferenceCoordinates from "./toReferenceCoordinates";

const dataToMag = (data: IPmdData, graphSize: number) => {

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

  const mag: Array<number> = [];
  const stepValues: Array<number> = [];

  steps.forEach((step) => {
    mag.push(step.mag);
    stepValues.push(+step.step.match(/\d+/)![0]);
  });

  const maxMAG = Math.max(...mag);
  const maxStep = Math.max(...stepValues);
  const maxStepOrder = maxStep.toFixed(0).length - 1;
  const stepsCeil = Math.ceil(maxStep / Math.pow(10, maxStepOrder)) * Math.pow(10, maxStepOrder);
  
  const xyData: Array<[number, number]> = stepValues.map((step, index) => {
    const normalizedMAG = mag[index] / maxMAG;
    const x = step * (graphSize / stepsCeil);
    const y = (1 - normalizedMAG) * graphSize;
    return [x, y]; // "x" is stepValue, "y" is normalizedMAG
  });

  const stepLabels: Array<string> = [];
  for (let i = 0; i <= stepsCeil; i += Math.pow(10, maxStepOrder)) {
    stepLabels.push(i.toString());
  };

  const demagnetizationType = data.steps[0].demagType;
  
  return { 
    xyData, 
    stepLabels, 
    maxMAG,
    tooltipData,
    labels,
    demagnetizationType,
  };

};

export default dataToMag;
