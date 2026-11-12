// @ts-nocheck
import { forwardRef, useMemo } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { HeroText } from '../../helpers/internal/components/index';
import { childrenToString, createContext } from '../../helpers/internal/utils/index';
import {
  useStackedMeterRootAnimation,
  useStackedMeterSegmentAnimation,
  useStackedMeterSegmentRootAnimation,
} from './stacked-meter.animation';
import { DEFAULT_FORMAT_OPTIONS, DEFAULT_SIZE, DISPLAY_NAME } from './stacked-meter.constants';
import { stackedMeterClassNames, stackedMeterStyleSheet } from './stacked-meter.styles';
import { buildMeterSummaryText, computeSegmentStates } from './stacked-meter.utils';
const [StackedMeterProvider, useStackedMeter] = createContext<any>({
  name: 'StackedMeterContext',
  errorMessage: 'useStackedMeter: StackedMeter parts must be rendered inside `StackedMeter`.',
});
const [StackedMeterSegmentProvider, useStackedMeterSegment] = createContext<any>({
  name: 'StackedMeterSegmentContext',
  errorMessage:
    'useStackedMeterSegment: `StackedMeter.Segment` and the legend item parts must be rendered inside a segment context — use the default `StackedMeter.Track` / `StackedMeter.Legend` content or their render-function children.',
});
// --------------------------------------------------
/**
 * Provides a single segment's computed state to the parts rendered inside it.
 */
const StackedMeterSegmentScope = (props) => {
  const { segment, children } = props;
  const contextValue = useMemo(
    () => ({
      segment,
    }),
    [segment]
  );
  return <StackedMeterSegmentProvider value={contextValue}>{children}</StackedMeterSegmentProvider>;
};
// --------------------------------------------------
const StackedMeterRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    segments,
    maxValue,
    size = DEFAULT_SIZE,
    isDisabled = false,
    className,
    formatOptions = DEFAULT_FORMAT_OPTIONS,
    accessibilityLabel,
    animation,
    ...restProps
  } = props;
  const computedState = useMemo(
    () => computeSegmentStates(segments, maxValue, formatOptions),
    [segments, maxValue, formatOptions]
  );
  const summaryText = useMemo(
    () => buildMeterSummaryText(computedState.segments),
    [computedState.segments]
  );
  const rootClassName = stackedMeterClassNames.root({
    isDisabled,
    className,
  });
  const { isAllAnimationsDisabled } = useStackedMeterRootAnimation({
    animation,
  });
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  const contextValue = useMemo(
    () => ({
      segments: computedState.segments,
      total: computedState.total,
      remainderPercentage: computedState.remainderPercentage,
      summaryText,
      accessibilityLabel,
      size,
      isDisabled,
    }),
    [computedState, summaryText, accessibilityLabel, size, isDisabled]
  );
  const renderProps = {
    segments: computedState.segments,
    total: computedState.total,
    summaryText,
  };
  const stringifiedChildren = typeof children !== 'function' ? childrenToString(children) : null;
  const resolvedChildren =
    typeof children === 'function' ? (
      children(renderProps)
    ) : stringifiedChildren ? (
      <>
        <StackedMeterLabel>{stringifiedChildren}</StackedMeterLabel>
        <StackedMeterTrack />
        <StackedMeterLegend />
      </>
    ) : children === undefined || children === null ? (
      <>
        <StackedMeterTrack />
        <StackedMeterLegend />
      </>
    ) : (
      children
    );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <StackedMeterProvider value={contextValue}>
        <View
          ref={ref}
          className={rootClassName}
          accessibilityState={{
            disabled: isDisabled,
          }}
          {...restProps}
        >
          {resolvedChildren}
        </View>
      </StackedMeterProvider>
    </AnimationSettingsProvider>
  );
});
// --------------------------------------------------
const StackedMeterLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const labelClassName = stackedMeterClassNames.label({
    className,
  });
  return (
    <HeroText ref={ref} accessibilityRole="header" className={labelClassName} {...restProps}>
      {children}
    </HeroText>
  );
});
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the empty
 * remainder of the track. With no `children`, the active library theme
 * decides the default content: `glass` renders a `GlassView` blur layer;
 * other themes render nothing. Pass `children` to host arbitrary content
 * (gradients, images) with the container's positioning and clipping applied.
 */
const StackedMeterTrackBackground = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const trackBackgroundClassName = stackedMeterClassNames.trackBackground({
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
const StackedMeterTrack = forwardRef((props: any, ref: any) => {
  const { children, className, style, background, accessibilityLabel, ...restProps } = props;
  const ctx = useStackedMeter();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const visibleSegments = useMemo(
    () => ctx.segments.filter((segment) => segment.percentage > 0),
    [ctx.segments]
  );
  const trackClassName = stackedMeterClassNames.track({
    size: ctx.size,
    className,
  });
  const trackAccessibilityLabel =
    accessibilityLabel ??
    (ctx.accessibilityLabel ? `${ctx.accessibilityLabel}, ${ctx.summaryText}` : ctx.summaryText);
  /**
   * Background layer rendered behind the empty remainder.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content (the remainder paints `--color-default`)
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <StackedMeterTrackBackground />
    ) : null;
  const remainderElement =
    ctx.remainderPercentage > 0 ? (
      <StackedMeterRemainder percentage={ctx.remainderPercentage}>
        {backgroundElement}
      </StackedMeterRemainder>
    ) : null;
  const content =
    typeof children === 'function' ? (
      <>
        {visibleSegments.map((segment) => (
          <StackedMeterSegmentScope key={segment.id} segment={segment}>
            {children(segment)}
          </StackedMeterSegmentScope>
        ))}
        {remainderElement}
      </>
    ) : children === undefined || children === null ? (
      <>
        {visibleSegments.map((segment) => (
          <StackedMeterSegmentScope key={segment.id} segment={segment}>
            <StackedMeterSegment />
          </StackedMeterSegmentScope>
        ))}
        {remainderElement}
      </>
    ) : (
      children
    );
  return (
    <View
      ref={ref}
      accessible
      accessibilityRole="image"
      accessibilityLabel={trackAccessibilityLabel}
      className={trackClassName}
      style={[stackedMeterStyleSheet.track, style]}
      {...restProps}
    >
      {content}
    </View>
  );
});
// --------------------------------------------------
const StackedMeterSegment = forwardRef((props: any, ref: any) => {
  const { className, style, animation, isAnimatedStyleActive = true, ...restProps } = props;
  const { segment } = useStackedMeterSegment();
  const segmentClassName = stackedMeterClassNames.segment({
    color: segment.color,
    className: [segment.colorClassName, className],
  });
  const { growTimingConfig, isAnimationDisabled } = useStackedMeterSegmentRootAnimation({
    animation,
  });
  const { rSegmentStyle } = useStackedMeterSegmentAnimation({
    percentage: segment.percentage,
    isAnimationDisabled,
    growTimingConfig,
  });
  const segmentStyle = isAnimatedStyleActive ? [rSegmentStyle, style] : style;
  return (
    <Animated.View
      ref={ref}
      accessible={false}
      accessibilityRole="none"
      importantForAccessibility="no"
      className={segmentClassName}
      style={segmentStyle}
      {...restProps}
    />
  );
});
// --------------------------------------------------
/**
 * Internal empty portion of the track, shown when `maxValue` exceeds the sum
 * of the values (or when there is nothing to display). Hosts the track's
 * theme background layer, since it is the only part painting
 * `--color-default`.
 */
const StackedMeterRemainder = (props) => {
  const { percentage, children } = props;
  const remainderClassName = stackedMeterClassNames.remainder();
  const { growTimingConfig, isAnimationDisabled } = useStackedMeterSegmentRootAnimation({
    animation: undefined,
  });
  const { rSegmentStyle } = useStackedMeterSegmentAnimation({
    percentage,
    isAnimationDisabled,
    growTimingConfig,
  });
  return (
    <Animated.View
      accessible={false}
      accessibilityRole="none"
      importantForAccessibility="no"
      className={remainderClassName}
      style={rSegmentStyle}
    >
      {children}
    </Animated.View>
  );
};
// --------------------------------------------------
const StackedMeterLegend = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const ctx = useStackedMeter();
  const legendClassName = stackedMeterClassNames.legend({
    className,
  });
  const content =
    typeof children === 'function'
      ? ctx.segments.map((segment) => (
          <StackedMeterSegmentScope key={segment.id} segment={segment}>
            {children(segment)}
          </StackedMeterSegmentScope>
        ))
      : children === undefined || children === null
        ? ctx.segments.map((segment) => (
            <StackedMeterSegmentScope key={segment.id} segment={segment}>
              <StackedMeterLegendItem />
            </StackedMeterSegmentScope>
          ))
        : children;
  return (
    <View ref={ref} accessibilityRole="list" className={legendClassName} {...restProps}>
      {content}
    </View>
  );
});
// --------------------------------------------------
const StackedMeterLegendItem = forwardRef((props: any, ref: any) => {
  const { children, className, accessibilityLabel, ...restProps } = props;
  const { segment } = useStackedMeterSegment();
  const legendItemClassName = stackedMeterClassNames.legendItem({
    className,
  });
  const itemAccessibilityLabel = accessibilityLabel ?? `${segment.label}, ${segment.valueText}`;
  const content = children ?? (
    <>
      <StackedMeterLegendIndicator />
      <StackedMeterLegendLabel />
      <StackedMeterLegendValue />
    </>
  );
  return (
    <View
      ref={ref}
      accessible
      accessibilityRole="text"
      accessibilityLabel={itemAccessibilityLabel}
      className={legendItemClassName}
      {...restProps}
    >
      {content}
    </View>
  );
});
// --------------------------------------------------
const StackedMeterLegendIndicator = forwardRef((props: any, ref: any) => {
  const { className, ...restProps } = props;
  const { segment } = useStackedMeterSegment();
  const legendIndicatorClassName = stackedMeterClassNames.legendIndicator({
    color: segment.color,
    className: [segment.colorClassName, className],
  });
  return (
    <View
      ref={ref}
      accessible={false}
      accessibilityRole="none"
      importantForAccessibility="no"
      className={legendIndicatorClassName}
      {...restProps}
    />
  );
});
// --------------------------------------------------
const StackedMeterLegendLabel = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const { segment } = useStackedMeterSegment();
  const legendLabelClassName = stackedMeterClassNames.legendLabel({
    className,
  });
  return (
    <HeroText
      ref={ref}
      accessible={false}
      importantForAccessibility="no"
      className={legendLabelClassName}
      {...restProps}
    >
      {children ?? segment.label}
    </HeroText>
  );
});
// --------------------------------------------------
const StackedMeterLegendValue = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const { segment } = useStackedMeterSegment();
  const legendValueClassName = stackedMeterClassNames.legendValue({
    className,
  });
  return (
    <HeroText
      ref={ref}
      accessible={false}
      importantForAccessibility="no"
      className={legendValueClassName}
      {...restProps}
    >
      {children ?? segment.valueText}
    </HeroText>
  );
});
// --------------------------------------------------
StackedMeterRoot.displayName = DISPLAY_NAME.ROOT;
StackedMeterLabel.displayName = DISPLAY_NAME.LABEL;
StackedMeterTrack.displayName = DISPLAY_NAME.TRACK;
StackedMeterTrackBackground.displayName = DISPLAY_NAME.TRACK_BACKGROUND;
StackedMeterSegment.displayName = DISPLAY_NAME.SEGMENT;
StackedMeterRemainder.displayName = DISPLAY_NAME.REMAINDER;
StackedMeterLegend.displayName = DISPLAY_NAME.LEGEND;
StackedMeterLegendItem.displayName = DISPLAY_NAME.LEGEND_ITEM;
StackedMeterLegendIndicator.displayName = DISPLAY_NAME.LEGEND_INDICATOR;
StackedMeterLegendLabel.displayName = DISPLAY_NAME.LEGEND_LABEL;
StackedMeterLegendValue.displayName = DISPLAY_NAME.LEGEND_VALUE;
/**
 * Compound StackedMeter component with sub-components
 *
 * @component StackedMeter - Root container owning the `segments` data.
 * Computes each segment's share of the total (the sum of the values, or a
 * larger `maxValue`) and its formatted value text. With no children it
 * renders Track + Legend; plain string children render Label + Track +
 * Legend.
 *
 * @component StackedMeter.Label - @optional Title text describing the meter.
 *
 * @component StackedMeter.Track - @optional Rounded horizontal container
 * rendering one Segment per non-zero segment, followed by the empty
 * remainder. Accepts a render function called per segment. Exposed to screen
 * readers as a single element summarizing every segment.
 *
 * @component StackedMeter.TrackBackground - @optional Absolute-fill
 * background container behind the empty remainder. With no children, the
 * active library theme decides the default content (e.g. a glass blur
 * layer).
 *
 * @component StackedMeter.Segment - @optional Animated element sized by the
 * segment's share (animated `flexGrow`). Reads its segment from context.
 *
 * @component StackedMeter.Legend - @optional Wrapping row rendering one
 * LegendItem per segment. Accepts a render function called per segment.
 *
 * @component StackedMeter.LegendItem - @optional Row describing one segment;
 * defaults to LegendIndicator + LegendLabel + LegendValue.
 *
 * @component StackedMeter.LegendIndicator - @optional Dot painted with the
 * segment's color.
 *
 * @component StackedMeter.LegendLabel - @optional Segment name text.
 *
 * @component StackedMeter.LegendValue - @optional Formatted segment value,
 * rendered with tabular figures.
 *
 * Props flow from StackedMeter to sub-components via context (segment
 * states, size, isDisabled); each segment's state flows to its parts through
 * a per-segment context.
 *
 * @note RTL: mirrored by layout alone. The track and the legend are
 * `flex-direction: row` containers that Yoga flips, segment sizes come from a
 * direction-less `flexGrow`, and the track's rounded ends are symmetric, so
 * there is no direction-dependent JS or CSS to override.
 */
const StackedMeter = Object.assign(StackedMeterRoot, {
  /** @optional Title text describing the meter */
  Label: StackedMeterLabel,
  /** @optional Container holding the segments */
  Track: StackedMeterTrack,
  /** @optional Theme-aware background behind the empty remainder */
  TrackBackground: StackedMeterTrackBackground,
  /** @optional Animated element representing one segment's share */
  Segment: StackedMeterSegment,
  /** @optional Wrapping row of legend items */
  Legend: StackedMeterLegend,
  /** @optional Row describing one segment */
  LegendItem: StackedMeterLegendItem,
  /** @optional Dot painted with the segment's color */
  LegendIndicator: StackedMeterLegendIndicator,
  /** @optional Segment name text */
  LegendLabel: StackedMeterLegendLabel,
  /** @optional Formatted segment value text */
  LegendValue: StackedMeterLegendValue,
});
export default StackedMeter;
export { useStackedMeter, useStackedMeterSegment };
