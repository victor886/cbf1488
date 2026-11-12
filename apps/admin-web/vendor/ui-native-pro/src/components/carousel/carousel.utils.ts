// @ts-nocheck
import { SNAP_OFFSET_TOLERANCE } from './carousel.constants';
/**
 * Computes the width of one slide from the measured viewport width.
 *
 * With `itemsPerView` slides visible, `ceil(itemsPerView) - 1` gaps are
 * visible alongside them (a fractional slide peeks past the last full gap),
 * so the slide width is the remaining space — after the side padding on
 * both ends — divided by `itemsPerView`.
 *
 * @param options.viewportWidth - Measured width of the slide viewport.
 * @param options.itemsPerView - Number of slides visible per view (fractional values peek).
 * @param options.gap - Gap between adjacent slides in pixels.
 * @param options.sidePadding - Breathing room at both ends of the strip in pixels.
 * @returns The slide width in pixels, or `0` when the viewport is unmeasured.
 */
export function getCarouselItemWidth(options) {
  const { viewportWidth, itemsPerView, gap, sidePadding } = options;
  if (viewportWidth <= 0 || itemsPerView <= 0) {
    return 0;
  }
  const visibleGaps = Math.max(0, Math.ceil(itemsPerView) - 1);
  const width = (viewportWidth - 2 * sidePadding - gap * visibleGaps) / itemsPerView;
  return Math.max(0, width);
}
/**
 * Computes the physical snap offsets of the slide strip, indexed by snap
 * index.
 *
 * Offsets are aligned per `align`, clamped to the scrollable range, and
 * de-duplicated (mirroring Embla's `containScroll: "trimSnaps"`), so the
 * snap count can be smaller than the item count when several slides fit the
 * viewport. In RTL the slide render order is reversed, so each offset is
 * mirrored across the scrollable range (`maxOffset - offset`) to keep snap
 * index `i` pointing at the i-th logical slide.
 *
 * With `sidePadding`, the content row carries that padding at both ends and
 * the aligned positions account for it: edge slides rest with the padding
 * as breathing room (the clamp lands them exactly on it) while intermediate
 * slides keep their `align` position within the full viewport.
 *
 * @param options.viewportWidth - Measured width of the slide viewport.
 * @param options.itemWidth - Computed slide width (see {@link getCarouselItemWidth}).
 * @param options.itemCount - Number of slides.
 * @param options.gap - Gap between adjacent slides in pixels.
 * @param options.sidePadding - Breathing room at both ends of the strip in pixels.
 * @param options.align - Alignment of the selected slide within the viewport.
 * @param options.isRTL - Whether the layout direction is right-to-left.
 * @returns Physical snap offsets indexed by snap index (empty until measured).
 */
export function getCarouselSnapOffsets(options) {
  const { viewportWidth, itemWidth, itemCount, gap, sidePadding, align, isRTL } = options;
  if (viewportWidth <= 0 || itemWidth <= 0 || itemCount <= 0) {
    return [];
  }
  const stride = itemWidth + gap;
  const contentWidth = 2 * sidePadding + itemCount * itemWidth + (itemCount - 1) * gap;
  const maxOffset = Math.max(0, contentWidth - viewportWidth);
  /**
   * Screen x the selected slide's leading edge should rest at. `start` and
   * `end` align to the padded frame (the padding is the resting inset);
   * `center` splits the full viewport.
   */
  const alignTargetX =
    align === 'center'
      ? (viewportWidth - itemWidth) / 2
      : align === 'end'
        ? viewportWidth - itemWidth - sidePadding
        : sidePadding;
  const offsets = [];
  for (let index = 0; index < itemCount; index += 1) {
    const offset = Math.min(maxOffset, Math.max(0, sidePadding + index * stride - alignTargetX));
    const previous = offsets[offsets.length - 1];
    if (previous === undefined || Math.abs(offset - previous) > SNAP_OFFSET_TOLERANCE) {
      offsets.push(offset);
    }
  }
  if (!isRTL) {
    return offsets;
  }
  return offsets.map((offset) => maxOffset - offset);
}
/**
 * Finds the snap index whose offset is nearest to the given physical scroll
 * offset.
 *
 * @param offsetX - Physical scroll offset of the strip.
 * @param snapOffsets - Physical snap offsets indexed by snap index.
 * @returns The nearest snap index, or `0` when there are no offsets.
 */
export function findNearestSnapIndex(offsetX, snapOffsets) {
  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (let index = 0; index < snapOffsets.length; index += 1) {
    const offset = snapOffsets[index];
    if (offset === undefined) {
      continue;
    }
    const distance = Math.abs(offset - offsetX);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  }
  return nearestIndex;
}
/**
 * Clamps a snap index into the valid `[0, count - 1]` range.
 *
 * @param index - Requested snap index.
 * @param count - Number of snap points.
 * @returns The clamped index, or `0` when there are no snap points.
 */
export function clampSnapIndex(index, count) {
  if (count <= 0) {
    return 0;
  }
  return Math.min(count - 1, Math.max(0, index));
}
/**
 * Maps a physical scroll offset onto the continuous snap-index scale.
 *
 * The result is a float in `[0, snapCount - 1]`. Between two snap points it
 * is linearly interpolated from the bracketing offsets, so consumers can
 * interpolate indicator position while the strip is dragged instead of
 * waiting for the snap to settle. Works for both ascending (LTR) and
 * descending (RTL) offset lists.
 *
 * Marked as a worklet so it can run on the UI thread from a derived
 * progress value.
 *
 * @param offsetX - Physical scroll offset of the strip.
 * @param snapOffsets - Physical snap offsets indexed by snap index.
 * @returns Continuous progress aligned with snap indices.
 */
export function getCarouselProgress(offsetX, snapOffsets) {
  'worklet';
  const count = snapOffsets.length;
  if (count <= 1) {
    return 0;
  }
  const first = snapOffsets[0];
  const last = snapOffsets[count - 1];
  if (first === undefined || last === undefined) {
    return 0;
  }
  const minOffset = Math.min(first, last);
  const maxOffset = Math.max(first, last);
  if (offsetX <= minOffset || offsetX >= maxOffset) {
    const distFirst = Math.abs(offsetX - first);
    const distLast = Math.abs(offsetX - last);
    return distFirst <= distLast ? 0 : count - 1;
  }
  for (let index = 0; index < count - 1; index += 1) {
    const start = snapOffsets[index];
    const end = snapOffsets[index + 1];
    if (start === undefined || end === undefined) {
      continue;
    }
    const lo = Math.min(start, end);
    const hi = Math.max(start, end);
    if (offsetX < lo || offsetX > hi) {
      continue;
    }
    if (end === start) {
      return index;
    }
    return index + (offsetX - start) / (end - start);
  }
  return 0;
}
