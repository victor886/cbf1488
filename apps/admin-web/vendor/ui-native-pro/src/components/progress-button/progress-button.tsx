import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable } from 'react-native';
import Animated, { useAnimatedReaction } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { HeroText } from '../../helpers/internal/components/index';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { childrenToString, createContext } from '../../helpers/internal/utils/index';
import {
  useProgressButtonMaskLabelAnimation,
  useProgressButtonOverlayAnimation,
  useProgressButtonRootAnimation,
} from './progress-button.animation';
import {
  DEFAULT_AUTO_RESET_DELAY,
  DEFAULT_HOLD_DURATION_MS,
  DISPLAY_NAME,
} from './progress-button.constants';
import { progressButtonClassNames, progressButtonStyleSheet } from './progress-button.styles';
import type { ProgressButtonContextValue } from './progress-button.types';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
/**
 * Animated version of HeroText for the MaskLabel counter-translation.
 */
const AnimatedHeroText = Animated.createAnimatedComponent(HeroText);
const [ProgressButtonProvider, useProgressButton] = createContext<ProgressButtonContextValue>({
  name: 'ProgressButtonContext',
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the button
 * surface. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const ProgressButtonBackground = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const backgroundClassName = progressButtonClassNames.background({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={backgroundClassName}
      fallbackColor="default"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const ProgressButtonRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    variant = 'default',
    holdDuration = DEFAULT_HOLD_DURATION_MS,
    isCompleted: isCompletedProp,
    isDefaultCompleted = false,
    isDisabled = false,
    autoReset = false,
    autoResetDelay = DEFAULT_AUTO_RESET_DELAY,
    className,
    style,
    onCompleteChange,
    onComplete,
    onReset,
    onPressIn,
    onPressOut,
    onLayout,
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
  const rootClassName = progressButtonClassNames.root({
    variant,
    isDisabled,
    className,
  });
  const autoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInternalChangeRef = useRef(false);
  const {
    isAllAnimationsDisabled,
    progress,
    isProgressCompleted,
    trackWidth,
    textX,
    textWidth,
    rContainerStyle,
    handlePressIn,
    handlePressOut,
    handleLayout,
    resetProgress,
  } = useProgressButtonRootAnimation({
    animation,
    isCompleted,
    holdDuration,
    isInternalChangeRef,
    onPressIn,
    onPressOut,
    onLayout,
  });
  /** Schedules auto-reset after the configured delay */
  const scheduleAutoReset = useCallback(() => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
    }
    autoResetTimerRef.current = setTimeout(() => {
      isInternalChangeRef.current = true;
      resetProgress();
      setIsCompleted(false);
      onReset?.();
    }, autoResetDelay);
  }, [resetProgress, autoResetDelay, setIsCompleted, onReset]);
  /** Marks the button as completed and optionally triggers auto-reset */
  const handleComplete = useCallback(() => {
    isInternalChangeRef.current = true;
    setIsCompleted(true);
    onComplete?.();
    if (autoReset) {
      scheduleAutoReset();
    }
  }, [setIsCompleted, onComplete, autoReset, scheduleAutoReset]);
  /** Fire handleComplete only on the false->true transition */
  useAnimatedReaction(
    () => isProgressCompleted.get(),
    (current, previous) => {
      if (current && !previous) {
        scheduleOnRN(handleComplete);
      }
    }
  );
  /** Clean up auto-reset timer on unmount */
  useEffect(() => {
    return () => {
      if (autoResetTimerRef.current) {
        clearTimeout(autoResetTimerRef.current);
      }
    };
  }, []);
  const reset = useCallback(() => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
    }
    isInternalChangeRef.current = true;
    resetProgress();
    setIsCompleted(false);
    onReset?.();
  }, [resetProgress, setIsCompleted, onReset]);
  const complete = useCallback(() => {
    isInternalChangeRef.current = true;
    setIsCompleted(true);
    onComplete?.();
  }, [setIsCompleted, onComplete]);
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const contextValue = useMemo(
    () => ({
      progress,
      isCompleted,
      trackWidth,
      textX,
      textWidth,
      isDisabled,
      variant,
      reset,
      complete,
    }),
    [progress, isCompleted, trackWidth, textX, textWidth, isDisabled, variant, reset, complete]
  );
  const renderProps = {
    progress,
    isCompleted,
    trackWidth,
    textX,
    textWidth,
    isDisabled,
    variant,
  };
  const stringifiedChildren = typeof children !== 'function' ? childrenToString(children) : null;
  const resolvedChildren =
    typeof children === 'function' ? (
      children(renderProps)
    ) : stringifiedChildren ? (
      <>
        <ProgressButtonLabel>{stringifiedChildren}</ProgressButtonLabel>
        <ProgressButtonOverlay>
          <ProgressButtonMaskLabel>{stringifiedChildren}</ProgressButtonMaskLabel>
        </ProgressButtonOverlay>
      </>
    ) : (
      children
    );
  /**
   * Background layer rendered behind the button surface.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content (the root always paints `--color-default`)
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <ProgressButtonBackground />
    ) : null;
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <ProgressButtonProvider value={contextValue}>
        <AnimatedPressable
          ref={ref}
          className={rootClassName}
          style={[progressButtonStyleSheet.root, rContainerStyle, style]}
          disabled={isDisabled}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLayout={handleLayout}
          accessibilityRole="button"
          accessibilityState={{
            disabled: isDisabled,
          }}
          {...restProps}
        >
          {backgroundElement}
          {resolvedChildren}
        </AnimatedPressable>
      </ProgressButtonProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const ProgressButtonLabel = forwardRef((props: any, ref: any) => {
  const { children, className, onLayout, ...restProps } = props;
  const ctx = useProgressButton();
  const labelClassName = progressButtonClassNames.label({
    variant: ctx.variant,
    className,
  });
  const handleTextLayout = useCallback(
    (event) => {
      ctx.textX.set(event.nativeEvent.layout.x);
      ctx.textWidth.set(event.nativeEvent.layout.width);
      onLayout?.(event);
    },
    [ctx.textX, ctx.textWidth, onLayout]
  );
  return (
    <HeroText ref={ref} className={labelClassName} onLayout={handleTextLayout} {...restProps}>
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
const ProgressButtonOverlay = forwardRef((props: any, ref: any) => {
  const { children, className, style, ...restProps } = props;
  const ctx = useProgressButton();
  const { rOverlayStyle, rWidthStyle } = useProgressButtonOverlayAnimation({
    progress: ctx.progress,
    trackWidth: ctx.trackWidth,
  });
  const overlayClassName = progressButtonClassNames.overlay({
    variant: ctx.variant,
    className,
  });
  return (
    <Animated.View
      ref={ref}
      className={overlayClassName}
      style={[rOverlayStyle, rWidthStyle, style]}
      {...restProps}
    >
      <Animated.View className="h-full" style={rWidthStyle} />
      {children}
    </Animated.View>
  );
});
// --------------------------------------------------
const ProgressButtonMaskLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const ctx = useProgressButton();
  const { rMaskLabelStyle } = useProgressButtonMaskLabelAnimation({
    progress: ctx.progress,
    trackWidth: ctx.trackWidth,
    textX: ctx.textX,
    textWidth: ctx.textWidth,
  });
  const maskLabelClassName = progressButtonClassNames.maskLabel({
    variant: ctx.variant,
    className,
  });
  return (
    <AnimatedHeroText
      ref={ref}
      className={maskLabelClassName}
      style={rMaskLabelStyle}
      {...restProps}
    >
      {children}
    </AnimatedHeroText>
  );
});
// --------------------------------------------------
ProgressButtonRoot.displayName = DISPLAY_NAME.ROOT;
ProgressButtonBackground.displayName = DISPLAY_NAME.BACKGROUND;
ProgressButtonOverlay.displayName = DISPLAY_NAME.OVERLAY;
ProgressButtonLabel.displayName = DISPLAY_NAME.LABEL;
ProgressButtonMaskLabel.displayName = DISPLAY_NAME.MASK_LABEL;
/**
 * Compound ProgressButton component with sub-components
 *
 * @component ProgressButton - Root container managing press-and-hold state.
 * Uses an AnimatedPressable that scales down on press and fills a progress
 * animation from 0 to 1 over the configured hold duration. Supports controlled
 * and uncontrolled completion state with optional auto-reset.
 *
 * @component ProgressButton.Background - Absolute-fill background container
 * behind the button surface. With no children, the active library theme
 * decides the default content (e.g. a glass blur layer); pass children to
 * host custom content with the same positioning and clipping.
 *
 * @component ProgressButton.Label - Base text layer always visible beneath the overlay.
 * Captures its own layout position (x, width) to enable the MaskLabel
 * counter-animation for the color-wipe effect.
 *
 * @component ProgressButton.Overlay - Absolutely positioned layer
 * that sweeps left-to-right via animated translateX with a variant-colored
 * background. Renders children (typically MaskLabel).
 *
 * @component ProgressButton.MaskLabel - Inverted-color text inside the Overlay.
 * Counter-translates to stay visually aligned with the base Label, creating
 * the illusion that a single label changes color as the fill sweeps across.
 *
 * Props flow from ProgressButton to sub-components via context
 * (progress, isCompleted, trackWidth, textX, textWidth, variant, isDisabled).
 *
 */
const ProgressButton = Object.assign(ProgressButtonRoot, {
  /** @optional Theme-aware background container behind the button surface */
  Background: ProgressButtonBackground,
  /** @optional Base text label (captures layout for MaskLabel alignment) */
  Label: ProgressButtonLabel,
  /** @optional Overlay that sweeps left-to-right on hold */
  Overlay: ProgressButtonOverlay,
  /** @optional Inverted-color text for color-wipe effect inside Overlay */
  MaskLabel: ProgressButtonMaskLabel,
});
export default ProgressButton;
export { useProgressButton };
