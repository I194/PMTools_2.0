export function calculateTolerance(precision: number): number {
  return Math.pow(10, -precision) / 2;
}
