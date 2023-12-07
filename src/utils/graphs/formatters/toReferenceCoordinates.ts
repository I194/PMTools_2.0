import { IPmdData } from "../../GlobalTypes";
import Coordinates from "../classes/Coordinates";
import { Reference } from "../types";

const toReferenceCoordinates = (
  reference: Reference, 
  metadata: IPmdData['metadata'], 
  coordinates: Coordinates
) => {
  // Function inReferenceCoordinates
  // rotates the coordinates to the reference coordinates
  
  if (reference == "specimen") return coordinates;

  // Иногда по ошибке можно передать вместо coordinates просто объект {x, y, z} и он пройдет тайпчек пропсов и тут это вызовет ошибки ниже
  // И потому, чтобы такие ошибки не допустить, приходится создавать coordsHelper, у которого наверняка определены все методы Coordinates
  const {x, y, z} = coordinates;
  let coordsHelper = new Coordinates(x, y, z);
  // Do the geographic correction
  coordsHelper = coordsHelper.rotateTo(metadata.a, metadata.b);

  if (reference == "geographic") return coordsHelper;

  // Do the stratigraphic correction
  // See Lisa Tauxe: 9.3 Changing coordinate systems; last paragraph
  return coordsHelper.correctBedding(metadata.s, metadata.d);
};

export default toReferenceCoordinates;
