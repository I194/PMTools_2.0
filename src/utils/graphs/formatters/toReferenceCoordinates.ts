import { IPmdData } from "../../files/fileManipulations";
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

  // Do the geographic correction
  coordinates = coordinates.rotateTo(metadata.a, metadata.b);

  if (reference == "geographic") return coordinates;

  // Do the stratigraphic correction
  // See Lisa Tauxe: 9.3 Changing coordinate systems; last paragraph
  return coordinates.correctBedding(metadata.s, metadata.d);
};

export default toReferenceCoordinates;
