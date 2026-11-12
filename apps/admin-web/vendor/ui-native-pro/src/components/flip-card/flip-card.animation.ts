import { useEffect, useMemo, useRef } from 'react';
import {
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useCombinedAnimationDisabledState } from 'heroui-native/hooks';
import {
  createContext,
  getAnimationState,
  getAnimationValueMergedConfig,
  getIsAnimationDisabledValue,
  getRootAnimationState,
} from '../../helpers/internal/utils/index';
import {
  BACK_ROTATION_RANGE,
  DEFAULT_FLIP_SPRING_CONFIG,
  FLIP_MIDPOINT,
  FLIP_PERSPECTIVE,
  FLIP_SCALE_INPUT_RANGE,
  FLIP_SCALE_OUTPUT_RANGE,
  FRONT_ROTATION_RANGE,
} from './flip-card.constants';
import type { FlipCardAnimationContextValue } from './flip-card.types';
const [FlipCardAnimationProvider, useFlipCardAnimation] =
  createContext<FlipCardAnimationContextValue>({
    name: 'FlipCardAnimationContext',
  });
export { FlipCardAnimationProvider, useFlipCardAnimation };
// --------------------------------------------------
/**
 * Animation hook for the {@link FlipCard} root component.
 *
 * Owns the shared flip `progress` value (0 = front visible, 1 = back
 * visible) and drives it with a spring whenever `isFlipped` changes.
 * When the root animation is disabled (locally or via cascade), progress
 * snaps to its target instantly.
 *
 * Also combines the global, parent, and own animation-disabled states so
 * the root can cascade `isAllAnimationsDisabled` to descendants via
 * `AnimationSettingsProvider`. Priority: Global > Parent > Own.
 */
export function useFlipCardRootAnimation(options) {
  const { animation, isFlipped } = options;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  const { animationConfig, isAnimationDisabled } = getRootAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const progressSpringConfig = useMemo(
    () =>
      getAnimationValueMergedConfig({
        animationValue: animationConfig?.progress,
        property: 'springConfig',
        defaultValue: DEFAULT_FLIP_SPRING_CONFIG,
      }),
    [animationConfig]
  );
  const progress = useSharedValue(isFlipped ? 1 : 0);
  /**
   * Tracks the last applied flipped state so Strict Mode double-invocation
   * does not run a spurious spring on mount, and so we only animate when
   * the state actually changes after the initial sync.
   */
  const prevIsFlippedRef = useRef(null);
  useEffect(() => {
    const target = isFlipped ? 1 : 0;
    if (prevIsFlippedRef.current === null) {
      progress.set(target);
      prevIsFlippedRef.current = isFlipped;
      return;
    }
    if (prevIsFlippedRef.current === isFlipped) {
      return;
    }
    prevIsFlippedRef.current = isFlipped;
    cancelAnimation(progress);
    if (isAnimationDisabledValue) {
      progress.set(target);
      return;
    }
    progress.set(withSpring(target, progressSpringConfig));
  }, [isFlipped, isAnimationDisabledValue, progress, progressSpringConfig]);
  return {
    progress,
    isAllAnimationsDisabled,
  };
}
// --------------------------------------------------
/**
 * Animation hook for a {@link FlipCard} face (`FlipCard.Front` /
 * `FlipCard.Back`).
 *
 * Builds the 3D flip transform from the shared root `progress`:
 * - Rotation: front maps progress [0, 1] to [0deg, 180deg]; back maps to
 *   [180deg, 360deg]. The axis follows `direction` (`rotateY` for
 *   horizontal, `rotateX` for vertical), and both ranges are negated when
 *   `rotation` is `"reverse"` so the card spins the opposite way.
 * - Scale: dips to 0.95 at the flip midpoint to sell the rotation.
 * - `perspective` is applied first so the rotation reads as 3D.
 * - `backfaceVisibility: "hidden"` hides the face once it turns away.
 *
 * When the face animation is disabled, rotation snaps between the range
 * endpoints at the flip midpoint and the scale dip is dropped.
 */
export function useFlipCardFaceAnimation(options) {
  const { animation, side, direction, rotation, progress } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const rotationRange = useMemo(() => {
    const baseRange = side === 'front' ? FRONT_ROTATION_RANGE : BACK_ROTATION_RANGE;
    const sign = rotation === 'reverse' ? -1 : 1;
    return [baseRange[0] * sign, baseRange[1] * sign];
  }, [side, rotation]);
  const rFaceStyle = useAnimatedStyle(() => {
    const p = progress.get();
    if (isAnimationDisabledValue) {
      const angle = p >= FLIP_MIDPOINT ? rotationRange[1] : rotationRange[0];
      if (direction === 'vertical') {
        return {
          transform: [
            {
              perspective: FLIP_PERSPECTIVE,
            },
            {
              rotateX: `${angle}deg`,
            },
          ],
          backfaceVisibility: 'hidden',
        };
      }
      return {
        transform: [
          {
            perspective: FLIP_PERSPECTIVE,
          },
          {
            rotateY: `${angle}deg`,
          },
        ],
        backfaceVisibility: 'hidden',
      };
    }
    const angle = interpolate(p, [0, 1], rotationRange);
    const scale = interpolate(p, FLIP_SCALE_INPUT_RANGE, FLIP_SCALE_OUTPUT_RANGE);
    if (direction === 'vertical') {
      return {
        transform: [
          {
            perspective: FLIP_PERSPECTIVE,
          },
          {
            rotateX: `${angle}deg`,
          },
          {
            scale,
          },
        ],
        backfaceVisibility: 'hidden',
      };
    }
    return {
      transform: [
        {
          perspective: FLIP_PERSPECTIVE,
        },
        {
          rotateY: `${angle}deg`,
        },
        {
          scale,
        },
      ],
      backfaceVisibility: 'hidden',
    };
  }, [direction, isAnimationDisabledValue, progress, rotationRange]);
  return {
    rFaceStyle,
  };
}
