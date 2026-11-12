// @ts-nocheck
import * as React from 'react';
import { Skia } from '../../skia';
import { createRoundedRectPath } from '../../utils/createRoundedRectPath';
import { useCartesianChartContext } from '../contexts/CartesianChartContext';
import { getBarThickness } from '../utils/getBarThickness';
import { getHorizontalStackedBarRect } from '../utils/getHorizontalStackedBarRect';
import {
  getHorizontalStackedBarOptionsContext,
  getStackedBarSegments,
} from '../utils/getStackedBarSegments';
const DEFAULT_COLORS = ['red', 'orange', 'blue', 'green', 'blue', 'purple'];
const DEFAULT_BAR_OPTIONS = () => ({});
export const useHorizontalStackedBarPaths = ({
  points,
  chartBounds,
  innerPadding = 0.25,
  barWidth: customBarWidth,
  barCount,
  barOptions = DEFAULT_BAR_OPTIONS,
  colors = DEFAULT_COLORS,
}) => {
  const { xScale } = useCartesianChartContext();
  const barWidth = getBarThickness({
    points,
    axisStart: chartBounds.top,
    axisEnd: chartBounds.bottom,
    innerPadding,
    customBarThickness: customBarWidth,
    barCount,
  });
  const paths = React.useMemo(() => {
    const bars = [];
    const segments = getStackedBarSegments(points);
    segments.forEach((segment) => {
      const rect = getHorizontalStackedBarRect({
        segment,
        xScale,
        barWidth,
      });
      if (!rect) return;
      const options = barOptions(getHorizontalStackedBarOptionsContext(segment));
      const { roundedCorners, color, ...ops } = options;
      const path = Skia.PathBuilder.Make();
      if (roundedCorners) {
        const nonUniformRoundedRect = createRoundedRectPath(
          rect.x,
          rect.y,
          rect.width,
          rect.height,
          roundedCorners,
          segment.value,
          'horizontal'
        );
        path.addRRect(nonUniformRoundedRect);
      } else {
        path.addRect(Skia.XYWHRect(rect.x, rect.y, rect.width, rect.height));
      }
      bars.push({
        path: path.detach(),
        key: `${segment.seriesIndex}-${segment.datumIndex}`,
        color: color ?? colors[segment.seriesIndex],
        ...ops,
      });
    });
    return bars;
  }, [barOptions, barWidth, colors, points, xScale]);
  return paths;
};
