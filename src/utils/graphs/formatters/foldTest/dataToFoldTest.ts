import { FoldTestResult, IPmdData } from "../../../GlobalTypes";
import Coordinates from "../../classes/Coordinates";
import { DotsData, Reference, TooltipDot } from "../../types";
import getCDF from "../getCDF";
import toReferenceCoordinates from "../toReferenceCoordinates";

const dataToFoldTest = (
  data: FoldTestResult, 
  graphWidth: number,
  graphHeight: number,
) => {

  const { untilts, savedBootstraps } = data;

  const untiltsCDF = getCDF(untilts);

  const unfoldingMinimun = untilts[parseInt((0.025 * untiltsCDF.length).toString(), 10)] || -50;
  const unfoldingMaximum = untilts[parseInt((0.975 * untiltsCDF.length).toString(), 10)] || 150;

  const cdfDotsData: DotsData = untiltsCDF.map((cdf, index) => {
    const x = (cdf.x + 50) * (graphWidth / 200);
    const y = (1 - cdf.y) * graphHeight;
    const xyData: [number, number] = [x, y];
    return {id: index, xyData};
  });

  const bootstrapDotsData: Array<DotsData> = savedBootstraps.map((bootstrap, index) => {
    const dotsData: DotsData = bootstrap.map((value, index) => {
      const x = (value.x + 50) * (graphWidth / 200);
      const y = (1 - value.y) * graphHeight;
      const xyData: [number, number] = [x, y];
      return {id: index, xyData};
    });
    return dotsData;
  });

  const lowerDotsData: DotsData = [
    {id: 0, xyData: [(unfoldingMinimun + 50) * (graphWidth / 200), 0]},
    {id: 1, xyData: [(unfoldingMinimun + 50) * (graphWidth / 200), graphHeight]},
  ];

  const upperDotsData: DotsData = [
    {id: 0, xyData: [(unfoldingMaximum + 50) * (graphWidth / 200), 0]},
    {id: 1, xyData: [(unfoldingMaximum + 50) * (graphWidth / 200), graphHeight]},
  ];

  const untitlingStartDotsData: DotsData = [
    {id: 0, xyData: [(untiltsCDF[0].x + 50) * (graphWidth / 200), 0]},
    {id: 1, xyData: [(untiltsCDF[0].x + 50) * (graphWidth / 200), graphHeight]},
  ];

  const untitlingEndDotsData: DotsData = [
    {id: 0, xyData: [(untiltsCDF[untiltsCDF.length - 1].x + 50) * (graphWidth / 200), 0]},
    {id: 1, xyData: [(untiltsCDF[untiltsCDF.length - 1].x + 50) * (graphWidth / 200), graphHeight]},
  ];

  console.log(untilts, untiltsCDF, bootstrapDotsData, graphWidth, graphHeight);

  // const labels = steps.map((step) => step.step);

  // const tooltipData: Array<TooltipDot> = steps.map((step, index) => {
  //   const xyz = new Coordinates(step.x, step.y, step.z);
  //   const direction = xyz.toDirection();
  //   return {
  //     '№': index + 1,
  //     step: step.step,
  //     x: step.x,
  //     y: step.y,
  //     z: step.z,
  //     dec: +direction.declination.toFixed(1),
  //     inc: +direction.inclination.toFixed(1),
  //     mag: step.mag.toExponential(2).toUpperCase(),
  //   };
  // })

  // const mag: Array<number> = [];
  // const stepValues: Array<number> = [];

  // steps.forEach((step) => {
  //   mag.push(step.mag);
  //   stepValues.push(+step.step.match(/\d+/)![0]);
  // });

  // const maxMAG = Math.max(...mag);
  // const maxStep = Math.max(...stepValues);
  // const maxStepOrder = maxStep.toFixed(0).length - 1;
  // const stepsCeil = Math.ceil(maxStep / Math.pow(10, maxStepOrder)) * Math.pow(10, maxStepOrder);
  
  // const dotsData: DotsData = stepValues.map((value, index) => {
  //   const normalizedMAG = mag[index] / maxMAG;
  //   const x = value * (graphSize / stepsCeil);
  //   const y = (1 - normalizedMAG) * graphSize;
  //   return {id: steps[index].id, xyData: [x, y]}; // "x" is stepValue, "y" is normalizedMAG
  // });

  // const stepLabels: Array<string> = [];
  // for (let i = 0; i <= stepsCeil; i += Math.pow(10, maxStepOrder)) {
  //   stepLabels.push(i.toString());
  // };

  // const demagnetizationType = data.steps[0].demagType;
  
  return { 
    cdfDotsData,
    bootstrapDotsData,
    lowerDotsData,
    upperDotsData,
    untitlingStartDotsData,
    untitlingEndDotsData,
  };
};

export default dataToFoldTest;
