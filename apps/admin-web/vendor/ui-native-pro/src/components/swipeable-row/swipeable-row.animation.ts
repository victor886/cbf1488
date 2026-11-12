// @ts-nocheck
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  Extrapolation,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useCombinedAnimationDisabledState, useIsRTL } from 'heroui-native/hooks';
import { useResolveClassNames } from 'uniwind';
import {
  getAnimationState,
  getAnimationValueMergedConfig,
  getAnimationValueProperty,
  getIsAnimationDisabledValue,
  getRootAnimationState,
} from '../../helpers/internal/utils/index';
import {
  DEFAULT_ACTION_CONTENT_OPACITY_RANGE,
  DEFAULT_ACTION_CONTENT_SCALE_RANGE,
  DEFAULT_ACTION_CONTENT_TRANSLATE_X_RANGE,
  DEFAULT_ACTION_PRESS_DURATION,
  DEFAULT_ACTION_PRESS_SCALE,
  DEFAULT_ACTIONS_FADE_DURATION,
  DEFAULT_ACTIVATION_THRESHOLD,
  DEFAULT_FRICTION,
  DEFAULT_INLINE_BORDER_RADIUS_DISTANCE,
  DEFAULT_OPEN_THRESHOLD,
  DEFAULT_OVERSHOOT_FRICTION,
  DEFAULT_SPRING_CONFIG,
  DRAG_TOSS,
  FALLBACK_STANDALONE_BORDER_RADIUS,
} from './swipeable-row.constants';
import { swipeableRowClassNames } from './swipeable-row.styles';
function toGestureRelations(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}
function sideToValue(side) {
  'worklet';
  return side === 'start' ? 1 : side === 'end' ? -1 : 0;
}
function valueToSide(value) {
  'worklet';
  return value > 0 ? 'start' : value < 0 ? 'end' : null;
}
/** Falls back for `NaN` and infinite values, which would poison the math. */
function toFiniteNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}
/**
 * Owns SwipeableRow's gesture state, settle animation, logical RTL mapping,
 * and public imperative controls.
 */
export function useSwipeableRowRootAnimation(options) {
  const {
    animation,
    openSide,
    isOpen,
    isControlled,
    isDisabled,
    hasActions,
    openThreshold,
    activationThreshold,
    failOffsetY,
    friction,
    overshoot,
    overshootFriction,
    closeOnContentPress,
    enableTrackpadTwoFingerGesture,
    simultaneousWithExternalGesture,
    requireExternalGestureToFail,
    blocksExternalGesture,
    onOpenSideChange,
  } = options;
  const isRTL = useIsRTL();
  const direction = isRTL ? -1 : 1;
  const isAllAnimationsDisabled = useCombinedAnimationDisabledState(animation);
  const { animationConfig, isAnimationDisabled } = getRootAnimationState(animation);
  const isSettleAnimationDisabled = isAnimationDisabled || isAllAnimationsDisabled;
  const springConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig,
    property: 'springConfig',
    defaultValue: DEFAULT_SPRING_CONFIG,
  });
  const translation = useSharedValue(0);
  const gestureStartTranslation = useSharedValue(0);
  const gestureActivationTranslationX = useSharedValue(0);
  const settledSide = useSharedValue(sideToValue(openSide));
  const startActionsWidth = useSharedValue(0);
  const endActionsWidth = useSharedValue(0);
  const normalizedOpenThreshold = Math.max(
    0,
    Math.min(toFiniteNumber(openThreshold, DEFAULT_OPEN_THRESHOLD), 1)
  );
  const normalizedActivationThreshold = Math.max(
    0,
    toFiniteNumber(activationThreshold, DEFAULT_ACTIVATION_THRESHOLD)
  );
  // Below 1 the card would outrun the finger and fly off screen.
  const normalizedFriction = Math.max(toFiniteNumber(friction, DEFAULT_FRICTION), 1);
  const normalizedOvershootFriction = Math.max(
    toFiniteNumber(overshootFriction, DEFAULT_OVERSHOOT_FRICTION),
    1
  );
  const startProgress = useDerivedValue(() => {
    const width = startActionsWidth.get();
    if (width <= 0) return 0;
    return Math.max(0, Math.min(translation.get() / width, 1));
  });
  const endProgress = useDerivedValue(() => {
    const width = endActionsWidth.get();
    if (width <= 0) return 0;
    return Math.max(0, Math.min(-translation.get() / width, 1));
  });
  const animateToSide = useCallback(
    (side, animated, velocity = 0) => {
      'worklet';
      const target =
        side === 'start' ? startActionsWidth.get() : side === 'end' ? -endActionsWidth.get() : 0;
      // A side without travel (no rail, empty, or not measured yet) settles
      // closed, so taps and drags never treat the row as open.
      settledSide.set(target === 0 ? 0 : sideToValue(side));
      if (isSettleAnimationDisabled || !animated) {
        cancelAnimation(translation);
        translation.set(target);
        return;
      }
      translation.set(
        withSpring(target, {
          ...springConfig,
          velocity,
        })
      );
    },
    [
      endActionsWidth,
      isSettleAnimationDisabled,
      springConfig,
      startActionsWidth,
      settledSide,
      translation,
    ]
  );
  const requestedTransitionRef = useRef(undefined);
  /**
   * Bumped with every request so the sync effect also runs when a controlled
   * parent keeps `openSide` unchanged, letting the row settle back to it.
   */
  const [transitionRequestId, setTransitionRequestId] = useState(0);
  const requestOpenSide = useCallback(
    (side, animated = true, velocity = 0, isApplied = false) => {
      requestedTransitionRef.current = {
        side,
        animated,
        velocity,
        isApplied,
      };
      setTransitionRequestId((id) => id + 1);
      onOpenSideChange(side);
    },
    [onOpenSideChange]
  );
  const open = useCallback(
    (side, transitionOptions) => {
      const animated = transitionOptions?.animated ?? true;
      requestOpenSide(side, animated, 0, !isControlled);
      if (!isControlled) {
        scheduleOnUI(() => {
          'worklet';
          animateToSide(side, animated);
        });
      }
    },
    [animateToSide, isControlled, requestOpenSide]
  );
  const close = useCallback(
    (transitionOptions) => {
      const animated = transitionOptions?.animated ?? true;
      requestOpenSide(null, animated, 0, !isControlled);
      if (!isControlled) {
        scheduleOnUI(() => {
          'worklet';
          animateToSide(null, animated);
        });
      }
    },
    [animateToSide, isControlled, requestOpenSide]
  );
  const reset = useCallback(() => {
    requestOpenSide(null, false, 0, !isControlled);
    if (!isControlled) {
      scheduleOnUI(() => {
        'worklet';
        cancelAnimation(translation);
        gestureStartTranslation.set(0);
        translation.set(0);
        settledSide.set(0);
      });
    }
  }, [gestureStartTranslation, isControlled, requestOpenSide, settledSide, translation]);
  /**
   * Read through a ref so a new `animateToSide` identity (e.g. an inline
   * `springConfig`) never re-runs the sync effect and restarts the settle.
   */
  const animateToSideRef = useRef(animateToSide);
  animateToSideRef.current = animateToSide;
  /**
   * Sync `openSide` changes and pending requests to the row position:
   * - request already applied and accepted: nothing to do, so a drag release
   *   is never restarted when the matching (controlled) prop arrives
   * - request rejected by a controlled parent: settle back to `openSide`
   * - external change: animate to the new `openSide`
   */
  useEffect(() => {
    const requestedTransition = requestedTransitionRef.current;
    requestedTransitionRef.current = undefined;
    const isRequestAccepted = requestedTransition?.side === openSide;
    if (isRequestAccepted && requestedTransition.isApplied) {
      return;
    }
    const animated = isRequestAccepted ? requestedTransition.animated : true;
    const velocity = isRequestAccepted ? requestedTransition.velocity : 0;
    const animateToSideWorklet = animateToSideRef.current;
    scheduleOnUI(() => {
      'worklet';
      animateToSideWorklet(openSide, animated, velocity);
    });
  }, [openSide, transitionRequestId]);
  const setActionsWidth = useCallback(
    (side, width) => {
      const widthValue = side === 'start' ? startActionsWidth : endActionsWidth;
      widthValue.set(width);
      if (openSide === side) {
        // Follow a resized open rail in place; slide closed when it's removed.
        const animated = width === 0;
        scheduleOnUI(() => {
          'worklet';
          animateToSide(side, animated);
        });
      }
    },
    [animateToSide, endActionsWidth, openSide, startActionsWidth]
  );
  const panGesture = useMemo(() => {
    let gesture = Gesture.Pan()
      .enabled(!isDisabled && hasActions)
      .activeOffsetX([-normalizedActivationThreshold, normalizedActivationThreshold])
      .failOffsetY(failOffsetY)
      .enableTrackpadTwoFingerGesture(enableTrackpadTwoFingerGesture)
      .onStart((event) => {
        // Grabbing a settling row takes over from the spring in place.
        cancelAnimation(translation);
        gestureStartTranslation.set(translation.get());
        // The pan activates after `activationThreshold` of travel; measuring
        // from here avoids a jump of that distance on the first update.
        gestureActivationTranslationX.set(event.translationX);
      })
      .onUpdate((event) => {
        const logicalDrag =
          ((event.translationX - gestureActivationTranslationX.get()) * direction) /
          normalizedFriction;
        const rawTranslation = gestureStartTranslation.get() + logicalDrag;
        const startWidth = startActionsWidth.get();
        const endWidth = endActionsWidth.get();
        // Past a rail's width — or from rest on a side without a rail
        // (width 0) — the card rubber-bands instead of stopping hard.
        if (rawTranslation > startWidth) {
          translation.set(
            overshoot
              ? startWidth + (rawTranslation - startWidth) / normalizedOvershootFriction
              : startWidth
          );
        } else if (rawTranslation < -endWidth) {
          translation.set(
            overshoot
              ? -endWidth + (rawTranslation + endWidth) / normalizedOvershootFriction
              : -endWidth
          );
        } else {
          translation.set(rawTranslation);
        }
      })
      .onEnd((event, success) => {
        // Cancelled drags settle back to the previous side in `onFinalize`.
        if (!success) return;
        const velocity = event.velocityX * direction;
        const projectedTranslation =
          translation.get() + (velocity * DRAG_TOSS) / normalizedFriction;
        const startWidth = startActionsWidth.get();
        const endWidth = endActionsWidth.get();
        let nextSide = null;
        if (startWidth > 0 && projectedTranslation >= startWidth * normalizedOpenThreshold) {
          nextSide = 'start';
        } else if (endWidth > 0 && projectedTranslation <= -endWidth * normalizedOpenThreshold) {
          nextSide = 'end';
        }
        const previousSide = valueToSide(settledSide.get());
        // Settle straight to the released side in both modes. A controlled
        // parent that rejects the change is reconciled by the sync effect.
        animateToSide(nextSide, true, velocity / normalizedFriction);
        if (previousSide !== nextSide) {
          scheduleOnRN(requestOpenSide, nextSide, true, velocity / normalizedFriction, true);
        }
      })
      .onFinalize((_event, success) => {
        if (!success) {
          animateToSide(valueToSide(settledSide.get()), true);
        }
      });
    const simultaneous = toGestureRelations(simultaneousWithExternalGesture);
    const requireToFail = toGestureRelations(requireExternalGestureToFail);
    const blocks = toGestureRelations(blocksExternalGesture);
    if (simultaneous.length > 0) {
      gesture = gesture.simultaneousWithExternalGesture(...simultaneous);
    }
    if (requireToFail.length > 0) {
      gesture = gesture.requireExternalGestureToFail(...requireToFail);
    }
    if (blocks.length > 0) {
      gesture = gesture.blocksExternalGesture(...blocks);
    }
    return gesture;
  }, [
    animateToSide,
    blocksExternalGesture,
    direction,
    enableTrackpadTwoFingerGesture,
    endActionsWidth,
    failOffsetY,
    gestureActivationTranslationX,
    gestureStartTranslation,
    hasActions,
    isDisabled,
    normalizedActivationThreshold,
    normalizedFriction,
    normalizedOpenThreshold,
    normalizedOvershootFriction,
    overshoot,
    requestOpenSide,
    requireExternalGestureToFail,
    settledSide,
    simultaneousWithExternalGesture,
    startActionsWidth,
    translation,
  ]);
  const tapGesture = useMemo(() => {
    let gesture = Gesture.Tap()
      .enabled(!isDisabled && closeOnContentPress && isOpen)
      .onEnd((_event, success) => {
        if (!success || settledSide.get() === 0) return;
        animateToSide(null, true);
        scheduleOnRN(requestOpenSide, null, true, 0, true);
      });
    const simultaneous = toGestureRelations(simultaneousWithExternalGesture);
    const requireToFail = toGestureRelations(requireExternalGestureToFail);
    const blocks = toGestureRelations(blocksExternalGesture);
    if (simultaneous.length > 0) {
      gesture = gesture.simultaneousWithExternalGesture(...simultaneous);
    }
    if (requireToFail.length > 0) {
      gesture = gesture.requireExternalGestureToFail(...requireToFail);
    }
    if (blocks.length > 0) {
      gesture = gesture.blocksExternalGesture(...blocks);
    }
    return gesture;
  }, [
    animateToSide,
    blocksExternalGesture,
    closeOnContentPress,
    isDisabled,
    isOpen,
    requestOpenSide,
    requireExternalGestureToFail,
    settledSide,
    simultaneousWithExternalGesture,
  ]);
  const rContentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translation.get() * direction,
      },
    ],
  }));
  // The dragged inline radius defaults to the standalone card's, resolved from
  // the theme so theme overrides of the standalone radius carry over.
  const standaloneContentStyle = useResolveClassNames(
    swipeableRowClassNames.content({
      variant: 'standalone',
    })
  );
  const standaloneBorderRadius =
    typeof standaloneContentStyle.borderRadius === 'number'
      ? standaloneContentStyle.borderRadius
      : FALLBACK_STANDALONE_BORDER_RADIUS;
  const [restBorderRadius, draggedBorderRadius] = getAnimationValueProperty({
    animationValue: animationConfig?.borderRadius,
    property: 'value',
    defaultValue: [0, standaloneBorderRadius],
  });
  const inlineBorderRadiusRange = useMemo(
    () => [
      toFiniteNumber(restBorderRadius, 0),
      toFiniteNumber(draggedBorderRadius, standaloneBorderRadius),
    ],
    [draggedBorderRadius, restBorderRadius, standaloneBorderRadius]
  );
  const inlineBorderRadiusDistance = Math.max(
    toFiniteNumber(
      getAnimationValueProperty({
        animationValue: animationConfig?.borderRadius,
        property: 'distance',
        defaultValue: DEFAULT_INLINE_BORDER_RADIUS_DISTANCE,
      }),
      DEFAULT_INLINE_BORDER_RADIUS_DISTANCE
    ),
    1
  );
  return {
    isAllAnimationsDisabled,
    translation,
    startProgress,
    endProgress,
    startActionsWidth,
    endActionsWidth,
    panGesture,
    tapGesture,
    rContentStyle,
    inlineBorderRadiusRange,
    inlineBorderRadiusDistance,
    open,
    close,
    reset,
    setActionsWidth,
  };
}
// --------------------------------------------------
/**
 * Drives the content card's corner radius. Inline rows are square at rest and
 * round their corners as they move off rest in either direction, including
 * rubber-banding on a side without actions; the radius tracks the gesture, so
 * it never lags the card.
 *
 * Reanimated keeps the last animated value of a prop after the style stops
 * writing it, so once animated the radius is always owned here: standalone
 * rows re-apply their resting radius, or a runtime switch from `inline` would
 * leave them square.
 */
export function useSwipeableRowContentAnimation(options) {
  const {
    translation,
    variant,
    restingBorderRadius,
    inlineBorderRadiusRange,
    inlineBorderRadiusDistance,
  } = options;
  const isInline = variant === 'inline';
  const rBorderRadiusStyle = useAnimatedStyle(() => {
    if (!isInline) {
      return restingBorderRadius === undefined
        ? {}
        : {
            borderRadius: restingBorderRadius,
          };
    }
    return {
      borderRadius: interpolate(
        Math.abs(translation.get()),
        [0, inlineBorderRadiusDistance],
        inlineBorderRadiusRange,
        Extrapolation.CLAMP
      ),
    };
  });
  return {
    rBorderRadiusStyle,
  };
}
// --------------------------------------------------
/**
 * The rail never moves: it rests at its open position behind the content
 * card, and the moving card uncovers it. It is only shown once measured and
 * while partly uncovered, so a translucent card never shows it through at
 * rest.
 *
 * With `isRevealFadeActive` (the active theme renders a translucent card,
 * e.g. `glass`), visibility is handed to mounting instead of the mask's
 * opacity: `isRevealed` flips as the card starts and stops uncovering the
 * rail, and the rail mounts with `entering` and unmounts with `exiting` fades,
 * so the actions fade in and out behind the frosted card rather than popping.
 */
export function useSwipeableRowActionsAnimation(options) {
  const { side, translation, progress, actionsWidth, isRevealFadeActive } = options;
  const { isAllAnimationsDisabled } = useAnimationSettings();
  /** Width of the action row, excluding the rail's content-side gap. */
  const railWidth = useSharedValue(0);
  /** Logical distance the card has uncovered of this rail, from its edge. */
  const revealDistance = useDerivedValue(() =>
    Math.max(0, side === 'start' ? translation.get() : -translation.get())
  );
  /** Whether the card currently uncovers any of this rail (fade mode only). */
  const [isRevealed, setIsRevealed] = useState(false);
  useAnimatedReaction(
    () => isRevealFadeActive && progress.get() > 0,
    (current, previous) => {
      if (current !== previous) {
        scheduleOnRN(setIsRevealed, current);
      }
    },
    [isRevealFadeActive]
  );
  /**
   * In fade mode the mask stays visible once measured: gating it on progress
   * would hide the rail the instant the card covers it again, before the
   * exiting fade could play.
   */
  const rMaskStyle = useAnimatedStyle(() => {
    const isMeasured = actionsWidth.get() > 0;
    return {
      opacity: isMeasured && (isRevealFadeActive || progress.get() > 0) ? 1 : 0,
    };
  });
  const isFadeAnimated = isRevealFadeActive && !isAllAnimationsDisabled;
  const entering = useMemo(
    () => (isFadeAnimated ? FadeIn.duration(DEFAULT_ACTIONS_FADE_DURATION) : undefined),
    [isFadeAnimated]
  );
  const exiting = useMemo(
    () => (isFadeAnimated ? FadeOut.duration(DEFAULT_ACTIONS_FADE_DURATION) : undefined),
    [isFadeAnimated]
  );
  return {
    rMaskStyle,
    railWidth,
    revealDistance,
    isRevealed,
    entering,
    exiting,
  };
}
// --------------------------------------------------
/**
 * Slides, zooms, and fades an action's content in with its own reveal
 * progress: the stretch of travel over which the moving card uncovers this
 * action. The card uncovers a rail from its outer edge inward, so with several
 * actions the outermost animates first and the one next to the card last. The
 * slide travels from the card side toward the rail's outer edge. The whole
 * button also scales down subtly while pressed.
 */
export function useSwipeableRowActionAnimation(options) {
  const { animation, side, progress, revealDistance, railWidth } = options;
  const isRTL = useIsRTL();
  const actionX = useSharedValue(0);
  const actionWidth = useSharedValue(0);
  /** Records the action's physical position within its rail's action row. */
  const handleLayout = useCallback(
    (event) => {
      const { x, width } = event.nativeEvent.layout;
      actionX.set(x);
      actionWidth.set(width);
    },
    [actionWidth, actionX]
  );
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const { animationConfig, isAnimationDisabled } = getAnimationState(animation);
  const isAnimationDisabledValue = getIsAnimationDisabledValue({
    isAnimationDisabled,
    isAllAnimationsDisabled,
  });
  const translateXValue = getAnimationValueProperty({
    animationValue: animationConfig?.translateX,
    property: 'value',
    defaultValue: DEFAULT_ACTION_CONTENT_TRANSLATE_X_RANGE,
  });
  const scaleValue = getAnimationValueProperty({
    animationValue: animationConfig?.scale,
    property: 'value',
    defaultValue: DEFAULT_ACTION_CONTENT_SCALE_RANGE,
  });
  const opacityValue = getAnimationValueProperty({
    animationValue: animationConfig?.opacity,
    property: 'value',
    defaultValue: DEFAULT_ACTION_CONTENT_OPACITY_RANGE,
  });
  const pressScaleValue = getAnimationValueProperty({
    animationValue: animationConfig?.pressScale,
    property: 'value',
    defaultValue: DEFAULT_ACTION_PRESS_SCALE,
  });
  const pressTimingConfig = getAnimationValueMergedConfig({
    animationValue: animationConfig?.pressScale,
    property: 'timingConfig',
    defaultValue: {
      duration: DEFAULT_ACTION_PRESS_DURATION,
    },
  });
  const isPressed = useSharedValue(false);
  const animationOnPressIn = useCallback(() => {
    isPressed.set(true);
  }, [isPressed]);
  const animationOnPressOut = useCallback(() => {
    isPressed.set(false);
  }, [isPressed]);
  const rPressStyle = useAnimatedStyle(() => {
    if (isAnimationDisabledValue) {
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
          scale: withTiming(isPressed.get() ? pressScaleValue : 1, pressTimingConfig),
        },
      ],
    };
  });
  // `translateX` is physical: the card sits to the physical left of end rails
  // in LTR, and mirrors for start rails and in RTL.
  const inwardDirection = (side === 'start' ? 1 : -1) * (isRTL ? -1 : 1);
  // Layout `x` is physical, so locate the rail's outer edge physically too:
  // start rails sit on the physical left in LTR, end rails in RTL.
  const isOuterEdgeLeft = (side === 'start') !== isRTL;
  const rContentStyle = useAnimatedStyle(() => {
    // Outside a rail there is no progress to follow, so stay fully visible.
    if (
      isAnimationDisabledValue ||
      progress === undefined ||
      revealDistance === undefined ||
      railWidth === undefined
    ) {
      return {
        opacity: 1,
        transform: [
          {
            translateX: 0,
          },
          {
            scale: 1,
          },
        ],
      };
    }
    const width = actionWidth.get();
    const rowWidth = railWidth.get();
    let progressValue = progress.get();
    if (width > 0 && rowWidth > 0) {
      // Distance from the rail's outer edge to this action's outer side.
      const outerOffset = isOuterEdgeLeft ? actionX.get() : rowWidth - actionX.get() - width;
      progressValue = interpolate(
        revealDistance.get(),
        [outerOffset, outerOffset + width],
        [0, 1],
        Extrapolation.CLAMP
      );
    }
    return {
      opacity: interpolate(progressValue, [0, 1], opacityValue, Extrapolation.CLAMP),
      transform: [
        {
          translateX:
            inwardDirection *
            interpolate(progressValue, [0, 1], translateXValue, Extrapolation.CLAMP),
        },
        {
          scale: interpolate(progressValue, [0, 1], scaleValue, Extrapolation.CLAMP),
        },
      ],
    };
  });
  return {
    rContentStyle,
    rPressStyle,
    handleLayout,
    animationOnPressIn,
    animationOnPressOut,
  };
}
