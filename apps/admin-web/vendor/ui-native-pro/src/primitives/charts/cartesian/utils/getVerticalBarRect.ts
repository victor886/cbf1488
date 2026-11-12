// @ts-nocheck
export const getVerticalBarRect = (point, baselineY, barThickness) => {
  const { x, y } = point;
  if (typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  const yStart = Math.min(baselineY, y);
  const height = Math.abs(baselineY - y);
  return {
    x: x - barThickness / 2,
    y: yStart,
    width: barThickness,
    height,
  };
};
