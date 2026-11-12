// @ts-nocheck
export const getBarGroupOffset = ({ groupWidth, barWidth, gapWidth, barIndex }) => {
  return -groupWidth / 2 + barIndex * (barWidth + gapWidth);
};
