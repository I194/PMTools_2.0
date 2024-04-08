import { Projection, Reference } from "../../types";

const axesNamesByReference = (reference: Reference) => {
  if (reference !== 'specimen') return {N: 'N', E: 'E', S: 'S', W: 'W'};
  return {N: 'x', E: 'y', S: '-x', W: '-y'}; 
};

export default axesNamesByReference;