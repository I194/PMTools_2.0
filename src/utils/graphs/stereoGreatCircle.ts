import Coordinates from "./classes/Coordinates";
import { IPmdData } from "../GlobalTypes";
import { Reference } from "./types";
import toReferenceCoordinates from "./formatters/toReferenceCoordinates";

const EPS = 1e-8;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const toUnit = (v: Coordinates) => v.length === 0 ? v : v.toUnit();

const slerp = (u: Coordinates, v: Coordinates, t: number) => {
  const dot = clamp(u.toUnit().dot(v.toUnit()), -1, 1);
  const theta = Math.acos(dot);
  if (theta < EPS) {
    // Nearly identical: linear interpolate and normalize
    const lin = new Coordinates(
      (1 - t) * u.x + t * v.x,
      (1 - t) * u.y + t * v.y,
      (1 - t) * u.z + t * v.z,
    );
    return toUnit(lin);
  }
  const sinTheta = Math.sin(theta);
  const a = Math.sin((1 - t) * theta) / sinTheta;
  const b = Math.sin(t * theta) / sinTheta;
  const res = new Coordinates(
    a * u.x + b * v.x,
    a * u.y + b * v.y,
    a * u.z + b * v.z,
  );
  return toUnit(res);
};

/**
 * Generate a 2D polyline (in current reference) approximating the great-circle arc
 * between two steps by their IDs. The points are already projected for the given graph size.
 */
export const generateArc2DForPair = (
  data: IPmdData,
  ref: Reference,
  graphSize: number,
  idA: number,
  idB: number,
  maxStepDeg: number = 3,
): Array<[number, number]> => {
  const stepA = data.steps.find(s => s.id === idA);
  const stepB = data.steps.find(s => s.id === idB);
  if (!stepA || !stepB) return [];

  const aRef = toReferenceCoordinates(ref, data.metadata, new Coordinates(stepA.x, stepA.y, stepA.z));
  const bRef = toReferenceCoordinates(ref, data.metadata, new Coordinates(stepB.x, stepB.y, stepB.z));

  let u = toUnit(aRef);
  let v = toUnit(bRef);

  // Handle opposite (antipodal) vectors: choose a stable slight nudge
  if (Math.abs(u.toUnit().dot(v.toUnit()) + 1) < 1e-6) {
    // If antipodal, perturb v slightly in a deterministic way
    v = toUnit(new Coordinates(v.x + 1e-6, v.y - 1e-6, v.z + 2e-6));
  }

  const angleRad = Math.acos(clamp(u.toUnit().dot(v.toUnit()), -1, 1));
  const stepRad = (maxStepDeg * Math.PI) / 180;
  const segments = Math.max(1, Math.ceil(angleRad / Math.max(stepRad, 1e-6)));
  const points: Array<[number, number]> = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = slerp(u, v, t).toDirection().toCartesian2DForGraph(graphSize);
    points.push([p[0], p[1]]);
  }

  return points;
};

export const makePairKey = (idA: number, idB: number) => `${idA}->${idB}`;


