// @ts-nocheck
export const getHorizontalBarRect = (point, baselineX, barThickness) => {
  const { x, y } = point;
  if (
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {
    return null;
  }
  const xStart = Math.min(baselineX, x);
  const width = Math.abs(x - baselineX);
  return {
    x: xStart,
    y: y - barThickness / 2,
    width,
    height: barThickness,
  };
};
