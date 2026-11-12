// @ts-nocheck
import { getBarThickness } from './getBarThickness';
export const getBarWidth = ({ customBarWidth, chartBounds, innerPadding, barCount, points }) => {
  return getBarThickness({
    axisStart: chartBounds.left,
    axisEnd: chartBounds.right,
    points,
    innerPadding,
    customBarThickness: customBarWidth,
    barCount,
  });
};
