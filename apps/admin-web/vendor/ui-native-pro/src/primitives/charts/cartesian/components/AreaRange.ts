// @ts-nocheck
import * as React from 'react';
import { Path } from '../../skia';
import { useAreaPath } from '../hooks/useAreaPath';
import { AnimatedPath } from './AnimatedPath';
// Extend PointsArray but make y represent upper bound and y0 lower bound
export function AreaRange({
  upperPoints,
  lowerPoints,
  points,
  animate,
  curveType,
  connectMissingData,
  ...ops
}) {
  const areaRangePoints = React.useMemo(() => {
    if (points) {
      // Create upper bound points going forward
      const forwardPoints = points.map((point) => ({
        ...point,
        y: point.y,
      }));
      // Create lower bound points going backward
      const backwardPoints = [...points].reverse().map((point) => ({
        ...point,
        y: point.y0,
      }));
      // Combine into single array that traces a complete path
      return [...forwardPoints, ...backwardPoints];
    }
    const reverseLowerPoints = [...lowerPoints].reverse();
    return [...upperPoints, ...reverseLowerPoints];
  }, [lowerPoints, points, upperPoints]);
  const { path } = useAreaPath(areaRangePoints, 0, {
    curveType,
    connectMissingData,
  });
  return React.createElement(animate ? AnimatedPath : Path, {
    path,
    style: 'fill',
    ...ops,
    ...(Boolean(animate) && {
      animate,
    }),
  });
}
