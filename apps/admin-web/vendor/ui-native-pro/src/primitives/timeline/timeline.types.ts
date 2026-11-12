import type {
  SlottableTextProps,
  SlottableViewProps,
  TextRef,
  ViewRef,
} from '../../helpers/internal/types';
/**
 * Layout rectangle captured from `onLayout` (`nativeEvent.layout`).
 */
type LayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
/**
 * Per-item layout measurements stored on the root context.
 * Used to absolutely position the connector so it bridges adjacent markers
 * regardless of variable item content height.
 */
type ItemMeasurements = {
  /** The item row layout. */
  item?: LayoutRect;
  /** The rail (marker + connector wrapper) layout within the item. */
  rail?: LayoutRect;
  /** The connector layout (used to center it horizontally on the rail). */
  connector?: LayoutRect;
};
/**
 * Marker tone for a timeline item. The timeline is static, so each item owns
 * its status independently (there is no active/progress concept).
 */
type TimelineStatus = 'default' | 'muted' | 'current' | 'success' | 'warning' | 'danger';
/**
 * Visual size scale for the timeline.
 */
type TimelineSize = 'sm' | 'md' | 'lg';
/**
 * Vertical rhythm between items.
 */
type TimelineDensity = 'compact' | 'comfortable';
/**
 * Vertical alignment of an item's row content relative to its marker.
 */
type TimelineItemAlign = 'start' | 'center';
/**
 * Root context value for the Timeline primitive.
 */
type TimelineRootContextValue = {
  size: TimelineSize;
  density: TimelineDensity;
  itemAlign: TimelineItemAlign;
  measurements: Record<number, ItemMeasurements>;
  setItemMeasurement: (index: number, partial: Partial<ItemMeasurements>) => void;
};
/**
 * Per-item context (each `Item` provides this).
 */
type TimelineItemContextValue = {
  index: number;
  isLast: boolean;
  status: TimelineStatus;
  align: TimelineItemAlign;
};
type RootProps = Omit<SlottableViewProps, 'children'> & {
  children: React.ReactNode;
  /** Visual size scale @default md */
  size?: TimelineSize;
  /** Vertical rhythm between items @default comfortable */
  density?: TimelineDensity;
  /** Default vertical alignment for item content @default start */
  itemAlign?: TimelineItemAlign;
  /**
   * When true, Root does not clone children to inject `_index` / `_isLast`.
   * Use when a parent layer (e.g. styled Timeline) already injected indices.
   * @default false
   */
  skipInjectItemIndices?: boolean;
};
type RootRef = ViewRef;
/** Injected by root when mapping `Item` children */
type ItemInjectedProps = {
  _index?: number;
  _isLast?: boolean;
};
type ItemProps = SlottableViewProps & {
  children?: React.ReactNode;
  /** Marker tone for this item @default default */
  status?: TimelineStatus;
  /** Vertical alignment for this item's content @default inherited from root */
  align?: TimelineItemAlign;
};
type ItemRef = ViewRef;
type LeadingProps = SlottableViewProps;
type LeadingRef = ViewRef;
type RailProps = SlottableViewProps;
type RailRef = ViewRef;
type MarkerProps = SlottableViewProps;
type MarkerRef = ViewRef;
type ConnectorProps = SlottableViewProps & {
  /** Render the connector even on the first item @default false */
  force?: boolean;
};
type ConnectorRef = ViewRef;
type ContentProps = SlottableViewProps & {
  children?: React.ReactNode;
};
type ContentRef = ViewRef;
type TitleProps = SlottableTextProps & {
  children?: React.ReactNode;
};
type TitleRef = TextRef;
type DescriptionProps = SlottableTextProps & {
  children?: React.ReactNode;
};
type DescriptionRef = TextRef;
export type {
  ConnectorProps,
  ConnectorRef,
  ContentProps,
  ContentRef,
  DescriptionProps,
  DescriptionRef,
  ItemInjectedProps,
  ItemMeasurements,
  ItemProps,
  ItemRef,
  LayoutRect,
  LeadingProps,
  LeadingRef,
  MarkerProps,
  MarkerRef,
  RailProps,
  RailRef,
  RootProps,
  RootRef,
  TimelineDensity,
  TimelineItemAlign,
  TimelineItemContextValue,
  TimelineRootContextValue,
  TimelineSize,
  TimelineStatus,
  TitleProps,
  TitleRef,
};
