// Linear Congruential Generator with 32-bit unsigned integer state.
// Numerical Recipes parameters: multiplier = 1664525, increment = 1013904223,
// modulus = 2^32.
//
// State is integer (Math.imul + uint32 coercion) so the sequence is
// bit-exact across JS engines and across the planned Phase 7 Rust port.
// The float output is `currentState / 2^32` — exactly representable in float64,
// so the [0, 1) values are also bit-exact across engines.
//
// Use as a drop-in replacement for `Math.random` in bootstrap tests:
//   const seededRng = createSeededRng(42);
//   const sample = items[Math.floor(seededRng.next() * items.length)];
//
// `nextInt(min, max)` uses `Math.floor(next() * range)` and is technically
// biased for ranges close to 2^32, but bias is < 10^-7 for any range below
// ~1000 — irrelevant for bootstrap sample indices we actually use.

export type SeededRng = {
  next: () => number;
  nextInt: (minInclusive: number, maxExclusive: number) => number;
  state: () => number;
};

export function createSeededRng(seed: number): SeededRng {
  let currentState = seed >>> 0;

  const next = (): number => {
    currentState = (Math.imul(currentState, 1664525) + 1013904223) >>> 0;
    return currentState / 0x100000000;
  };

  const nextInt = (minInclusive: number, maxExclusive: number): number => {
    return minInclusive + Math.floor(next() * (maxExclusive - minInclusive));
  };

  const state = (): number => currentState;

  return { next, nextInt, state };
}

export function createSeededRandom(seed: number): () => number {
  const seededRng = createSeededRng(seed);
  return seededRng.next;
}
