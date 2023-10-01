export const calculateZijdAreaParams = (width: number, height: number) => {
  const graphAreaMargin = 56;
  return {
    graphAreaMargin,
    viewWidth: width + graphAreaMargin * 2,
    viewHeight: height + graphAreaMargin * 2,
    unit: (width / 10),
    unitCount: 10,
    zeroX: (width / 2),
    zeroY: (height / 2),
  };
};