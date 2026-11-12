// @ts-nocheck
import { Extrapolation, interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native/contexts';
import {
  getAnimationState,
  getAnimationValueMergedConfig,
  getAnimationValueProperty,
  getIsAnimationDisabledValue,
} from '../../helpers/internal/utils/index';
// --------------------------------------------------
/**
 * Press / drag scale feedback for a timed event chip.
 *
 * The Agenda root does not own a dedicated root animation hook: the root forwards its
 * `animation` prop to the underlying `SplitView` root, which performs the `"disable-all"`
 * cascade through `AnimationSettingsProvider`. Sub-parts read the cascaded flag here.
 */
export function useAgendaEventAnimation(options) {
  const { animation, isActive } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const scaleTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig?.scale,
    property: 'timingConfig',
    defaultValue: {
      duration: 120,
    },
  });
  const [scaleRest, scaleActive] = getAnimationValueProperty({
    animationValue: animationConfig?.scale,
    property: 'value',
    defaultValue: [1, 0.97],
  });
  const rEventStyle = useAnimatedStyle(() => {
    const target = isActive ? scaleActive : scaleRest;
    if (isAnimationDisabledValue) {
      return {
        transform: [
          {
            scale: scaleRest,
          },
        ],
      };
    }
    return {
      transform: [
        {
          scale: withTiming(target, scaleTimingConfig),
        },
      ],
    };
  }, [isActive, isAnimationDisabledValue, scaleActive, scaleRest, scaleTimingConfig]);
  return {
    rEventStyle,
  };
}
// --------------------------------------------------
/**
 * One drop-guide line: fades in while a drag is active and tracks the snapped drop
 * position.
 *
 * The position is intentionally NOT timed here: gesture start writes it directly so
 * the line appears at the grab position instead of gliding in from wherever the
 * previous drag left it. The 5-minute step smoothing is applied at the write sites
 * (`withTiming` on the shared value) only while a drag is in progress.
 */
export function useAgendaDragGuideAnimation(options) {
  const { isActive, positionY } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const rGuideStyle = useAnimatedStyle(() => {
    return {
      opacity: isAllAnimationsDisabled
        ? isActive.get()
          ? 1
          : 0
        : withTiming(isActive.get() ? 1 : 0, {
            duration: 120,
          }),
      transform: [
        {
          translateY: positionY.get(),
        },
      ],
    };
  }, [isAllAnimationsDisabled]);
  return {
    rGuideStyle,
  };
}
// --------------------------------------------------
/**
 * Press feedback for the event resize grabber: scales down slightly while the
 * resize gesture is active.
 */
export function useAgendaEventResizeGrabberAnimation(options) {
  const { isResizing } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const rGrabberStyle = useAnimatedStyle(() => {
    if (isAllAnimationsDisabled) {
      return {
        transform: [
          {
            scale: 1,
          },
        ],
      };
    }
    return {
      transform: [
        {
          scale: withTiming(isResizing.get() ? 0.8 : 1, {
            duration: 120,
          }),
        },
      ],
    };
  }, [isAllAnimationsDisabled]);
  return {
    rGrabberStyle,
  };
}
// --------------------------------------------------
/**
 * Collapse translation for the calendar grid body: while the SplitView top section
 * shrinks toward its collapsed snap point, the week row containing the selected date
 * slides up into view and the other rows are clipped.
 *
 * The translation tracks the live drag position (it is layout, not decoration), so it
 * stays active even when animations are disabled.
 */
export function useAgendaCalendarCollapseAnimation(options) {
  const { topSectionHeight, collapsedHeight, expandedHeight, weekIndex, weekRowHeight } = options;
  const rGridBodyStyle = useAnimatedStyle(() => {
    if (weekRowHeight <= 0 || expandedHeight <= collapsedHeight || weekIndex <= 0) {
      return {
        transform: [
          {
            translateY: 0,
          },
        ],
      };
    }
    const translateY = interpolate(
      topSectionHeight.get(),
      [collapsedHeight, expandedHeight],
      [-weekIndex * weekRowHeight, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        {
          translateY,
        },
      ],
    };
  }, [collapsedHeight, expandedHeight, weekIndex, weekRowHeight]);
  return {
    rGridBodyStyle,
  };
}
