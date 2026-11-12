/**
 * Fallback placement used before the trigger has been measured.
 * Matches the most common FAB position (bottom corner opening upwards).
 */
const FALLBACK_PLACEMENT = 'top';
/**
 * Fallback alignment used before the trigger has been measured.
 */
const FALLBACK_ALIGN = 'end';
/**
 * Resolves the content placement from the trigger position on screen.
 *
 * Explicit placements pass through unchanged. `"auto"` compares the trigger's
 * vertical center against the screen midpoint: a trigger in the bottom half
 * opens upwards (`"top"`), a trigger in the top half opens downwards
 * (`"bottom"`). Falls back to `"top"` when the trigger is not measured yet.
 *
 * @param placement - Placement prop value from the root
 * @param triggerPosition - Measured trigger position, or null before measure
 * @param dimensions - Screen dimensions used for the midpoint comparison
 * @returns The resolved placement
 */
export function resolvePlacement(placement, triggerPosition, dimensions) {
  if (placement !== 'auto') {
    return placement;
  }
  if (!triggerPosition) {
    return FALLBACK_PLACEMENT;
  }
  const triggerCenterY = triggerPosition.pageY + triggerPosition.height / 2;
  return triggerCenterY > dimensions.height / 2 ? 'top' : 'bottom';
}
/**
 * Resolves the content alignment from the trigger position on screen.
 *
 * Explicit alignments pass through unchanged. `"auto"` splits the axis
 * perpendicular to the resolved placement into thirds: the first third
 * resolves to `"start"`, the last third to `"end"`, and the middle third to
 * `"center"`. For `"top"` / `"bottom"` placements the horizontal position is
 * used; for `"left"` / `"right"` placements the vertical position is used.
 * Falls back to `"end"` when the trigger is not measured yet.
 *
 * @param align - Align prop value from the root
 * @param placement - Resolved placement (defines the alignment axis)
 * @param triggerPosition - Measured trigger position, or null before measure
 * @param dimensions - Screen dimensions used for the thirds comparison
 * @returns The resolved alignment
 */
export function resolveAlign(align, placement, triggerPosition, dimensions) {
  if (align !== 'auto') {
    return align;
  }
  if (!triggerPosition) {
    return FALLBACK_ALIGN;
  }
  const isVerticalPlacement = placement === 'top' || placement === 'bottom';
  const triggerCenter = isVerticalPlacement
    ? triggerPosition.pageX + triggerPosition.width / 2
    : triggerPosition.pageY + triggerPosition.height / 2;
  const axisSize = isVerticalPlacement ? dimensions.width : dimensions.height;
  if (triggerCenter < axisSize / 3) {
    return 'start';
  }
  if (triggerCenter > (axisSize * 2) / 3) {
    return 'end';
  }
  return 'center';
}
