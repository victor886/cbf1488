// @ts-nocheck
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { AnimationSettingsProvider } from 'heroui-native/contexts';
import { HeroText } from '../../helpers/internal/components/index';
import { createContext } from '../../helpers/internal/utils/index';
import {
  useChartTooltipAnchorRootAnimation,
  useChartTooltipRootAnimation,
} from './chart-tooltip.animation';
import {
  DEFAULT_INDICATOR_VARIANT,
  DEFAULT_IS_VISIBLE,
  DEFAULT_PLACEMENT,
  DEFAULT_TOOLTIP_GAP,
  DISPLAY_NAME,
} from './chart-tooltip.constants';
import chartTooltipClassNames from './chart-tooltip.styles';
// --------------------------------------------------
const [ChartTooltipAnchorProvider, useChartTooltipAnchor] = createContext({
  errorMessage:
    'useChartTooltipAnchor: `context` is undefined. Wrap content in `ChartTooltip.Anchor`.',
  name: 'ChartTooltipAnchorContext',
  strict: true,
});
// --------------------------------------------------
const ChartTooltipAnchorRoot = forwardRef((props, ref) => {
  const { animation, chartBounds, children, isActive, matchedIndex, x, y, ...restViewProps } =
    props;
  const { isAllAnimationsDisabled } = useChartTooltipAnchorRootAnimation({
    animation,
  });
  const [activeIndex, setActiveIndex] = useState(null);
  useAnimatedReaction(
    () => {
      if (isActive == null || matchedIndex == null) {
        return null;
      }
      return {
        active: isActive.get(),
        index: matchedIndex.get(),
      };
    },
    (current) => {
      if (current == null) {
        scheduleOnRN(setActiveIndex, null);
        return;
      }
      const nextIndex = current.active ? Math.round(current.index) : null;
      scheduleOnRN(setActiveIndex, nextIndex);
    },
    [isActive, matchedIndex]
  );
  const anchorContextValue = useMemo(
    () => ({
      activeIndex,
      chartBounds,
      isActive,
      x,
      y,
    }),
    [activeIndex, chartBounds, isActive, x, y]
  );
  const animationSettingsContextValue = useMemo(
    () => ({
      isAllAnimationsDisabled,
    }),
    [isAllAnimationsDisabled]
  );
  return (
    <AnimationSettingsProvider value={animationSettingsContextValue}>
      <ChartTooltipAnchorProvider value={anchorContextValue}>
        <View ref={ref} {...restViewProps}>
          {children}
        </View>
      </ChartTooltipAnchorProvider>
    </AnimationSettingsProvider>
  );
});
ChartTooltipAnchorRoot.displayName = DISPLAY_NAME.ANCHOR;
// --------------------------------------------------
/**
 * Generic absolute-fill background container rendered behind the card
 * content. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const ChartTooltipBackground = forwardRef(({ className, ...props }, ref) => {
  const backgroundClassName = chartTooltipClassNames.background({
    className,
  });
  return <ThemeBackground ref={ref} className={backgroundClassName} {...props} />;
});
ChartTooltipBackground.displayName = DISPLAY_NAME.BACKGROUND;
// --------------------------------------------------
const ChartTooltipRoot = forwardRef((props, ref) => {
  const {
    animation,
    children,
    className,
    gap = DEFAULT_TOOLTIP_GAP,
    isVisible = DEFAULT_IS_VISIBLE,
    offset,
    placement = DEFAULT_PLACEMENT,
    background,
    style,
    ...restViewProps
  } = props;
  const anchor = useChartTooltipAnchor();
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  const measuredWidth = useSharedValue(0);
  const measuredHeight = useSharedValue(0);
  const { rContainerStyle } = useChartTooltipRootAnimation({
    anchor,
    animation,
    gap,
    isVisible,
    measuredHeight,
    measuredWidth,
    offset,
    placement,
  });
  const onLayout = useCallback(
    (event) => {
      measuredWidth.set(event.nativeEvent.layout.width);
      measuredHeight.set(event.nativeEvent.layout.height);
    },
    [measuredHeight, measuredWidth]
  );
  if (isVisible === false) {
    return null;
  }
  const rootClassName = chartTooltipClassNames.root({
    className,
  });
  /**
   * Background layer rendered behind the card content.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   */
  const backgroundElement =
    background !== undefined ? (
      background
    ) : hasDefaultThemeBackground ? (
      <ChartTooltipBackground />
    ) : null;
  return (
    <Animated.View
      ref={ref}
      accessibilityLiveRegion="polite"
      accessibilityRole="summary"
      className={rootClassName}
      pointerEvents="none"
      style={[rContainerStyle, style]}
      onLayout={onLayout}
      {...restViewProps}
    >
      {backgroundElement}
      {children}
    </Animated.View>
  );
});
ChartTooltipRoot.displayName = DISPLAY_NAME.ROOT;
// --------------------------------------------------
const ChartTooltipHeader = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const headerClassName = chartTooltipClassNames.header({
    className,
  });
  return (
    <HeroText ref={ref} accessibilityRole="header" className={headerClassName} {...restProps}>
      {children}
    </HeroText>
  );
});
ChartTooltipHeader.displayName = DISPLAY_NAME.HEADER;
// --------------------------------------------------
const ChartTooltipItem = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const itemClassName = chartTooltipClassNames.item({
    className,
  });
  return (
    <View ref={ref} accessible accessibilityRole="text" className={itemClassName} {...restProps}>
      {children}
    </View>
  );
});
ChartTooltipItem.displayName = DISPLAY_NAME.ITEM;
// --------------------------------------------------
const ChartTooltipIndicator = forwardRef((props, ref) => {
  const { className, color, style, variant = DEFAULT_INDICATOR_VARIANT, ...restProps } = props;
  const indicatorClassName = chartTooltipClassNames.indicator({
    className,
    variant,
  });
  const indicatorStyle =
    color != null && color !== ''
      ? [
          {
            backgroundColor: color,
          },
          style,
        ]
      : style;
  return (
    <View
      ref={ref}
      accessibilityElementsHidden
      accessible={false}
      aria-hidden={true}
      className={indicatorClassName}
      importantForAccessibility="no-hide-descendants"
      style={indicatorStyle}
      {...restProps}
    />
  );
});
ChartTooltipIndicator.displayName = DISPLAY_NAME.INDICATOR;
// --------------------------------------------------
const ChartTooltipLabel = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const labelClassName = chartTooltipClassNames.label({
    className,
  });
  return (
    <HeroText ref={ref} accessibilityRole="text" className={labelClassName} {...restProps}>
      {children}
    </HeroText>
  );
});
ChartTooltipLabel.displayName = DISPLAY_NAME.LABEL;
// --------------------------------------------------
const ChartTooltipValue = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const valueClassName = chartTooltipClassNames.value({
    className,
  });
  return (
    <HeroText ref={ref} accessibilityRole="text" className={valueClassName} {...restProps}>
      {children}
    </HeroText>
  );
});
ChartTooltipValue.displayName = DISPLAY_NAME.VALUE;
// --------------------------------------------------
/**
 * Compound chart tooltip API:
 *
 * @component ChartTooltip — Floating card for multi-series press labels; **requires**
 *   {@link ChartTooltip.Anchor}.
 * @component ChartTooltip.Anchor — Relative wrapper supplying press coordinates, active index,
 *   and plot bounds.
 * @component ChartTooltip.Background — Absolute-fill background container behind the card
 *   content. With no children, the active library theme decides the content (glass theme
 *   renders a blur layer). Replaceable via the `background` prop on ChartTooltip.
 * @component ChartTooltip.Header — Optional title row (typically the X-axis category).
 * @component ChartTooltip.Item — One series row (indicator + label + value).
 * @component ChartTooltip.Indicator — Color swatch beside a series name.
 * @component ChartTooltip.Label — Series name within an item row.
 * @component ChartTooltip.Value — Formatted value within an item row.
 */
const ChartTooltip = Object.assign(ChartTooltipRoot, {
  Anchor: ChartTooltipAnchorRoot,
  Background: ChartTooltipBackground,
  Header: ChartTooltipHeader,
  Indicator: ChartTooltipIndicator,
  Item: ChartTooltipItem,
  Label: ChartTooltipLabel,
  Value: ChartTooltipValue,
});
export default ChartTooltip;
export { useChartTooltipAnchor };
