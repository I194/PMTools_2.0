import { IPmdData } from "../GlobalTypes";
import { Reference } from "./types";

type PairKey = string; // `${idA}->${idB}`

type RefCache = Map<Reference, Map<PairKey, Array<[number, number]>>>;
type SizeCache = Map<number, RefCache>; // graphSize -> per-reference cache
const fileCache = new WeakMap<IPmdData, SizeCache>();

const ensureRefCache = (data: IPmdData, size: number, ref: Reference): Map<PairKey, Array<[number, number]>> => {
  let sizes = fileCache.get(data);
  if (!sizes) {
    sizes = new Map();
    fileCache.set(data, sizes);
  }
  let refs = sizes.get(size);
  if (!refs) {
    refs = new Map();
    sizes.set(size, refs);
  }
  let pairs = refs.get(ref);
  if (!pairs) {
    pairs = new Map();
    refs.set(ref, pairs);
  }
  return pairs;
};

export const getOrComputePairPolyline = (
  data: IPmdData,
  size: number,
  ref: Reference,
  pairKey: PairKey,
  compute: () => Array<[number, number]>,
): Array<[number, number]> => {
  const pairs = ensureRefCache(data, size, ref);
  const cached = pairs.get(pairKey);
  if (cached) return cached;
  const polyline = compute();
  pairs.set(pairKey, polyline);
  return polyline;
};

export const setPairPolyline = (
  data: IPmdData,
  size: number,
  ref: Reference,
  pairKey: PairKey,
  polyline: Array<[number, number]>,
) => {
  const pairs = ensureRefCache(data, size, ref);
  pairs.set(pairKey, polyline);
};

export const clearFileCache = (data: IPmdData) => {
  fileCache.delete(data);
};


