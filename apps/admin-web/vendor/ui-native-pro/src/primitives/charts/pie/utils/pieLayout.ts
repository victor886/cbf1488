// @ts-nocheck
import { vec } from '../../skia';
import { computePieLayout } from './computePieLayout';
export function getPieLayout({ canvasSize, size }) {
  const { centerX, centerY, radius, layoutWidth, layoutHeight } = computePieLayout({
    canvasSize,
    size,
  });
  return {
    center: vec(centerX, centerY),
    radius,
    layoutWidth,
    layoutHeight,
  };
}
