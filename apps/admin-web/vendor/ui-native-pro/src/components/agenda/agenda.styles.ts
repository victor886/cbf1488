// @ts-nocheck
import { Platform, StyleSheet } from 'react-native';
import { cn } from 'heroui-native/utils';
import { tv } from 'tailwind-variants';
import { combineStyles } from '../../helpers/internal/utils/index';
/**
 * Layout direction style. Native Yoga uses `direction`; react-native-web rejects
 * that key in StyleSheet and maps `writingDirection` → CSS `direction` instead.
 */
const layoutDirection = (dir: 'ltr' | 'rtl') =>
  Platform.OS === 'web' ? { writingDirection: dir } : { direction: dir };
/**
 * Root container (hosts the SplitView).
 *
 * @note All `data-[...]:` prefixed utilities in this file stay here: data
 * selectors are Tailwind variants and cannot be applied to custom CSS
 * classes. Plain base styles live in `styles/components/agenda.css`.
 */
const root = tv({
  base: 'agenda__root shadow-surface',
});
/**
 * Background style definition — absolute-fill container behind the agenda
 * shell, hosting theme-specific layers (e.g. glass blur) or custom content
 * (gradients, images).
 */
const background = tv({
  base: 'agenda__background',
});
/**
 * Header (top SplitView pane): `pane` is the rounded surface card on the animated
 * pane; `content` is the measured natural-height wrapper (drives dynamic snap points).
 */
const header = tv({
  slots: {
    pane: 'agenda__header-pane',
    content: 'agenda__header',
  },
});
/**
 * Collapsible calendar wrapper inside the header.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The grid body (inside `gridClip`) animates the following:
 * - `transform` (translateY) - Slides the selected week row into view while collapsing
 */
const calendar = tv({
  slots: {
    container: 'agenda__calendar',
    gridClip: 'agenda__calendar-grid-clip',
  },
});
/**
 * Measured wrapper around `Calendar.Header` (no visual styling of its own).
 */
const calendarHeader = tv({
  base: '',
});
/**
 * Month + year heading text bound to the active date.
 */
const heading = tv({
  base: 'agenda__heading',
});
/**
 * Previous / next agenda navigation control.
 */
const navButton = tv({
  base: 'agenda__nav-button',
});
/**
 * Compact "Today" button preset (`container` on the Button, `label` on its text).
 */
const todayButton = tv({
  slots: {
    container: 'h-8 px-3',
    label: 'text-xs',
  },
});
/**
 * Paged body area inside the SplitView bottom section: `container` is the rounded
 * surface card, `fade` the bottom gradient overlay above the floating selector.
 */
const body = tv({
  slots: {
    container: 'agenda__body',
    fade: 'agenda__body-fade',
  },
});
/**
 * One horizontal page (day / week / month).
 */
const page = tv({
  base: 'agenda__page',
});
/**
 * Week header row above the time grid (weekday letters, or names + date pills).
 */
const weekHeader = tv({
  slots: {
    container: 'agenda__week-header',
    cell: 'agenda__week-header-cell',
    day: cn('agenda__week-header-day', 'data-[today=true]:text-accent-soft-foreground'),
    date: cn(
      'agenda__week-header-date',
      'data-[today=true]:bg-accent data-[today=true]:text-accent-foreground',
      'data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground'
    ),
  },
});
/**
 * All-day section above the time grid: packed event bars with per-event color tint.
 */
const allDaySection = tv({
  slots: {
    container: 'agenda__all-day-section',
    event: 'agenda__all-day-event',
    eventTitle: 'agenda__all-day-event-title',
    tint: 'agenda__absolute-fill',
  },
});
/**
 * Scrollable time grid (hour gutter + hour lines + composed content): `container`
 * is the viewport wrapper, `scroll` the vertical scroll view, and `topFade` the
 * gradient overlay fading content that scrolls under the grid's top edge. The
 * `dragGuide*` slots style the dashed drop guides (projected start/end lines with
 * time labels on the rail) shown while an event is dragged or resized.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `dragGuide` slot animates the following:
 * - `opacity` - Shown only while a drag is active
 * - `transform` (translateY) - Tracks the snapped drop position
 */
const timeGrid = tv({
  slots: {
    container: 'agenda__time-grid',
    scroll: 'agenda__time-grid-scroll',
    content: '',
    gutterLabel: 'agenda__time-gutter-label',
    hourLine: 'agenda__hour-line',
    topFade: 'agenda__time-grid-fade',
    dragGuide: 'agenda__drag-guide',
    dragGuideLine: 'agenda__drag-guide-line',
    dragGuideLineDash: 'agenda__drag-guide-line-dash',
    dragGuideLabel: 'agenda__drag-guide-label',
  },
});
/**
 * Day columns row: one column per page day with a fading events layer.
 */
const dayColumns = tv({
  slots: {
    container: 'agenda__day-columns',
    column: 'agenda__day-column',
    eventsLayer: 'agenda__absolute-fill',
  },
});
/**
 * Timed event card.
 *
 * @note ANIMATED PROPERTIES (cannot be set via className):
 * The `container` slot animates the following:
 * - `transform` (scale) - Press / drag feedback
 * - `height` - Live feedback while resizing
 *
 * The `resizeGrabber` slot animates the following:
 * - `transform` (scale) - Scales down while the resize gesture is active
 *
 * To customize the scale, use the `animation` prop on `Agenda.Event`. To disable the
 * decorative scale, set `isAnimatedStyleActive={false}`.
 */
const event = tv({
  slots: {
    container: cn(
      'agenda__event w-full h-full',
      'data-[selected=true]:border-accent',
      'data-[unconfirmed=true]:border-dashed'
    ),
    content: 'agenda__event-content',
    tint: 'agenda__event-tint',
    accentBar: 'agenda__event-accent-bar',
    title: 'agenda__event-title',
    time: 'agenda__event-time',
    resizeHandle: 'agenda__event-resize-handle',
    resizeGrabber: cn(
      'agenda__event-resize-grabber',
      'data-[selected=true]:bg-accent data-[selected=true]:opacity-100'
    ),
  },
});
/**
 * Current time indicator (badge + line + notch).
 */
const currentTimeIndicator = tv({
  slots: {
    container: 'agenda__current-time',
    gutter: 'agenda__current-time-gutter',
    badge: 'agenda__current-time-badge',
    line: 'agenda__current-time-line',
    dot: 'agenda__current-time-dot',
    label: 'agenda__current-time-label',
  },
});
/**
 * Month grid page: weekday row, week rows with spanning bars, and day cells with
 * event chips.
 */
const monthGrid = tv({
  slots: {
    container: 'agenda__month-grid',
    weekdayRow: 'agenda__month-weekday-row',
    weekdayLabel: 'agenda__month-weekday-label',
    row: 'agenda__month-row',
    spanningLayer: 'agenda__month-spanning-layer',
    spanningEvent: 'agenda__month-spanning-event',
    spanningEventTitle: 'agenda__month-spanning-event-title',
    cell: 'agenda__month-cell',
    cellDate: cn(
      'agenda__month-cell-date',
      'data-[today=true]:bg-accent data-[today=true]:text-accent-foreground',
      'data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-soft-foreground',
      'data-[outside-month=true]:text-muted'
    ),
    cellEvents: 'agenda__month-cell-events',
    cellEvent: 'agenda__month-event',
    cellEventTitle: 'agenda__month-event-title',
    cellMore: 'agenda__month-cell-more',
  },
});
/**
 * Floating day/week/month selector (positions the underlying `Segment` root;
 * pill visuals come from `Segment` itself).
 */
const viewSelector = tv({
  base: 'agenda__view-selector',
});
/**
 * Pill row of the view selector: adds the overlay shadow on top of `Segment.Group`
 * (the group owns the rounded background, so the shadow follows the pill shape).
 */
const viewSelectorGroup = tv({
  base: 'shadow-overlay',
});
export const agendaClassNames = combineStyles({
  root,
  background,
  header,
  calendar,
  calendarHeader,
  heading,
  navButton,
  todayButton,
  body,
  page,
  weekHeader,
  allDaySection,
  timeGrid,
  dayColumns,
  event,
  currentTimeIndicator,
  monthGrid,
  viewSelector,
  viewSelectorGroup,
});
export const agendaStyleSheet = StyleSheet.create({
  borderCurve: {
    borderCurve: 'continuous',
  },
  /**
   * Pins the pager's content row to a physical left-to-right flow. The
   * FlatList virtualization math (`getItemLayout`, `scrollToIndex`,
   * viewability offsets) is physical, so the RTL mirroring happens in the
   * index ↔ date mapping instead of in layout. Pages restore the app
   * direction on their own root (see `pageDirection*`).
   */
  pagerContent: layoutDirection('ltr'),
  /**
   * Pins the pager's own list node to LTR as well. On Android, a horizontal
   * FlatList whose node resolves to `rtl` mirrors its scroll offsets, which
   * breaks the `removeClippedSubviews` clipping math against the LTR-pinned
   * content row and blanks pages. Node and content must agree on a physical
   * left-to-right flow.
   */
  pagerList: layoutDirection('ltr'),
  /**
   * Inner wrapper hosting the pager list. Page width is measured here — the
   * body's content box — rather than on the body itself, so borders or
   * padding added to `Agenda.Body` by themes (e.g. brutalism's 1px border)
   * or consumer classNames never desync the `pagingEnabled` snap width from
   * the `getItemLayout` page width.
   */
  pagerViewport: {
    flex: 1,
  },
  /** Restores the app layout direction inside an LTR-pinned pager page. */
  pageDirectionLTR: layoutDirection('ltr'),
  pageDirectionRTL: layoutDirection('rtl'),
});
export default agendaClassNames;
