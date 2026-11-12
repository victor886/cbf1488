// @ts-nocheck
import {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
import {
  getAnimationState,
  getAnimationValueMergedConfig,
  getAnimationValueProperty,
  getIsAnimationDisabledValue,
  getRootAnimationState,
} from '../../helpers/internal/utils/index';
import {
  DEFAULT_COLLAPSED_OPACITY,
  DEFAULT_COLLAPSED_SCALE,
  DEFAULT_CONTENT_TIMING_DURATION,
  DEFAULT_EXPANDED_OPACITY,
  DEFAULT_EXPANDED_SCALE,
  DEFAULT_MORPH_SPRING_CONFIG,
  DIRECTION_ANCHOR_MAP,
} from './morph-button.constants';
// --------------------------------------------------
/**
 * Animation hook for the MorphButton root component.
 * Owns the measured content sizes (collapsed/expanded), springs the surface
 * width/height toward the open-state target, and produces the surface and
 * expanded-host anchor styles.
 *
 * No-flicker guarantees:
 * - Both content parts stay mounted, so the expanded size is measured while
 *   still closed and the spring always starts at a known destination.
 * - Until the collapsed content reports its first layout AND the morph
 *   target has a measured size (so `surfaceWidth`/`surfaceHeight` are
 *   non-zero), the surface falls back to an absolute fill of the root
 *   footprint. Waiting on the surface size — not just collapsed — covers
 *   `defaultOpen`, where collapsed `onLayout` can fire while the expanded
 *   target is still 0.
 * - When a target size becomes available while the previous one was
 *   unmeasured (e.g. `defaultOpen` before the first layout pass), the
 *   surface snaps instead of animating from a zero size.
 * - `isOpenValue` is written during render (not in `useEffect`) so the
 *   surface spring and the content cross-fade start on the same frame as
 *   the React `isOpen` update. A post-paint sync would let expanded
 *   content fade in while still clipped to the collapsed surface.
 */
export function useMorphButtonRootAnimation(options) {
  const { animation, isOpen, direction, windowWidth, windowHeight } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  const { animationConfig } = getRootAnimationState(animation);
  const morphSpringConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig,
    property: 'morphSpringConfig',
    defaultValue: DEFAULT_MORPH_SPRING_CONFIG,
  });
  const { vertical, horizontal } = DIRECTION_ANCHOR_MAP[direction];
  const collapsedWidth = useSharedValue(0);
  const collapsedHeight = useSharedValue(0);
  const expandedWidth = useSharedValue(0);
  const expandedHeight = useSharedValue(0);
  const surfaceWidth = useSharedValue(0);
  const surfaceHeight = useSharedValue(0);
  const isOpenValue = useSharedValue(isOpen);
  /**
   * Sync during render so UI-thread reactions see the new open state before
   * paint. `useEffect` would trail by a frame and desync the content fade.
   */
  if (isOpenValue.get() !== isOpen) {
    isOpenValue.set(isOpen);
  }
  /** Morph target derived from the open state and the measured sizes */
  const targetSize = useDerivedValue(() => {
    const isOpenNow = isOpenValue.get();
    return {
      width: isOpenNow ? expandedWidth.get() : collapsedWidth.get(),
      height: isOpenNow ? expandedHeight.get() : collapsedHeight.get(),
    };
  });
  /**
   * Drives the surface size toward the target. Snaps (no spring) on the
   * first valid measurement or when animations are disabled; springs on
   * open/close toggles and on re-measures of the active content.
   */
  useAnimatedReaction(
    () => targetSize.get(),
    (current, previous) => {
      if (current.width <= 0 || current.height <= 0) {
        return;
      }
      const wasUnmeasured = previous === null || previous.width <= 0 || previous.height <= 0;
      if (wasUnmeasured || isAllAnimationsDisabled) {
        surfaceWidth.set(current.width);
        surfaceHeight.set(current.height);
        return;
      }
      // Only retarget the dimension that changed: re-issuing a spring toward
      // an unchanged target would restart it mid-flight with zero velocity.
      if (previous.width !== current.width) {
        surfaceWidth.set(withSpring(current.width, morphSpringConfig));
      }
      if (previous.height !== current.height) {
        surfaceHeight.set(withSpring(current.height, morphSpringConfig));
      }
    }
  );
  /**
   * Surface size and anchor offsets. Offsets are relative to the root
   * footprint (the collapsed box): `(collapsed - animated) * factor` pins
   * the opposite corner/edge of the growth direction. The horizontal offset
   * is written to the logical `start` inset, so growth toward the inline
   * start/end mirrors physically in RTL without any JS direction check.
   */
  const rSurfaceStyle = useAnimatedStyle(() => {
    const cw = collapsedWidth.get();
    const ch = collapsedHeight.get();
    const w = surfaceWidth.get();
    const h = surfaceHeight.get();
    // Pre-measurement fallback: fill the root footprint so the surface
    // paints correctly on the very first frame. Stay here until both the
    // collapsed box and the morph target have been measured — otherwise
    // `defaultOpen` can leave the fill after collapsed `onLayout` while
    // `surfaceWidth`/`surfaceHeight` are still 0, painting a 0×0 box.
    if (cw <= 0 || ch <= 0 || w <= 0 || h <= 0) {
      return {
        top: 0,
        start: 0,
        width: '100%',
        height: '100%',
      };
    }
    return {
      top: (ch - h) * vertical,
      start: (cw - w) * horizontal,
      width: w,
      height: h,
    };
  });
  /**
   * Expanded-host anchor offsets inside the surface. The host keeps a fixed
   * window-sized box (stable wrapping constraint for the content) and slides
   * with the animated surface size so its aligned corner always coincides
   * with the surface's pinned corner.
   */
  const rExpandedHostStyle = useAnimatedStyle(() => {
    return {
      top: (surfaceHeight.get() - windowHeight) * vertical,
      start: (surfaceWidth.get() - windowWidth) * horizontal,
      width: windowWidth,
      height: windowHeight,
    };
  });
  return {
    isAllAnimationsDisabled,
    isOpenValue,
    collapsedWidth,
    collapsedHeight,
    expandedWidth,
    expandedHeight,
    surfaceWidth,
    surfaceHeight,
    rSurfaceStyle,
    rExpandedHostStyle,
  };
}
// --------------------------------------------------
/**
 * Shared cross-fade/scale transition for the two content parts.
 * Value tuples read `[closed, open]`; the part-specific hooks below only
 * differ in their defaults.
 */
function useMorphButtonContentAnimation(options) {
  const { animation, isOpenValue, defaultOpacity, defaultScale } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const opacityValue = getAnimationValueProperty({
    animationValue: animationConfig?.opacity,
    property: 'value',
    defaultValue: defaultOpacity,
  });
  const opacityTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig?.opacity,
    property: 'timingConfig',
    defaultValue: {
      duration: DEFAULT_CONTENT_TIMING_DURATION,
    },
  });
  const scaleValue = getAnimationValueProperty({
    animationValue: animationConfig?.scale,
    property: 'value',
    defaultValue: defaultScale,
  });
  const scaleTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig?.scale,
    property: 'timingConfig',
    defaultValue: {
      duration: DEFAULT_CONTENT_TIMING_DURATION,
    },
  });
  const rContentStyle = useAnimatedStyle(() => {
    const isOpenNow = isOpenValue.get();
    const targetOpacity = isOpenNow ? opacityValue[1] : opacityValue[0];
    const targetScale = isOpenNow ? scaleValue[1] : scaleValue[0];
    if (isAnimationDisabledValue) {
      return {
        opacity: targetOpacity,
        transform: [
          {
            scale: targetScale,
          },
        ],
      };
    }
    return {
      opacity: withTiming(targetOpacity, opacityTimingConfig),
      transform: [
        {
          scale: withTiming(targetScale, scaleTimingConfig),
        },
      ],
    };
  });
  return {
    rContentStyle,
  };
}
// --------------------------------------------------
/**
 * Animation hook for `MorphButton.CollapsedContent`.
 * Fades/scales the collapsed row out while open.
 */
export function useMorphButtonCollapsedContentAnimation(options) {
  const { animation, isOpenValue } = options;
  return useMorphButtonContentAnimation({
    animation,
    isOpenValue,
    defaultOpacity: DEFAULT_COLLAPSED_OPACITY,
    defaultScale: DEFAULT_COLLAPSED_SCALE,
  });
}
// --------------------------------------------------
/**
 * Animation hook for `MorphButton.ExpandedContent`.
 * Fades/scales the panel content in while open.
 */
export function useMorphButtonExpandedContentAnimation(options) {
  const { animation, isOpenValue } = options;
  return useMorphButtonContentAnimation({
    animation,
    isOpenValue,
    defaultOpacity: DEFAULT_EXPANDED_OPACITY,
    defaultScale: DEFAULT_EXPANDED_SCALE,
  });
}
