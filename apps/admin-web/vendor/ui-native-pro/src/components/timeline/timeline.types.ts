import type { AnimationRootDisableAll } from '../../helpers/internal/types';
import type * as TimelinePrimitivesTypes from '../../primitives/timeline/timeline.types';
/**
 * Animation configuration for the Timeline root.
 *
 * Timeline is a static component and owns no animated styles of its own, but it
 * still exposes the cascade so consumers can disable any animated descendants.
 * - `"disable-all"`: disable all animations including children (cascades down).
 * - `undefined`: use default animations.
 */
export type TimelineRootAnimation = AnimationRootDisableAll;
/**
 * Root Timeline props.
 */
export interface TimelineProps extends Omit<
  TimelinePrimitivesTypes.RootProps,
  'skipInjectItemIndices'
> {
  /**
   * Visual size scale for markers and rail spacing.
   * @default "md"
   */
  size?: TimelinePrimitivesTypes.TimelineSize;
  /**
   * Vertical rhythm between items.
   * @default "comfortable"
   */
  density?: TimelinePrimitivesTypes.TimelineDensity;
  /**
   * Default vertical alignment for item content relative to the marker.
   * @default "start"
   */
  itemAlign?: TimelinePrimitivesTypes.TimelineItemAlign;
  /**
   * Additional CSS classes for the root container.
   */
  className?: string;
  /**
   * Root animation configuration (disable-all cascade only).
   */
  animation?: TimelineRootAnimation;
}
/**
 * Item container props (a single event row in the timeline).
 */
export interface TimelineItemProps extends TimelinePrimitivesTypes.ItemProps {
  /**
   * Additional CSS classes for the item row container.
   */
  className?: string;
}
/**
 * Leading (left column) props. Renders a static slot to the left of the rail,
 * suited to timestamps or short metadata.
 */
export interface TimelineLeadingProps extends TimelinePrimitivesTypes.LeadingProps {
  /**
   * Additional CSS classes for the leading container.
   */
  className?: string;
}
/**
 * Rail props (relative wrapper for marker + connector).
 * When `children` is omitted, the rail renders `Marker` and `Connector` by
 * default; `Connector` is omitted on item index `0`.
 */
export interface TimelineRailProps extends TimelinePrimitivesTypes.RailProps {
  /**
   * Additional CSS classes for the rail container.
   */
  className?: string;
}
/**
 * Marker props (the dot/circle for an item). Tone is derived from the item
 * status; pass icon children to render inside the marker.
 */
export interface TimelineMarkerProps extends TimelinePrimitivesTypes.MarkerProps {
  /**
   * Additional CSS classes for the marker container.
   */
  className?: string;
}
/**
 * Connector props (static line bridging adjacent markers).
 */
export interface TimelineConnectorProps extends TimelinePrimitivesTypes.ConnectorProps {
  /**
   * Additional CSS classes for the connector line.
   */
  className?: string;
}
/**
 * Content region props (the right column body of an item).
 */
export interface TimelineContentProps extends TimelinePrimitivesTypes.ContentProps {
  /**
   * Additional CSS classes for the content container.
   */
  className?: string;
}
/**
 * Item title text props (compound: `Timeline.Title`).
 */
export interface TimelineTitleProps extends TimelinePrimitivesTypes.TitleProps {
  /**
   * Additional CSS classes for the title text.
   */
  className?: string;
}
/**
 * Item description text props (compound: `Timeline.Description`).
 */
export interface TimelineDescriptionProps extends TimelinePrimitivesTypes.DescriptionProps {
  /**
   * Additional CSS classes for the description text.
   */
  className?: string;
}
/**
 * Ref types aligned with the primitives.
 */
export type TimelineRootRef = TimelinePrimitivesTypes.RootRef;
export type TimelineItemRef = TimelinePrimitivesTypes.ItemRef;
export type TimelineLeadingRef = TimelinePrimitivesTypes.LeadingRef;
export type TimelineRailRef = TimelinePrimitivesTypes.RailRef;
export type TimelineMarkerRef = TimelinePrimitivesTypes.MarkerRef;
export type TimelineConnectorRef = TimelinePrimitivesTypes.ConnectorRef;
export type TimelineContentRef = TimelinePrimitivesTypes.ContentRef;
export type TimelineTitleRef = TimelinePrimitivesTypes.TitleRef;
export type TimelineDescriptionRef = TimelinePrimitivesTypes.DescriptionRef;
export type {
  TimelineDensity,
  TimelineItemAlign,
  TimelineSize,
  TimelineStatus,
} from '../../primitives/timeline/timeline.types';
