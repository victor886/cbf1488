// @ts-nocheck
import { getTransformComponents } from '../../utils/transform';
const finiteOrFallback = (value, fallback) => {
  'worklet';
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof fallback === 'number' && Number.isFinite(fallback)) {
    return fallback;
  }
  return 0;
};
export const getCartesianTouchCoordinates = ({ touch, transform }) => {
  'worklet';
  const { scaleX, scaleY, translateX, translateY } = getTransformComponents(transform);
  const safeScaleX = scaleX === 0 || !Number.isFinite(scaleX) ? 1 : scaleX;
  const safeScaleY = scaleY === 0 || !Number.isFinite(scaleY) ? 1 : scaleY;
  // `handleTouch` compares against pre-transform canvas-space positions from
  // `tData`, while the gesture handler fills the visible chart container.
  // Invert the active chart transform so a press on transformed content still
  // maps back to the matching data point.
  return {
    x: (finiteOrFallback(touch.x, touch.absoluteX) - translateX) / safeScaleX,
    y: (finiteOrFallback(touch.y, touch.absoluteY) - translateY) / safeScaleY,
  };
};
