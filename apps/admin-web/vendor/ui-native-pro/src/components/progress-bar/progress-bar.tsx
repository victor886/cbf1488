import { forwardRef, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { HeroText } from '../../helpers/internal/components/index';
import { childrenToString, createContext } from '../../helpers/internal/utils/index';
import {
  useProgressBarFillAnimation,
  useProgressBarFillRootAnimation,
  useProgressBarIndeterminateAnimation,
  useProgressBarRootAnimation,
} from './progress-bar.animation';
import {
  DEFAULT_COLOR,
  DEFAULT_FORMAT_OPTIONS,
  DEFAULT_MAX_VALUE,
  DEFAULT_MIN_VALUE,
  DEFAULT_SIZE,
  DISPLAY_NAME,
} from './progress-bar.constants';
import { progressBarClassNames, progressBarStyleSheet } from './progress-bar.styles';
import type { ProgressBarContextValue } from './progress-bar.types';
import { clampPercentage, formatProgressValue } from './progress-bar.utils';
const [ProgressBarProvider, useProgressBar] = createContext<ProgressBarContextValue>({
  name: 'ProgressBarContext',
});
// --------------------------------------------------
const ProgressBarRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    value = 0,
    minValue = DEFAULT_MIN_VALUE,
    maxValue = DEFAULT_MAX_VALUE,
    isIndeterminate = false,
    isDisabled = false,
    size = DEFAULT_SIZE,
    color = DEFAULT_COLOR,
    formatOptions = DEFAULT_FORMAT_OPTIONS,
    className,
    animation,
    ...restProps
  } = props;
  const [trackWidth, setTrackWidth] = useState(0);
  const percentage = isIndeterminate ? 0 : clampPercentage(value, minValue, maxValue);
  const valueText = isIndeterminate
    ? ''
    : formatProgressValue(value, minValue, maxValue, formatOptions);
  const { isAllAnimationsDisabled } = useProgressBarRootAnimation({
    animation,
  });
  const onTrackLayout = useCallback((width) => {
    setTrackWidth(width);
  }, []);
  const rootClassName = progressBarClassNames.root({
    isDisabled,
    className,
  });
  const labelRowClassName = progressBarClassNames.labelRow();
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const contextValue = useMemo(
    () => ({
      percentage,
      valueText,
      isIndeterminate,
      isDisabled,
      size,
      color,
      trackWidth,
      onTrackLayout,
    }),
    [percentage, valueText, isIndeterminate, isDisabled, size, color, trackWidth, onTrackLayout]
  );
  const renderProps = {
    percentage,
    valueText,
    isIndeterminate,
  };
  const stringifiedChildren = typeof children !== 'function' ? childrenToString(children) : null;
  const resolvedChildren =
    typeof children === 'function' ? (
      children(renderProps)
    ) : stringifiedChildren ? (
      <>
        <View className={labelRowClassName}>
          <ProgressBarLabel>{stringifiedChildren}</ProgressBarLabel>
          <ProgressBarValueLabel />
        </View>
        <ProgressBarTrack>
          <ProgressBarFill />
        </ProgressBarTrack>
      </>
    ) : (
      children
    );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <ProgressBarProvider value={contextValue}>
        <View
          ref={ref}
          className={rootClassName}
          accessibilityRole="progressbar"
          accessibilityValue={{
            min: minValue,
            max: maxValue,
            now: isIndeterminate ? undefined : value,
            text: isIndeterminate ? undefined : valueText,
          }}
          accessibilityState={{
            disabled: isDisabled,
          }}
          {...restProps}
        >
          {resolvedChildren}
        </View>
      </ProgressBarProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the track
 * surface. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const ProgressBarTrackBackground = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const trackBackgroundClassName = progressBarClassNames.trackBackground({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={trackBackgroundClassName}
      fallbackColor="default"
      {...restProps}
    />
  );
});
// --------------------------------------------------
const ProgressBarTrack = forwardRef((props: any, ref: any) => {
  const { children, className, style, onLayout, background, ...restProps } = props;
  const ctx = useProgressBar();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const trackClassName = progressBarClassNames.track({
    size: ctx.size,
    className,
  });
  const { onTrackLayout } = ctx;
  const handleLayout = useCallback(
    (event) => {
      onTrackLayout(event.nativeEvent.layout.width);
      onLayout?.(event);
    },
    [onTrackLayout, onLayout]
  );
  /**
   * Background layer rendered behind the track surface.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content (the track paints `--color-default`)
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <ProgressBarTrackBackground />
    ) : null;
  return (
    <View
      ref={ref}
      accessible={false}
      accessibilityRole="none"
      importantForAccessibility="no"
      className={trackClassName}
      style={[progressBarStyleSheet.track, style]}
      onLayout={handleLayout}
      {...restProps}
    >
      {backgroundElement}
      {children}
    </View>
  );
});
// --------------------------------------------------
const ProgressBarFill = forwardRef((props: any, ref: any) => {
  const { className, animation, isAnimatedStyleActive = true, ...restProps } = props;
  const ctx = useProgressBar();
  const { fillTimingConfig, indeterminateFillTimingConfig, isAnimationDisabled } =
    useProgressBarFillRootAnimation({
      animation,
    });
  const fillClassName = progressBarClassNames.fill({
    color: ctx.color,
    className,
  });
  if (ctx.isIndeterminate) {
    return (
      <ProgressBarIndeterminateFill
        ref={ref}
        className={fillClassName}
        trackWidth={ctx.trackWidth}
        indeterminateFillTimingConfig={indeterminateFillTimingConfig}
        isAnimationDisabled={isAnimationDisabled}
        isAnimatedStyleActive={isAnimatedStyleActive}
        {...restProps}
      />
    );
  }
  return (
    <ProgressBarDeterminateFill
      ref={ref}
      className={fillClassName}
      percentage={ctx.percentage}
      fillTimingConfig={fillTimingConfig}
      isAnimationDisabled={isAnimationDisabled}
      isAnimatedStyleActive={isAnimatedStyleActive}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const ProgressBarDeterminateFill = forwardRef((props: any, ref: any) => {
  const {
    className,
    style,
    percentage,
    fillTimingConfig,
    isAnimationDisabled,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { rFillStyle } = useProgressBarFillAnimation({
    percentage,
    isAnimationDisabled,
    fillTimingConfig,
  });
  const fillStyle = isAnimatedStyleActive ? [rFillStyle, style] : style;
  return (
    <Animated.View
      ref={ref}
      accessible={false}
      accessibilityRole="none"
      importantForAccessibility="no"
      className={className}
      style={fillStyle}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const ProgressBarIndeterminateFill = forwardRef((props: any, ref: any) => {
  const {
    className,
    style,
    trackWidth,
    indeterminateFillTimingConfig,
    isAnimationDisabled,
    isAnimatedStyleActive = true,
    ...restProps
  } = props;
  const { rIndeterminateFillStyle } = useProgressBarIndeterminateAnimation({
    trackWidth,
    isAnimationDisabled,
    indeterminateFillTimingConfig,
  });
  const fillStyle = isAnimatedStyleActive ? [rIndeterminateFillStyle, style] : style;
  return (
    <Animated.View
      ref={ref}
      accessible={false}
      accessibilityRole="none"
      importantForAccessibility="no"
      className={className}
      style={fillStyle}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const ProgressBarLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const labelClassName = progressBarClassNames.label({
    className,
  });
  return (
    <HeroText
      ref={ref}
      accessible={false}
      accessibilityRole="text"
      importantForAccessibility="no"
      className={labelClassName}
      {...restProps}
    >
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
const ProgressBarValueLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const ctx = useProgressBar();
  if (ctx.isIndeterminate) return null;
  const valueLabelClassName = progressBarClassNames.valueLabel({
    className,
  });
  const displayContent = children ?? ctx.valueText;
  return (
    <HeroText
      ref={ref}
      accessible={false}
      accessibilityRole="text"
      importantForAccessibility="no"
      className={valueLabelClassName}
      {...restProps}
    >
      {displayContent}
    </HeroText>
  );
});
// --------------------------------------------------
ProgressBarRoot.displayName = DISPLAY_NAME.ROOT;
ProgressBarTrack.displayName = DISPLAY_NAME.TRACK;
ProgressBarTrackBackground.displayName = DISPLAY_NAME.TRACK_BACKGROUND;
ProgressBarFill.displayName = DISPLAY_NAME.FILL;
ProgressBarLabel.displayName = DISPLAY_NAME.LABEL;
ProgressBarValueLabel.displayName = DISPLAY_NAME.VALUE_LABEL;
/**
 * Compound ProgressBar component with sub-components
 *
 * @component ProgressBar - Root container managing progress state and variant
 * configuration. Computes percentage and formatted value text from `value`,
 * `minValue`, `maxValue`, and `formatOptions`. When plain string children are
 * provided, they auto-expand into Label + ValueLabel + Track(Fill).
 *
 * @component ProgressBar.Track - Background container for the fill element.
 * Applies rounded corners, overflow hidden, and size-based height.
 *
 * @component ProgressBar.TrackBackground - Absolute-fill background container
 * behind the track surface. With no children, the active library theme
 * decides the default content (e.g. a glass blur layer); pass children to
 * host custom content with the same positioning and clipping.
 *
 * @component ProgressBar.Fill - Animated element representing filled progress.
 * Automatically switches between determinate (width animation) and
 * indeterminate (translateX sweep) based on the root's `isIndeterminate` prop.
 *
 * @component ProgressBar.Label - Text describing the progress operation.
 *
 * @component ProgressBar.ValueLabel - Displays the formatted progress value.
 * Renders with tabular figures for consistent digit alignment. Hidden when
 * indeterminate.
 *
 * Props flow from ProgressBar to sub-components via context
 * (percentage, valueText, isIndeterminate, isDisabled, size, color).
 *
 */
const ProgressBar = Object.assign(ProgressBarRoot, {
  /** Background container for the fill element */
  Track: ProgressBarTrack,
  /** Theme-aware background container behind the track surface */
  TrackBackground: ProgressBarTrackBackground,
  /** Animated fill representing progress */
  Fill: ProgressBarFill,
  /** Text label describing the operation */
  Label: ProgressBarLabel,
  /** Formatted progress value text */
  ValueLabel: ProgressBarValueLabel,
});
export default ProgressBar;
export { useProgressBar };
