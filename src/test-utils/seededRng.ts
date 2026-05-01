// Linear Congruential Generator with 32-bit unsigned integer state.
// Numerical Recipes parameters: a = 1664525, c = 1013904223, m = 2^32.
//
// State is integer (Math.imul + uint32 coercion) so the sequence is
// bit-exact across JS engines and across the planned Phase 7 Rust port.
// The float output is `state / 2^32` — exactly representable in float64,
// so the [0, 1) values are also bit-exact across engines.
//
// Use as a drop-in replacement for `Math.random` in bootstrap tests:
//   const rng = createSeededRng(42);
//   const sample = items[Math.floor(rng() * items.length)];

export type SeededRng = {
  next: () => number;
  nextInt: (min: number, maxExclusive: number) => number;
  state: () => number;
};

export function createSeededRng(seed: number): SeededRng {
  let s = seed >>> 0;

  const next = (): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };

  const nextInt = (min: number, maxExclusive: number): number => {
    return min + Math.floor(next() * (maxExclusive - min));
  };

  const state = (): number => s;

  return { next, nextInt, state };
}

export function createSeededRandom(seed: number): () => number {
  const rng = createSeededRng(seed);
  return rng.next;
}
