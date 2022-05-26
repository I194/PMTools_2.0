import { IDirData, RawStatisticsDIR } from "../../../GlobalTypes";
import Coordinates from "../../classes/Coordinates";
import { DotsData, MeanDirection, Reference, TooltipDot } from "../../types";
import toReferenceCoordinates from "../toReferenceCoordinates";
import { dirToCartesian2D } from "../../dirToCartesian";
import { graphSelectedDotColor } from "../../../ThemeConstants";
import createStereoPlaneData from "./createPlaneData/createStereoPlaneData";
import Direction from "../../classes/Direction";
 
const dataToStereoDIR = (
  data: IDirData, 
  graphSize: number, 
  reference: Reference,
  hiddenDirectionsIDs: Array<number>,
  reversedDirectionsIDs: Array<number>,
  statistics?: RawStatisticsDIR,
) => {
  let directions = data.interpretations.filter((direction, index) => !hiddenDirectionsIDs.includes(index + 1));
  directions = directions.map((direction, index) => {
    const { id, Dgeo, Igeo, Dstrat, Istrat } = direction;
    let geoDirection = new Direction(Dgeo, Igeo, 1);
    let stratDirection = new Direction(Dstrat, Istrat, 1);
    if (reversedDirectionsIDs.includes(id)) {
      geoDirection = geoDirection.reversePolarity();
      stratDirection = stratDirection.reversePolarity();
    };
    const DgeoFinal = +geoDirection.declination.toFixed(1);
    const IgeoFinal = +geoDirection.inclination.toFixed(1);
    const DstratFinal = +stratDirection.declination.toFixed(1);
    const IstratFinal = +stratDirection.inclination.toFixed(1);
    return {...direction, Dgeo: DgeoFinal, Igeo: IgeoFinal, Dstrat: DstratFinal, Istrat: IstratFinal};
  });

  // annotations for dots ('id' field added right in the Data.tsx as dot index)
  const labels = directions.map((direction) => direction.label);

  // 1) get inReference directional data
  const directionalData: Array<[number, number]> = directions.map((direction) => {
    const { Dgeo, Igeo, Dstrat, Istrat } = direction;
    const inReferenceCoords: [number, number]  = reference === 'stratigraphic' ? [Dstrat, Istrat] : [Dgeo, Igeo];
    return inReferenceCoords;
  });

  const dotsData: DotsData = directionalData.map((di, index) => {
    const coords = dirToCartesian2D(di[0] - 90, di[1], graphSize);
    return {id: directions[index].id, xyData: [coords.x, coords.y]};
  });

  // mean direction calculation
  let meanDirection: MeanDirection = null;
  if (statistics) {
    const mean = statistics.mean[reference as 'geographic' | 'stratigraphic']; 
    const { direction, MAD } = mean;

    const [declination, inclination] = direction.toArray(); // mean dec and inc
    const meanXYData = dirToCartesian2D(declination - 90, inclination, graphSize);
    const confidenceCircle = createStereoPlaneData(direction, graphSize, MAD);
    const greatCircle = createStereoPlaneData(direction, graphSize);

    const tooltip: TooltipDot = {
      title: 'Mean dot',
      dec: +declination.toFixed(1),
      inc: +inclination.toFixed(1),
      mad: +MAD.toFixed(1),
      meanType: statistics.code,
    };

    meanDirection = {
      dirData: direction.toArray(),
      xyData: [meanXYData.x, meanXYData.y],
      confidenceCircle: {
        xyData: confidenceCircle.all, 
        xyDataSplitted: confidenceCircle, 
        color: graphSelectedDotColor('mean')
      },
      greatCircle: (statistics.code === 'gc') 
        ? {
            xyData: greatCircle.all, 
            xyDataSplitted: greatCircle, 
            color: graphSelectedDotColor('mean')
          }
        : undefined,
      tooltip,
    };
  };

  // tooltip data for each dot on graph
  const tooltipData: Array<TooltipDot> = directions.map((direction, index) => {
    return {
      '№': index + 1,
      label: direction.label,
      dec: +directionalData[index][0].toFixed(1),
      inc: +directionalData[index][1].toFixed(1),
      a95: +direction.mad.toFixed(1),
    };
  });
  
  return {
    directionalData, 
    dotsData,
    tooltipData,
    labels,
    meanDirection,
  };
}

export default dataToStereoDIR;
