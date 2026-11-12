// @ts-nocheck
/**
 * Display name constants for the compound Agenda (`HeroUINative.Agenda.*`).
 */
export const DISPLAY_NAME = {
  ROOT: 'HeroUINative.Agenda.Root',
  BACKGROUND: 'HeroUINative.Agenda.Background',
  HEADER: 'HeroUINative.Agenda.Header',
  CALENDAR: 'HeroUINative.Agenda.Calendar',
  CALENDAR_HEADER: 'HeroUINative.Agenda.CalendarHeader',
  CALENDAR_GRID: 'HeroUINative.Agenda.CalendarGrid',
  HEADING: 'HeroUINative.Agenda.Heading',
  TODAY_BUTTON: 'HeroUINative.Agenda.TodayButton',
  NAV_BUTTON: 'HeroUINative.Agenda.NavButton',
  DRAG_AREA: 'HeroUINative.Agenda.DragArea',
  DRAG_HANDLE: 'HeroUINative.Agenda.DragHandle',
  BODY: 'HeroUINative.Agenda.Body',
  WEEK_HEADER: 'HeroUINative.Agenda.WeekHeader',
  ALL_DAY_SECTION: 'HeroUINative.Agenda.AllDaySection',
  TIME_GRID: 'HeroUINative.Agenda.TimeGrid',
  DAY_COLUMNS: 'HeroUINative.Agenda.DayColumns',
  EVENT: 'HeroUINative.Agenda.Event',
  EVENT_TITLE: 'HeroUINative.Agenda.EventTitle',
  EVENT_TIME: 'HeroUINative.Agenda.EventTime',
  CURRENT_TIME_INDICATOR: 'HeroUINative.Agenda.CurrentTimeIndicator',
  MONTH_GRID: 'HeroUINative.Agenda.MonthGrid',
  VIEW_SELECTOR: 'HeroUINative.Agenda.ViewSelector',
};
/**
 * Pages rendered on each side of the frozen anchor date (per view mode).
 * The pager therefore covers `anchor ± PAGE_WINDOW` days / weeks / months.
 */
export const PAGE_WINDOW = 60;
/**
 * Total page count of the horizontal pager.
 */
export const PAGE_COUNT = PAGE_WINDOW * 2 + 1;
/**
 * Stable index array backing the pager `FlatList` data.
 */
export const PAGE_INDICES = Array.from(
  {
    length: PAGE_COUNT,
  },
  (_, index) => index
);
/**
 * Drag / resize snapping granularity in minutes.
 */
export const SNAP_MINUTES = 5;
/**
 * Minimum event duration in minutes enforced during resize.
 */
export const MIN_EVENT_MINUTES = 5;
/**
 * Default rendered height of one time slot in px.
 */
export const DEFAULT_SLOT_HEIGHT = 60;
/**
 * Default minutes represented by one grid slot.
 */
export const DEFAULT_SLOT_DURATION = 60;
/**
 * Default first rendered hour (inclusive).
 */
export const DEFAULT_START_HOUR = 0;
/**
 * Default last rendered hour (exclusive).
 */
export const DEFAULT_END_HOUR = 24;
/**
 * Width in px of the hour label gutter on the left of the time grid.
 */
export const TIME_GUTTER_WIDTH = 56;
/**
 * Update interval of the current-time indicator in ms.
 */
export const NOW_INDICATOR_INTERVAL_MS = 60000;
/**
 * Rendered height in px of one packed all-day row.
 */
export const ALL_DAY_ROW_HEIGHT = 26;
/**
 * Top offset in px of the all-day section when it is the first element of a page
 * (day pages, where no week header carries the page's top padding).
 */
export const ALL_DAY_STANDALONE_TOP_PADDING = 8;
/**
 * Rendered height in px of one month event chip (including its gap).
 */
export const MONTH_EVENT_HEIGHT = 18;
/**
 * Default maximum event chips per month cell before the "+N" overflow label.
 */
export const DEFAULT_MAX_MONTH_EVENTS = 2;
/**
 * Vertical offset in px from the top of a month row to the first event chip
 * (space reserved for the date pill).
 */
export const MONTH_DATE_OFFSET = 28;
/**
 * Extra px added below the collapsed week row so it is not clipped flush.
 */
export const COLLAPSED_BOTTOM_PADDING = 4;
/**
 * Delay in ms before a pressed event starts dragging (distinguishes tap from drag).
 */
export const EVENT_PRE_DRAG_DELAY = 220;
/**
 * Height in px of the invisible resize hit area at the bottom of an event.
 */
export const RESIZE_HANDLE_HIT_HEIGHT = 12;
/**
 * Extra touch area around the resize handle (extends past the chip's bottom edge),
 * so the grabber is easy to catch without hitting the exact pixel row.
 */
export const RESIZE_GESTURE_HIT_SLOP = {
  top: 8,
  bottom: 16,
  left: 16,
  right: 16,
};
/**
 * Horizontal pager virtualization settings (small window keeps at most a few pages alive).
 */
export const PAGER_WINDOW_SIZE = 3;
export const PAGER_MAX_TO_RENDER_PER_BATCH = 1;
export const PAGER_INITIAL_NUM_TO_RENDER = 1;
/**
 * Minimum visibility percentage before a swiped page commits a date change.
 */
export const PAGE_VIEWABILITY_THRESHOLD = 90;
/**
 * Estimated collapsed top-section height in px used before measurements settle
 * (calendar header + weekday row + one week row).
 */
export const ESTIMATED_COLLAPSED_TOP_HEIGHT = 142;
/**
 * Estimated expanded top-section height in px used before measurements settle.
 */
export const ESTIMATED_EXPANDED_TOP_HEIGHT = 380;
/**
 * Default order of the `Agenda.ViewSelector` options.
 */
export const DEFAULT_VIEW_OPTIONS = ['day', 'week', 'month'];
/**
 * Default labels of the `Agenda.ViewSelector` options.
 */
export const DEFAULT_VIEW_LABELS = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
};
/**
 * Opacity of the tint overlay derived from `event.color`.
 */
export const EVENT_COLOR_TINT_OPACITY = 0.16;
/**
 * Minimum card height in px before the default event content shows the time label.
 */
export const EVENT_TIME_MIN_HEIGHT = 34;
/**
 * Default chevron icon size of `Agenda.NavButton`.
 */
export const NAV_ICON_SIZE = 18;
/**
 * Minutes scrolled above "now" when the time grid mounts (one hour of context).
 */
export const INITIAL_SCROLL_LEAD_MINUTES = 60;
/**
 * Bottom padding of the scrollable time grid so the last events are not covered
 * by the floating `Agenda.ViewSelector`.
 */
export const BODY_SCROLL_BOTTOM_PADDING = 88;
/**
 * Timing duration in ms of one snapped drop-guide position step while dragging or
 * resizing an event (applied at the shared-value write sites, not on gesture start).
 */
export const DRAG_GUIDE_STEP_DURATION_MS = 80;
/**
 * Delay in ms before a freshly mounted page brings in its event chips layer.
 * Sized to outlast the view selector's indicator animation, so on view changes the
 * empty grid shows immediately and the data arrives after the indicator settles.
 */
export const EVENTS_LAYER_REVEAL_DELAY_MS = 200;
