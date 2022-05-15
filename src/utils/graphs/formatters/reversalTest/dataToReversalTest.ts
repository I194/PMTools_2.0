import { CommonMeanTestBootstrapResult, CoordsComparison, FoldTestResult, IPmdData } from "../../../GlobalTypes";
import Coordinates from "../../classes/Coordinates";
import { DotsData, Reference, TooltipDot } from "../../types";
import getCDF from "../getCDF";

const dataToReversalTest = (
  data: CommonMeanTestBootstrapResult,
  graphWidth: number,
  graphHeight: number,
) => {
  const graphX = reversalTestGraph(data.x, graphWidth, graphHeight);
  const graphY = reversalTestGraph(data.y, graphWidth, graphHeight);
  const graphZ = reversalTestGraph(data.z, graphWidth, graphHeight);

  return { graphX, graphY, graphZ };
};

const reversalTestGraph = (
  data: CoordsComparison, 
  graphWidth: number,
  graphHeight: number,
) => {

  const firstCDF = getCDF(data.first);
  const secondCDF = getCDF(data.second);

  const firstMinimum = data.first[parseInt((0.025 * data.first.length).toString(), 10)];
  const firstMaximum = data.first[parseInt((0.975 * data.first.length).toString(), 10)];
  const secondMinimum = data.second[parseInt((0.025 * data.second.length).toString(), 10)];
  const secondMaximum = data.second[parseInt((0.975 * data.second.length).toString(), 10)];

  const firstCDFDotsData: DotsData = firstCDF.map((cdf, index) => {
    const x = (cdf.x + 1) * (graphWidth / 2);
    const y = (1 - cdf.y) * graphHeight;
    const xyData: [number, number] = [x, y];
    return {id: index, xyData};
  });

  const secondCDFDotsData: DotsData = secondCDF.map((cdf, index) => {
    const x = (cdf.x + 1) * (graphWidth / 2);
    const y = (1 - cdf.y) * graphHeight;
    const xyData: [number, number] = [x, y];
    return {id: index, xyData};
  });
  
  const [firstLowerDotsData, firstUpperDotsData, secondLowerDotsData, secondUpperDotsData]: DotsData[] = [firstMinimum, firstMaximum, secondMinimum, secondMaximum].map((value, index) => {
    const x = (value + 1) * (graphWidth / 2);
    return [
      {id: 0, xyData: [x, 0]},
      {id: 1, xyData: [x, graphHeight]},
    ];
  });

  return { 
    firstCDFDotsData,
    secondCDFDotsData,
    firstLowerDotsData,
    firstUpperDotsData,
    secondLowerDotsData,
    secondUpperDotsData,
  };
};

export default dataToReversalTest;
