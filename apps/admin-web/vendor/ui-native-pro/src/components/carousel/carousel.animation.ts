// @ts-nocheck
import {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useCombinedAnimationDisabledState, useThemeColor } from 'heroui-native/hooks';
import {
  getAnimationState,
  getAnimationValueMergedConfig,
  getAnimationValueProperty,
  getIsAnimationDisabledValue,
} from '../../helpers/internal/utils/index';
import {
  DOT_WIDTH_RANGE,
  THUMBNAIL_RING_OPACITY_RANGE,
  THUMBNAIL_SCALE_RANGE,
  THUMBNAIL_TIMING_DURATION,
} from './carousel.constants';
// --------------------------------------------------
/**
 * Animation hook for the {@link Carousel} root component.
 *
 * The carousel root owns no animated styles of its own; the hook only
 * combines the global, parent, and own animation-disabled states so the root
 * can cascade `isAllAnimationsDisabled` to descendants (the dots, thumbnails,
 * and custom slide content) via `AnimationSettingsProvider`.
 * Priority: Global > Parent > Own.
 */
export function useCarouselRootAnimation(options) {
  const { animation } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  return {
    isAllAnimationsDisabled,
  };
}
// --------------------------------------------------
/**
 * Animation hook for a default dot rendered by {@link Carousel.Dots}.
 *
 * Interpolates `width` and `backgroundColor` against the root `progress`
 * shared value so the selected pill slides between neighbors as the strip
 * is dragged (`[index - 1, index, index + 1]` → unselected / selected /
 * unselected). Colors are resolved at runtime with `useThemeColor` so they
 * re-resolve when the theme changes. When animations are disabled (locally
 * or via cascade), both properties snap to the discrete selected state.
 *
 * @note RTL: the dot is a symmetric shape interpolating in place — Yoga
 * row order mirrors the strip; nothing to mirror in the animated style.
 */
export function useCarouselDotAnimation(options) {
  const { animation, index, isSelected, progress } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const themeDefaultColor = useThemeColor('default');
  const themeAccentColor = useThemeColor('accent');
  const widthValue = getAnimationValueProperty({
    animationValue: animationConfig?.width,
    property: 'value',
    defaultValue: DOT_WIDTH_RANGE,
  });
  const backgroundColorValue = getAnimationValueProperty({
    animationValue: animationConfig?.backgroundColor,
    property: 'value',
    defaultValue: [themeDefaultColor, themeAccentColor],
  });
  const rDotStyle = useAnimatedStyle(() => {
    const unselectedWidth = widthValue[0];
    const selectedWidth = widthValue[1];
    const unselectedColor = backgroundColorValue[0];
    const selectedColor = backgroundColorValue[1];
    if (isAnimationDisabledValue) {
      return {
        width: isSelected ? selectedWidth : unselectedWidth,
        backgroundColor: isSelected ? selectedColor : unselectedColor,
      };
    }
    const progressValue = progress.get();
    const inputRange = [index - 1, index, index + 1];
    return {
      width: interpolate(
        progressValue,
        inputRange,
        [unselectedWidth, selectedWidth, unselectedWidth],
        Extrapolation.CLAMP
      ),
      backgroundColor: interpolateColor(progressValue, inputRange, [
        unselectedColor,
        selectedColor,
        unselectedColor,
      ]),
    };
  }, [backgroundColorValue, index, isAnimationDisabledValue, isSelected, progress, widthValue]);
  return {
    rDotStyle,
  };
}
// --------------------------------------------------
/**
 * Animation hook for a {@link Carousel.Thumbnail}.
 *
 * Scales the thumbnail down while pressed and fades the selection ring in on
 * the selected thumbnail. When animations are disabled (locally or via
 * cascade), both properties snap to their targets.
 *
 * @note RTL: scale and opacity are direction-neutral — nothing to mirror.
 */
export function useCarouselThumbnailAnimation(options) {
  const { animation, isSelected, isPressed } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const scaleValue = getAnimationValueProperty({
    animationValue: animationConfig?.scale,
    property: 'value',
    defaultValue: THUMBNAIL_SCALE_RANGE,
  });
  const scaleTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig?.scale,
    property: 'timingConfig',
    defaultValue: {
      duration: THUMBNAIL_TIMING_DURATION,
    },
  });
  const ringOpacityValue = getAnimationValueProperty({
    animationValue: animationConfig?.ringOpacity,
    property: 'value',
    defaultValue: THUMBNAIL_RING_OPACITY_RANGE,
  });
  const ringOpacityTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig?.ringOpacity,
    property: 'timingConfig',
    defaultValue: {
      duration: THUMBNAIL_TIMING_DURATION,
    },
  });
  const rContainerStyle = useAnimatedStyle(() => {
    const targetScale = isPressed ? scaleValue[1] : scaleValue[0];
    if (isAnimationDisabledValue) {
      return {
        transform: [
          {
            scale: targetScale,
          },
        ],
      };
    }
    return {
      transform: [
        {
          scale: withTiming(targetScale, scaleTimingConfig),
        },
      ],
    };
  }, [isAnimationDisabledValue, isPressed, scaleValue, scaleTimingConfig]);
  const rRingStyle = useAnimatedStyle(() => {
    const targetOpacity = isSelected ? ringOpacityValue[1] : ringOpacityValue[0];
    if (isAnimationDisabledValue) {
      return {
        opacity: targetOpacity,
      };
    }
    return {
      opacity: withTiming(targetOpacity, ringOpacityTimingConfig),
    };
  }, [isAnimationDisabledValue, isSelected, ringOpacityValue, ringOpacityTimingConfig]);
  return {
    rContainerStyle,
    rRingStyle,
  };
}
