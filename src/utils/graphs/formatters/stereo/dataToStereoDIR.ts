import { IDirData, RawStatisticsDIR } from "../../../GlobalTypes";
import Coordinates from "../../classes/Coordinates";
import { DotsData, MeanDirection, Reference, TooltipDot } from "../../types";
import toReferenceCoordinates from "../toReferenceCoordinates";
import { dirToCartesian2D } from "../../dirToCartesian";
import { graphSelectedDotColor } from "../../../ThemeConstants";
import createStereoPlaneData from "./createPlaneData/createStereoPlaneData";
import Direction from "../../classes/Direction";
import { strangeRotation } from "../../../statistics/matrix";
import calculateCutoff from "../../../statistics/calculation/calculateCutoff";
 
const dataToStereoDIR = (
  data: IDirData, 
  graphSize: number, 
  reference: Reference,
  hiddenDirectionsIDs: Array<number>,
  reversedDirectionsIDs: Array<number>,
  centeredByMean?: boolean,
  statistics?: RawStatisticsDIR,
  cutoffType?: '45' | 'vandamme',
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

  // mean direction calculation
  let meanDirection: MeanDirection = null;
  if (statistics) {
    const mean = statistics.mean[reference as 'geographic' | 'stratigraphic']; 
    const { direction, MAD } = mean;
    const centeredDirection = new Direction(0, 90, 1);
    // let centeredDirectionCoords = new Direction(0, 90, 1).toCartesian();
    // const firstRotation = centeredDirectionCoords.rotateTo(0, 90);
    // const secondRotation = firstRotation//.rotateTo(0, direction.inclination - 90);
    // const centeredDirection = secondRotation.toDirection();

    const [declination, inclination] = centeredByMean ? centeredDirection.toArray() : direction.toArray(); 
    const meanXYData = dirToCartesian2D(declination - 90, inclination, graphSize);
    const confidenceCircle = createStereoPlaneData(centeredByMean ? centeredDirection : direction, graphSize, MAD);
    const greatCircle = createStereoPlaneData(centeredByMean ? centeredDirection : direction, graphSize);

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

  
  // 1) get inReference directional data
  const directionalData: Array<[number, number]> = directions.map((direction) => {
    const { Dgeo, Igeo, Dstrat, Istrat } = direction;
    const inReferenceCoords: [number, number]  = reference === 'stratigraphic' ? [Dstrat, Istrat] : [Dgeo, Igeo];
    let finalCoords: [number, number] = inReferenceCoords;
    if (centeredByMean && meanDirection) {
      const directionVector = new Direction(finalCoords[0], finalCoords[1], 1)//.toCartesian();
      const firstRotationDirection = new Direction(meanDirection.dirData[0], 0, 1);
      const secondRotationDirection = new Direction(0, meanDirection.dirData[1] - 90, 1);
      // const firstRotation = directionVector.rotateTo(meanDirection.dirData[0] - 90, 0);
      // const secondRotation = firstRotation.rotateTo(0, meanDirection.dirData[1]);
      const firstRotation = strangeRotation(directionVector, firstRotationDirection);
      const secondRotation = strangeRotation(firstRotation, secondRotationDirection);
      finalCoords = secondRotation.toArray();
    }
    return finalCoords;
  });

  const dotsData: DotsData = directionalData.map((di, index) => {
    let coords = dirToCartesian2D(di[0] - 90, di[1], graphSize);
    const direction = new Direction(di[0], di[1], 1);
    const a95 = directions[index] ? directions[index].mad : 0;
    const confidenceCircle = createStereoPlaneData(direction, graphSize, a95);
    return {
      id: directions[index].id, 
      xyData: [coords.x, coords.y],
      dirData: di,
      confidenceCircle: {
        xyData: confidenceCircle.all, 
        xyDataSplitted: confidenceCircle, 
        color: '#000'
      },
    };
  });

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

  let cutoff = null;
  if (cutoffType) {
    const toCutoffDirs = directions.map((direction) => {
      const { Dgeo, Igeo, Dstrat, Istrat } = direction;
      const inReferenceDirs: [number, number]  = reference === 'stratigraphic' ? [Dstrat, Istrat] : [Dgeo, Igeo];
      return new Direction(inReferenceDirs[0], inReferenceDirs[1], 1);
    });
    cutoff = calculateCutoff(toCutoffDirs, cutoffType).cutoffValue;
  }
  
  return {
    directionalData, 
    dotsData,
    tooltipData,
    labels,
    meanDirection,
    cutoff,
  };
}

export default dataToStereoDIR;
