// @ts-nocheck
import { downsampleTicks } from '../../utils/tickHelpers';
export const getXAxisTicks = ({ isNumericalData, ix, tickCount, tickValues, xScale }) => {
  if (tickValues) {
    return downsampleTicks(tickValues, tickCount);
  }
  if (!isNumericalData) {
    return downsampleTicks(
      ix.map((_, index) => index),
      tickCount
    );
  }
  return xScale.ticks(tickCount);
};
