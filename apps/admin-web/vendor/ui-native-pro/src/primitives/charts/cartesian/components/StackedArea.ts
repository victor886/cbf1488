// @ts-nocheck
import * as React from 'react';
import { Path } from '../../skia';
import { useStackedAreaPaths } from '../hooks/useStackedAreaPaths';
import { AnimatedPath } from './AnimatedPath';
const DEFAULT_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
export function StackedArea({
  points,
  y0,
  animate,
  curveType,
  colors = DEFAULT_COLORS,
  areaOptions,
}) {
  const paths = useStackedAreaPaths({
    pointsArray: points,
    colors,
    y0,
    curveType,
    areaOptions,
  });
  return paths.map((p) => {
    return React.createElement(animate ? AnimatedPath : Path, {
      ...p,
      ...(Boolean(animate) && {
        animate,
      }),
    });
  });
}
