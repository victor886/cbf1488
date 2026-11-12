import { useMemo } from 'react';
import { I18nManager } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';
import { useTabsMeasurements } from 'heroui-native';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
import { getAnimationState, getIsAnimationDisabledValue } from '../../helpers/internal/utils/index';
import { getIndicatorGeometry } from './swipeable-tabs.utils';
// --------------------------------------------------
/**
 * Animation hook for the SwipeableTabs root component.
 * Cascades `disable-all` to the indicator and the pager. The continuous
 * pager position the indicator follows lives in the shared tabs pager state.
 */
export function useSwipeableTabsRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
// --------------------------------------------------
/**
 * Animation hook for `SwipeableTabs.Indicator`.
 * Reads the trigger measurements collected by heroui-native `Tabs`, orders
 * them by page, and interpolates the indicator frame from the pager
 * position, so the indicator slides and resizes with the swipe. When
 * animations are disabled it snaps to the selected trigger.
 */
export function useSwipeableTabsIndicatorAnimation(options) {
  const { animation, progress, values, selectedIndex } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const { measurements, listWidth } = useTabsMeasurements();
  /** Trigger measurements in page order (a page without a trigger is `undefined`). */
  const measurementsByIndex = useMemo(
    () => values.map((pageValue) => measurements[pageValue]),
    [measurements, values]
  );
  /**
   * `left: 0` on the indicator is re-anchored to the right edge only under
   * app-wide RTL with the default swap flag, not under a soft direction.
   */
  const isAnchorMirrored = I18nManager.isRTL && I18nManager.doLeftAndRightSwapInRTL;
  const rContainerStyle = useAnimatedStyle(() => {
    const geometry = getIndicatorGeometry({
      progress: isAnimationDisabledValue ? selectedIndex : progress.get(),
      measurements: measurementsByIndex,
      listWidth,
      isAnchorMirrored,
    });
    if (!geometry) {
      return {
        width: 0,
        height: 0,
        opacity: 0,
        transform: [
          {
            translateX: 0,
          },
        ],
      };
    }
    return {
      width: geometry.width,
      height: geometry.height,
      opacity: 1,
      transform: [
        {
          translateX: geometry.translateX,
        },
      ],
    };
  }, [
    isAnchorMirrored,
    isAnimationDisabledValue,
    listWidth,
    measurementsByIndex,
    progress,
    selectedIndex,
  ]);
  return {
    rContainerStyle,
  };
}
