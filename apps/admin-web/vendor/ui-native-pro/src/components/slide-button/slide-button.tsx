import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { HeroText } from '../../helpers/internal/components/index';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { createContext } from '../../helpers/internal/utils/index';
import {
  useSlideButtonOverlayAnimation,
  useSlideButtonRootAnimation,
  useSlideButtonThumbAnimation,
  useSlideButtonUnderlayAnimation,
} from './slide-button.animation';
import {
  DEFAULT_AUTO_RESET_DELAY,
  DEFAULT_COMPLETION_THRESHOLD,
  DISPLAY_NAME,
} from './slide-button.constants';
import { ChevronRightIcon } from './slide-button.icons';
import { slideButtonClassNames, slideButtonStyleSheet } from './slide-button.styles';
import type { SlideButtonContextValue } from './slide-button.types';
const [SlideButtonProvider, useSlideButton] = createContext<SlideButtonContextValue>({
  name: 'SlideButtonContext',
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the container
 * surface. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied. The container
 * paints the `--color-default` tint, so the Android / web fallback flattens
 * the `default` token to match.
 */
const SlideButtonContainerBackground = forwardRef(({ className, ...props }: any, ref: any) => {
  const containerBackgroundClassName = slideButtonClassNames.containerBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={containerBackgroundClassName}
      fallbackColor="default"
      {...props}
    />
  );
});
// --------------------------------------------------
const SlideButtonRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    variant = 'default',
    isCompleted: isCompletedProp,
    isDefaultCompleted = false,
    isDisabled = false,
    completionThreshold = DEFAULT_COMPLETION_THRESHOLD,
    autoReset = false,
    autoResetDelay = DEFAULT_AUTO_RESET_DELAY,
    className,
    classNames,
    styles: stylesProp,
    style,
    onCompleteChange,
    onComplete,
    onReset,
    animation,
    background,
    ...restProps
  } = props;
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const [isCompleted = false, setIsCompleted] = useControllableState({
    prop: isCompletedProp,
    defaultProp: isDefaultCompleted,
    onChange: onCompleteChange,
  });
  const { container: containerSlot, contentContainer: contentContainerSlot } =
    slideButtonClassNames.root({
      isDisabled,
    });
  const containerClassName = containerSlot({
    className: [className, classNames?.container],
  });
  const contentContainerClassName = contentContainerSlot({
    className: classNames?.contentContainer,
  });
  const progress = useSharedValue(isCompleted ? 1 : 0);
  const trackWidth = useSharedValue(0);
  const trackHeight = useSharedValue(0);
  const thumbWidth = useSharedValue(0);
  const thumbHeight = useSharedValue(0);
  const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInternalChangeRef = useRef(false);
  const prevIsCompletedRef = useRef(isCompleted);
  const { isAllAnimationsDisabled, resetSpringConfig } = useSlideButtonRootAnimation({
    animation,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const resetProgress = useCallback(() => {
    if (isAllAnimationsDisabled) {
      progress.set(0);
    } else {
      progress.set(withSpring(0, resetSpringConfig));
    }
  }, [isAllAnimationsDisabled, progress, resetSpringConfig]);
  const handleLayout = useCallback(
    (event) => {
      const { width, height } = event.nativeEvent.layout;
      trackWidth.set(width);
      trackHeight.set(height);
    },
    [trackWidth, trackHeight]
  );
  const handleComplete = useCallback(() => {
    isInternalChangeRef.current = true;
    setIsCompleted(true);
    onComplete?.();
    if (autoReset) {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
      autoResetTimerRef.current = setTimeout(() => {
        isInternalChangeRef.current = true;
        resetProgress();
        setIsCompleted(false);
        onReset?.();
      }, autoResetDelay);
    }
  }, [setIsCompleted, onComplete, autoReset, autoResetDelay, resetProgress, onReset]);
  const reset = useCallback(() => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
    }
    isInternalChangeRef.current = true;
    resetProgress();
    setIsCompleted(false);
    onReset?.();
  }, [resetProgress, setIsCompleted, onReset]);
  /**
   * Sync progress with external controlled state changes.
   * Skips when the change was triggered internally (gesture, auto-reset, reset).
   */
  useEffect(() => {
    const prev = prevIsCompletedRef.current;
    prevIsCompletedRef.current = isCompleted;
    if (prev === isCompleted) return;
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (isCompleted) {
      if (isAllAnimationsDisabled) {
        progress.set(1);
      } else {
        progress.set(withSpring(1, resetSpringConfig));
      }
    } else {
      resetProgress();
    }
  }, [isCompleted, isAllAnimationsDisabled, progress, resetSpringConfig, resetProgress]);
  const contextValue = useMemo(
    () => ({
      progress,
      isCompleted,
      trackWidth,
      trackHeight,
      thumbWidth,
      thumbHeight,
      completionThreshold,
      isDisabled,
      variant,
      reset,
      complete: handleComplete,
    }),
    [
      progress,
      isCompleted,
      trackWidth,
      trackHeight,
      thumbWidth,
      thumbHeight,
      completionThreshold,
      isDisabled,
      variant,
      reset,
      handleComplete,
    ]
  );
  const renderProps = {
    progress,
    isCompleted,
    trackWidth,
    trackHeight,
    thumbWidth,
    thumbHeight,
    isDisabled,
    variant,
  };
  const resolvedChildren = typeof children === 'function' ? children(renderProps) : children;
  /**
   * Background layer rendered behind the container surface.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <SlideButtonContainerBackground />
    ) : null;
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <SlideButtonProvider value={contextValue}>
        <View
          ref={ref}
          className={containerClassName}
          style={[slideButtonStyleSheet.root, stylesProp?.container, style]}
          accessibilityRole="button"
          accessibilityState={{
            disabled: isDisabled,
          }}
          {...restProps}
        >
          {backgroundElement}
          <View
            className={contentContainerClassName}
            style={stylesProp?.contentContainer}
            onLayout={handleLayout}
          >
            {resolvedChildren}
          </View>
        </View>
      </SlideButtonProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const SlideButtonUnderlayContent = forwardRef((props: any, ref: any) => {
  const { children, className, classNames, styles: stylesProp, style, ...restProps } = props;
  const ctx = useSlideButton();
  const { rClipStyle, rInnerStyle } = useSlideButtonUnderlayAnimation({
    progress: ctx.progress,
    trackWidth: ctx.trackWidth,
    thumbWidth: ctx.thumbWidth,
  });
  const { container: containerSlot, contentContainer: contentContainerSlot } =
    slideButtonClassNames.underlayContent();
  const containerClassName = containerSlot({
    className: [className, classNames?.container],
  });
  const contentContainerClassName = contentContainerSlot({
    className: classNames?.contentContainer,
  });
  return (
    <Animated.View
      ref={ref}
      className={containerClassName}
      style={[rClipStyle, stylesProp?.container, style]}
      {...restProps}
    >
      <Animated.View
        className={contentContainerClassName}
        style={[rInnerStyle, stylesProp?.contentContainer]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
});
// --------------------------------------------------
const SlideButtonOverlayContent = forwardRef((props: any, ref: any) => {
  const { children, className, classNames, styles: stylesProp, style, ...restProps } = props;
  const ctx = useSlideButton();
  const { rClipStyle, rInnerStyle } = useSlideButtonOverlayAnimation({
    progress: ctx.progress,
    trackWidth: ctx.trackWidth,
    thumbWidth: ctx.thumbWidth,
  });
  const { container: overlayContainerSlot, contentContainer: overlayContentSlot } =
    slideButtonClassNames.overlayContent({
      variant: ctx.variant,
    });
  const containerClassName = overlayContainerSlot({
    className: [className, classNames?.container],
  });
  const contentContainerClassName = overlayContentSlot({
    className: classNames?.contentContainer,
  });
  return (
    <Animated.View
      ref={ref}
      className={containerClassName}
      style={[rClipStyle, stylesProp?.container, style]}
      {...restProps}
    >
      <Animated.View
        className={contentContainerClassName}
        style={[rInnerStyle, stylesProp?.contentContainer]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the thumb
 * surface. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const SlideButtonThumbBackground = forwardRef(({ className, ...props }: any, ref: any) => {
  const thumbBackgroundClassName = slideButtonClassNames.thumbBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={thumbBackgroundClassName}
      fallbackColor="surface"
      {...props}
    />
  );
});
// --------------------------------------------------
const SlideButtonThumb = forwardRef((props: any, ref: any) => {
  const {
    children,
    className,
    style,
    animation,
    isAnimatedStyleActive = true,
    iconProps,
    onLayout,
    background,
    ...restProps
  } = props;
  const ctx = useSlideButton();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const { rThumbStyle, panGesture } = useSlideButtonThumbAnimation({
    animation,
    progress: ctx.progress,
    isCompleted: ctx.isCompleted,
    trackWidth: ctx.trackWidth,
    thumbWidth: ctx.thumbWidth,
    completionThreshold: ctx.completionThreshold,
    isDisabled: ctx.isDisabled,
    complete: ctx.complete,
  });
  const thumbClassName = slideButtonClassNames.thumb({
    className,
  });
  const thumbStyle = isAnimatedStyleActive ? [rThumbStyle, style] : [style];
  const handleThumbLayout = useCallback(
    (event) => {
      const { width, height } = event.nativeEvent.layout;
      ctx.thumbWidth.set(width);
      ctx.thumbHeight.set(height);
      onLayout?.(event);
    },
    [ctx.thumbWidth, ctx.thumbHeight, onLayout]
  );
  /**
   * Background layer rendered behind the thumb surface. `undefined` falls
   * back to the theme-aware default; `null` removes the layer.
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <SlideButtonThumbBackground />
    ) : null;
  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        ref={ref}
        className={thumbClassName}
        style={thumbStyle}
        onLayout={handleThumbLayout}
        {...restProps}
      >
        {backgroundElement}
        {children ?? <ChevronRightIcon {...iconProps} />}
      </Animated.View>
    </GestureDetector>
  );
});
// --------------------------------------------------
// --------------------------------------------------
const SlideButtonLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const { variant } = useSlideButton();
  const labelClassName = slideButtonClassNames.label({
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
SlideButtonRoot.displayName = DISPLAY_NAME.ROOT;
SlideButtonUnderlayContent.displayName = DISPLAY_NAME.UNDERLAY_CONTENT;
SlideButtonOverlayContent.displayName = DISPLAY_NAME.OVERLAY_CONTENT;
SlideButtonThumb.displayName = DISPLAY_NAME.THUMB;
SlideButtonThumbBackground.displayName = DISPLAY_NAME.THUMB_BACKGROUND;
SlideButtonContainerBackground.displayName = DISPLAY_NAME.CONTAINER_BACKGROUND;
SlideButtonLabel.displayName = DISPLAY_NAME.LABEL;
/**
 * Compound SlideButton component with sub-components
 *
 * @component SlideButton - Root container managing slide gesture state.
 * Provides progress, completion, and variant context to sub-components.
 * Supports controlled and uncontrolled completion state with optional auto-reset.
 *
 * @component SlideButton.UnderlayContent - Static content layer beneath the overlay.
 * Renders at full track width for label text, gradients, or patterns.
 * Supports render-prop children for progress-driven animations.
 *
 * @component SlideButton.OverlayContent - Progress fill layer that clips from left.
 * Uses overflow-hidden with animated width tied to thumb position.
 * Inner container maintains full track width for natural content layout.
 *
 * @component SlideButton.Thumb - Draggable handle driven by Pan gesture.
 * Uses react-native-gesture-handler for 60fps native gesture tracking.
 * Renders a chevron-right icon by default; accepts custom children.
 *
 * @component SlideButton.ThumbBackground - Absolute-fill background container
 * behind the thumb surface. With no children, the active library theme
 * decides the content (glass theme renders a blur layer with a
 * surface-matched fallback). Accepts children to host custom content such as
 * gradients with the container's positioning and clipping applied.
 * Replaceable via the `background` prop on SlideButton.Thumb.
 *
 * @component SlideButton.ContainerBackground - Absolute-fill background
 * container behind the container surface. With no children, the active
 * library theme decides the content (glass theme renders a blur layer with a
 * default-matched fallback). Replaceable via the `background` prop on
 * SlideButton.
 *
 * @component SlideButton.Label - Styled text that inherits the variant color.
 * Use inside UnderlayContent or OverlayContent for consistent label text.
 *
 * Props flow from SlideButton to sub-components via context
 * (progress, isCompleted, trackWidth, trackHeight, variant, isDisabled).
 *
 */
const SlideButton = Object.assign(SlideButtonRoot, {
  /** @optional Static content beneath the overlay (label, gradient, pattern) */
  UnderlayContent: SlideButtonUnderlayContent,
  /** @optional Progress fill layer clipped to thumb position */
  OverlayContent: SlideButtonOverlayContent,
  /** @optional Draggable thumb handle with gesture support */
  Thumb: SlideButtonThumb,
  /** @optional Theme-aware background container behind the thumb surface */
  ThumbBackground: SlideButtonThumbBackground,
  /** @optional Theme-aware background container behind the container surface */
  ContainerBackground: SlideButtonContainerBackground,
  /** @optional Styled text label that inherits the variant color */
  Label: SlideButtonLabel,
});
export default SlideButton;
export { useSlideButton };
