import { IPmdData } from "../../files/fileManipulations";
import Coordinates from "../classes/Coordinates";
import { Reference } from "../types";

const fromReferenceCoordinates = (
  reference: Reference, 
  metadata: IPmdData['metadata'], 
  coordinates: Coordinates
) => {
  // Function fromReferenceCoordinates
  // Rotates all the way back to specimen coordinates

  if (reference == "specimen") return coordinates;

  // Do the geographic correction
  coordinates = coordinates.rotateFrom(metadata.a, metadata.b);

  if (reference == "geographic") return coordinates;

  // In stratigraphic coordinates: inverse bedding correction
  // and geographic correction at the end
  const dipDirection = metadata.s + 90;
  return (
    coordinates
      .rotateTo(-dipDirection, 90)
      .rotateFrom(0, 90 - metadata.d)
      .rotateTo(dipDirection, 90)
      .rotateFrom(metadata.a, metadata.b)
  );
};

export default fromReferenceCoordinates;
