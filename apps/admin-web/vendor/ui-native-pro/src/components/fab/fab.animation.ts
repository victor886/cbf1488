import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  cancelAnimation,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
import {
  getAnimationState,
  getAnimationValueProperty,
  getIsAnimationDisabledValue,
  getRootAnimationState,
} from '../../helpers/internal/utils/index';
import {
  DEFAULT_ITEM_SCALE,
  DEFAULT_ITEM_TRANSLATE_DISTANCE,
  DEFAULT_OVERLAY_OPACITY,
  DEFAULT_PROGRESS_SPRING_CONFIG,
  DEFAULT_STAGGER_ITEM_WINDOW,
  DEFAULT_TRIGGER_ROTATION,
  MIN_STAGGER_ITEM_WINDOW,
  PROGRESS_CLOSE,
  PROGRESS_IDLE,
  PROGRESS_OPEN,
  PROGRESS_OPEN_LOWER_BOUND,
  PROGRESS_OPEN_UPPER_BOUND,
} from './fab.constants';
import { FABAnimationProvider, useFABAnimation } from './fab.context';
export { FABAnimationProvider, useFABAnimation };
// --------------------------------------------------
/**
 * Checks whether a (possibly snapped) progress value represents the open
 * state. Used by the animation-disabled branches of all part hooks.
 */
function getIsProgressOpen(progress) {
  'worklet';
  return progress >= PROGRESS_OPEN_LOWER_BOUND && progress <= PROGRESS_OPEN_UPPER_BOUND;
}
// --------------------------------------------------
/**
 * Animation hook for the {@link FAB} root component.
 *
 * Owns the shared open/close `progress` value with the semantics
 * `0 = idle/closed`, `1 = open`, `2 = close target`:
 * - On open, progress resets to 0 and animates to 1.
 * - On close, progress animates from 1 to 2, then snaps back to 0 and flips
 *   `isVisible` to `false` so the portaled content unmounts only after the
 *   exit animation completes.
 *
 * All animated parts (overlay, items, trigger rotation, and custom
 * consumers such as blur backdrops) interpolate this single value, which
 * keeps backdrop and item animations orchestrated.
 *
 * Also combines the global, parent, and own animation-disabled states so
 * the root can cascade `isAllAnimationsDisabled` to descendants via
 * `AnimationSettingsProvider`.
 */
export function useFABRootAnimation(options) {
  const { animation, isOpen } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  const { animationConfig, isAnimationDisabled } = getRootAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const progressConfig = animationConfig?.progress;
  /**
   * Drives the progress towards `target` with the configured driver.
   * Defaults to a spring with {@link DEFAULT_PROGRESS_SPRING_CONFIG}; a
   * custom spring config replaces the default entirely (Reanimated spring
   * configs are a physics/duration union, so partial merges are invalid).
   * `type: "timing"` switches to `withTiming` with the config passed
   * through as-is.
   */
  const animateProgress = useCallback(
    (target: number, callback?: (finished?: boolean) => void) => {
      if (progressConfig?.type === 'timing') {
        return withTiming(target, progressConfig.config, callback);
      }
      return withSpring(target, progressConfig?.config ?? DEFAULT_PROGRESS_SPRING_CONFIG, callback);
    },
    [progressConfig]
  );
  const staggerItemWindowValue = getAnimationValueProperty({
    animationValue: animationConfig?.stagger,
    property: 'itemWindow',
    defaultValue: DEFAULT_STAGGER_ITEM_WINDOW,
  });
  const staggerItemWindow = Math.min(1, Math.max(MIN_STAGGER_ITEM_WINDOW, staggerItemWindowValue));
  const progress = useSharedValue(isOpen ? PROGRESS_OPEN : PROGRESS_IDLE);
  const [isVisible, setIsVisible] = useState(isOpen);
  /**
   * Latest open state for the async close-completion callback. Guards
   * against a re-open racing the scheduled hide (the callback would
   * otherwise unmount freshly opened content).
   */
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const hide = useCallback(() => {
    if (!isOpenRef.current) {
      setIsVisible(false);
    }
  }, []);
  /**
   * Tracks the last applied open state so Strict Mode double-invocation does
   * not run a spurious animation on mount, and so we only animate when the
   * state actually changes after the initial sync.
   */
  const prevIsOpenRef = useRef(null);
  useEffect(() => {
    if (prevIsOpenRef.current === null) {
      progress.set(isOpen ? PROGRESS_OPEN : PROGRESS_IDLE);
      prevIsOpenRef.current = isOpen;
      return;
    }
    if (prevIsOpenRef.current === isOpen) {
      return;
    }
    prevIsOpenRef.current = isOpen;
    cancelAnimation(progress);
    if (isOpen) {
      setIsVisible(true);
      if (isAnimationDisabledValue) {
        progress.set(PROGRESS_OPEN);
        return;
      }
      progress.set(PROGRESS_IDLE);
      progress.set(animateProgress(PROGRESS_OPEN));
      return;
    }
    if (isAnimationDisabledValue) {
      progress.set(PROGRESS_IDLE);
      setIsVisible(false);
      return;
    }
    progress.set(
      animateProgress(PROGRESS_CLOSE, (finished) => {
        'worklet';
        if (finished) {
          progress.set(PROGRESS_IDLE);
          scheduleOnRN(hide);
        }
      })
    );
  }, [isOpen, isAnimationDisabledValue, progress, animateProgress, hide]);
  return {
    progress,
    isVisible,
    staggerItemWindow,
    isAllAnimationsDisabled,
  };
}
// --------------------------------------------------
/**
 * Animation hook for the {@link FAB.Trigger} compound part.
 *
 * Rotates the trigger content with the shared progress
 * (`[idle, open, close]` degrees, `[0, 45, 0]` by default) so a plus icon
 * reads as a close affordance while the FAB is open. When disabled, the
 * rotation snaps between the idle and open angles.
 */
export function useFABTriggerAnimation(options) {
  const { animation, progress } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const rotateValue = getAnimationValueProperty({
    animationValue: animationConfig?.rotate,
    property: 'value',
    defaultValue: DEFAULT_TRIGGER_ROTATION,
  });
  const rContentContainerStyle = useAnimatedStyle(() => {
    const p = progress.get();
    if (isAnimationDisabledValue) {
      const angle = getIsProgressOpen(p) ? rotateValue[1] : rotateValue[0];
      return {
        transform: [
          {
            rotate: `${angle}deg`,
          },
        ],
      };
    }
    const angle = interpolate(
      p,
      [PROGRESS_IDLE, PROGRESS_OPEN, PROGRESS_CLOSE],
      rotateValue,
      Extrapolation.CLAMP
    );
    return {
      transform: [
        {
          rotate: `${angle}deg`,
        },
      ],
    };
  }, [isAnimationDisabledValue, progress, rotateValue]);
  return {
    rContentContainerStyle,
  };
}
// --------------------------------------------------
/**
 * Animation hook for the {@link FAB.Overlay} compound part.
 *
 * Fades the overlay with the shared progress (`[idle, open, close]`
 * opacities, `[0, 1, 0]` by default). When disabled, the opacity snaps
 * between the idle and open values.
 */
export function useFABOverlayAnimation(options) {
  const { animation, progress } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const opacityValue = getAnimationValueProperty({
    animationValue: animationConfig?.opacity,
    property: 'value',
    defaultValue: DEFAULT_OVERLAY_OPACITY,
  });
  const rOverlayStyle = useAnimatedStyle(() => {
    const p = progress.get();
    if (isAnimationDisabledValue) {
      return {
        opacity: getIsProgressOpen(p) ? opacityValue[1] : opacityValue[0],
      };
    }
    return {
      opacity: interpolate(
        p,
        [PROGRESS_IDLE, PROGRESS_OPEN, PROGRESS_CLOSE],
        opacityValue,
        Extrapolation.CLAMP
      ),
    };
  }, [isAnimationDisabledValue, progress, opacityValue]);
  return {
    rOverlayStyle,
  };
}
// --------------------------------------------------
/**
 * Computes the normalized open/close animation windows for one item.
 *
 * In `"staggered"` mode the `[0, 1]` progress range is divided so each item
 * animates within its own window of `staggerItemWindow` length: on open the
 * item nearest the trigger starts first (for `"top"` placement that is the
 * last child, since the column grows upwards towards the trigger), and on
 * close the order is reversed so the item furthest from the trigger
 * disappears first. Smaller windows produce a more sequential stagger.
 * In `"normal"` mode every item uses the full range.
 */
function getItemAnimationRanges(options) {
  const { index, total, itemsAppearance, placement, staggerItemWindow } = options;
  if (itemsAppearance === 'normal' || total <= 1) {
    return {
      openStart: 0,
      openEnd: 1,
      closeStart: 0,
      closeEnd: 1,
    };
  }
  const openOrder = placement === 'top' ? total - 1 - index : index;
  const closeOrder = total - 1 - openOrder;
  const step = (1 - staggerItemWindow) / (total - 1);
  const openStart = openOrder * step;
  const closeStart = closeOrder * step;
  return {
    openStart,
    openEnd: openStart + staggerItemWindow,
    closeStart,
    closeEnd: closeStart + staggerItemWindow,
  };
}
// --------------------------------------------------
/**
 * Animation hook for a {@link FAB.Item} compound part.
 *
 * Builds the appearing motion from the shared progress: opacity fades in,
 * the item translates from the trigger direction (down for `"top"`
 * placement, up for `"bottom"`, sideways for `"left"` / `"right"`), and
 * scales from 0.9 to 1. In `"staggered"` mode the item only animates within
 * its own window of the progress range (see {@link getItemAnimationRanges}).
 * When disabled, the item snaps between hidden and visible.
 */
export function useFABItemAnimation(options) {
  const { animation, index, total, itemsAppearance, staggerItemWindow, placement, progress } =
    options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const translateDistance = getAnimationValueProperty({
    animationValue: animationConfig?.translate,
    property: 'value',
    defaultValue: DEFAULT_ITEM_TRANSLATE_DISTANCE,
  });
  const scaleValue = getAnimationValueProperty({
    animationValue: animationConfig?.scale,
    property: 'value',
    defaultValue: DEFAULT_ITEM_SCALE,
  });
  const ranges = useMemo(
    () =>
      getItemAnimationRanges({
        index,
        total,
        itemsAppearance,
        placement,
        staggerItemWindow,
      }),
    [index, total, itemsAppearance, placement, staggerItemWindow]
  );
  const rItemStyle = useAnimatedStyle(() => {
    const p = progress.get();
    if (isAnimationDisabledValue) {
      return {
        opacity: getIsProgressOpen(p) ? 1 : 0,
        transform: [],
      };
    }
    // Item visibility: 0 = hidden, 1 = fully visible. The open phase maps
    // progress [0, 1] through the item's open window; the close phase maps
    // progress [1, 2] through the (reversed) close window.
    const visibility =
      p <= PROGRESS_OPEN
        ? interpolate(p, [ranges.openStart, ranges.openEnd], [0, 1], Extrapolation.CLAMP)
        : 1 -
          interpolate(
            p - PROGRESS_OPEN,
            [ranges.closeStart, ranges.closeEnd],
            [0, 1],
            Extrapolation.CLAMP
          );
    const displacement = (1 - visibility) * translateDistance;
    const scale = interpolate(visibility, [0, 1], scaleValue);
    const translation =
      placement === 'top'
        ? {
            translateY: displacement,
          }
        : placement === 'bottom'
          ? {
              translateY: -displacement,
            }
          : placement === 'left'
            ? {
                translateX: displacement,
              }
            : {
                translateX: -displacement,
              };
    return {
      opacity: visibility,
      transform: [
        translation,
        {
          scale,
        },
      ],
    };
  }, [isAnimationDisabledValue, progress, ranges, translateDistance, scaleValue, placement]);
  return {
    rItemStyle,
  };
}
