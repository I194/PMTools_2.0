export const reversalTestConstants = (width: number, height: number) => {
  const graphAreaMargin = 48;
  const unitCountX = 4;
  const unitCountY = 4;
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