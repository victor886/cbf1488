import { cloneElement, forwardRef, isValidElement, type ReactElement, useMemo } from 'react';
import { View } from 'react-native';
import { Chip } from 'heroui-native/chip';
import { childrenToString, createContext } from '../../helpers/internal/utils/index';
import {
  DEFAULT_SIZE,
  DEFAULT_TREND,
  DEFAULT_VARIANT,
  DISPLAY_NAME,
  INDICATOR_SIZE_MAP,
  TREND_TO_CHIP_COLOR_MAP,
} from './trend-chip.constants';
import { TrendArrowDownIcon, TrendArrowRightIcon, TrendArrowUpIcon } from './trend-chip.icons';
import { trendChipClassNames } from './trend-chip.styles';
import type { TrendChipContextValue } from './trend-chip.types';
import { getIndicatorColorClassName } from './trend-chip.utils';
const TREND_ARROW_ICON_MAP = {
  up: TrendArrowUpIcon,
  neutral: TrendArrowRightIcon,
  down: TrendArrowDownIcon,
};
// --------------------------------------------------
const [TrendChipProvider, useTrendChip] = createContext<TrendChipContextValue>({
  name: 'TrendChipContext',
});
// --------------------------------------------------
const TrendChipRoot = forwardRef((props: any, ref: any) => {
  const {
    children,
    size = DEFAULT_SIZE,
    trend = DEFAULT_TREND,
    variant = DEFAULT_VARIANT,
    ...restProps
  } = props;
  const chipColor = TREND_TO_CHIP_COLOR_MAP[trend];
  const contextValue = useMemo(
    () => ({
      size,
      trend,
      variant,
    }),
    [size, trend, variant]
  );
  const stringifiedChildren = childrenToString(children);
  const resolvedChildren =
    stringifiedChildren !== null ? (
      <>
        <TrendChipIndicator />
        <TrendChipValue>{stringifiedChildren}</TrendChipValue>
      </>
    ) : (
      children
    );
  return (
    <TrendChipProvider value={contextValue}>
      <Chip ref={ref} color={chipColor} size={size} variant={variant} {...restProps}>
        {resolvedChildren}
      </Chip>
    </TrendChipProvider>
  );
});
// --------------------------------------------------
const DefaultTrendArrow = (props) => {
  const { trend, ...iconProps } = props;
  const Arrow = TREND_ARROW_ICON_MAP[trend];
  return <Arrow {...iconProps} />;
};
const TrendChipIndicator = forwardRef((props: any, ref: any) => {
  const { children, className, size, color, colorClassName, ...restProps } = props;
  const ctx = useTrendChip();
  const indicatorClassName = trendChipClassNames.indicator({
    className,
  });
  const resolvedSize = size ?? INDICATOR_SIZE_MAP[ctx.size];
  const resolvedColorClassName =
    colorClassName ?? getIndicatorColorClassName(ctx.variant, TREND_TO_CHIP_COLOR_MAP[ctx.trend]);
  const iconElement = isValidElement(children) ? (
    cloneElement(children as ReactElement<any>, {
      ...restProps,
      size: (children.props as any).size ?? resolvedSize,
      color: (children.props as any).color ?? color,
      colorClassName: (children.props as any).colorClassName ?? resolvedColorClassName,
    })
  ) : (
    <DefaultTrendArrow
      {...restProps}
      trend={ctx.trend}
      size={resolvedSize}
      color={color}
      colorClassName={resolvedColorClassName}
    />
  );
  return (
    <View ref={ref} className={indicatorClassName} data-size={ctx.size}>
      {iconElement}
    </View>
  );
});
// --------------------------------------------------
const TrendChipValue = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const valueClassName = trendChipClassNames.value({
    className,
  });
  return (
    <Chip.Label ref={ref} className={valueClassName} {...restProps}>
      {children}
    </Chip.Label>
  );
});
// --------------------------------------------------
const TrendChipPrefix = forwardRef((props: any, ref: any) => {
  const { children, ...restProps } = props;
  return (
    <Chip.Label ref={ref} {...restProps}>
      {children}
    </Chip.Label>
  );
});
// --------------------------------------------------
const TrendChipSuffix = forwardRef((props: any, ref: any) => {
  const { children, className, ...restProps } = props;
  const suffixClassName = trendChipClassNames.suffix({
    className,
  });
  return (
    <Chip.Label ref={ref} className={suffixClassName} {...restProps}>
      {children}
    </Chip.Label>
  );
});
// --------------------------------------------------
TrendChipRoot.displayName = DISPLAY_NAME.ROOT;
TrendChipIndicator.displayName = DISPLAY_NAME.INDICATOR;
TrendChipValue.displayName = DISPLAY_NAME.VALUE;
TrendChipPrefix.displayName = DISPLAY_NAME.PREFIX;
TrendChipSuffix.displayName = DISPLAY_NAME.SUFFIX;
// --------------------------------------------------
/**
 * Compound `TrendChip` component with sub-components.
 *
 * @component TrendChip - Semantic trend indicator pill built on top of
 * `heroui-native`'s `Chip`. The `trend` prop drives both the default arrow
 * direction and the underlying chip color (`up` -> success, `neutral` ->
 * warning, `down` -> danger). When plain text/number children are provided,
 * they are automatically wrapped in the default indicator + value layout.
 *
 * @component TrendChip.Indicator - Renders the default trend arrow. Pass a
 * custom SVG child to replace the arrow while inheriting sizing and color
 * from the chip context.
 *
 * @component TrendChip.Value - Numeric content of the chip, rendered with
 * tabular figures so values align vertically across chips.
 *
 * @component TrendChip.Prefix - Optional inline text placed before the
 * numeric value (e.g. `$`, `+`).
 *
 * @component TrendChip.Suffix - Optional inline text placed after the numeric
 * value (e.g. `%`, `vs last month`). Rendered with a muted color by default.
 *
 * Props flow from `TrendChip` to its sub-components via context
 * (`size`, `trend`, `variant`).
 *
 */
const TrendChip = Object.assign(TrendChipRoot, {
  /** Default trend arrow — accepts a custom SVG child to override. */
  Indicator: TrendChipIndicator,
  /** Numeric value rendered with tabular figures. */
  Value: TrendChipValue,
  /** Inline text rendered before the numeric value. */
  Prefix: TrendChipPrefix,
  /** Inline text rendered after the numeric value. */
  Suffix: TrendChipSuffix,
});
export default TrendChip;
export { useTrendChip };
