// @ts-nocheck
import { getBarGroupOffset } from './getBarGroupOffset';
export const getVerticalBarGroupRect = ({
  point,
  baselineY,
  barWidth,
  groupWidth,
  gapWidth,
  barIndex,
}) => {
  const { x, y } = point;
  if (typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return {
    x:
      x +
      getBarGroupOffset({
        groupWidth,
        barWidth,
        gapWidth,
        barIndex,
      }),
    y: Math.min(baselineY, y),
    width: barWidth,
    height: Math.abs(baselineY - y),
  };
};
