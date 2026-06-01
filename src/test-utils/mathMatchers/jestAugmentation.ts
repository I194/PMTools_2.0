declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeCloseToArray(expected: number[], precision?: number): R;
      toBeCloseToDirection(
        expected: { declination: number; inclination: number; length?: number },
        precision?: number,
      ): R;
    }
  }
}

export {};
