import './jestAugmentation';
import { toBeCloseToArray } from './toBeCloseToArray';
import { toBeCloseToDirection } from './toBeCloseToDirection';

expect.extend({
  toBeCloseToArray,
  toBeCloseToDirection,
});

export {};
