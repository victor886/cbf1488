// @ts-nocheck
export function computePieLayout({ canvasSize, size }) {
  const layoutWidth = size ?? canvasSize.width;
  const layoutHeight = size ?? canvasSize.height;
  const radius = Math.min(layoutWidth, layoutHeight) / 2;
  const centerX = (canvasSize.width - layoutWidth) / 2 + layoutWidth / 2;
  const centerY = (canvasSize.height - layoutHeight) / 2 + layoutHeight / 2;
  return {
    centerX,
    centerY,
    radius,
    layoutWidth,
    layoutHeight,
  };
}
