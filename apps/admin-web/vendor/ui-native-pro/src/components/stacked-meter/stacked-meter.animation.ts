import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native';
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
import {
  getAnimationState,
  getAnimationValueMergedConfig,
  getIsAnimationDisabledValue,
} from '../../helpers/internal/utils/index';
import { DEFAULT_GROW_TIMING_DURATION } from './stacked-meter.constants';
// --------------------------------------------------
/**
 * Animation hook for the {@link StackedMeter} root component.
 *
 * Combines the global, parent, and own `disable-all` animation states so the
 * root can cascade `isAllAnimationsDisabled` to children via
 * `AnimationSettingsProvider`.
 *
 * Priority: Global > Parent > Own.
 */
export function useStackedMeterRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
// --------------------------------------------------
/**
 * Animation hook for the {@link StackedMeter}.Segment component (also used by
 * the internal remainder). Resolves the share transition timing from the
 * `animation` prop, merged with defaults, and the combined disabled state.
 */
export function useStackedMeterSegmentRootAnimation(options) {
  const { animation } = options;
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const growTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig,
    property: 'growTimingConfig',
    defaultValue: {
      duration: DEFAULT_GROW_TIMING_DURATION,
    },
  });
  return {
    growTimingConfig,
    isAnimationDisabled: isAnimationDisabledValue,
  };
}
// --------------------------------------------------
/**
 * Animation hook producing an animated `flexGrow` for a segment (or the
 * remainder). Combined with the CSS `flex-basis: 0`, the grow factor is the
 * element's exact share of the track width left after the gaps, so shares
 * transition smoothly when values change.
 *
 * `flexGrow` has no direction, so the share mirrors with the flex row in RTL
 * without any `useIsRTL()` handling.
 */
export function useStackedMeterSegmentAnimation(options) {
  const { percentage, isAnimationDisabled, growTimingConfig } = options;
  const animatedPercentage = useSharedValue(percentage);
  useEffect(() => {
    animatedPercentage.set(percentage);
  }, [percentage, animatedPercentage]);
  const rSegmentStyle = useAnimatedStyle(() => {
    if (isAnimationDisabled) {
      return {
        flexGrow: percentage,
      };
    }
    return {
      flexGrow: withTiming(animatedPercentage.get(), growTimingConfig),
    };
  });
  return {
    rSegmentStyle,
  };
}
