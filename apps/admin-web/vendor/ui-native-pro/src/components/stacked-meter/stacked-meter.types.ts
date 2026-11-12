import type { ReactNode } from 'react';
import type { TextProps, ViewProps } from 'react-native';
import type { WithTimingConfig } from 'react-native-reanimated';
import type {
  Animation,
  AnimationRootDisableAll,
  AnimationValue,
  TextRef,
  ViewRef,
} from '../../helpers/internal/types/index';
/**
 * Size variants supported by {@link StackedMeter}.
 * Controls the height of the track.
 */
export type StackedMeterSize = 'sm' | 'md' | 'lg';
/**
 * Color variants supported by {@link StackedMeter} segments and legend
 * indicators. `chart-1` through `chart-5` derive from the accent color and are
 * assigned in order to segments without an explicit `color`.
 */
export type StackedMeterColor =
  | 'default'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5';
/**
 * Input data describing a single segment of the meter.
 */
export interface StackedMeterSegment {
  /**
   * Unique identifier, used as the React key for the segment and its legend
   * item.
   */
  id: string;
  /**
   * Human-readable name of the segment (e.g. "TypeScript").
   * Rendered by `StackedMeter.LegendLabel` and used in accessibility labels.
   */
  label: string;
  /**
   * Raw value of the segment. Negative and non-finite values are treated as
   * `0`.
   */
  value: number;
  /**
   * Color variant of the segment and its legend indicator.
   * Defaults to the next color in the `chart-1` … `chart-5` sequence.
   */
  color?: StackedMeterColor;
  /**
   * Additional CSS classes applied to both the segment and its legend
   * indicator, after the `color` variant. Use it for colors outside the
   * variant set (e.g. `bg-[#3178c6]`).
   */
  colorClassName?: string;
}
/**
 * Computed state for a single segment, derived from {@link StackedMeterSegment}
 * by the root.
 */
export interface StackedMeterSegmentState extends StackedMeterSegment {
  /** Position of the segment in the `segments` array */
  index: number;
  /** Share of the total (0–100) */
  percentage: number;
  /** Formatted value text (e.g. "96.3%") */
  valueText: string;
  /** Resolved color variant (explicit `color` or the sequence default) */
  color: StackedMeterColor;
}
/**
 * Render props exposed via children-as-function on the root.
 */
export interface StackedMeterRenderProps {
  /** Computed state for every segment */
  segments: StackedMeterSegmentState[];
  /** Total the percentages are computed against */
  total: number;
  /** Combined text summary of all segments (e.g. "TypeScript 96.3%, CSS 2.6%") */
  summaryText: string;
}
/**
 * Props for the StackedMeter root component.
 * Owns the segment data and computes each segment's share of the total.
 */
export interface StackedMeterRootProps extends Omit<ViewProps, 'children'> {
  /**
   * Children elements or render function with access to the computed
   * segment state.
   * - `undefined`: renders `StackedMeter.Track` followed by
   *   `StackedMeter.Legend`
   * - string: renders it as `StackedMeter.Label`, followed by the track and
   *   the legend
   */
  children?: ReactNode | ((props: StackedMeterRenderProps) => ReactNode);
  /**
   * Segments to display, in order along the reading direction.
   */
  segments: StackedMeterSegment[];
  /**
   * Total capacity the segment values are measured against. When omitted,
   * or smaller than the sum of the values, the sum is used and the segments
   * fill the whole track. A larger value leaves the remaining track empty
   * (e.g. free space in a storage meter).
   */
  maxValue?: number;
  /**
   * Size of the track.
   *
   * @default "md"
   */
  size?: StackedMeterSize;
  /**
   * Whether the component is disabled.
   *
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Additional CSS classes for the root container.
   */
  className?: string;
  /**
   * Number format options for each segment's value text.
   * With `style: 'percent'` the segment's share of the total is formatted;
   * otherwise the raw segment value is formatted.
   *
   * @default { style: 'percent', maximumFractionDigits: 1 }
   */
  formatOptions?: Intl.NumberFormatOptions;
  /**
   * Animation configuration for the root component.
   * - `"disable-all"`: Disable all animations including children
   *   (cascades down to all child components)
   * - `undefined`: Use default animations
   */
  animation?: StackedMeterRootAnimation;
}
/**
 * Ref type for the StackedMeter root component.
 */
export type StackedMeterRootRef = ViewRef;
/**
 * Animation configuration for the StackedMeter root.
 * Only supports cascading the disable-all flag to children.
 */
export type StackedMeterRootAnimation = AnimationRootDisableAll;
/**
 * Props for the StackedMeter.Label component.
 * Title text describing the meter (e.g. "Languages").
 */
export interface StackedMeterLabelProps extends TextProps {
  /**
   * Text content for the label.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the label text.
   */
  className?: string;
}
/**
 * Ref type for the StackedMeter.Label component.
 */
export type StackedMeterLabelRef = TextRef;
/**
 * Render function receiving one segment's computed state. Parts rendered
 * inside it (`Segment`, `LegendItem`, `LegendIndicator`, …) read that
 * segment through context.
 */
export type StackedMeterSegmentRenderFn = (segment: StackedMeterSegmentState) => ReactNode;
/**
 * Props for the StackedMeter.Track component.
 * Horizontal container holding one `StackedMeter.Segment` per non-zero
 * segment, followed by the empty remainder when `maxValue` exceeds the sum.
 */
export interface StackedMeterTrackProps extends Omit<ViewProps, 'children'> {
  /**
   * Content of the track.
   * - `undefined`: renders a `StackedMeter.Segment` per non-zero segment
   * - function: called once per non-zero segment; the returned node is
   *   rendered inside that segment's context
   * - node: rendered verbatim in place of the default segments
   *
   * The empty remainder is rendered after the segments in the first two
   * cases.
   */
  children?: ReactNode | StackedMeterSegmentRenderFn;
  /**
   * Additional CSS classes for the track container.
   */
  className?: string;
  /**
   * Background layer rendered behind the empty remainder of the track (the
   * only part painting the `--color-default` surface).
   * - `undefined` (default): renders `StackedMeter.TrackBackground` when the
   *   active library theme registers default background content (e.g.
   *   `glass`); otherwise no layer
   * - custom node: replaces the default layer entirely
   * - `null`: removes the background layer
   */
  background?: ReactNode;
}
/**
 * Ref type for the StackedMeter.Track component.
 */
export type StackedMeterTrackRef = ViewRef;
/**
 * Props for the StackedMeter.TrackBackground component.
 * Absolute-fill container rendered behind the empty remainder of the track.
 * With no children, the active library theme decides the default content
 * (e.g. a glass blur layer); pass children to host custom content with the
 * same positioning and clipping.
 */
export interface StackedMeterTrackBackgroundProps extends ViewProps {
  /**
   * Custom content to render inside the background container.
   * When omitted, the active library theme's default background content is
   * rendered.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the background container.
   */
  className?: string;
}
/**
 * Ref type for the StackedMeter.TrackBackground component.
 */
export type StackedMeterTrackBackgroundRef = ViewRef;
/**
 * Props for the StackedMeter.Segment component.
 * Animated element representing one segment's share of the track. Must be
 * rendered inside a segment context (the default track content, or a
 * `StackedMeter.Track` render function).
 *
 * @note The following style properties are occupied by animations and cannot be set via className:
 * - `flexGrow` - Animated for the segment's share of the track
 *
 * To completely disable animated styles and apply your own via className or
 * style prop, set `isAnimatedStyleActive={false}`.
 */
export interface StackedMeterSegmentProps extends ViewProps {
  /**
   * Additional CSS classes for the segment element.
   */
  className?: string;
  /**
   * Animation configuration for the segment.
   * Controls the timing of the share transition when values change.
   */
  animation?: StackedMeterSegmentAnimation;
  /**
   * When `false`, the animated `flexGrow` style is not applied, allowing
   * consumers to fully control the segment size via `className` or `style`.
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Ref type for the StackedMeter.Segment component.
 */
export type StackedMeterSegmentRef = ViewRef;
/**
 * Animation configuration for the StackedMeter.Segment.
 */
export type StackedMeterSegmentAnimation = Animation<{
  /**
   * Timing configuration for the segment's share transition.
   *
   * @default { duration: 300 }
   */
  growTimingConfig?: AnimationValue<WithTimingConfig>;
}>;
/**
 * Props for the StackedMeter.Legend component.
 * Wrapping row of legend items, one per segment.
 */
export interface StackedMeterLegendProps extends Omit<ViewProps, 'children'> {
  /**
   * Content of the legend.
   * - `undefined`: renders a `StackedMeter.LegendItem` per segment
   * - function: called once per segment; the returned node is rendered
   *   inside that segment's context
   * - node: rendered verbatim in place of the default items
   */
  children?: ReactNode | StackedMeterSegmentRenderFn;
  /**
   * Additional CSS classes for the legend container.
   */
  className?: string;
}
/**
 * Ref type for the StackedMeter.Legend component.
 */
export type StackedMeterLegendRef = ViewRef;
/**
 * Props for the StackedMeter.LegendItem component.
 * Row describing one segment. Exposed to screen readers as a single element
 * labelled "label, value".
 */
export interface StackedMeterLegendItemProps extends ViewProps {
  /**
   * Content of the item. When omitted, renders `LegendIndicator`,
   * `LegendLabel`, and `LegendValue`.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the legend item container.
   */
  className?: string;
}
/**
 * Ref type for the StackedMeter.LegendItem component.
 */
export type StackedMeterLegendItemRef = ViewRef;
/**
 * Props for the StackedMeter.LegendIndicator component.
 * Dot painted with the segment's color.
 */
export interface StackedMeterLegendIndicatorProps extends ViewProps {
  /**
   * Additional CSS classes for the indicator dot.
   */
  className?: string;
}
/**
 * Ref type for the StackedMeter.LegendIndicator component.
 */
export type StackedMeterLegendIndicatorRef = ViewRef;
/**
 * Props for the StackedMeter.LegendLabel component.
 * Displays the segment's name.
 */
export interface StackedMeterLegendLabelProps extends TextProps {
  /**
   * Custom content to override the segment label.
   * If not provided, the segment's `label` is displayed.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the legend label text.
   */
  className?: string;
}
/**
 * Ref type for the StackedMeter.LegendLabel component.
 */
export type StackedMeterLegendLabelRef = TextRef;
/**
 * Props for the StackedMeter.LegendValue component.
 * Displays the segment's formatted value.
 */
export interface StackedMeterLegendValueProps extends TextProps {
  /**
   * Custom content to override the formatted value text.
   * If not provided, the segment's `valueText` is displayed.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the legend value text.
   */
  className?: string;
}
/**
 * Ref type for the StackedMeter.LegendValue component.
 */
export type StackedMeterLegendValueRef = TextRef;
/**
 * Context value shared between StackedMeter compound parts.
 */
export interface StackedMeterContextValue {
  /** Computed state for every segment, in input order */
  segments: StackedMeterSegmentState[];
  /** Total the percentages are computed against */
  total: number;
  /**
   * Share (0–100) of the track left empty. `100` when there is nothing to
   * display.
   */
  remainderPercentage: number;
  /** Combined text summary of all segments */
  summaryText: string;
  /** Accessibility label passed to the root, prefixed to the track summary */
  accessibilityLabel: string | undefined;
  /** Current size variant */
  size: StackedMeterSize;
  /** Whether the component is disabled */
  isDisabled: boolean;
}
/**
 * Context value scoped to a single segment. Provided around each default
 * segment / legend item and around every render-function result.
 */
export interface StackedMeterSegmentContextValue {
  /** Computed state of the current segment */
  segment: StackedMeterSegmentState;
}
/**
 * Result of computing segment states from the root props.
 */
export interface StackedMeterComputedState {
  /** Computed state for every segment */
  segments: StackedMeterSegmentState[];
  /** Total the percentages are computed against */
  total: number;
  /** Share (0–100) of the track left empty */
  remainderPercentage: number;
}
