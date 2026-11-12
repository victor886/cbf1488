// @ts-nocheck
import { getBarWidth } from '../utils/getBarWidth';
export const useBarWidth = ({ customBarWidth, chartBounds, innerPadding, barCount, points }) => {
  return getBarWidth({
    customBarWidth,
    chartBounds,
    innerPadding,
    barCount,
    points,
  });
};
