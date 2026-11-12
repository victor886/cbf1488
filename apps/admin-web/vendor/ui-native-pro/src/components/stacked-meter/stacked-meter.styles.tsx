import { StyleSheet } from 'react-native';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Root style definition.
 * Stacks the label, track, and legend vertically.
 */
const root = tv({
  base: 'stacked-meter__root',
  variants: {
    isDisabled: {
      true: 'stacked-meter__root--is-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});
/**
 * Label style definition.
 * Title text describing the meter.
 */
const label = tv({
  base: 'stacked-meter__label',
});
/**
 * Track style definition.
 * Transparent horizontal container holding the segments and the remainder,
 * clipped to rounded outer ends.
 */
const track = tv({
  base: 'stacked-meter__track',
  variants: {
    size: {
      sm: 'stacked-meter__track--size-sm',
      md: 'stacked-meter__track--size-md',
      lg: 'stacked-meter__track--size-lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
/**
 * Track background style definition.
 * Absolute-fill container rendered behind the empty remainder.
 */
const trackBackground = tv({
  base: 'stacked-meter__track-background',
});
/**
 * Segment style definition.
 * Represents one segment's share of the track.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `flexGrow` - Animated for the segment's share of the track
 *
 * To customize the transition, use the `animation` prop on
 * `StackedMeter.Segment`:
 * ```tsx
 * <StackedMeter.Segment
 *   animation={{ growTimingConfig: { duration: 500 } }}
 * />
 * ```
 *
 * To completely disable animated styles and apply your own via `className` or
 * `style` prop, set `isAnimatedStyleActive={false}` on `StackedMeter.Segment`.
 */
const segment = tv({
  base: 'stacked-meter__segment',
  variants: {
    color: {
      'default': 'stacked-meter__segment--color-default',
      'accent': 'stacked-meter__segment--color-accent',
      'success': 'stacked-meter__segment--color-success',
      'warning': 'stacked-meter__segment--color-warning',
      'danger': 'stacked-meter__segment--color-danger',
      'chart-1': 'stacked-meter__segment--color-chart-1',
      'chart-2': 'stacked-meter__segment--color-chart-2',
      'chart-3': 'stacked-meter__segment--color-chart-3',
      'chart-4': 'stacked-meter__segment--color-chart-4',
      'chart-5': 'stacked-meter__segment--color-chart-5',
    },
  },
  defaultVariants: {
    color: 'chart-1',
  },
});
/**
 * Remainder style definition.
 * Empty portion of the track when `maxValue` exceeds the sum of the values.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * - `flexGrow` - Animated for the remainder's share of the track
 */
const remainder = tv({
  base: 'stacked-meter__remainder',
});
/**
 * Legend style definition.
 * Wrapping row of legend items.
 */
const legend = tv({
  base: 'stacked-meter__legend',
});
/**
 * Legend item style definition.
 * Row holding the indicator, label, and value of one segment.
 */
const legendItem = tv({
  base: 'stacked-meter__legend-item',
});
/**
 * Legend indicator style definition.
 * Dot painted with the segment's color.
 */
const legendIndicator = tv({
  base: 'stacked-meter__legend-indicator',
  variants: {
    color: {
      'default': 'stacked-meter__legend-indicator--color-default',
      'accent': 'stacked-meter__legend-indicator--color-accent',
      'success': 'stacked-meter__legend-indicator--color-success',
      'warning': 'stacked-meter__legend-indicator--color-warning',
      'danger': 'stacked-meter__legend-indicator--color-danger',
      'chart-1': 'stacked-meter__legend-indicator--color-chart-1',
      'chart-2': 'stacked-meter__legend-indicator--color-chart-2',
      'chart-3': 'stacked-meter__legend-indicator--color-chart-3',
      'chart-4': 'stacked-meter__legend-indicator--color-chart-4',
      'chart-5': 'stacked-meter__legend-indicator--color-chart-5',
    },
  },
  defaultVariants: {
    color: 'chart-1',
  },
});
/**
 * Legend label style definition.
 * Segment name text.
 */
const legendLabel = tv({
  base: 'stacked-meter__legend-label',
});
/**
 * Legend value style definition.
 * Formatted segment value text.
 */
const legendValue = tv({
  base: 'stacked-meter__legend-value',
});
export const stackedMeterClassNames = combineStyles({
  root,
  label,
  track,
  trackBackground,
  segment,
  remainder,
  legend,
  legendItem,
  legendIndicator,
  legendLabel,
  legendValue,
});
/**
 * StyleSheet for native-only properties that cannot be expressed via Tailwind.
 */
export const stackedMeterStyleSheet = StyleSheet.create({
  track: {
    borderCurve: 'continuous',
  },
});
