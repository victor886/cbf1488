// @ts-nocheck
import { getBarGroupDimensionsForAxis } from './getBarGroupDimensionsForAxis';
export const getBarGroupDimensions = ({
  chartBounds,
  betweenGroupPadding,
  withinGroupPadding,
  groupCount,
  barsPerGroup,
  customBarWidth,
  barCount,
}) => {
  return getBarGroupDimensionsForAxis({
    axisStart: chartBounds.left,
    axisEnd: chartBounds.right,
    betweenGroupPadding,
    withinGroupPadding,
    groupCount,
    barsPerGroup,
    customBarWidth,
    barCount,
  });
};
