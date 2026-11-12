// @ts-nocheck
import { getBarGroupOffset } from './getBarGroupOffset';
export const getHorizontalBarGroupRect = ({
  point,
  baselineX,
  barWidth,
  groupWidth,
  gapWidth,
  barIndex,
}) => {
  const { x, y } = point;
  if (
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    !Number.isFinite(x) ||
    !Number.isFinite(y)
  ) {
    return null;
  }
  return {
    x: Math.min(baselineX, x),
    y:
      y +
      getBarGroupOffset({
        groupWidth,
        barWidth,
        gapWidth,
        barIndex,
      }),
    width: Math.abs(x - baselineX),
    height: barWidth,
  };
};
