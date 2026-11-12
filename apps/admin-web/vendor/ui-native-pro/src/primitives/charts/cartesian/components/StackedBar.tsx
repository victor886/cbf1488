// @ts-nocheck
import * as React from 'react';
import { Path } from '../../skia';
import { useStackedBarPaths } from '../hooks/useStackedBarPaths';
import { AnimatedPath } from './AnimatedPath';
const DEFAULT_COLORS = ['red', 'orange', 'blue', 'green', 'blue', 'purple'];
export const StackedBar = ({
  points,
  chartBounds,
  animate,
  innerPadding = 0.25,
  barWidth,
  barCount,
  barOptions = () => ({}),
  colors = DEFAULT_COLORS,
}) => {
  const paths = useStackedBarPaths({
    points,
    chartBounds,
    innerPadding,
    barWidth,
    barCount,
    barOptions,
    colors,
  });
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
