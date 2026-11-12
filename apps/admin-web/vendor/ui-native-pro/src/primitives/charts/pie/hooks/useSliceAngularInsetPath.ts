// @ts-nocheck
import { useMemo } from 'react';
import { PaintStyle, Skia } from '../../skia';
import { calculatePointOnCircumference, degreesToRadians } from '../utils/radians';
export const useSliceAngularInsetPath = ({ angularInset, slice }) => {
  const [insetPath, paint] = useMemo(() => {
    const { radius, center, innerRadius } = slice;
    const builder = Skia.PathBuilder.Make();
    // Convert angles to radians for calculations
    const startRadians = degreesToRadians(slice.startAngle);
    const endRadians = degreesToRadians(slice.endAngle);
    if (innerRadius > 0) {
      // Calculate start and end points on the inner circumference
      const startPointInnerRadius = calculatePointOnCircumference(
        center,
        innerRadius,
        startRadians
      );
      const endPointInnerRadius = calculatePointOnCircumference(center, innerRadius, endRadians);
      //  Calculate start and end points on the outer circumference
      const startPointOuterRadius = calculatePointOnCircumference(center, radius, startRadians);
      const endPointOuterRadius = calculatePointOnCircumference(center, radius, endRadians);
      // Move to center, draw line to start point, move to center, draw line to end point
      builder.moveTo(startPointInnerRadius.x, startPointInnerRadius.y);
      builder.lineTo(startPointOuterRadius.x, startPointOuterRadius.y);
      builder.moveTo(endPointInnerRadius.x, endPointInnerRadius.y);
      builder.lineTo(endPointOuterRadius.x, endPointOuterRadius.y);
    } else {
      // Calculate start and end points on the circumference
      const startPoint = calculatePointOnCircumference(center, radius, startRadians);
      const endPoint = calculatePointOnCircumference(center, radius, endRadians);
      // Move to center, draw line to start point, move to center, draw line to end point
      builder.moveTo(center.x, center.y);
      builder.lineTo(startPoint.x, startPoint.y);
      builder.moveTo(center.x, center.y);
      builder.lineTo(endPoint.x, endPoint.y);
    }
    const path = builder.detach();
    // Create Paint for inset
    const insetPaint = Skia.Paint();
    insetPaint.setColor(Skia.Color(angularInset.angularStrokeColor));
    insetPaint.setStyle(PaintStyle.Stroke);
    insetPaint.setStrokeWidth(angularInset.angularStrokeWidth);
    return [path, insetPaint];
  }, [slice, angularInset]);
  return [insetPath, paint];
};
