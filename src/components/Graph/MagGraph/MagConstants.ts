export const magAreaConstants = (width: number, height: number, stepLabels: Array<string>) => {
  const graphAreaMargin = 32;
  const unitCountX = stepLabels.length - 1;
  const unitCountY = 10;
  return {
    graphAreaMargin,
    unitCountX,
    unitCountY,
    viewWidth: width + graphAreaMargin * 2,
    viewHeight: height + graphAreaMargin * 2,
    unitX: width / unitCountX,
    unitY: height / unitCountY,
    zeroX: 0,
    zeroY: height,
  };
};