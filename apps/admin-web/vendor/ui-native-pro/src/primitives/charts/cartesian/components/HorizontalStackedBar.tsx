// @ts-nocheck
import * as React from 'react';
import { Path } from '../../skia';
import { useCartesianChartContext } from '../contexts/CartesianChartContext';
import { useHorizontalStackedBarPaths } from '../hooks/useHorizontalStackedBarPaths';
import { AnimatedPath } from './AnimatedPath';
const DEFAULT_COLORS = ['red', 'orange', 'blue', 'green', 'blue', 'purple'];
export const HorizontalStackedBar = ({
  points,
  chartBounds,
  animate,
  innerPadding = 0.25,
  barWidth,
  barCount,
  barOptions,
  colors = DEFAULT_COLORS,
}) => {
  const { orientation } = useCartesianChartContext();
  const paths = useHorizontalStackedBarPaths({
    points,
    chartBounds,
    innerPadding,
    barWidth,
    barCount,
    barOptions,
    colors,
  });
  if (orientation !== 'horizontal') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'HorizontalStackedBar must be rendered inside a CartesianChart with orientation="horizontal".'
      );
    }
    return null;
  }
  return (
    <>
      {paths.map((p) => {
        return React.createElement(animate ? AnimatedPath : Path, {
          ...p,
          style: 'fill',
          ...(Boolean(animate) && {
            animate,
          }),
        });
      })}
    </>
  );
};
