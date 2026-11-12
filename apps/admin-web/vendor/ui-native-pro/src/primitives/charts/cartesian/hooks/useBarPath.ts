// @ts-nocheck
import * as React from 'react';
import { Skia } from '../../skia';
import { createRoundedRectPath } from '../../utils/createRoundedRectPath';
import { useCartesianChartContext } from '../contexts/CartesianChartContext';
import { getVerticalBarRect } from '../utils/getVerticalBarRect';
import { useBarWidth } from './useBarWidth';
export const useBarPath = (
  points,
  chartBounds,
  innerPadding = 0.2,
  roundedCorners,
  customBarWidth,
  barCount
) => {
  const { yScale } = useCartesianChartContext();
  const barWidth = useBarWidth({
    points,
    chartBounds,
    innerPadding,
    customBarWidth,
    barCount,
  });
  const path = React.useMemo(() => {
    const builder = Skia.PathBuilder.Make();
    const baselineY = yScale(0);
    points.forEach((point) => {
      const rect = getVerticalBarRect(point, baselineY, barWidth);
      if (!rect) return;
      const yValue = point.yValue;
      if (roundedCorners) {
        const nonUniformRoundedRect = createRoundedRectPath(
          rect.x,
          rect.y,
          rect.width,
          rect.height,
          roundedCorners,
          Number(yValue)
        );
        builder.addRRect(nonUniformRoundedRect);
      } else {
        builder.addRect(Skia.XYWHRect(rect.x, rect.y, rect.width, rect.height));
      }
    });
    return builder.detach();
  }, [barWidth, points, roundedCorners, yScale]);
  return {
    path,
    barWidth,
  };
};
