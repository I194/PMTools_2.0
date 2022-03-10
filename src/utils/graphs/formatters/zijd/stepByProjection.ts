import { IPmdData, PMDStep } from "../../../GlobalTypes";
import { Projection } from "../../types";
import projectionByReference from "./projectionByReference";

const axesLabelsByProjection = (projection: Projection) => {
  const xyzLabels = projectionByReference(projection, 'specimen');

  const yAxis = xyzLabels.y.split(', ').map(label => {
    if (label.length === 2) {
      const axisName: 'x' | 'y' | 'z' = label[1] as 'x' | 'y' | 'z';
      return {sign: -1, axisName};
    };
    const axisName: 'x' | 'y' | 'z' = label as 'x' | 'y' | 'z';
    return {sign: 1, axisName};
  });

  const xAxis = xyzLabels.x.split(', ').map(label => {
    if (label.length === 2) {
      const axisName: 'x' | 'y' | 'z' = label[1] as 'x' | 'y' | 'z';
      return {sign: -1, axisName};
    };
    const axisName: 'x' | 'y' | 'z' = label as 'x' | 'y' | 'z';
    return {sign: 1, axisName};
  });

  const axesLabels = {yAxis, xAxis};

  return axesLabels;
};

export default axesLabelsByProjection;