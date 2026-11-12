// @ts-nocheck
export const getVerticalStackedBarRect = ({ segment, yScale, barWidth }) => {
  const { x } = segment.point;
  const startY = yScale(segment.startValue);
  const endY = yScale(segment.endValue);
  if (!Number.isFinite(x) || !Number.isFinite(startY) || !Number.isFinite(endY)) {
    return null;
  }
  const yStart = Math.min(startY, endY);
  const height = Math.abs(startY - endY);
  return {
    x: x - barWidth / 2,
    y: yStart,
    width: barWidth,
    height,
  };
};
