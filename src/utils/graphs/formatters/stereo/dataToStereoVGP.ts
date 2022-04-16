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
 
const dataToStereoVGP = (
  data: VGPData, 
  graphSize: number, 
  hiddenDirectionsIDs: Array<number>,
  // statistics?: RawStatisticsDIR,
) => {
  const directions = data.filter((direction, index) => !hiddenDirectionsIDs.includes(index + 1));

  // annotations for dots ('id' field added right in the Data.tsx as dot index)
  const labels = directions.map((direction) => direction.label);

  // 1) get inReference directional data
  const directionalData: Array<[number, number]> = directions.map((direction) => {
    const { poleLatitude, poleLongitude } = direction;
    const inReferenceCoords: [number, number]  = [poleLatitude, poleLongitude];
    return inReferenceCoords;
  });

  const dotsData: DotsData = directionalData.map((di, index) => {
    const coords = dirToCartesian2D(di[0] - 90, di[1], graphSize);
    return {id: directions[index].id, xyData: [coords.x, coords.y]};
  });

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
    meanDirection: null,
  };
}

export default dataToStereoVGP;
