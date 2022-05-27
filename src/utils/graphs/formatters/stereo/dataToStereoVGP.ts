// var vgp_data = {
//   x: site.vgp[system].lng, // declination 0 360
//   y: Math.abs(site.vgp[system].lat), // inclination -90 90
//   inc: site.vgp[system].lat,
//   dotIndex: site.vgp.index,
//   id: site.id,
//   pLat: site.vgp[system].pLat,
//   dp: site.vgp[system].dp,
//   dm: site.vgp[system].dm,
// }

// dataSeriesVGPs.push(vgp_data)

import Coordinates from "../../classes/Coordinates";
import { DotsData, MeanDirection, Reference, TooltipDot } from "../../types";
import toReferenceCoordinates from "../toReferenceCoordinates";
import { dirToCartesian2D } from "../../dirToCartesian";
import { graphSelectedDotColor } from "../../../ThemeConstants";
import createStereoPlaneData from "./createPlaneData/createStereoPlaneData";
import { VGPData } from "../../../GlobalTypes";
import { fisherMean } from "../../../statistics/calculation/calculateFisherMean";
import Direction from "../../classes/Direction";
 
const dataToStereoVGP = (
  data: VGPData, 
  graphSize: number, 
  hiddenDirectionsIDs: Array<number>,
) => {
  const directions = data.filter((direction, index) => !hiddenDirectionsIDs.includes(index + 1));

  // annotations for dots ('id' field added right in the Data.tsx as dot index)
  const labels = directions.map((direction) => direction.label);

  // 1) get inReference directional data
  const directionalData: Array<[number, number]> = directions.map((direction) => {
    const { poleLatitude, poleLongitude } = direction;
    const inReferenceCoords: [number, number]  = [poleLongitude, poleLatitude];
    return inReferenceCoords;
  });

  const dotsData: DotsData = directionalData.map((di, index) => {
    // const coords = dirToCartesian2D(di[0] - 90, di[1], 82.5);
    const coords = new Direction(di[0], di[1], 1).toCartesian2DForGraph(graphSize);
    return {id: directions[index].id, xyData: coords};
  });

  console.log('what', dotsData, directions);
  console.log('what', graphSize)

  const mean = fisherMean(
    directions.map(
      (direction) => new Direction(direction.poleLongitude, direction.poleLatitude, 1)
    )
  );
  const { direction, MAD } = mean;

  const [declination, inclination] = direction.toArray(); // mean dec and inc
  const meanXYData = dirToCartesian2D(declination - 90, inclination, graphSize);
  const confidenceCircle = createStereoPlaneData(direction, graphSize, MAD);

  const tooltip: TooltipDot = {
    title: 'Mean VGP',
    dec: +declination.toFixed(1),
    inc: +inclination.toFixed(1),
    mad: +MAD.toFixed(1),
    meanType: 'fisher',
  };

  const meanDirection: MeanDirection = {
    dirData: direction.toArray(),
    xyData: [meanXYData.x, meanXYData.y],
    confidenceCircle: {
      xyData: confidenceCircle.all, 
      xyDataSplitted: confidenceCircle, 
      color: graphSelectedDotColor('mean')
    },
    tooltip,
  };

  // tooltip data for each dot on graph
  const tooltipData: Array<TooltipDot> = directions.map((direction, index) => {
    return {
      '№': index + 1,
      label: direction.label,
      dec: +directionalData[index][0].toFixed(1),
      inc: +directionalData[index][1].toFixed(1),
    };
  });
  return {
    directionalData, 
    dotsData,
    tooltipData,
    labels,
    meanDirection: meanDirection as MeanDirection,
  };
}

export default dataToStereoVGP;
