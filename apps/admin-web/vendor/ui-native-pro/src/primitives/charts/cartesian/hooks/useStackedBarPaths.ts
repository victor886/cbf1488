// @ts-nocheck
import React from 'react';
import { Skia } from '../../skia';
import { createRoundedRectPath } from '../../utils/createRoundedRectPath';
import { useCartesianChartContext } from '../contexts/CartesianChartContext';
import {
  getStackedBarSegments,
  getVerticalStackedBarOptionsContext,
} from '../utils/getStackedBarSegments';
import { getVerticalStackedBarRect } from '../utils/getVerticalStackedBarRect';
import { useBarWidth } from './useBarWidth';
const DEFAULT_COLORS = ['red', 'orange', 'blue', 'green', 'blue', 'purple'];
const DEFAULT_BAR_OPTIONS = () => ({});
export const useStackedBarPaths = ({
  points,
  chartBounds,
  innerPadding = 0.25,
  barWidth: customBarWidth,
  barCount,
  barOptions = DEFAULT_BAR_OPTIONS,
  colors = DEFAULT_COLORS,
}) => {
  const { yScale } = useCartesianChartContext();
  const barWidth = useBarWidth({
    points,
    chartBounds,
    innerPadding,
    customBarWidth,
    barCount,
  });
  const paths = React.useMemo(() => {
    const bars = [];
    const segments = getStackedBarSegments(points);
    segments.forEach((segment) => {
      const rect = getVerticalStackedBarRect({
        segment,
        yScale,
        barWidth,
      });
      if (!rect) return;
      const options = barOptions(getVerticalStackedBarOptionsContext(segment));
      const { roundedCorners, color, ...ops } = options;
      const path = Skia.PathBuilder.Make();
      if (roundedCorners) {
        const nonUniformRoundedRect = createRoundedRectPath(
          rect.x,
          rect.y,
          rect.width,
          rect.height,
          roundedCorners,
          segment.value
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
  }, [barOptions, barWidth, colors, points, yScale]);
  return paths;
};
