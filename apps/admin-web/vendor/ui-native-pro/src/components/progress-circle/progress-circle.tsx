import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { useThemeColor } from 'heroui-native/hooks';
import { HeroText } from '../../helpers/internal/components/index';
import { createContext } from '../../helpers/internal/utils/index';
import {
  useProgressCircleFillAnimation,
  useProgressCircleIndicatorRootAnimation,
  useProgressCircleRootAnimation,
  useProgressCircleSpinAnimation,
} from './progress-circle.animation';
import {
  CENTER,
  DEFAULT_COLOR,
  DEFAULT_FORMAT_OPTIONS,
  DEFAULT_MAX_VALUE,
  DEFAULT_MIN_VALUE,
  DEFAULT_SIZE,
  DISPLAY_NAME,
  SIZE_MAP,
  STROKE_WIDTH,
} from './progress-circle.constants';
import { progressCircleClassNames } from './progress-circle.styles';
import type { ProgressCircleContextValue } from './progress-circle.types';
import { clampPercentage, formatProgressValue } from './progress-circle.utils';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
// --------------------------------------------------
const [ProgressCircleProvider, useProgressCircle] = createContext<ProgressCircleContextValue>({
  name: 'ProgressCircleContext',
});
// --------------------------------------------------
const ProgressCircleRoot = forwardRef((props: any, ref: any) => {
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
  const percentage = isIndeterminate ? 0 : clampPercentage(value, minValue, maxValue);
  const valueText = isIndeterminate
    ? ''
    : formatProgressValue(value, minValue, maxValue, formatOptions);
  const { isAllAnimationsDisabled } = useProgressCircleRootAnimation({
    animation,
  });
  const rootClassName = progressCircleClassNames.root({
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
      percentage,
      valueText,
      isIndeterminate,
      isDisabled,
      size,
      color,
    }),
    [percentage, valueText, isIndeterminate, isDisabled, size, color]
  );
  const renderProps = {
    percentage,
    valueText,
    isIndeterminate,
  };
  const resolvedChildren = typeof children === 'function' ? children(renderProps) : children;
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <ProgressCircleProvider value={contextValue}>
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
      </ProgressCircleProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const ProgressCircleIndicator = forwardRef((props: any, ref: any) => {
  const { strokeWidth = STROKE_WIDTH, trackColor, fillColor, animation, ...restProps } = props;
  const ctx = useProgressCircle();
  const { fillTimingConfig, spinTimingConfig, isAnimationDisabled } =
    useProgressCircleIndicatorRootAnimation({
      animation,
    });
  const themeDefaultColor = useThemeColor('default');
  const themeDefaultForeground = useThemeColor('default-foreground');
  const themeAccent = useThemeColor('accent');
  const themeSuccess = useThemeColor('success');
  const themeWarning = useThemeColor('warning');
  const themeDanger = useThemeColor('danger');
  const fillColorMap = {
    default: themeDefaultForeground,
    accent: themeAccent,
    success: themeSuccess,
    warning: themeWarning,
    danger: themeDanger,
  };
  const resolvedTrackColor = trackColor ?? themeDefaultColor;
  const resolvedFillColor = fillColor ?? fillColorMap[ctx.color] ?? themeAccent;
  const circleSize = typeof ctx.size === 'number' ? ctx.size : SIZE_MAP[ctx.size];
  const radius = CENTER - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  if (ctx.isIndeterminate) {
    return (
      <IndeterminateIndicator
        ref={ref}
        circleSize={circleSize}
        strokeWidth={strokeWidth}
        radius={radius}
        circumference={circumference}
        trackColor={resolvedTrackColor}
        fillColor={resolvedFillColor}
        isAnimationDisabled={isAnimationDisabled}
        spinTimingConfig={spinTimingConfig}
        {...restProps}
      />
    );
  }
  return (
    <DeterminateIndicator
      ref={ref}
      circleSize={circleSize}
      strokeWidth={strokeWidth}
      radius={radius}
      circumference={circumference}
      percentage={ctx.percentage}
      trackColor={resolvedTrackColor}
      fillColor={resolvedFillColor}
      isAnimationDisabled={isAnimationDisabled}
      fillTimingConfig={fillTimingConfig}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const DeterminateIndicator = forwardRef((props: any, ref: any) => {
  const {
    circleSize,
    strokeWidth = STROKE_WIDTH,
    radius,
    circumference,
    percentage,
    trackColor,
    fillColor,
    isAnimationDisabled,
    fillTimingConfig,
    ...restProps
  } = props;
  const { animatedFillProps } = useProgressCircleFillAnimation({
    percentage,
    isAnimationDisabled,
    fillTimingConfig,
  });
  return (
    <View
      ref={ref}
      accessible={false}
      accessibilityRole="none"
      importantForAccessibility="no"
      {...restProps}
    >
      <Svg
        width={circleSize}
        height={circleSize}
        viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}
        fill="none"
      >
        <Circle cx={CENTER} cy={CENTER} r={radius} stroke={trackColor} strokeWidth={strokeWidth} />
        <AnimatedCircle
          cx={CENTER}
          cy={CENTER}
          r={radius}
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
          animatedProps={animatedFillProps}
        />
      </Svg>
    </View>
  );
});
// --------------------------------------------------
const IndeterminateIndicator = forwardRef((props: any, ref: any) => {
  const {
    circleSize,
    strokeWidth = STROKE_WIDTH,
    radius,
    circumference,
    trackColor,
    fillColor,
    isAnimationDisabled,
    spinTimingConfig,
    ...restProps
  } = props;
  const { rSpinStyle } = useProgressCircleSpinAnimation({
    isAnimationDisabled,
    spinTimingConfig,
  });
  const indeterminateOffset = circumference * 0.75;
  return (
    <View
      ref={ref}
      accessible={false}
      accessibilityRole="none"
      importantForAccessibility="no"
      {...restProps}
    >
      <Animated.View style={rSpinStyle}>
        <Svg
          width={circleSize}
          height={circleSize}
          viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}
          fill="none"
        >
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={radius}
            stroke={fillColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={indeterminateOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${CENTER} ${CENTER})`}
          />
        </Svg>
      </Animated.View>
    </View>
  );
});
// --------------------------------------------------
const ProgressCircleValueLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const ctx = useProgressCircle();
  if (ctx.isIndeterminate) return null;
  const textSize =
    typeof ctx.size === 'number'
      ? ctx.size >= 48
        ? 'lg'
        : ctx.size >= 36
          ? 'md'
          : 'sm'
      : ctx.size;
  const valueLabelClassName = progressCircleClassNames.valueLabel({
    size: textSize,
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
ProgressCircleRoot.displayName = DISPLAY_NAME.ROOT;
ProgressCircleIndicator.displayName = DISPLAY_NAME.INDICATOR;
ProgressCircleValueLabel.displayName = DISPLAY_NAME.VALUE_LABEL;
/**
 * Compound ProgressCircle component with sub-components
 *
 * @component ProgressCircle - Root container managing progress state and
 * variant configuration. Computes percentage and formatted value text from
 * `value`, `minValue`, `maxValue`, and `formatOptions`.
 *
 * @component ProgressCircle.Indicator - SVG rendering of the track and fill
 * circles. Automatically switches between determinate (animated
 * `strokeDashoffset`) and indeterminate (continuous rotation) modes based on
 * the root's `isIndeterminate` prop.
 *
 * @component ProgressCircle.ValueLabel - Text centered on the circle
 * displaying the formatted progress value. Renders with tabular figures for
 * consistent digit alignment. Hidden when indeterminate.
 *
 * Props flow from ProgressCircle to sub-components via context
 * (percentage, valueText, isIndeterminate, isDisabled, size, color).
 *
 */
const ProgressCircle = Object.assign(ProgressCircleRoot, {
  /** SVG indicator with track and fill circles */
  Indicator: ProgressCircleIndicator,
  /** Formatted progress value centered on the circle */
  ValueLabel: ProgressCircleValueLabel,
});
export default ProgressCircle;
export { useProgressCircle };
