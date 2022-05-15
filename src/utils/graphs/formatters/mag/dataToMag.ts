import { IPmdData } from "../../../GlobalTypes";
import Coordinates from "../../classes/Coordinates";
import { DotsData, Reference, TooltipDot } from "../../types";
import toReferenceCoordinates from "../toReferenceCoordinates";

const dataToMag = (
  data: IPmdData, 
  graphSize: number,
  hiddenStepsIDs: Array<number>,
) => {

  const steps = data.steps.filter((step, index) => !hiddenStepsIDs.includes(index + 1));
  
  const labels = steps.map((step) => step.step);

  const tooltipData: Array<TooltipDot> = steps.map((step, index) => {
    const xyz = new Coordinates(step.x, step.y, step.z);
    const direction = xyz.toDirection();
    return {
      '№': index + 1,
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
    const stepValue = step.step.match(/\d+/);
    stepValues.push(stepValue ? +stepValue[0] : 0);
  });

  const maxMAG = Math.max(...mag);
  const maxStep = Math.max(...stepValues);
  const maxStepOrder = maxStep.toFixed(0).length - 1;
  const stepsCeil = Math.ceil(maxStep / Math.pow(10, maxStepOrder)) * Math.pow(10, maxStepOrder);
  
  const dotsData: DotsData = stepValues.map((value, index) => {
    const normalizedMAG = mag[index] / maxMAG;
    const x = value * (graphSize / stepsCeil);
    const y = (1 - normalizedMAG) * graphSize;
    return {id: steps[index].id, xyData: [x, y]}; // "x" is stepValue, "y" is normalizedMAG
  });

  const stepLabels: Array<string> = [];
  for (let i = 0; i <= stepsCeil; i += Math.pow(10, maxStepOrder)) {
    stepLabels.push(i.toString());
  };

  const demagnetizationType = data.steps[data.steps.length - 1].demagType;
  
  return { 
    dotsData, 
    stepLabels, 
    maxMAG,
    tooltipData,
    labels,
    demagnetizationType,
  };

};

export default dataToMag;
