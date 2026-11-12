// @ts-nocheck
import { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
import {
  getAnimationState,
  getAnimationValueMergedConfig,
  getAnimationValueProperty,
  getIsAnimationDisabledValue,
} from '../../helpers/internal/utils/index';
import {
  SORT_INDICATOR_OPACITY,
  SORT_INDICATOR_ROTATION,
  SORT_INDICATOR_TIMING_DURATION,
} from './table.constants';
// --------------------------------------------------
/**
 * Animation hook for the {@link Table} root component.
 *
 * The table root owns no animated styles of its own; the hook only combines
 * the global, parent, and own animation-disabled states so the root can
 * cascade `isAllAnimationsDisabled` to descendants (the sort indicator,
 * checkboxes, custom cell content) via `AnimationSettingsProvider`.
 * Priority: Global > Parent > Own.
 */
export function useTableRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
// --------------------------------------------------
/**
 * Animation hook for a {@link Table.Column}'s sort indicator.
 *
 * Fades the indicator in only on the column driving the active sort and
 * rotates the chevron between the ascending (0°) and descending (180°)
 * positions. When animations are disabled (locally or via cascade), both
 * properties snap to their targets.
 *
 * @note RTL: the flip is a rotation between an up- and a down-pointing
 * chevron — direction-neutral glyphs — so no mirroring is required.
 */
export function useTableSortIndicatorAnimation(options) {
  const { animation, isSorted, sortDirection } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const rotationValue = getAnimationValueProperty({
    animationValue: animationConfig?.rotation,
    property: 'value',
    defaultValue: SORT_INDICATOR_ROTATION,
  });
  const rotationTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig?.rotation,
    property: 'timingConfig',
    defaultValue: {
      duration: SORT_INDICATOR_TIMING_DURATION,
    },
  });
  const opacityValue = getAnimationValueProperty({
    animationValue: animationConfig?.opacity,
    property: 'value',
    defaultValue: SORT_INDICATOR_OPACITY,
  });
  const opacityTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig?.opacity,
    property: 'timingConfig',
    defaultValue: {
      duration: SORT_INDICATOR_TIMING_DURATION,
    },
  });
  const rIndicatorStyle = useAnimatedStyle(() => {
    const targetRotation = sortDirection === 'descending' ? rotationValue[1] : rotationValue[0];
    const targetOpacity = isSorted ? opacityValue[1] : opacityValue[0];
    if (isAnimationDisabledValue) {
      return {
        opacity: targetOpacity,
        transform: [
          {
            rotate: `${targetRotation}deg`,
          },
        ],
      };
    }
    return {
      opacity: withTiming(targetOpacity, opacityTimingConfig),
      transform: [
        {
          rotate: withTiming(`${targetRotation}deg`, rotationTimingConfig),
        },
      ],
    };
  }, [
    isAnimationDisabledValue,
    isSorted,
    sortDirection,
    rotationValue,
    opacityValue,
    rotationTimingConfig,
    opacityTimingConfig,
  ]);
  return {
    rIndicatorStyle,
  };
}
