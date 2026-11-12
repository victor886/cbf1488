// @ts-nocheck
import { useEvent, useHandler } from 'react-native-reanimated';
/**
 * Worklet `onPageScroll` handler for an animated `PagerView`. Mirrors the
 * native scroll position into `progress` on the UI thread, so header parts
 * track swipes and tap-driven page slides frame by frame without a JS round
 * trip.
 *
 * `progress` is always a logical page index. On iOS, pager-view derives
 * `onPageScroll` from the collection view's physical `contentOffset.x`, so
 * under an RTL `layoutDirection` (logical page 0 on the physical right) the
 * reported position is mirrored and is flipped back here. Android's
 * ViewPager2 already reports logical positions in RTL.
 *
 * @param options - Handler options
 * @param options.progress - Shared pager position to write
 * @param options.pageCount - Number of pages (for the RTL mirror)
 * @param options.isPositionMirrored - Whether native positions are physical
 *   and must be mirrored (iOS under RTL)
 * @returns Event handler for the animated pager's `onPageScroll` prop
 */
export function useTabsPagerScrollHandler(options: any) {
  const { progress, pageCount, isPositionMirrored } = options;
  const handlers = {
    onPageScroll: (event) => {
      'worklet';
      const position = event.position + event.offset;
      progress.set(isPositionMirrored ? pageCount - 1 - position : position);
    },
  };
  const { doDependenciesDiffer } = useHandler(handlers, [isPositionMirrored, pageCount, progress]);
  return useEvent(
    (event) => {
      'worklet';
      if (event.eventName.endsWith('onPageScroll')) {
        handlers.onPageScroll(event);
      }
    },
    ['onPageScroll'],
    doDependenciesDiffer
  );
}
