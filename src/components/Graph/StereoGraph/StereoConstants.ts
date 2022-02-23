export const stereoAreaConstants = (width: number, height: number) => {
  const graphAreaMargin = 40;
  return {
    graphAreaMargin,
    viewWidth: width + graphAreaMargin * 2,
    viewHeight: height + graphAreaMargin * 2,
    unit: (width / 18),
    unitCount: 18,
    zeroX: (width / 2),
    zeroY: (height / 2),
  };
};