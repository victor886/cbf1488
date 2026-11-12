/**
 * Indicator frame derived from the pager position.
 */
/**
 * Interpolates the indicator frame between the measured triggers on either
 * side of the continuous pager position.
 *
 * The indicator is absolutely positioned with heroui-native's physical
 * `left: 0`, which React Native re-anchors to the right edge only under
 * app-wide RTL (`I18nManager.forceRTL`). `onLayout` reports `x` from the left
 * edge in every direction, so the offset is re-based only when that anchor
 * swap is active (mirrors `Tabs.Indicator`).
 *
 * @param options - Geometry inputs
 * @param options.progress - Continuous pager position (logical page index)
 * @param options.measurements - Trigger measurements in page order
 * @param options.listWidth - Measured width of the tab strip
 * @param options.isAnchorMirrored - Whether `left: 0` is re-anchored to the
 *   right edge by app-wide RTL
 * @returns The indicator frame, or `null` until the triggers around the
 *   position have been measured
 */
export function getIndicatorGeometry(options) {
  'worklet';
  const { progress, measurements, listWidth, isAnchorMirrored } = options;
  const count = measurements.length;
  if (count === 0 || (isAnchorMirrored && listWidth === 0)) {
    return null;
  }
  const clamped = Math.min(Math.max(progress, 0), count - 1);
  const fromIndex = Math.floor(clamped);
  const toIndex = Math.min(fromIndex + 1, count - 1);
  const fraction = clamped - fromIndex;
  const from = measurements[fromIndex];
  const to = measurements[toIndex] ?? from;
  if (!from || !to) {
    return null;
  }
  const x = from.x + (to.x - from.x) * fraction;
  const width = from.width + (to.width - from.width) * fraction;
  const height = from.height + (to.height - from.height) * fraction;
  const translateX = isAnchorMirrored && listWidth > 0 ? x - (listWidth - width) : x;
  return {
    translateX,
    width,
    height,
  };
}
