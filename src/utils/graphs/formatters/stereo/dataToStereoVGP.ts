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
 
const dataToStereoVGP = (

) => {
  
}

export default dataToStereoVGP;
