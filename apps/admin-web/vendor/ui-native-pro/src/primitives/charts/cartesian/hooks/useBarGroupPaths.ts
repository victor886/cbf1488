// @ts-nocheck
import * as React from 'react';
import { Skia } from '../../skia';
import { createRoundedRectPath } from '../../utils/createRoundedRectPath';
import { useCartesianChartContext } from '../contexts/CartesianChartContext';
import { getBarGroupDimensions } from '../utils/getBarGroupDimensions';
import { getVerticalBarGroupRect } from '../utils/getVerticalBarGroupRect';
export const useBarGroupPaths = (
  points,
  chartBounds,
  betweenGroupPadding = 0,
  withinGroupPadding = 0,
  roundedCorners,
  customBarWidth,
  barCount
) => {
  const numGroups = points[0]?.length || 0;
  const { yScale } = useCartesianChartContext();
  const { barWidth, groupWidth, gapWidth } = getBarGroupDimensions({
    chartBounds,
    betweenGroupPadding,
    withinGroupPadding,
    groupCount: numGroups,
    barsPerGroup: points.length,
    customBarWidth,
    barCount,
  });
  const paths = React.useMemo(() => {
    const baselineY = yScale(0);
    return points.map((pointSet, i) => {
      const p = Skia.PathBuilder.Make();
      pointSet.forEach((point) => {
        const rect = getVerticalBarGroupRect({
          point,
          baselineY,
          barWidth,
          groupWidth,
          gapWidth,
          barIndex: i,
        });
        if (!rect) return;
        if (roundedCorners) {
          const nonUniformRoundedRect = createRoundedRectPath(
            rect.x,
            rect.y,
            rect.width,
            rect.height,
            roundedCorners,
            Number(point.yValue)
          );
          p.addRRect(nonUniformRoundedRect);
        } else {
          p.addRect(Skia.XYWHRect(rect.x, rect.y, rect.width, rect.height));
        }
      });
      return p.detach();
    });
  }, [barWidth, gapWidth, groupWidth, points, roundedCorners, yScale]);
  return {
    barWidth,
    groupWidth,
    gapWidth,
    paths,
  };
};
