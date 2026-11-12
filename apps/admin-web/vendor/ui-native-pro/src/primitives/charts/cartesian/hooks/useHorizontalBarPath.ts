// @ts-nocheck
import * as React from 'react';
import { Skia } from '../../skia';
import { createRoundedRectPath } from '../../utils/createRoundedRectPath';
import { useCartesianChartContext } from '../contexts/CartesianChartContext';
import { getBarThickness } from '../utils/getBarThickness';
import { getHorizontalBarRect } from '../utils/getHorizontalBarRect';
export const useHorizontalBarPath = (
  points,
  chartBounds,
  innerPadding = 0.2,
  roundedCorners,
  customBarWidth,
  barCount
) => {
  const { xScale } = useCartesianChartContext();
  const barWidth = getBarThickness({
    points,
    axisStart: chartBounds.top,
    axisEnd: chartBounds.bottom,
    innerPadding,
    customBarThickness: customBarWidth,
    barCount,
  });
  const path = React.useMemo(() => {
    const builder = Skia.PathBuilder.Make();
    const baselineX = xScale(0);
    points.forEach((point) => {
      const rect = getHorizontalBarRect(point, baselineX, barWidth);
      if (!rect) return;
      if (roundedCorners) {
        const nonUniformRoundedRect = createRoundedRectPath(
          rect.x,
          rect.y,
          rect.width,
          rect.height,
          roundedCorners,
          Number(point.yValue),
          'horizontal'
        );
        builder.addRRect(nonUniformRoundedRect);
      } else {
        builder.addRect(Skia.XYWHRect(rect.x, rect.y, rect.width, rect.height));
      }
    });
    return builder.detach();
  }, [barWidth, points, roundedCorners, xScale]);
  return {
    path,
    barWidth,
  };
};
