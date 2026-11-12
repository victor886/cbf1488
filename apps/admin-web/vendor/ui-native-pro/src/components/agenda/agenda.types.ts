// @ts-nocheck
import type { ReactElement, ReactNode } from 'react';
import type { PressableProps, TextProps, TextStyle, ViewProps, ViewStyle } from 'react-native';
import type { AnimatedStyle, SharedValue, WithTimingConfig } from 'react-native-reanimated';
import type { CalendarDate, CalendarDateTime } from '@internationalized/date';
import type {
  Animation,
  AnimationValue,
  ElementSlots,
} from '../../helpers/internal/types/index.js';
import type { SegmentRootProps } from '../segment/segment.types.js';
import type {
  SplitViewDragAreaProps,
  SplitViewDragHandleProps,
  SplitViewRootAnimation,
  SplitViewRootProps,
} from '../split-view/split-view.types.js';
import type {
  AllDaySectionSlots,
  CurrentTimeIndicatorSlots,
  DayColumnsSlots,
  EventSlots,
  MonthGridSlots,
  TimeGridSlots,
  WeekHeaderSlots,
} from './agenda.styles.js';
/**
 * Agenda view mode: a single day column, a full week, or a month grid.
 */
export type AgendaView = 'day' | 'week' | 'month';
/**
 * Confirmation status of an event (mirrors the web Agenda API).
 */
export type AgendaEventStatus = 'confirmed' | 'unconfirmed';
/**
 * A calendar event rendered by the Agenda.
 *
 * Dates use `@internationalized/date` `CalendarDateTime` values so the Agenda stays
 * compatible with the `Calendar` component and the web Agenda API.
 */
export interface AgendaEvent {
  /**
   * Unique, stable identifier.
   */
  id: string;
  /**
   * Event title shown inside event chips.
   */
  title: string;
  /**
   * Start date-time (wall clock, no time zone).
   */
  start: CalendarDateTime;
  /**
   * End date-time (wall clock, no time zone). Exclusive (`[start, end)`): an event
   * ending at midnight does not cover the following day, so a one-day all-day event
   * spans from midnight to the next day's midnight.
   */
  end: CalendarDateTime;
  /**
   * Optional accent color (any React Native color string) used to tint the event chip.
   */
  color?: string;
  /**
   * All-day events render in the all-day section (day/week) and as spanning bars (month).
   *
   * @default false
   */
  isAllDay?: boolean;
  /**
   * Read-only events cannot be moved or resized.
   *
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Confirmation status; `"unconfirmed"` renders with a dashed border.
   *
   * @default 'confirmed'
   */
  status?: AgendaEventStatus;
}
/**
 * Column packing result for a timed event within its overlap cluster.
 */
export interface AgendaEventLayout {
  /**
   * Zero-based column of the event within its overlap cluster.
   */
  columnIndex: number;
  /**
   * Total columns of the overlap cluster the event belongs to.
   */
  totalColumns: number;
}
/**
 * Row-packed placement of an all-day event across a visible day range.
 */
export interface AgendaAllDayLayoutItem {
  /**
   * The all-day event.
   */
  event: AgendaEvent;
  /**
   * Zero-based first visible day column covered by the event.
   */
  colStart: number;
  /**
   * Number of visible day columns covered by the event.
   */
  colSpan: number;
  /**
   * Zero-based packed row index.
   */
  row: number;
}
/**
 * Row-packed placement of a multi-day spanning event within a month week row.
 */
export type AgendaMonthRowLayoutItem = AgendaAllDayLayoutItem;
/**
 * Spanning-event layout for one month week row.
 */
export interface AgendaMonthRowLayout {
  /**
   * Packed spanning events for the week.
   */
  items: AgendaMonthRowLayoutItem[];
  /**
   * Total packed spanning rows in the week.
   */
  rowCount: number;
  /**
   * Per-column count of spanning rows covering that column.
   */
  rowCountPerCol: number[];
}
/**
 * First day of week accepted by the Agenda (forwarded to the calendar and week math).
 */
export type AgendaFirstDayOfWeek = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
/**
 * Root animation configuration. The Agenda root wraps `SplitView`, so the value is forwarded
 * to the SplitView root (including `"disable-all"` cascading to all animated descendants).
 */
export type AgendaRootAnimation = SplitViewRootAnimation;
/**
 * Animation configuration for `Agenda.Event` press/drag scale feedback.
 */
export type AgendaEventAnimation = Animation<{
  /**
   * Scale values `[rest, active]` applied while the event is pressed or dragged.
   *
   * @default [1, 0.97]
   */
  scale?: AnimationValue<{
    value?: [number, number];
    /**
     * @default { duration: 120 }
     */
    timingConfig?: WithTimingConfig;
  }>;
}>;
/**
 * SplitView props forwarded from the Agenda root. When omitted, the Agenda derives snap
 * points from the measured top-section content (collapsed week row / fully expanded).
 */
export type AgendaSplitViewPassthroughProps = Pick<
  SplitViewRootProps,
  | 'snapPoints'
  | 'minHeight'
  | 'maxHeight'
  | 'snapIndex'
  | 'onSnapIndexChange'
  | 'onSnap'
  | 'skipInitialAnimation'
> & {
  /**
   * Default snap index for uncontrolled usage. `0` is the collapsed state showing only
   * the week row of the selected date; `1` reveals the full calendar and top content.
   *
   * @default 0
   */
  defaultSnapIndex?: number;
};
/**
 * Options accepted by the `useAgenda(options)` state-builder hook (web Agenda parity).
 */
export interface UseAgendaOptions {
  /**
   * Events to display. The Agenda never mutates this array; move/resize intents are
   * reported through `onEventMove` / `onEventResize`.
   */
  events: AgendaEvent[];
  /**
   * Controlled view mode.
   */
  view?: AgendaView;
  /**
   * Uncontrolled initial view mode.
   *
   * @default 'day'
   */
  defaultView?: AgendaView;
  /**
   * Called when the view mode changes.
   */
  onViewChange?: (view: AgendaView) => void;
  /**
   * Controlled active date.
   */
  date?: CalendarDate;
  /**
   * Uncontrolled initial active date.
   *
   * @default today (local time zone)
   */
  defaultDate?: CalendarDate;
  /**
   * Called when the active date changes (calendar tap, page swipe, `goToToday`, ...).
   */
  onDateChange?: (date: CalendarDate) => void;
  /**
   * Controlled selected event id.
   */
  selectedEventId?: string | null;
  /**
   * Uncontrolled initial selected event id.
   *
   * @default null
   */
  defaultSelectedEventId?: string | null;
  /**
   * Called when an event is selected (or deselected with `null`).
   */
  onEventSelect?: (id: string | null) => void;
  /**
   * Called when an event chip is pressed. When provided, pressing an event invokes this
   * callback (e.g. to open an event detail screen) instead of toggling the internal
   * selection. When omitted, pressing toggles `selectedEventId` (web Agenda parity).
   */
  onEventPress?: (event: AgendaEvent) => void;
  /**
   * First rendered hour of the time grid (inclusive).
   *
   * @default 0
   */
  startHour?: number;
  /**
   * Last rendered hour of the time grid (exclusive).
   *
   * @default 24
   */
  endHour?: number;
  /**
   * Minutes represented by one grid slot.
   *
   * @default 60
   */
  slotDuration?: number;
  /**
   * Rendered height in px of one grid slot.
   *
   * @default 60
   */
  slotHeight?: number;
  /**
   * First day of week for the calendar and week view.
   */
  firstDayOfWeek?: AgendaFirstDayOfWeek;
  /**
   * BCP 47 locale; defaults to the environment locale.
   */
  locale?: string;
  /**
   * Called with the new start/end after an event is dragged to another time or day.
   * Omit to disable event dragging.
   */
  onEventMove?: (id: string, start: CalendarDateTime, end: CalendarDateTime) => void;
  /**
   * Called with the new start/end after an event's end is resized.
   * Omit to disable event resizing.
   */
  onEventResize?: (id: string, start: CalendarDateTime, end: CalendarDateTime) => void;
  /**
   * Deletion intent callback (API parity with the web Agenda; invoke from custom UI).
   */
  onEventDelete?: (id: string) => void;
}
/**
 * Value returned by `useAgenda(options)`: the resolved agenda state, layout helpers,
 * navigation actions, and interaction callbacks. Spread it into the `Agenda` root
 * (`<Agenda {...agenda}>`), exactly like the web Agenda.
 */
export interface UseAgendaReturn extends AgendaContextValue {
  /**
   * Move intent callback, when provided in the options.
   */
  onEventMove?: (id: string, start: CalendarDateTime, end: CalendarDateTime) => void;
  /**
   * Resize intent callback, when provided in the options.
   */
  onEventResize?: (id: string, start: CalendarDateTime, end: CalendarDateTime) => void;
  /**
   * Press callback, when provided in the options; replaces the selection toggle.
   */
  onEventPress?: (event: AgendaEvent) => void;
}
/**
 * Props for the compound `Agenda` root. State comes exclusively from the
 * `useAgenda(options)` hook, spread into the root: `<Agenda {...agenda}>`.
 */
export interface AgendaRootProps
  extends Omit<ViewProps, 'children'>, AgendaSplitViewPassthroughProps, UseAgendaReturn {
  /**
   * Compound children. When omitted, the Agenda renders the default composition:
   * `Header` with `Calendar`, `DragArea` + `DragHandle`, `Body`, and `ViewSelector`.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the root container.
   */
  className?: string;
  /**
   * Root animation configuration, forwarded to the underlying `SplitView`.
   * Set to `"disable-all"` to disable all animations in the subtree.
   */
  animation?: AgendaRootAnimation;
  /**
   * Background layer rendered behind the agenda shell.
   * - `undefined` (default): renders `Agenda.Background` when the active
   *   library theme registers default background content (e.g. `glass`);
   *   otherwise no layer
   * - custom node: replaces the default layer entirely (wrap content in
   *   `Agenda.Background` to keep the absolute-fill and clipping)
   * - `null`: removes the background layer
   */
  background?: ReactNode;
}
/**
 * Props for the `Agenda.Background` sub-component.
 * Generic absolute-fill container behind the agenda shell. When no
 * `children` are given, the active library theme decides the default
 * content (e.g. a frosted-glass blur layer when the theme is `glass`).
 */
export type AgendaBackgroundProps = ViewProps & {
  /** Additional CSS classes */
  className?: string;
};
/**
 * Props for `Agenda.Header` (wraps `SplitView.TopSection` and measures its natural
 * content height to derive the expanded snap point).
 */
export interface AgendaHeaderProps extends ViewProps {
  /**
   * Additional CSS classes for the header content wrapper.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `height` - Driven by the SplitView `topSectionHeight` shared value
   */
  className?: string;
}
/**
 * Props for `Agenda.Calendar` — the collapsible month calendar bound to the agenda date.
 *
 * Children compose the calendar anatomy like `DatePicker.Calendar` does: use raw
 * `Calendar.*` parts together with `Agenda.CalendarHeader` and `Agenda.CalendarGrid`
 * (the two Agenda-measured wrappers required by the collapse machinery). When
 * `children` is omitted the default prewired composition is rendered.
 */
export interface AgendaCalendarProps extends ViewProps {
  /**
   * Calendar anatomy. Defaults to `CalendarHeader` + `CalendarGrid` + year picker overlay.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the calendar wrapper.
   *
   * @note The grid body slides vertically with the SplitView drag (collapse to the selected
   * week row); its `transform` (translateY) cannot be set via className.
   */
  className?: string;
}
/**
 * Props for `Agenda.CalendarHeader` — measured wrapper around `Calendar.Header`.
 * Children compose the header content (`Calendar.YearPickerTrigger`,
 * `Calendar.NavButton`, `Agenda.TodayButton`, ...); the measured height feeds the
 * collapsed snap point.
 */
export interface AgendaCalendarHeaderProps extends ViewProps {
  /**
   * Header content. Defaults to a year-picker trigger with month navigation and a
   * Today button.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the measured header wrapper.
   */
  className?: string;
}
/**
 * Props for `Agenda.CalendarGrid` — wraps `Calendar.Grid`, measures the weekday row,
 * and owns the clipped, collapse-animated grid body.
 */
export interface AgendaCalendarGridProps extends Omit<ViewProps, 'children'> {
  /**
   * Day cell renderer, matching `Calendar.GridBody`'s own API. Defaults to
   * `Calendar.Cell` with an event-coverage indicator.
   */
  children?: (date: CalendarDate) => ReactElement;
  /**
   * Additional CSS classes for the grid container.
   */
  className?: string;
}
/**
 * Props for `Agenda.Heading` — month + year title for the active date.
 */
export interface AgendaHeadingProps extends TextProps {
  /**
   * Custom heading content; defaults to the localized month + year of the active date.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the heading text.
   */
  className?: string;
}
/**
 * Props for `Agenda.TodayButton` — jumps to today and collapses the header.
 */
export interface AgendaTodayButtonProps {
  /**
   * Custom button content; defaults to a "Today" label.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the button.
   */
  className?: string;
}
/**
 * Props for `Agenda.NavButton` — previous/next agenda navigation (day, week, or month
 * step depending on the current view). Collapses the header like the other actions.
 */
export interface AgendaNavButtonProps extends Omit<PressableProps, 'children'> {
  /**
   * Navigation direction.
   */
  slot: 'previous' | 'next';
  /**
   * Custom icon/content; defaults to a chevron.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the pressable.
   */
  className?: string;
}
/**
 * Props for `Agenda.DragArea` (SplitView passthrough).
 */
export type AgendaDragAreaProps = SplitViewDragAreaProps;
/**
 * Props for `Agenda.DragHandle` (SplitView passthrough).
 */
export type AgendaDragHandleProps = SplitViewDragHandleProps;
/**
 * Props for `Agenda.Body` — the paged day/week/month area inside `SplitView.BottomSection`.
 *
 * Children act as the page template: they render once per pager page under the page
 * context (`useAgendaPage`). Parts like `Agenda.WeekHeader`, `Agenda.AllDaySection`,
 * `Agenda.TimeGrid`, and `Agenda.MonthGrid` self-gate by the page's view, so a single
 * template covers all views. When omitted, the default template renders all parts.
 */
export interface AgendaBodyProps extends ViewProps {
  /**
   * Page template rendered per pager page. Defaults to
   * `WeekHeader` + `AllDaySection` + `TimeGrid` + `MonthGrid`.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the body container.
   */
  className?: string;
  /**
   * Whether the bottom fade gradient (above the floating view selector) is rendered.
   *
   * @default true
   */
  showBottomFade?: boolean;
  /**
   * Color the bottom fade dissolves from (any React Native color string).
   *
   * @default theme surface color
   */
  bottomFadeColor?: string;
  /**
   * Height in px of the bottom fade.
   *
   * @default 64
   */
  bottomFadeHeight?: number;
}
/**
 * Props for `Agenda.WeekHeader` — the weekday row above the time grid. Renders only
 * on multi-day (week) pages.
 */
export interface AgendaWeekHeaderProps extends ViewProps {
  /**
   * When `true`, renders full weekday names with tappable date pills; when `false`,
   * renders slim day letters. The collapsed `Agenda.Calendar` already shows the week
   * dates, so letters are the default.
   *
   * @default false
   */
  showDates?: boolean;
  /**
   * Additional CSS classes for the week header container.
   */
  className?: string;
  /**
   * Additional CSS classes for the week header slots.
   */
  classNames?: ElementSlots<WeekHeaderSlots>;
  /**
   * Additional native styles for the week header slots.
   */
  styles?: {
    container?: ViewStyle;
    cell?: ViewStyle;
    day?: TextStyle;
    date?: TextStyle;
  };
}
/**
 * Props for `Agenda.AllDaySection` — packed all-day bars above the time grid.
 * Renders only on day/week pages with at least one all-day event.
 *
 * Children act as the per-event template rendered inside each bar with the event
 * available via `useAgendaEvent()` (e.g. `Agenda.EventTitle`). Defaults to a color
 * tint + title.
 */
export interface AgendaAllDaySectionProps extends ViewProps {
  /**
   * Per-event content template. Defaults to tint + `EventTitle`-styled title.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the section container.
   */
  className?: string;
  /**
   * Additional CSS classes for the section slots.
   */
  classNames?: ElementSlots<AllDaySectionSlots>;
  /**
   * Additional native styles for the section slots.
   */
  styles?: {
    container?: ViewStyle;
    event?: ViewStyle;
    eventTitle?: TextStyle;
  };
}
/**
 * Props for `Agenda.TimeGrid` — the vertically scrollable hour grid shared across
 * pages (synced scroll offset, hour gutter, hour lines, drop guides, and the top
 * fade overlay). Renders only on day/week pages.
 *
 * Children compose the grid content in its coordinate space; defaults to
 * `Agenda.CurrentTimeIndicator` + `Agenda.DayColumns`.
 */
export interface AgendaTimeGridProps extends ViewProps {
  /**
   * Grid content. Defaults to the current-time indicator and the day columns.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the grid viewport wrapper.
   */
  className?: string;
  /**
   * Additional CSS classes for the time grid slots (the fade is customized via
   * the `showTopFade` / `topFadeColor` / `topFadeHeight` props instead). The
   * `dragGuide*` slots style the dashed drop guides (leading lines + rail time
   * labels) shown while an event is dragged or resized.
   *
   * @note The following style properties of the `dragGuide` slot are occupied by
   * animations and cannot be set via className:
   * - `opacity` - Shown only while a drag is active
   * - `transform` (translateY) - Tracks the snapped drop position
   */
  classNames?: ElementSlots<Exclude<TimeGridSlots, 'topFade'>>;
  /**
   * Additional native styles for the time grid slots.
   */
  styles?: {
    container?: ViewStyle;
    scroll?: ViewStyle;
    content?: ViewStyle;
    gutterLabel?: TextStyle;
    hourLine?: ViewStyle;
    dragGuide?: ViewStyle;
    dragGuideLine?: ViewStyle;
    dragGuideLineDash?: ViewStyle;
    dragGuideLabel?: TextStyle;
  };
  /**
   * Whether the top fade gradient is rendered over content scrolling under the
   * grid's top edge.
   *
   * @default true
   */
  showTopFade?: boolean;
  /**
   * Color the top fade dissolves from (any React Native color string).
   *
   * @default theme surface color
   */
  topFadeColor?: string;
  /**
   * Height in px of the top fade.
   *
   * @default 36
   */
  topFadeHeight?: number;
}
/**
 * Props for `Agenda.DayColumns` — one column per page day, each rendering its
 * events. Children act as the per-event template rendered with the event available
 * via `useAgendaEvent()`; defaults to `Agenda.Event`.
 */
export interface AgendaDayColumnsProps extends ViewProps {
  /**
   * Per-event template. Defaults to `Agenda.Event`.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the columns row container.
   */
  className?: string;
  /**
   * Additional CSS classes for the day columns slots.
   */
  classNames?: ElementSlots<DayColumnsSlots>;
  /**
   * Additional native styles for the day columns slots.
   */
  styles?: Partial<Record<DayColumnsSlots, ViewStyle>>;
}
/**
 * Props for `Agenda.Event` — the positioned, draggable, resizable event card inside a
 * day column. Reads the event from the template context by default; pass `event`
 * explicitly for manual placement inside `Agenda.DayColumns` templates.
 */
export interface AgendaEventProps extends ViewProps {
  /**
   * The event to render. Defaults to the template context event (`useAgendaEvent`).
   */
  event?: AgendaEvent;
  /**
   * Card content. Defaults to color tint + accent bar + `EventTitle` + `EventTime`
   * (the time auto-hides on short chips).
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the card container.
   *
   * @note The following style properties are occupied by animations and cannot be set via className:
   * - `transform` (scale) - Press / drag feedback
   * - `height` - Live feedback while resizing
   *
   * To customize the scale, use the `animation` prop. To disable the scale styles,
   * set `isAnimatedStyleActive={false}`.
   */
  className?: string;
  /**
   * Additional CSS classes for the event slots.
   */
  classNames?: ElementSlots<EventSlots>;
  /**
   * Additional native styles for the event slots.
   */
  styles?: {
    container?: ViewStyle;
    content?: ViewStyle;
    tint?: ViewStyle;
    accentBar?: ViewStyle;
    title?: TextStyle;
    time?: TextStyle;
    resizeHandle?: ViewStyle;
    resizeGrabber?: ViewStyle;
  };
  /**
   * Press / drag scale animation for the card.
   */
  animation?: AgendaEventAnimation;
  /**
   * When `false`, the decorative scale style is not applied (functional drag/resize
   * styles stay active).
   *
   * @default true
   */
  isAnimatedStyleActive?: boolean;
}
/**
 * Props for `Agenda.EventTitle` — title text of the template context event.
 */
export interface AgendaEventTitleProps extends TextProps {
  /**
   * Custom title content; defaults to the event's `title`.
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the title text.
   */
  className?: string;
}
/**
 * Props for `Agenda.EventTime` — formatted time range of the template context event.
 */
export interface AgendaEventTimeProps extends TextProps {
  /**
   * Custom time content; defaults to the localized `start – end` range (or "All day").
   */
  children?: ReactNode;
  /**
   * Additional CSS classes for the time text.
   */
  className?: string;
}
/**
 * Props for `Agenda.CurrentTimeIndicator` — the live time badge + line. Renders only
 * on day/week pages containing today.
 */
export interface AgendaCurrentTimeIndicatorProps extends ViewProps {
  /**
   * Additional CSS classes for the indicator container.
   */
  className?: string;
  /**
   * Additional CSS classes for the indicator slots.
   */
  classNames?: ElementSlots<CurrentTimeIndicatorSlots>;
  /**
   * Additional native styles for the indicator slots.
   */
  styles?: {
    container?: ViewStyle;
    gutter?: ViewStyle;
    badge?: ViewStyle;
    line?: ViewStyle;
    dot?: ViewStyle;
    label?: TextStyle;
  };
}
/**
 * Props for `Agenda.MonthGrid` — six week rows with spanning multi-day bars and
 * per-cell event chips. Renders only on month pages.
 *
 * Children act as the per-event chip content template (spanning bars and cell chips),
 * rendered with the event available via `useAgendaEvent()`.
 */
export interface AgendaMonthGridProps extends ViewProps {
  /**
   * Per-event chip content template. Defaults to tint + title.
   */
  children?: ReactNode;
  /**
   * Maximum event chips per cell before the overflow label (web parity: `maxEvents`).
   *
   * @default 2
   */
  maxEventsPerCell?: number;
  /**
   * Custom overflow label; pressing it opens the day view for that date.
   *
   * @default (count) => `+${count}`
   */
  moreLabel?: (count: number) => string;
  /**
   * Additional CSS classes for the month grid container.
   */
  className?: string;
  /**
   * Additional CSS classes for the month grid slots.
   */
  classNames?: ElementSlots<MonthGridSlots>;
  /**
   * Additional native styles for the month grid slots.
   */
  styles?: {
    container?: ViewStyle;
    weekdayRow?: ViewStyle;
    weekdayLabel?: TextStyle;
    row?: ViewStyle;
    spanningEvent?: ViewStyle;
    spanningEventTitle?: TextStyle;
    cell?: ViewStyle;
    cellDate?: TextStyle;
    cellEvents?: ViewStyle;
    cellEvent?: ViewStyle;
    cellEventTitle?: TextStyle;
    cellMore?: TextStyle;
  };
}
/**
 * Props for `Agenda.ViewSelector` — the floating day/week/month selector built on `Segment`.
 *
 * Extends the full `Segment` API (size, isDisabled, Tabs animations, ...) except the
 * selection value, which is bound to the agenda view. Compose custom items with
 * `Agenda.ViewSelector.Item` / `.Label` / `.Separator` via `children` (values must be
 * `AgendaView` strings); `Segment.ScrollView` is intentionally not exposed.
 */
export interface AgendaViewSelectorProps extends Omit<
  SegmentRootProps,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
> {
  /**
   * Custom `Segment` composition. When omitted, a `Group` with an `Indicator` and one
   * `Item` per option is rendered.
   */
  children?: ReactNode;
  /**
   * Which views can be selected, in render order.
   *
   * @default ['day', 'week', 'month']
   */
  options?: AgendaView[];
  /**
   * Custom labels per view.
   *
   * @default { day: 'Day', week: 'Week', month: 'Month' }
   */
  labels?: Partial<Record<AgendaView, string>>;
  /**
   * Visual size of the underlying `Segment`.
   *
   * @default 'sm'
   */
  size?: SegmentRootProps['size'];
  /**
   * Additional CSS classes for the selector root. The default places the selector
   * absolutely at the bottom-center of the Agenda root.
   */
  className?: string;
}
/**
 * Page context provided per pager page, returned by `useAgendaPage()`. Available to
 * `Agenda.Body` template children.
 */
export interface AgendaPageContextValue {
  /**
   * Page anchor date: the day itself, the week start, or the first of the month.
   */
  date: CalendarDate;
  /**
   * Days rendered by this page (1 for day, 7 for week, empty for month).
   */
  days: CalendarDate[];
  /**
   * Six week rows for month pages (empty for day/week).
   */
  weeks: CalendarDate[][];
  /**
   * Whether this page renders a month grid.
   */
  isMonthPage: boolean;
}
/**
 * Internal context shared between compound parts (not exposed via `useAgenda`).
 */
export interface AgendaInternalContextValue {
  /**
   * Rendered px per minute (`slotHeight / slotDuration`).
   */
  pxPerMinute: number;
  /**
   * Move intent callback from the root, when provided.
   */
  onEventMove: ((id: string, start: CalendarDateTime, end: CalendarDateTime) => void) | undefined;
  /**
   * Resize intent callback from the root, when provided.
   */
  onEventResize: ((id: string, start: CalendarDateTime, end: CalendarDateTime) => void) | undefined;
  /**
   * Press callback from the root; replaces the selection toggle when provided.
   */
  onEventPress: ((event: AgendaEvent) => void) | undefined;
  /**
   * `Agenda.Calendar` reports the collapsed top height (calendar offset + header +
   * weekday row + one week row). `null` clears the measurement.
   */
  reportCollapsedTopHeight: (height: number | null) => void;
  /**
   * `Agenda.Header` reports the natural (unclipped) height of its content.
   * `null` clears the measurement.
   */
  reportTopContentHeight: (height: number | null) => void;
}
/**
 * Internal per-page context (pager geometry and shared scroll state).
 */
export interface AgendaPageInternalContextValue {
  /**
   * Index of this page in the pager window.
   */
  pageIndex: number;
  /**
   * Rendered page width in px.
   */
  pageWidth: number;
  /**
   * Width in px of one day column (page width minus gutter, divided by day count).
   */
  dayColumnWidth: number;
  /**
   * Shared vertical scroll offset synchronized across pages.
   */
  scrollY: SharedValue<number>;
  /**
   * Index of the currently active (visible) page.
   */
  activePageIndex: SharedValue<number>;
  /**
   * Initial vertical scroll offset in minutes (about one hour before now).
   */
  initialScrollOffsetMinutes: number;
  /**
   * `true` once the page's deferred event chips layer may mount.
   */
  isEventsLayerReady: boolean;
}
/**
 * Shared values driving the drop guides of one time grid while an event is dragged
 * or resized. Moving shows both lines; resizing shows only the end line.
 */
export interface AgendaDragGuideValues {
  startActive: SharedValue<boolean>;
  endActive: SharedValue<boolean>;
  startY: SharedValue<number>;
  endY: SharedValue<number>;
}
/**
 * Internal context provided by `Agenda.TimeGrid` to columns and events.
 */
export interface AgendaTimeGridInternalContextValue {
  /**
   * Total grid content height in px.
   */
  contentHeight: number;
  /**
   * Drop guide shared values for the grid.
   */
  dragGuides: AgendaDragGuideValues;
  /**
   * Reports snapped drop minutes for the rail labels (`null` clears them).
   */
  onDragGuideChange: (
    minutes: {
      start?: number;
      end?: number;
    } | null
  ) => void;
}
/**
 * Internal context provided by each day column to its events.
 */
export interface AgendaDayColumnContextValue {
  /**
   * The column's date.
   */
  day: CalendarDate;
  /**
   * Zero-based column index within the page.
   */
  dayIndex: number;
  /**
   * Total day columns on the page.
   */
  daysCount: number;
}
/**
 * Internal context wiring `Agenda.CalendarHeader` / `Agenda.CalendarGrid` to the
 * collapse machinery owned by `Agenda.Calendar`.
 */
export interface AgendaCalendarInternalContextValue {
  /**
   * Reports the measured header block height.
   */
  reportHeaderHeight: (height: number) => void;
  /**
   * Reports the measured weekday row height.
   */
  reportGridHeaderHeight: (height: number) => void;
  /**
   * Reports the measured grid body height.
   */
  reportGridBodyHeight: (height: number) => void;
  /**
   * Animated collapse translation applied around the grid body.
   */
  rGridBodyStyle: AnimatedStyle<ViewStyle>;
  /**
   * Day keys (ISO date strings) covered by at least one event, for cell indicators.
   */
  eventDayKeys: ReadonlySet<string>;
}
/**
 * Public context value returned by `useAgenda()`.
 */
export interface AgendaContextValue {
  /**
   * Current view mode.
   */
  view: AgendaView;
  /**
   * Active date.
   */
  date: CalendarDate;
  /**
   * Events passed to the root.
   */
  events: AgendaEvent[];
  /**
   * Selected event id or `null`.
   */
  selectedEventId: string | null;
  /**
   * First rendered hour (inclusive).
   */
  startHour: number;
  /**
   * Last rendered hour (exclusive).
   */
  endHour: number;
  /**
   * Minutes per grid slot.
   */
  slotDuration: number;
  /**
   * Height in px of one grid slot.
   */
  slotHeight: number;
  /**
   * Resolved BCP 47 locale.
   */
  locale: string;
  /**
   * Local time zone identifier.
   */
  timeZone: string;
  /**
   * First day of week, when explicitly provided.
   */
  firstDayOfWeek: AgendaFirstDayOfWeek | undefined;
  /**
   * Month + year heading for the active date.
   */
  heading: string;
  /**
   * Days visible for the active date in the current view (1 for day, 7 for week, empty for month).
   */
  visibleDays: CalendarDate[];
  /**
   * Six week rows for the active month (month view only, empty otherwise).
   */
  visibleWeeks: CalendarDate[][];
  /**
   * Sets the view mode.
   */
  setView: (view: AgendaView) => void;
  /**
   * Sets the active date (syncs calendar and pager).
   */
  setDate: (date: CalendarDate) => void;
  /**
   * Selects an event (or deselects with `null`).
   */
  selectEvent: (id: string | null) => void;
  /**
   * Moves to the next day/week/month depending on the view.
   */
  goToNext: () => void;
  /**
   * Moves to the previous day/week/month depending on the view.
   */
  goToPrevious: () => void;
  /**
   * Jumps to today.
   */
  goToToday: () => void;
  /**
   * Timed events whose start falls on the given day.
   */
  getEventsForDay: (day: CalendarDate) => AgendaEvent[];
  /**
   * Overlap column layout for a timed event.
   */
  getEventLayout: (eventId: string) => AgendaEventLayout;
  /**
   * All events (timed + all-day) whose start falls on the given day.
   * Multi-day spans are attributed to their start day only; use
   * `getAllDayLayoutForDays` for coverage-based all-day placement.
   */
  getAllEventsForDay: (day: CalendarDate) => AgendaEvent[];
  /**
   * Packed all-day rows for an arbitrary visible day range (page-independent).
   */
  getAllDayLayoutForDays: (days: CalendarDate[]) => AgendaAllDayLayoutItem[];
  /**
   * Spanning-event layout for a month week row.
   */
  getMonthRowLayout: (week: CalendarDate[]) => AgendaMonthRowLayout;
  /**
   * Non-spanning events for a month cell.
   */
  getPerCellEvents: (day: CalendarDate, week: CalendarDate[]) => AgendaEvent[];
  /**
   * Deletion intent callback from the root, when provided.
   */
  onEventDelete: ((id: string) => void) | undefined;
}
