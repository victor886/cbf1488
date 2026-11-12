// @ts-nocheck
import { useMemo } from 'react';
import { FillType, Skia } from '../../skia';
import { buildPath } from '../../utils/buildPath';
export const useSlicePath = ({ slice }) => {
  const path = useMemo(() => {
    const { radius, center, startAngle, endAngle, innerRadius } = slice;
    return buildPath((builder) => {
      // Draw the outer arc
      builder.arcToOval(
        Skia.XYWHRect(center.x - radius, center.y - radius, radius * 2, radius * 2),
        startAngle,
        endAngle - startAngle,
        false
      );
      if (slice.sliceIsEntireCircle) {
        // If there's only one data point, draw the entire circle
        builder.addOval(
          Skia.XYWHRect(center.x - radius, center.y - radius, radius * 2, radius * 2)
        );
      }
      if (innerRadius > 0) {
        if (slice.sliceIsEntireCircle) {
          builder.addOval(
            Skia.XYWHRect(
              center.x - innerRadius,
              center.y - innerRadius,
              innerRadius * 2,
              innerRadius * 2
            )
          );
          builder.setFillType(FillType.EvenOdd);
        } else {
          // Draw the inner arc in reverse
          builder.arcToOval(
            Skia.XYWHRect(
              center.x - innerRadius,
              center.y - innerRadius,
              innerRadius * 2,
              innerRadius * 2
            ),
            endAngle,
            startAngle - endAngle,
            false
          );
        }
      } else {
        // If no inner radius, just draw a line back to the center (traditional pie slice)
        builder.lineTo(center.x, center.y);
      }
    });
  }, [slice]);
  return path;
};
