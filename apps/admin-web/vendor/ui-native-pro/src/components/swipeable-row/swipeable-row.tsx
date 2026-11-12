// @ts-nocheck
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { useResolveClassNames } from 'uniwind';
import { HeroText } from '../../helpers/internal/components/index';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { childrenToString, createContext } from '../../helpers/internal/utils/index';
import {
  useSwipeableRowActionAnimation,
  useSwipeableRowActionsAnimation,
  useSwipeableRowContentAnimation,
  useSwipeableRowRootAnimation,
} from './swipeable-row.animation';
import {
  ACCESSIBILITY_ACTION_NAME_MAP,
  DEFAULT_ACCESSIBILITY_ACTION_LABEL_MAP,
  DEFAULT_ACTIVATION_THRESHOLD,
  DEFAULT_FAIL_OFFSET_Y,
  DEFAULT_FRICTION,
  DEFAULT_OPEN_THRESHOLD,
  DEFAULT_OVERSHOOT_FRICTION,
  DISPLAY_NAME,
} from './swipeable-row.constants';
import { swipeableRowClassNames, swipeableRowStyleSheet } from './swipeable-row.styles';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const [SwipeableRowProvider, useSwipeableRowInternal] = createContext<any>({
  name: 'SwipeableRowContext',
});
/** Optional: an action rendered outside a rail simply does not zoom. */
const [SwipeableRowActionsProvider, useSwipeableRowActions] = createContext<any>({
  name: 'SwipeableRowActionsContext',
  strict: false,
});
const [SwipeableRowActionProvider, useSwipeableRowAction] = createContext<any>({
  name: 'SwipeableRowActionContext',
});
/** Access the enclosing row's logical state, progress, and controls. */
function useSwipeableRow() {
  return useSwipeableRowInternal();
}
// --------------------------------------------------
const SwipeableRowRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    openSide: openSideProp,
    defaultOpenSide = null,
    variant = 'standalone',
    isDisabled = false,
    openThreshold = DEFAULT_OPEN_THRESHOLD,
    activationThreshold = DEFAULT_ACTIVATION_THRESHOLD,
    failOffsetY = DEFAULT_FAIL_OFFSET_Y,
    friction = DEFAULT_FRICTION,
    overshoot = true,
    overshootFriction = DEFAULT_OVERSHOOT_FRICTION,
    closeOnContentPress = true,
    accessibilityOpenStartActionsLabel = DEFAULT_ACCESSIBILITY_ACTION_LABEL_MAP.OPEN_START,
    accessibilityOpenEndActionsLabel = DEFAULT_ACCESSIBILITY_ACTION_LABEL_MAP.OPEN_END,
    accessibilityCloseActionsLabel = DEFAULT_ACCESSIBILITY_ACTION_LABEL_MAP.CLOSE,
    enableTrackpadTwoFingerGesture = false,
    simultaneousWithExternalGesture,
    requireExternalGestureToFail,
    blocksExternalGesture,
    className,
    style,
    onOpenSideChange,
    animation,
    accessibilityState,
    ...restProps
  } = props;
  const [openSide = null, setOpenSide] = useControllableState({
    prop: openSideProp,
    defaultProp: defaultOpenSide,
    onChange: onOpenSideChange,
  });
  const isControlled = openSideProp !== undefined;
  const actionSideCountsRef = useRef({
    start: 0,
    end: 0,
  });
  const [availableActionSides, setAvailableActionSides] = useState({
    start: false,
    end: false,
  });
  const registerActionsSide = useCallback((side) => {
    actionSideCountsRef.current[side] += 1;
    setAvailableActionSides((current) =>
      current[side]
        ? current
        : {
            ...current,
            [side]: true,
          }
    );
    return () => {
      actionSideCountsRef.current[side] = Math.max(0, actionSideCountsRef.current[side] - 1);
      if (actionSideCountsRef.current[side] === 0) {
        setAvailableActionSides((current) =>
          current[side]
            ? {
                ...current,
                [side]: false,
              }
            : current
        );
      }
    };
  }, []);
  /**
   * `openSide` may name a side without a usable rail (none mounted, empty,
   * or not measured yet). The row then stays closed and reports itself
   * closed until that rail appears.
   */
  const isOpen = openSide !== null && availableActionSides[openSide];
  const effectiveOpenSide = isOpen ? openSide : null;
  const {
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
  } = useSwipeableRowRootAnimation({
    animation,
    openSide,
    isOpen,
    isControlled,
    isDisabled,
    hasActions: availableActionSides.start || availableActionSides.end,
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
    onOpenSideChange: setOpenSide,
  });
  /**
   * Closes the row when the open side's rail unmounts or empties, so the
   * open state is cleared instead of silently reopening if it comes back.
   */
  const previousAvailableActionSidesRef = useRef(availableActionSides);
  useEffect(() => {
    const previous = previousAvailableActionSidesRef.current;
    previousAvailableActionSidesRef.current = availableActionSides;
    if (openSide !== null && previous[openSide] && !availableActionSides[openSide]) {
      close();
    }
  }, [availableActionSides, close, openSide]);
  /** A disabled row can't be interacted with, so it never stays open. */
  useEffect(() => {
    if (isDisabled && openSide !== null) {
      close();
    }
  }, [close, isDisabled, openSide]);
  const nativeRef = useRef(null);
  useImperativeHandle(
    ref,
    () =>
      Object.assign(nativeRef.current ?? {}, {
        open,
        close,
        reset,
      }),
    [close, open, reset]
  );
  const rootClassName = swipeableRowClassNames.root({
    variant,
    isDisabled,
    className,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const contextValue = useMemo(
    () => ({
      openSide: effectiveOpenSide,
      variant,
      isDisabled,
      translation,
      startProgress,
      endProgress,
      open,
      close,
      reset,
      tapGesture,
      rContentStyle,
      inlineBorderRadiusRange,
      inlineBorderRadiusDistance,
      closeOnContentPress,
      setActionsWidth,
      startActionsWidth,
      endActionsWidth,
      availableActionSides,
      registerActionsSide,
      accessibilityActionLabels: {
        openStart: accessibilityOpenStartActionsLabel,
        openEnd: accessibilityOpenEndActionsLabel,
        close: accessibilityCloseActionsLabel,
      },
    }),
    [
      accessibilityCloseActionsLabel,
      accessibilityOpenEndActionsLabel,
      accessibilityOpenStartActionsLabel,
      availableActionSides,
      close,
      closeOnContentPress,
      effectiveOpenSide,
      endActionsWidth,
      endProgress,
      inlineBorderRadiusDistance,
      inlineBorderRadiusRange,
      isDisabled,
      open,
      rContentStyle,
      reset,
      registerActionsSide,
      setActionsWidth,
      startActionsWidth,
      startProgress,
      tapGesture,
      translation,
      variant,
    ]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <SwipeableRowProvider value={contextValue}>
        <GestureDetector gesture={panGesture}>
          <View
            ref={nativeRef}
            className={rootClassName}
            style={[swipeableRowStyleSheet.borderCurve, style]}
            accessibilityState={{
              ...accessibilityState,
              disabled: isDisabled || accessibilityState?.disabled,
            }}
            {...restProps}
          >
            {children}
          </View>
        </GestureDetector>
      </SwipeableRowProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const SwipeableRowActions = forwardRef((props: any, ref: any) => {
  const { children, side, className, style, onLayout, ...restProps } = props;
  const ctx = useSwipeableRowInternal();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const registerActionsSide = ctx.registerActionsSide;
  const maskWidthRef = useRef(0);
  const rowWidthRef = useRef(0);
  /** An empty rail (e.g. conditional children) offers no travel or actions. */
  const [hasContent, setHasContent] = useState(false);
  /** Last measured action-row width, held by the placeholder while unmounted. */
  const [measuredRowWidth, setMeasuredRowWidth] = useState(0);
  const setActionsWidthRef = useRef(ctx.setActionsWidth);
  setActionsWidthRef.current = ctx.setActionsWidth;
  const isOpen = ctx.openSide === side;
  const progress = side === 'start' ? ctx.startProgress : ctx.endProgress;
  const actionsWidth = side === 'start' ? ctx.startActionsWidth : ctx.endActionsWidth;
  /**
   * A theme with default background content (e.g. `glass`) makes the card
   * translucent, so the rail is mounted only while uncovered and fades in and
   * out instead of popping behind the frosted card.
   */
  const isRevealFadeActive = hasDefaultThemeBackground;
  const { rMaskStyle, railWidth, revealDistance, isRevealed, entering, exiting } =
    useSwipeableRowActionsAnimation({
      side,
      translation: ctx.translation,
      progress,
      actionsWidth,
      isRevealFadeActive,
    });
  const maskClassName = swipeableRowClassNames.actionsMask({
    side,
  });
  const actionsClassName = swipeableRowClassNames.actions({
    side,
    className,
  });
  /**
   * Travel distance is measured on the internal rail container, whose
   * content-side padding provides the gap between card and actions. It is not
   * themable, so consumer or theme classes on the rail cannot desync it. An
   * empty action row reports no travel, or the gap alone would open the row.
   */
  const reportActionsWidth = useCallback(() => {
    setActionsWidthRef.current(side, rowWidthRef.current > 0 ? maskWidthRef.current : 0);
  }, [side]);
  const handleMaskLayout = useCallback(
    (event) => {
      maskWidthRef.current = event.nativeEvent.layout.width;
      reportActionsWidth();
    },
    [reportActionsWidth]
  );
  /** Measures the action row so each action can locate its reveal range. */
  const handleActionsLayout = useCallback(
    (event) => {
      const { width } = event.nativeEvent.layout;
      rowWidthRef.current = width;
      railWidth.set(width);
      setHasContent(width > 0);
      setMeasuredRowWidth(width);
      reportActionsWidth();
      onLayout?.(event);
    },
    [onLayout, railWidth, reportActionsWidth]
  );
  useEffect(() => {
    reportActionsWidth();
    return () => {
      setActionsWidthRef.current(side, 0);
    };
  }, [reportActionsWidth, side]);
  useEffect(() => {
    if (!hasContent) return;
    return registerActionsSide(side);
  }, [hasContent, registerActionsSide, side]);
  const resolvedChildren =
    typeof children === 'function'
      ? children({
          side,
          progress,
          translation: ctx.translation,
          isOpen,
          close: ctx.close,
        })
      : children;
  const actionsContextValue = useMemo(
    () => ({
      side,
      progress,
      revealDistance,
      railWidth,
    }),
    [progress, railWidth, revealDistance, side]
  );
  /**
   * Fade mode lifecycle of the action row:
   * - measuring (never measured): mounted invisibly so the rail reports its
   *   travel distance before the first swipe
   * - hidden (measured, covered): unmounted; a placeholder holds the measured
   *   width so the rail's travel distance does not collapse
   * - revealed (partly uncovered): mounted with the entering fade, and
   *   unmounted with the exiting fade once covered again
   */
  const isMeasuring = measuredRowWidth === 0;
  const isRowMounted = !isRevealFadeActive || isMeasuring || isRevealed;
  const placeholderStyle = useMemo(
    () => ({
      width: measuredRowWidth,
    }),
    [measuredRowWidth]
  );
  return (
    <SwipeableRowActionsProvider value={actionsContextValue}>
      <Animated.View
        className={maskClassName}
        style={[swipeableRowStyleSheet.borderCurve, rMaskStyle]}
        onLayout={handleMaskLayout}
        pointerEvents="box-none"
      >
        {isRowMounted ? (
          <Animated.View
            ref={ref}
            {...restProps}
            entering={isMeasuring ? undefined : entering}
            exiting={isMeasuring ? undefined : exiting}
            className={actionsClassName}
            style={[
              style,
              isRevealFadeActive && isMeasuring
                ? swipeableRowStyleSheet.measuringActions
                : undefined,
            ]}
            onLayout={handleActionsLayout}
            pointerEvents={isOpen ? 'auto' : 'none'}
            accessibilityElementsHidden={!isOpen}
            importantForAccessibility={isOpen ? 'auto' : 'no-hide-descendants'}
          >
            {resolvedChildren}
          </Animated.View>
        ) : (
          <View
            style={placeholderStyle}
            pointerEvents="none"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        )}
      </Animated.View>
    </SwipeableRowActionsProvider>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the content
 * card. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. It lives inside the card so it travels with the swipe.
 */
const SwipeableRowContentBackground = forwardRef((props: any, ref: any) => {
  const { className, style, ...restProps } = props;
  const { variant } = useSwipeableRowInternal();
  const backgroundClassName = swipeableRowClassNames.contentBackground({
    variant,
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={backgroundClassName}
      style={[swipeableRowStyleSheet.borderCurve, style]}
      fallbackColor="surface"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const SwipeableRowContent = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    accessibilityActions,
    accessibilityState,
    onAccessibilityAction,
    background,
    ...restProps
  } = props;
  const ctx = useSwipeableRowInternal();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const isOpen = ctx.openSide !== null;
  const contentClassName = swipeableRowClassNames.content({
    variant: ctx.variant,
    className,
  });
  /** Resting radius from classes, overridden by an explicit `style` radius. */
  const resolvedContentStyle = useResolveClassNames(contentClassName);
  const flattenedStyle = StyleSheet.flatten(style);
  const restingBorderRadius =
    typeof flattenedStyle?.borderRadius === 'number'
      ? flattenedStyle.borderRadius
      : typeof resolvedContentStyle.borderRadius === 'number'
        ? resolvedContentStyle.borderRadius
        : undefined;
  const { rBorderRadiusStyle } = useSwipeableRowContentAnimation({
    translation: ctx.translation,
    variant: ctx.variant,
    restingBorderRadius,
    inlineBorderRadiusRange: ctx.inlineBorderRadiusRange,
    inlineBorderRadiusDistance: ctx.inlineBorderRadiusDistance,
  });
  /**
   * Background layer rendered behind the content card.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <SwipeableRowContentBackground />
    ) : null;
  const rowAccessibilityActions = useMemo(() => {
    const actions = [...(accessibilityActions ?? [])];
    if (ctx.isDisabled) return actions;
    if (isOpen) {
      actions.push({
        name: ACCESSIBILITY_ACTION_NAME_MAP.CLOSE,
        label: ctx.accessibilityActionLabels.close,
      });
      return actions;
    }
    if (ctx.availableActionSides.start) {
      actions.push({
        name: ACCESSIBILITY_ACTION_NAME_MAP.OPEN_START,
        label: ctx.accessibilityActionLabels.openStart,
      });
    }
    if (ctx.availableActionSides.end) {
      actions.push({
        name: ACCESSIBILITY_ACTION_NAME_MAP.OPEN_END,
        label: ctx.accessibilityActionLabels.openEnd,
      });
    }
    return actions;
  }, [
    accessibilityActions,
    ctx.accessibilityActionLabels,
    ctx.availableActionSides,
    ctx.isDisabled,
    isOpen,
  ]);
  const handleAccessibilityAction = useCallback(
    (event) => {
      switch (event.nativeEvent.actionName) {
        case ACCESSIBILITY_ACTION_NAME_MAP.OPEN_START:
          if (ctx.isDisabled) return;
          ctx.open('start');
          return;
        case ACCESSIBILITY_ACTION_NAME_MAP.OPEN_END:
          if (ctx.isDisabled) return;
          ctx.open('end');
          return;
        case ACCESSIBILITY_ACTION_NAME_MAP.CLOSE:
          if (ctx.isDisabled) return;
          ctx.close();
          return;
        default:
          onAccessibilityAction?.(event);
      }
    },
    [ctx, onAccessibilityAction]
  );
  return (
    <GestureDetector gesture={ctx.tapGesture}>
      <Animated.View
        ref={ref}
        {...restProps}
        accessible
        accessibilityActions={rowAccessibilityActions}
        accessibilityState={{
          ...accessibilityState,
          disabled: ctx.isDisabled || accessibilityState?.disabled,
          expanded: isOpen,
        }}
        onAccessibilityAction={handleAccessibilityAction}
        className={contentClassName}
        style={[swipeableRowStyleSheet.borderCurve, style, ctx.rContentStyle, rBorderRadiusStyle]}
        pointerEvents={isOpen && ctx.closeOnContentPress ? 'box-only' : 'auto'}
        accessibilityElementsHidden={false}
        importantForAccessibility="auto"
      >
        {backgroundElement}
        {children}
      </Animated.View>
    </GestureDetector>
  );
});
// --------------------------------------------------
const SwipeableRowAction = forwardRef((props: any, ref: any) => {
  const {
    children,
    variant = 'default',
    closeOnPress = true,
    className,
    style,
    disabled,
    onPress,
    accessibilityState,
    accessibilityRole = 'button',
    animation,
    onLayout,
    onPressIn,
    onPressOut,
    ...restProps
  } = props;
  const row = useSwipeableRowInternal();
  const actions = useSwipeableRowActions();
  const isDisabled = disabled || row.isDisabled;
  /** Mirrors Pressable's pressed state for function `style` props. */
  const [isPressed, setIsPressed] = useState(false);
  const actionClassName = swipeableRowClassNames.action({
    variant,
    className,
  });
  const actionContentClassName = swipeableRowClassNames.actionContent();
  const { rContentStyle, rPressStyle, handleLayout, animationOnPressIn, animationOnPressOut } =
    useSwipeableRowActionAnimation({
      animation,
      side: actions?.side,
      progress: actions?.progress,
      revealDistance: actions?.revealDistance,
      railWidth: actions?.railWidth,
    });
  const handlePressIn = useCallback(
    (event) => {
      setIsPressed(true);
      animationOnPressIn();
      onPressIn?.(event);
    },
    [animationOnPressIn, onPressIn]
  );
  const handlePressOut = useCallback(
    (event) => {
      setIsPressed(false);
      animationOnPressOut();
      onPressOut?.(event);
    },
    [animationOnPressOut, onPressOut]
  );
  const handleActionLayout = useCallback(
    (event) => {
      handleLayout(event);
      onLayout?.(event);
    },
    [handleLayout, onLayout]
  );
  /**
   * The animated Pressable only accepts style objects, so a function style is
   * resolved here against the mirrored pressed state.
   */
  const resolvedStyle = useMemo(() => {
    if (typeof style !== 'function') return style;
    // Some React Native type versions also require `hovered`; a variable
    // (rather than an inline literal) satisfies both shapes.
    const pressState = {
      pressed: isPressed,
      hovered: false,
    };
    return style(pressState);
  }, [isPressed, style]);
  const handlePress = useCallback(
    (event) => {
      onPress?.(event);
      if (closeOnPress) row.close();
    },
    [closeOnPress, onPress, row]
  );
  const actionContextValue = useMemo(
    () => ({
      variant,
    }),
    [variant]
  );
  const stringifiedChildren = childrenToString(children);
  const resolvedChildren =
    stringifiedChildren !== null ? (
      <SwipeableRowActionLabel>{stringifiedChildren}</SwipeableRowActionLabel>
    ) : (
      children
    );
  return (
    <SwipeableRowActionProvider value={actionContextValue}>
      <AnimatedPressable
        ref={ref}
        className={actionClassName}
        style={[swipeableRowStyleSheet.borderCurve, resolvedStyle, rPressStyle]}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole={accessibilityRole}
        accessibilityState={{
          ...accessibilityState,
          disabled: isDisabled || accessibilityState?.disabled,
        }}
        {...restProps}
        onLayout={handleActionLayout}
      >
        <Animated.View className={actionContentClassName} style={rContentStyle}>
          {resolvedChildren}
        </Animated.View>
      </AnimatedPressable>
    </SwipeableRowActionProvider>
  );
});
// --------------------------------------------------
const SwipeableRowActionLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const { variant } = useSwipeableRowAction();
  const labelClassName = swipeableRowClassNames.actionLabel({
    variant,
    className,
  });
  return (
    <HeroText ref={ref} className={labelClassName} {...restProps}>
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
SwipeableRowRoot.displayName = DISPLAY_NAME.ROOT;
SwipeableRowActions.displayName = DISPLAY_NAME.ACTIONS;
SwipeableRowContent.displayName = DISPLAY_NAME.CONTENT;
SwipeableRowContentBackground.displayName = DISPLAY_NAME.CONTENT_BACKGROUND;
SwipeableRowAction.displayName = DISPLAY_NAME.ACTION;
SwipeableRowActionLabel.displayName = DISPLAY_NAME.ACTION_LABEL;
/**
 * Compound swipeable row with logical action rails.
 *
 * @component SwipeableRow - Non-clipping root that owns gesture, controlled
 * open state, progress values, and imperative controls. `variant="standalone"`
 * renders a rounded card; `variant="inline"` renders a square, flat list row
 * whose corners round as it is dragged.
 *
 * @component SwipeableRow.Actions - Intrinsically measured action rail anchored
 * to `side="start"` or `side="end"`. It never moves: it rests behind the card,
 * which uncovers it. Function children receive live progress. Under a theme
 * with a translucent card (e.g. `glass`), the action row is mounted only
 * while uncovered and fades in and out with Reanimated `entering` /
 * `exiting` animations, so the forwarded ref is `null` while it is hidden.
 *
 * @component SwipeableRow.Content - Rounded surface card translated as a
 * whole by the swipe gesture. Tapping it while open closes the row by default.
 *
 * @component SwipeableRow.ContentBackground - Theme-aware absolute-fill layer
 * behind the card (a blur under `glass`). Replace or remove it with the
 * `background` prop on `SwipeableRow.Content`.
 *
 * @component SwipeableRow.Action - Accessible action button. Plain text is
 * wrapped in `SwipeableRow.ActionLabel`; the row closes after press by default.
 * Its content slides out from the card, zooms, and fades in over the stretch
 * of travel during which the card uncovers that action.
 *
 * @component SwipeableRow.ActionLabel - Styled text inheriting the enclosing
 * action's visual variant.
 *
 * @note RTL: public sides and translation are logical. `start` / positive
 * translation and `end` / negative translation are mirrored to physical screen
 * coordinates internally via `useIsRTL()`. Action rails use logical CSS insets
 * and paddings, and their reveal window mirrors its travel off `useIsRTL()`.
 */
const SwipeableRow = Object.assign(SwipeableRowRoot, {
  /** Action rail anchored to a logical edge. */
  Actions: SwipeableRowActions,
  /** Draggable row card. */
  Content: SwipeableRowContent,
  /** @optional Theme-aware background layer behind the content card. */
  ContentBackground: SwipeableRowContentBackground,
  /** Pressable action rendered inside an action rail. */
  Action: SwipeableRowAction,
  /** Styled action text inheriting the action variant. */
  ActionLabel: SwipeableRowActionLabel,
});
export default SwipeableRow;
export { useSwipeableRow };
