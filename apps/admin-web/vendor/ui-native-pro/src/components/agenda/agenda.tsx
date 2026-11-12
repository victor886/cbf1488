// @ts-nocheck
import { forwardRef, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import { ThemeBackground, useHasDefaultThemeBackground } from 'heroui-native';
import { Button } from 'heroui-native/button';
import { useAnimationSettings } from 'heroui-native/contexts';
import { useIsRTL, useThemeColor } from 'heroui-native/hooks';
import { cn } from 'heroui-native/utils';
import { HeroText } from '../../helpers/internal/components/index';
import { ChevronLeftIcon, ChevronRightIcon } from '../../helpers/internal/icons/index';
import InternationalizedDatePackage from '../../optional/internationalized-date';
import ReactNativeReanimatedDndPackage from '../../optional/react-native-reanimated-dnd';
import { useCalendarStateContext } from '../../primitives/calendar/index';
import Calendar from '../calendar/calendar';
import Segment from '../segment/segment';
import SplitView, { useSplitView } from '../split-view/split-view';
import {
  useAgendaCalendarCollapseAnimation,
  useAgendaDragGuideAnimation,
  useAgendaEventAnimation,
  useAgendaEventResizeGrabberAnimation,
} from './agenda.animation';
import {
  ALL_DAY_ROW_HEIGHT,
  ALL_DAY_STANDALONE_TOP_PADDING,
  BODY_SCROLL_BOTTOM_PADDING,
  COLLAPSED_BOTTOM_PADDING,
  DEFAULT_MAX_MONTH_EVENTS,
  DEFAULT_VIEW_LABELS,
  DEFAULT_VIEW_OPTIONS,
  DISPLAY_NAME,
  DRAG_GUIDE_STEP_DURATION_MS,
  ESTIMATED_COLLAPSED_TOP_HEIGHT,
  ESTIMATED_EXPANDED_TOP_HEIGHT,
  EVENT_COLOR_TINT_OPACITY,
  EVENT_PRE_DRAG_DELAY,
  EVENT_TIME_MIN_HEIGHT,
  INITIAL_SCROLL_LEAD_MINUTES,
  MIN_EVENT_MINUTES,
  MONTH_DATE_OFFSET,
  MONTH_EVENT_HEIGHT,
  NAV_ICON_SIZE,
  NOW_INDICATOR_INTERVAL_MS,
  PAGE_COUNT,
  PAGE_INDICES,
  PAGE_VIEWABILITY_THRESHOLD,
  PAGE_WINDOW,
  PAGER_INITIAL_NUM_TO_RENDER,
  PAGER_MAX_TO_RENDER_PER_BATCH,
  PAGER_WINDOW_SIZE,
  RESIZE_GESTURE_HIT_SLOP,
  RESIZE_HANDLE_HIT_HEIGHT,
  SNAP_MINUTES,
  TIME_GUTTER_WIDTH,
} from './agenda.constants';
import agendaClassNames, { agendaStyleSheet } from './agenda.styles';
import {
  addPagesToDate,
  buildEventDayKeySet,
  buildHourLabels,
  clampNumber,
  formatMinutesOfDay,
  getDateForPageIndex,
  getEventDurationMinutes,
  getMinutesFromMidnight,
  getPageIndexForDate,
  getVisibleWeeks,
  getWeekIndexInMonth,
  getWeeksInMonth,
  instantDropAnimation,
  snapDeltaMinutes,
} from './agenda.utils';
import {
  AgendaCalendarInternalProvider,
  AgendaDayColumnProvider,
  AgendaEventProvider,
  AgendaInternalProvider,
  AgendaPageInternalProvider,
  AgendaPageProvider,
  AgendaProvider,
  AgendaTimeGridInternalProvider,
  useAgenda,
  useAgendaCalendarInternal,
  useAgendaContext,
  useAgendaDayColumn,
  useAgendaEvent,
  useAgendaEventOptional,
  useAgendaHeaderCollapse,
  useAgendaInternal,
  useAgendaPage,
  useAgendaPageInternal,
  useAgendaTimeGridInternal,
  useDeferredEventsLayer,
} from './use-agenda';
const { DateFormatter, fromDate, isSameDay, isSameMonth, today, toCalendarDate } =
  InternationalizedDatePackage ?? {};
const DndDraggable = ReactNativeReanimatedDndPackage?.Draggable;
const DndDropProvider = ReactNativeReanimatedDndPackage?.DropProvider;
/**
 * Spring used when event chips reorganize around a moved/resized chip. The
 * chip's position/width are driven entirely on the UI thread (see
 * `AgendaEventCard`); a `LinearTransition` layout prop on the same node would
 * re-intercept every animated `top`/`start` change and fight the manual
 * animation frame by frame, which visibly breaks on Android. This spring
 * replicates the physics of the layout transition it replaced.
 */
const EVENT_POSITION_SPRING = {
  mass: 3,
  stiffness: 1000,
  damping: 90,
};
// ==================================================
// Background
// ==================================================
/**
 * Generic absolute-fill background container rendered behind the agenda
 * shell. With no `children`, the active library theme decides the default
 * content: `glass` renders a `GlassView` blur layer; other themes render
 * nothing. Pass `children` to host arbitrary content (gradients, images)
 * with the container's positioning and clipping applied.
 */
const AgendaBackground = forwardRef(({ className, ...props }, ref) => {
  const backgroundClassName = agendaClassNames.background({
    className,
  });
  return (
    <ThemeBackground
      ref={ref}
      className={backgroundClassName}
      fallbackColor="surface-secondary"
      {...props}
    />
  );
});
// ==================================================
// Root
// ==================================================
const AgendaRoot = forwardRef((props, ref) => {
  const {
    children,
    className,
    // useAgendaContext() state — resolved values, helpers, actions, and callbacks.
    view,
    date,
    events,
    selectedEventId,
    startHour,
    endHour,
    slotDuration,
    slotHeight,
    locale,
    timeZone,
    firstDayOfWeek,
    heading,
    visibleDays,
    visibleWeeks,
    setView,
    setDate,
    selectEvent,
    goToNext,
    goToPrevious,
    goToToday,
    getEventsForDay,
    getEventLayout,
    getAllEventsForDay,
    getAllDayLayoutForDays,
    getMonthRowLayout,
    getPerCellEvents,
    onEventDelete,
    onEventMove,
    onEventResize,
    onEventPress,
    // SplitView passthrough + root visuals.
    snapPoints,
    minHeight,
    maxHeight,
    defaultSnapIndex = 0,
    snapIndex,
    onSnapIndexChange,
    onSnap,
    skipInitialAnimation = true,
    animation,
    background,
    style,
    ...restProps
  } = props;
  const contextValue = useMemo(
    () => ({
      view,
      date,
      events,
      selectedEventId,
      startHour,
      endHour,
      slotDuration,
      slotHeight,
      locale,
      timeZone,
      firstDayOfWeek,
      heading,
      visibleDays,
      visibleWeeks,
      setView,
      setDate,
      selectEvent,
      goToNext,
      goToPrevious,
      goToToday,
      getEventsForDay,
      getEventLayout,
      getAllEventsForDay,
      getAllDayLayoutForDays,
      getMonthRowLayout,
      getPerCellEvents,
      onEventDelete,
    }),
    [
      view,
      date,
      events,
      selectedEventId,
      startHour,
      endHour,
      slotDuration,
      slotHeight,
      locale,
      timeZone,
      firstDayOfWeek,
      heading,
      visibleDays,
      visibleWeeks,
      setView,
      setDate,
      selectEvent,
      goToNext,
      goToPrevious,
      goToToday,
      getEventsForDay,
      getEventLayout,
      getAllEventsForDay,
      getAllDayLayoutForDays,
      getMonthRowLayout,
      getPerCellEvents,
      onEventDelete,
    ]
  );
  const [collapsedTopHeight, setCollapsedTopHeight] = useState(null);
  const [topContentHeight, setTopContentHeight] = useState(null);
  const reportCollapsedTopHeight = useCallback((height) => {
    setCollapsedTopHeight(height !== null && height > 0 ? height : null);
  }, []);
  const reportTopContentHeight = useCallback((height) => {
    setTopContentHeight(height !== null && height > 0 ? height : null);
  }, []);
  const internalContextValue = useMemo(
    () => ({
      pxPerMinute: slotHeight / slotDuration,
      onEventMove,
      onEventResize,
      onEventPress,
      reportCollapsedTopHeight,
      reportTopContentHeight,
    }),
    [
      slotHeight,
      slotDuration,
      onEventMove,
      onEventResize,
      onEventPress,
      reportCollapsedTopHeight,
      reportTopContentHeight,
    ]
  );
  const collapsedPx = collapsedTopHeight ?? ESTIMATED_COLLAPSED_TOP_HEIGHT;
  const expandedPx = Math.max(topContentHeight ?? ESTIMATED_EXPANDED_TOP_HEIGHT, collapsedPx + 80);
  const resolvedSnapPoints = useMemo(
    () => snapPoints ?? [collapsedPx, expandedPx],
    [snapPoints, collapsedPx, expandedPx]
  );
  const rootClassName = agendaClassNames.root({
    className,
  });
  const hasDefaultThemeBackground = useHasDefaultThemeBackground();
  /**
   * Background layer rendered behind the agenda shell.
   * - `undefined`: theme-aware default when the active theme registers
   *   default background content (e.g. a glass blur layer)
   * - custom node: replaces the default layer
   * - `null`: removes the layer
   *
   * The header pane and body keep only their translucent surface tints —
   * they composite over this root layer, which avoids stacking multiple
   * native blur views.
   */
  const backgroundElement =
    background !== undefined ? background : hasDefaultThemeBackground ? <AgendaBackground /> : null;
  return (
    <AgendaProvider value={contextValue}>
      <AgendaInternalProvider value={internalContextValue}>
        <SplitView
          ref={ref}
          className={rootClassName}
          snapPoints={resolvedSnapPoints}
          minHeight={minHeight ?? collapsedPx}
          maxHeight={maxHeight ?? expandedPx}
          defaultSnapIndex={defaultSnapIndex}
          snapIndex={snapIndex}
          onSnapIndexChange={onSnapIndexChange}
          onSnap={onSnap}
          skipInitialAnimation={skipInitialAnimation}
          animation={animation}
          style={style}
          {...restProps}
        >
          {backgroundElement}
          {children ?? (
            <>
              <AgendaHeader>
                <AgendaCalendar />
              </AgendaHeader>
              <AgendaDragArea>
                <AgendaDragHandle />
              </AgendaDragArea>
              <AgendaBody />
              <AgendaViewSelector />
            </>
          )}
        </SplitView>
      </AgendaInternalProvider>
    </AgendaProvider>
  );
});
// ==================================================
// Header (top SplitView pane)
// ==================================================
const AgendaHeader = forwardRef((props, ref) => {
  const { children, className, style, ...restProps } = props;
  const { reportTopContentHeight } = useAgendaInternal();
  const { pane, content } = agendaClassNames.header();
  const paneClassName = pane();
  const contentClassName = content({
    className,
  });
  const handleContentLayout = useCallback(
    (event) => {
      reportTopContentHeight(event.nativeEvent.layout.height);
    },
    [reportTopContentHeight]
  );
  useEffect(() => {
    return () => {
      reportTopContentHeight(null);
    };
  }, [reportTopContentHeight]);
  return (
    <SplitView.TopSection
      ref={ref}
      className={paneClassName}
      style={[agendaStyleSheet.borderCurve, style]}
      {...restProps}
    >
      <View className={contentClassName} onLayout={handleContentLayout}>
        {children}
      </View>
    </SplitView.TopSection>
  );
});
// ==================================================
// Calendar (collapsible month calendar)
// ==================================================
/**
 * Invisible bridge rendered inside the Calendar subtree: keeps the calendar's focused
 * month in sync with the agenda date (page swipes, `goToToday`, ...) and reports the
 * week geometry used by the collapse animation.
 */
function AgendaCalendarBridge(props) {
  const { onWeekMetrics } = props;
  const state = useCalendarStateContext();
  const { date, locale, firstDayOfWeek } = useAgendaContext();
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const calendarState = stateRef.current;
    if (!isSameDay(calendarState.focusedDate, date)) {
      calendarState.setFocusedDate(date);
    }
  }, [date]);
  const visibleMonthStart = state.visibleRange.start;
  useEffect(() => {
    const weeksInMonth = getWeeksInMonth(visibleMonthStart, locale, firstDayOfWeek);
    const weekIndex = isSameMonth(visibleMonthStart, date)
      ? Math.min(
          getWeekIndexInMonth(date, visibleMonthStart, locale, firstDayOfWeek),
          Math.max(0, weeksInMonth - 1)
        )
      : 0;
    onWeekMetrics({
      weekIndex,
      weeksInMonth,
    });
  }, [visibleMonthStart, date, locale, firstDayOfWeek, onWeekMetrics]);
  return null;
}
// --------------------------------------------------
const AgendaCalendar = forwardRef((props, ref) => {
  const { children, className, onLayout, ...restProps } = props;
  const agenda = useAgendaContext();
  const { reportCollapsedTopHeight } = useAgendaInternal();
  const splitViewCtx = useSplitView();
  const [selfY, setSelfY] = useState(0);
  const [selfHeight, setSelfHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [gridHeaderHeight, setGridHeaderHeight] = useState(0);
  const [gridBodyHeight, setGridBodyHeight] = useState(0);
  const [weekMetrics, setWeekMetrics] = useState({
    weekIndex: 0,
    weeksInMonth: 5,
  });
  const eventDayKeys = useMemo(() => buildEventDayKeySet(agenda.events), [agenda.events]);
  const weekRowHeight =
    weekMetrics.weeksInMonth > 0 ? gridBodyHeight / weekMetrics.weeksInMonth : 0;
  const collapsedHeight =
    selfY + headerHeight + gridHeaderHeight + weekRowHeight + COLLAPSED_BOTTOM_PADDING;
  const isMeasured = headerHeight > 0 && gridHeaderHeight > 0 && weekRowHeight > 0;
  useEffect(() => {
    reportCollapsedTopHeight(isMeasured ? collapsedHeight : null);
    return () => {
      reportCollapsedTopHeight(null);
    };
  }, [reportCollapsedTopHeight, isMeasured, collapsedHeight]);
  const { rGridBodyStyle } = useAgendaCalendarCollapseAnimation({
    topSectionHeight: splitViewCtx.topSectionHeight,
    collapsedHeight,
    expandedHeight: selfY + selfHeight,
    weekIndex: weekMetrics.weekIndex,
    weekRowHeight,
  });
  const handleSelfLayout = useCallback(
    (event) => {
      setSelfY(event.nativeEvent.layout.y);
      setSelfHeight(event.nativeEvent.layout.height);
      onLayout?.(event);
    },
    [onLayout]
  );
  const collapseHeader = useAgendaHeaderCollapse();
  // Picking a date collapses the SplitView back to the week row (Google Calendar
  // style); the date change renders as a transition to keep the snap smooth.
  const handleCalendarChange = useCallback(
    (value) => {
      collapseHeader(() => {
        agenda.setDate(toCalendarDate(value));
      });
    },
    [agenda, collapseHeader]
  );
  const splitViewCtxRef = useRef(splitViewCtx);
  splitViewCtxRef.current = splitViewCtx;
  // The year picker overlays the month grid, so opening it from the collapsed week
  // row expands the SplitView to the top snap point first.
  const handleYearPickerOpenChange = useCallback((isOpen) => {
    if (!isOpen) {
      return;
    }
    const ctx = splitViewCtxRef.current;
    const expandedIndex = ctx.resolvedSnapPoints.length - 1;
    if (ctx.snapIndex !== expandedIndex) {
      ctx.snapTo(expandedIndex);
    }
  }, []);
  const calendarInternalValue = useMemo(
    () => ({
      reportHeaderHeight: setHeaderHeight,
      reportGridHeaderHeight: setGridHeaderHeight,
      reportGridBodyHeight: setGridBodyHeight,
      rGridBodyStyle,
      eventDayKeys,
    }),
    [rGridBodyStyle, eventDayKeys]
  );
  const { container } = agendaClassNames.calendar();
  const containerClassName = container({
    className,
  });
  return (
    <View ref={ref} className={containerClassName} onLayout={handleSelfLayout} {...restProps}>
      <Calendar
        value={agenda.date}
        onChange={handleCalendarChange}
        locale={agenda.locale}
        firstDayOfWeek={agenda.firstDayOfWeek}
        onYearPickerOpenChange={handleYearPickerOpenChange}
      >
        <AgendaCalendarInternalProvider value={calendarInternalValue}>
          {children ?? (
            <>
              <AgendaCalendarHeader />
              <AgendaCalendarGrid />
              <Calendar.YearPickerGrid>
                <Calendar.YearPickerGridBody>
                  {({ year, isSelected }) => (
                    <Calendar.YearPickerCell year={year} isSelected={isSelected} />
                  )}
                </Calendar.YearPickerGridBody>
              </Calendar.YearPickerGrid>
            </>
          )}
        </AgendaCalendarInternalProvider>
        <AgendaCalendarBridge onWeekMetrics={setWeekMetrics} />
      </Calendar>
    </View>
  );
});
// --------------------------------------------------
const AgendaCalendarHeader = forwardRef((props, ref) => {
  const { children, className, onLayout, ...restProps } = props;
  const { reportHeaderHeight } = useAgendaCalendarInternal();
  const headerClassName = agendaClassNames.calendarHeader({
    className,
  });
  const handleLayout = useCallback(
    (event) => {
      reportHeaderHeight(event.nativeEvent.layout.height);
      onLayout?.(event);
    },
    [reportHeaderHeight, onLayout]
  );
  return (
    <View ref={ref} className={headerClassName} onLayout={handleLayout} {...restProps}>
      <Calendar.Header>
        {children ?? (
          <>
            <Calendar.YearPickerTrigger>
              <Calendar.YearPickerTriggerHeading />
              <Calendar.YearPickerTriggerIndicator />
            </Calendar.YearPickerTrigger>
            <View className="flex-row items-center gap-0.5">
              <Calendar.NavButton slot="previous" />
              <AgendaTodayButton />
              <Calendar.NavButton slot="next" />
            </View>
          </>
        )}
      </Calendar.Header>
    </View>
  );
});
// --------------------------------------------------
/**
 * Module-level default cell renderer factory: cells show an indicator on days covered
 * by at least one event. The cell `key` encodes the indicator state because memoized
 * calendar cells skip render-prop comparison — a coverage change remounts only the
 * affected day cell.
 */
function renderAgendaCalendarCell(cellDate, eventDayKeys) {
  const hasEvents = eventDayKeys.has(cellDate.toString());
  return (
    <Calendar.Cell key={hasEvents ? 'with-events' : 'no-events'} date={cellDate}>
      {(renderProps) => (
        <Calendar.CellBody cellRenderProps={renderProps}>
          <Calendar.CellLabel cellRenderProps={renderProps}>
            {renderProps.formattedDate}
          </Calendar.CellLabel>
          {hasEvents ? <Calendar.CellIndicator cellRenderProps={renderProps} /> : null}
        </Calendar.CellBody>
      )}
    </Calendar.Cell>
  );
}
const AgendaCalendarGrid = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const { reportGridHeaderHeight, reportGridBodyHeight, rGridBodyStyle, eventDayKeys } =
    useAgendaCalendarInternal();
  const handleGridHeaderLayout = useCallback(
    (event) => {
      reportGridHeaderHeight(event.nativeEvent.layout.height);
    },
    [reportGridHeaderHeight]
  );
  const handleGridBodyLayout = useCallback(
    (event) => {
      reportGridBodyHeight(event.nativeEvent.layout.height);
    },
    [reportGridBodyHeight]
  );
  const renderCell = useMemo(() => {
    if (children !== undefined) {
      return children;
    }
    return (cellDate) => renderAgendaCalendarCell(cellDate, eventDayKeys);
  }, [children, eventDayKeys]);
  const { gridClip } = agendaClassNames.calendar();
  const gridClipClassName = gridClip();
  return (
    <Calendar.Grid ref={ref} className={className} {...restProps}>
      <Calendar.GridHeader onLayout={handleGridHeaderLayout}>
        {(day) => <Calendar.HeaderCell day={day} />}
      </Calendar.GridHeader>
      <View className={gridClipClassName}>
        <Animated.View style={rGridBodyStyle}>
          <Calendar.GridBody onLayout={handleGridBodyLayout}>{renderCell}</Calendar.GridBody>
        </Animated.View>
      </View>
    </Calendar.Grid>
  );
});
// ==================================================
// Header building blocks
// ==================================================
const AgendaHeading = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const { heading } = useAgendaContext();
  const headingClassName = agendaClassNames.heading({
    className,
  });
  return (
    <HeroText ref={ref} className={headingClassName} {...restProps}>
      {children ?? heading}
    </HeroText>
  );
});
// --------------------------------------------------
const AgendaTodayButton = (props) => {
  const { children, className } = props;
  const { goToToday } = useAgendaContext();
  const collapseHeader = useAgendaHeaderCollapse();
  const handlePress = useCallback(() => {
    collapseHeader(() => {
      goToToday();
    });
  }, [collapseHeader, goToToday]);
  const { container, label } = agendaClassNames.todayButton();
  return (
    <Button
      size="sm"
      variant="outline"
      className={container({
        className,
      })}
      accessibilityLabel="Go to today"
      onPress={handlePress}
    >
      {children ?? <Button.Label className={label()}>Today</Button.Label>}
    </Button>
  );
};
// --------------------------------------------------
const AgendaNavButton = forwardRef((props, ref) => {
  const { slot, children, className, onPress, ...restProps } = props;
  const { goToNext, goToPrevious } = useAgendaContext();
  const collapseHeader = useAgendaHeaderCollapse();
  const themeAccent = useThemeColor('accent-soft-foreground');
  const isRTL = useIsRTL();
  const isPrevious = slot === 'previous';
  const handlePress = useCallback(
    (event) => {
      collapseHeader(() => {
        if (isPrevious) {
          goToPrevious();
        } else {
          goToNext();
        }
      });
      onPress?.(event);
    },
    [collapseHeader, isPrevious, goToPrevious, goToNext, onPress]
  );
  const navButtonClassName = agendaClassNames.navButton({
    className,
  });
  // "Previous" points toward the past side of the reading direction — left
  // in LTR, right in RTL (matches `Calendar.NavButton`). The icon components
  // draw fixed physical glyphs, so the pair is swapped instead of
  // scale-flipping each icon.
  const pointsLeft = isPrevious !== isRTL;
  const defaultIcon = pointsLeft ? (
    <ChevronLeftIcon color={themeAccent} size={NAV_ICON_SIZE} />
  ) : (
    <ChevronRightIcon color={themeAccent} size={NAV_ICON_SIZE} />
  );
  return (
    <Pressable
      ref={ref}
      className={navButtonClassName}
      accessibilityRole="button"
      accessibilityLabel={isPrevious ? 'Previous' : 'Next'}
      onPress={handlePress}
      {...restProps}
    >
      {children ?? defaultIcon}
    </Pressable>
  );
});
// ==================================================
// Drag area (SplitView passthrough)
// ==================================================
const AgendaDragArea = forwardRef((props, ref) => {
  return <SplitView.DragArea ref={ref} {...props} />;
});
// --------------------------------------------------
const AgendaDragHandle = forwardRef((props, ref) => {
  return <SplitView.DragHandle ref={ref} {...props} />;
});
// ==================================================
// Body (horizontal pager)
// ==================================================
const AgendaBody = forwardRef((props, ref) => {
  const {
    children,
    className,
    showBottomFade = true,
    bottomFadeColor,
    bottomFadeHeight,
    style,
    ...restProps
  } = props;
  const agenda = useAgendaContext();
  const { view, date, locale, firstDayOfWeek, startHour, slotHeight, slotDuration, setDate } =
    agenda;
  const [pageWidth, setPageWidth] = useState(0);
  /**
   * The pager mirrors in RTL by inverting the physical index ↔ date mapping
   * (see `toDirectedPageIndex`) while the FlatList itself stays pinned to a
   * physical left-to-right content flow: `getItemLayout`, `scrollToIndex`,
   * and the viewability math all work in physical offsets, so letting Yoga
   * flip the row would silently break them.
   */
  const isRTL = useIsRTL();
  const dateRef = useRef(date);
  dateRef.current = date;
  const viewRef = useRef(view);
  viewRef.current = view;
  const isRTLRef = useRef(isRTL);
  isRTLRef.current = isRTL;
  const [pager, setPager] = useState(() => ({
    view,
    anchor: date,
    key: 0,
  }));
  const listRef = useRef(null);
  const currentIndexRef = useRef(PAGE_WINDOW);
  const pendingIndexRef = useRef(null);
  const activePageIndex = useSharedValue(PAGE_WINDOW);
  const initialScrollOffsetMinutes = useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return Math.max(0, nowMinutes - startHour * 60 - INITIAL_SCROLL_LEAD_MINUTES);
  }, [startHour]);
  const scrollY = useSharedValue((initialScrollOffsetMinutes * slotHeight) / slotDuration);
  // Remount the pager with a fresh anchor whenever the view mode changes.
  useEffect(() => {
    setPager((prev) => {
      if (prev.view === view) {
        return prev;
      }
      currentIndexRef.current = PAGE_WINDOW;
      pendingIndexRef.current = null;
      activePageIndex.set(PAGE_WINDOW);
      return {
        view,
        anchor: dateRef.current,
        key: prev.key + 1,
      };
    });
  }, [view, activePageIndex]);
  // Keep the pager position in sync with external date changes (calendar taps,
  // goToToday, controlled updates). Swipe-driven commits are suppressed because
  // the committed index already matches `currentIndexRef`.
  useEffect(() => {
    if (pager.view !== view) {
      return;
    }
    // `getPageIndexForDate` returns the left-to-right index; mirror it so
    // later dates sit to the physical left of the anchor in RTL.
    const ltrTarget = getPageIndexForDate(pager.view, pager.anchor, date, locale, firstDayOfWeek);
    const target = isRTL ? PAGE_COUNT - 1 - ltrTarget : ltrTarget;
    if (target < 0 || target >= PAGE_COUNT) {
      currentIndexRef.current = PAGE_WINDOW;
      pendingIndexRef.current = null;
      activePageIndex.set(PAGE_WINDOW);
      setPager((prev) => ({
        view: prev.view,
        anchor: date,
        key: prev.key + 1,
      }));
      return;
    }
    if (target !== currentIndexRef.current) {
      // Before the first layout the list is not mounted and cannot scroll, so a
      // pending index would never be confirmed by a viewability event and every
      // later swipe commit would stay suppressed. Re-anchor to the new date
      // instead: the list mounts directly on the correct page.
      if (listRef.current === null) {
        currentIndexRef.current = PAGE_WINDOW;
        pendingIndexRef.current = null;
        activePageIndex.set(PAGE_WINDOW);
        setPager((prev) => ({
          view: prev.view,
          anchor: date,
          key: prev.key + 1,
        }));
        return;
      }
      const animated = Math.abs(target - currentIndexRef.current) === 1;
      pendingIndexRef.current = target;
      currentIndexRef.current = target;
      activePageIndex.set(target);
      listRef.current.scrollToIndex({
        index: target,
        animated,
      });
    }
  }, [date, pager, view, locale, firstDayOfWeek, activePageIndex, isRTL]);
  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig: {
        itemVisiblePercentThreshold: PAGE_VIEWABILITY_THRESHOLD,
      },
      onViewableItemsChanged: ({ viewableItems }) => {
        const viewable = viewableItems.find((item) => item.isViewable && item.index !== null);
        if (viewable === undefined || viewable.index === null) {
          return;
        }
        const index = viewable.index;
        if (pendingIndexRef.current !== null) {
          if (index === pendingIndexRef.current) {
            pendingIndexRef.current = null;
          }
          return;
        }
        if (index !== currentIndexRef.current) {
          const physicalDelta = index - currentIndexRef.current;
          // Physical page deltas convert to date deltas with a direction
          // sign: in RTL, later pages sit to the physical left. Read from a
          // ref because the viewability pairs are created once and FlatList
          // requires them to stay stable.
          const delta = isRTLRef.current ? -physicalDelta : physicalDelta;
          currentIndexRef.current = index;
          activePageIndex.set(index);
          setDate(addPagesToDate(viewRef.current, dateRef.current, delta));
        }
      },
    },
  ]);
  const handleBodyLayout = useCallback((event) => {
    setPageWidth(event.nativeEvent.layout.width);
  }, []);
  const surfaceColor = useThemeColor('surface');
  const resolvedBottomFadeColor = bottomFadeColor ?? surfaceColor;
  const bottomGradientStyle = useMemo(
    () => ({
      experimental_backgroundImage: `linear-gradient(to top, ${resolvedBottomFadeColor}, transparent)`,
    }),
    [resolvedBottomFadeColor]
  );
  const getItemLayout = useCallback(
    (_data, index) => ({
      length: pageWidth,
      offset: pageWidth * index,
      index,
    }),
    [pageWidth]
  );
  const keyExtractor = useCallback((item) => String(item), []);
  const renderItem = useCallback(
    ({ item }) => (
      <AgendaPage
        pageIndex={item}
        pager={pager}
        pageWidth={pageWidth}
        scrollY={scrollY}
        activePageIndex={activePageIndex}
        initialScrollOffsetMinutes={initialScrollOffsetMinutes}
      >
        {children}
      </AgendaPage>
    ),
    [pager, pageWidth, scrollY, activePageIndex, initialScrollOffsetMinutes, children]
  );
  const { container, fade } = agendaClassNames.body();
  const bodyClassName = container({
    className,
  });
  const list =
    pageWidth > 0 ? (
      <FlatList
        key={`${pager.view}-${String(pager.key)}`}
        ref={listRef}
        data={PAGE_INDICES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={PAGE_WINDOW}
        style={agendaStyleSheet.pagerList}
        contentContainerStyle={agendaStyleSheet.pagerContent}
        getItemLayout={getItemLayout}
        windowSize={PAGER_WINDOW_SIZE}
        maxToRenderPerBatch={PAGER_MAX_TO_RENDER_PER_BATCH}
        initialNumToRender={PAGER_INITIAL_NUM_TO_RENDER}
        removeClippedSubviews
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
      />
    ) : null;
  return (
    <SplitView.BottomSection>
      <View
        ref={ref}
        className={bodyClassName}
        style={[agendaStyleSheet.borderCurve, style]}
        {...restProps}
      >
        <View style={agendaStyleSheet.pagerViewport} onLayout={handleBodyLayout}>
          {DndDropProvider !== undefined ? <DndDropProvider>{list}</DndDropProvider> : list}
        </View>
        {showBottomFade ? (
          <View
            pointerEvents="none"
            className={fade()}
            style={[
              bottomGradientStyle,
              bottomFadeHeight !== undefined && {
                height: bottomFadeHeight,
              },
            ]}
          />
        ) : null}
      </View>
    </SplitView.BottomSection>
  );
});
// --------------------------------------------------
/**
 * One pager page: computes the page's date range and provides the page contexts.
 * `children` is the consumer's page template; the default template renders every
 * self-gating part, covering all views.
 */
const AgendaPage = memo(function AgendaPage(props) {
  const {
    pageIndex,
    pager,
    pageWidth,
    scrollY,
    activePageIndex,
    initialScrollOffsetMinutes,
    children,
  } = props;
  const { locale, firstDayOfWeek } = useAgendaContext();
  const isRTL = useIsRTL();
  const isMonthPage = pager.view === 'month';
  // The pager row is pinned to physical LTR (see `AgendaBody`), so in RTL a
  // page's date is derived from the mirrored index: later dates sit to the
  // physical left of the anchor.
  const pageDate = useMemo(
    () =>
      getDateForPageIndex(
        pager.view,
        pager.anchor,
        isRTL ? PAGE_COUNT - 1 - pageIndex : pageIndex,
        locale,
        firstDayOfWeek
      ),
    [pager, pageIndex, locale, firstDayOfWeek, isRTL]
  );
  const days = useMemo(() => {
    if (isMonthPage) {
      return [];
    }
    if (pager.view === 'day') {
      return [pageDate];
    }
    const result = [];
    for (let i = 0; i < 7; i++) {
      result.push(
        pageDate.add({
          days: i,
        })
      );
    }
    return result;
  }, [isMonthPage, pager.view, pageDate]);
  const weeks = useMemo(
    () => (isMonthPage ? getVisibleWeeks(pageDate, locale, firstDayOfWeek) : []),
    [isMonthPage, pageDate, locale, firstDayOfWeek]
  );
  const isEventsLayerReady = useDeferredEventsLayer();
  const dayColumnWidth = days.length > 0 ? (pageWidth - TIME_GUTTER_WIDTH) / days.length : 0;
  const pageValue = useMemo(
    () => ({
      date: pageDate,
      days,
      weeks,
      isMonthPage,
    }),
    [pageDate, days, weeks, isMonthPage]
  );
  const pageInternalValue = useMemo(
    () => ({
      pageIndex,
      pageWidth,
      dayColumnWidth,
      scrollY,
      activePageIndex,
      initialScrollOffsetMinutes,
      isEventsLayerReady,
    }),
    [
      pageIndex,
      pageWidth,
      dayColumnWidth,
      scrollY,
      activePageIndex,
      initialScrollOffsetMinutes,
      isEventsLayerReady,
    ]
  );
  const pageClassName = agendaClassNames.page();
  return (
    <AgendaPageProvider value={pageValue}>
      <AgendaPageInternalProvider value={pageInternalValue}>
        <View
          className={pageClassName}
          style={[
            {
              width: pageWidth,
            },
            // Restore the app layout direction inside the LTR-pinned pager
            // content so the page's own layout (gutter, columns) mirrors.
            isRTL ? agendaStyleSheet.pageDirectionRTL : agendaStyleSheet.pageDirectionLTR,
          ]}
        >
          {children ?? (
            <>
              <AgendaWeekHeader />
              <AgendaAllDaySection />
              <AgendaTimeGrid />
              <AgendaMonthGrid />
            </>
          )}
        </View>
      </AgendaPageInternalProvider>
    </AgendaPageProvider>
  );
});
// ==================================================
// Week header (day/week pages)
// ==================================================
const AgendaWeekHeader = forwardRef((props, ref) => {
  const {
    showDates = false,
    className,
    classNames,
    styles: stylesProp,
    style,
    ...restProps
  } = props;
  const { date, timeZone, locale, setDate } = useAgendaContext();
  const { days, isMonthPage } = useAgendaPage();
  // Intentionally not memoized: recomputing on every render keeps the
  // `data-today` highlight correct after a midnight rollover.
  const localToday = today(timeZone);
  const weekdayFormatter = useMemo(
    () =>
      new DateFormatter(locale, {
        weekday: showDates ? 'short' : 'narrow',
      }),
    [locale, showDates]
  );
  const { container, cell, day: daySlot, date: dateSlot } = agendaClassNames.weekHeader();
  if (isMonthPage || days.length <= 1) {
    return null;
  }
  return (
    <View
      ref={ref}
      className={container({
        className: [className, classNames?.container],
      })}
      style={[
        {
          paddingStart: TIME_GUTTER_WIDTH,
        },
        stylesProp?.container,
        style,
      ]}
      {...restProps}
    >
      {days.map((day) => {
        const isDayToday = isSameDay(day, localToday);
        const isDaySelected = isSameDay(day, date);
        const weekdayLabel = weekdayFormatter.format(day.toDate(timeZone));
        if (!showDates) {
          return (
            <View
              key={day.toString()}
              className={cell({
                className: classNames?.cell,
              })}
              style={stylesProp?.cell}
            >
              <HeroText
                className={daySlot({
                  className: classNames?.day,
                })}
                style={stylesProp?.day}
                data-today={isDayToday}
              >
                {weekdayLabel}
              </HeroText>
            </View>
          );
        }
        return (
          <Pressable
            key={day.toString()}
            className={cell({
              className: classNames?.cell,
            })}
            style={stylesProp?.cell}
            accessibilityRole="button"
            accessibilityLabel={`Select ${day.toString()}`}
            onPress={() => setDate(day)}
          >
            <HeroText
              className={daySlot({
                className: classNames?.day,
              })}
              style={stylesProp?.day}
              data-today={isDayToday}
            >
              {weekdayLabel}
            </HeroText>
            <HeroText
              className={dateSlot({
                className: classNames?.date,
              })}
              style={stylesProp?.date}
              data-today={isDayToday}
              data-selected={isDaySelected && !isDayToday}
            >
              {String(day.day)}
            </HeroText>
          </Pressable>
        );
      })}
    </View>
  );
});
// ==================================================
// All-day section (day/week pages)
// ==================================================
/**
 * Default all-day bar content: color tint + title.
 */
function AgendaAllDayEventDefaultContent(props) {
  const { classNames, styles: stylesProp } = props;
  const event = useAgendaEvent();
  const { eventTitle, tint } = agendaClassNames.allDaySection();
  return (
    <>
      {event.color !== undefined ? (
        <View
          pointerEvents="none"
          className={tint({
            className: classNames?.tint,
          })}
          style={{
            backgroundColor: event.color,
            opacity: EVENT_COLOR_TINT_OPACITY,
          }}
        />
      ) : null}
      <HeroText
        className={eventTitle({
          className: classNames?.eventTitle,
        })}
        style={stylesProp?.eventTitle}
        numberOfLines={1}
      >
        {event.title}
      </HeroText>
    </>
  );
}
const AgendaAllDaySection = forwardRef((props, ref) => {
  const { children, className, classNames, styles: stylesProp, style, ...restProps } = props;
  const { getAllDayLayoutForDays, selectedEventId, selectEvent } = useAgendaContext();
  const { onEventPress } = useAgendaInternal();
  const { days, isMonthPage } = useAgendaPage();
  const { dayColumnWidth } = useAgendaPageInternal();
  const layout = useMemo(
    () => (isMonthPage ? [] : getAllDayLayoutForDays(days)),
    [isMonthPage, getAllDayLayoutForDays, days]
  );
  const rowCount = layout.reduce((max, item) => Math.max(max, item.row + 1), 0);
  const handleEventPress = useCallback(
    (pressedEvent, isSelected) => {
      if (onEventPress !== undefined) {
        onEventPress(pressedEvent);
        return;
      }
      selectEvent(isSelected ? null : pressedEvent.id);
    },
    [onEventPress, selectEvent]
  );
  const { container, event: eventSlot } = agendaClassNames.allDaySection();
  // On day pages no week header renders above, so the section is the page's
  // first element and carries the page top padding itself.
  const topOffset = days.length === 1 ? ALL_DAY_STANDALONE_TOP_PADDING : 0;
  if (isMonthPage || layout.length === 0) {
    return null;
  }
  return (
    <View
      ref={ref}
      className={container({
        className: [className, classNames?.container],
      })}
      style={[
        {
          height: rowCount * ALL_DAY_ROW_HEIGHT + 6 + topOffset,
        },
        stylesProp?.container,
        style,
      ]}
      {...restProps}
    >
      {layout.map((item) => {
        const isSelected = selectedEventId === item.event.id;
        return (
          <Pressable
            key={item.event.id}
            className={eventSlot({
              className: classNames?.event,
            })}
            accessibilityRole="button"
            accessibilityLabel={item.event.title}
            style={[
              agendaStyleSheet.borderCurve,
              {
                // `start` (not `left`) so the bar anchors to the leading
                // edge: day columns flow right-to-left in RTL.
                start: TIME_GUTTER_WIDTH + item.colStart * dayColumnWidth,
                width: item.colSpan * dayColumnWidth - 4,
                top: topOffset + item.row * ALL_DAY_ROW_HEIGHT,
                height: ALL_DAY_ROW_HEIGHT - 4,
              },
              stylesProp?.event,
            ]}
            onPress={() => handleEventPress(item.event, isSelected)}
          >
            <AgendaEventProvider value={item.event}>
              {children ?? (
                <AgendaAllDayEventDefaultContent classNames={classNames} styles={stylesProp} />
              )}
            </AgendaEventProvider>
          </Pressable>
        );
      })}
    </View>
  );
});
// ==================================================
// Time grid (day/week pages)
// ==================================================
/**
 * Dashed lines with time-rail labels marking the snapped start / end of the dragged
 * or resized event, so the drop time is visible while moving a block. Slot classes
 * and styles come precomputed from the owning `Agenda.TimeGrid`.
 */
const AgendaDragGuides = memo(function AgendaDragGuides(props) {
  const { guides, labels, classNames, styles: stylesProp } = props;
  const { rGuideStyle: rStartGuideStyle } = useAgendaDragGuideAnimation({
    isActive: guides.startActive,
    positionY: guides.startY,
  });
  const { rGuideStyle: rEndGuideStyle } = useAgendaDragGuideAnimation({
    isActive: guides.endActive,
    positionY: guides.endY,
  });
  const renderGuide = (rStyle, labelText) => (
    <Animated.View
      pointerEvents="none"
      className={classNames.container}
      style={[rStyle, stylesProp.container]}
    >
      <View
        className={classNames.line}
        style={[
          {
            marginStart: TIME_GUTTER_WIDTH,
          },
          stylesProp.line,
        ]}
      >
        <View className={classNames.lineDash} style={stylesProp.lineDash} />
      </View>
      {labelText !== undefined ? (
        <HeroText
          className={classNames.label}
          style={[
            {
              width: TIME_GUTTER_WIDTH - 8,
            },
            stylesProp.label,
          ]}
          numberOfLines={1}
        >
          {labelText}
        </HeroText>
      ) : null}
    </Animated.View>
  );
  return (
    <>
      {renderGuide(rStartGuideStyle, labels?.start)}
      {renderGuide(rEndGuideStyle, labels?.end)}
    </>
  );
});
// --------------------------------------------------
const AgendaTimeGrid = forwardRef((props, ref) => {
  const {
    children,
    className,
    classNames,
    styles: stylesProp,
    showTopFade = true,
    topFadeColor,
    topFadeHeight,
    style,
    ...restProps
  } = props;
  const { locale, startHour, endHour, slotHeight, slotDuration } = useAgendaContext();
  const { isMonthPage } = useAgendaPage();
  const { pageIndex, scrollY, activePageIndex, initialScrollOffsetMinutes } =
    useAgendaPageInternal();
  const pxPerMinute = slotHeight / slotDuration;
  const contentHeight = (endHour - startHour) * 60 * pxPerMinute;
  const hourFormatter = useMemo(
    () =>
      new DateFormatter(locale, {
        hour: 'numeric',
      }),
    [locale]
  );
  const hourLabels = useMemo(
    () => buildHourLabels(startHour, endHour, hourFormatter),
    [startHour, endHour, hourFormatter]
  );
  // Drop guides: positions live on the UI thread; labels are formatted on the JS
  // thread only when the snapped minute changes (a few times per second at most).
  const dragGuideStartActive = useSharedValue(false);
  const dragGuideEndActive = useSharedValue(false);
  const dragGuideStartY = useSharedValue(0);
  const dragGuideEndY = useSharedValue(0);
  const dragGuides = useMemo(
    () => ({
      startActive: dragGuideStartActive,
      endActive: dragGuideEndActive,
      startY: dragGuideStartY,
      endY: dragGuideEndY,
    }),
    [dragGuideStartActive, dragGuideEndActive, dragGuideStartY, dragGuideEndY]
  );
  const [dragGuideLabels, setDragGuideLabels] = useState(null);
  const guideTimeFormatter = useMemo(
    () =>
      new DateFormatter(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    [locale]
  );
  const handleDragGuideChange = useCallback(
    (minutes) => {
      if (minutes === null) {
        setDragGuideLabels(null);
        return;
      }
      setDragGuideLabels({
        start:
          minutes.start !== undefined
            ? formatMinutesOfDay(guideTimeFormatter, minutes.start)
            : undefined,
        end:
          minutes.end !== undefined
            ? formatMinutesOfDay(guideTimeFormatter, minutes.end)
            : undefined,
      });
    },
    [guideTimeFormatter]
  );
  const scrollRef = useAnimatedRef();
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      if (activePageIndex.get() === pageIndex) {
        scrollY.set(event.contentOffset.y);
      }
    },
  });
  // On month pages the grid renders null and the ref never attaches, so the
  // sync must not dispatch (Reanimated warns on uninitialized refs).
  useAnimatedReaction(
    () => scrollY.get(),
    (value) => {
      if (!isMonthPage && activePageIndex.get() !== pageIndex) {
        scrollTo(scrollRef, 0, value, false);
      }
    },
    [pageIndex, isMonthPage]
  );
  const timeGridInternalValue = useMemo(
    () => ({
      contentHeight,
      dragGuides,
      onDragGuideChange: handleDragGuideChange,
    }),
    [contentHeight, dragGuides, handleDragGuideChange]
  );
  const surfaceColor = useThemeColor('surface');
  const resolvedTopFadeColor = topFadeColor ?? surfaceColor;
  // Content scrolling under the grid's top edge fades out regardless of what sits
  // above (week header, all-day section, or nothing at all).
  const topFadeGradientStyle = useMemo(
    () => ({
      experimental_backgroundImage: `linear-gradient(to bottom, ${resolvedTopFadeColor}, transparent)`,
    }),
    [resolvedTopFadeColor]
  );
  const {
    container,
    scroll,
    content,
    gutterLabel,
    hourLine,
    topFade,
    dragGuide,
    dragGuideLine,
    dragGuideLineDash,
    dragGuideLabel,
  } = agendaClassNames.timeGrid();
  if (isMonthPage) {
    return null;
  }
  return (
    <View
      ref={ref}
      className={container({
        className: [className, classNames?.container],
      })}
      style={[stylesProp?.container, style]}
      {...restProps}
    >
      <Animated.ScrollView
        ref={scrollRef}
        className={scroll({
          className: classNames?.scroll,
        })}
        style={stylesProp?.scroll}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentOffset={{
          x: 0,
          y: initialScrollOffsetMinutes * pxPerMinute,
        }}
        contentContainerStyle={{
          paddingBottom: BODY_SCROLL_BOTTOM_PADDING,
        }}
      >
        <View
          className={content({
            className: classNames?.content,
          })}
          style={[
            {
              height: contentHeight,
            },
            stylesProp?.content,
          ]}
        >
          {hourLabels.map(({ hour, label }) => (
            <View key={String(hour)} pointerEvents="none">
              <View
                className={hourLine({
                  className: classNames?.hourLine,
                })}
                style={[
                  {
                    top: (hour - startHour) * 60 * pxPerMinute,
                    start: TIME_GUTTER_WIDTH,
                  },
                  stylesProp?.hourLine,
                ]}
              />
              <HeroText
                className={gutterLabel({
                  className: classNames?.gutterLabel,
                })}
                style={[
                  {
                    top: (hour - startHour) * 60 * pxPerMinute - 6,
                    width: TIME_GUTTER_WIDTH - 8,
                  },
                  stylesProp?.gutterLabel,
                ]}
                numberOfLines={1}
              >
                {label}
              </HeroText>
            </View>
          ))}
          <AgendaTimeGridInternalProvider value={timeGridInternalValue}>
            {children ?? (
              <>
                <AgendaDayColumns />
                <AgendaCurrentTimeIndicator />
              </>
            )}
          </AgendaTimeGridInternalProvider>
          <AgendaDragGuides
            guides={dragGuides}
            labels={dragGuideLabels}
            classNames={{
              container: dragGuide({
                className: classNames?.dragGuide,
              }),
              line: dragGuideLine({
                className: classNames?.dragGuideLine,
              }),
              lineDash: dragGuideLineDash({
                className: classNames?.dragGuideLineDash,
              }),
              label: dragGuideLabel({
                className: classNames?.dragGuideLabel,
              }),
            }}
            styles={{
              container: stylesProp?.dragGuide,
              line: stylesProp?.dragGuideLine,
              lineDash: stylesProp?.dragGuideLineDash,
              label: stylesProp?.dragGuideLabel,
            }}
          />
        </View>
      </Animated.ScrollView>
      {showTopFade ? (
        <View
          pointerEvents="none"
          className={topFade()}
          style={[
            topFadeGradientStyle,
            topFadeHeight !== undefined && {
              height: topFadeHeight,
            },
          ]}
        />
      ) : null}
    </View>
  );
});
// ==================================================
// Day columns + events (day/week pages)
// ==================================================
const AgendaDayColumns = forwardRef((props, ref) => {
  const { children, className, classNames, styles: stylesProp, style, ...restProps } = props;
  const { getEventsForDay } = useAgendaContext();
  const { days, isMonthPage } = useAgendaPage();
  const { isEventsLayerReady } = useAgendaPageInternal();
  const { contentHeight } = useAgendaTimeGridInternal();
  const { isAllAnimationsDisabled } = useAnimationSettings();
  // One fade layer per column, all mounting together: the whole events content
  // appears as a single fade, not per chip.
  const eventsLayerEntering = isAllAnimationsDisabled ? undefined : FadeIn.duration(150);
  const { container, column, eventsLayer } = agendaClassNames.dayColumns();
  if (isMonthPage || days.length === 0) {
    return null;
  }
  return (
    <View
      ref={ref}
      className={container({
        className: [className, classNames?.container],
      })}
      style={[
        {
          paddingStart: TIME_GUTTER_WIDTH,
        },
        stylesProp?.container,
        style,
      ]}
      {...restProps}
    >
      {days.map((day, dayIndex) => (
        <View
          key={day.toString()}
          className={column({
            className: classNames?.column,
          })}
          style={[
            {
              height: contentHeight,
            },
            stylesProp?.column,
          ]}
        >
          {isEventsLayerReady ? (
            <Animated.View
              entering={eventsLayerEntering}
              className={eventsLayer({
                className: classNames?.eventsLayer,
              })}
              style={stylesProp?.eventsLayer}
            >
              <AgendaDayColumnProvider
                value={{
                  day,
                  dayIndex,
                  daysCount: days.length,
                }}
              >
                {getEventsForDay(day).map((event) => (
                  <AgendaEventProvider key={event.id} value={event}>
                    {children ?? <AgendaEvent />}
                  </AgendaEventProvider>
                ))}
              </AgendaDayColumnProvider>
            </Animated.View>
          ) : null}
        </View>
      ))}
    </View>
  );
});
// --------------------------------------------------
const AgendaEventTitle = forwardRef((props, ref) => {
  const { children, className, ...restProps } = props;
  const event = useAgendaEvent();
  const { title } = agendaClassNames.event();
  return (
    <HeroText
      ref={ref}
      className={title({
        className,
      })}
      numberOfLines={1}
      {...restProps}
    >
      {children ?? event.title}
    </HeroText>
  );
});
// --------------------------------------------------
const AgendaEventTime = forwardRef((props, ref) => {
  const { children, className, style, ...restProps } = props;
  const event = useAgendaEvent();
  const { locale, timeZone } = useAgendaContext();
  const timeFormatter = useMemo(
    () =>
      new DateFormatter(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    [locale]
  );
  const timeLabel = useMemo(() => {
    if (event.isAllDay === true) {
      return 'All day';
    }
    const startLabel = timeFormatter.format(event.start.toDate(timeZone));
    const endLabel = timeFormatter.format(event.end.toDate(timeZone));
    return [startLabel, endLabel].join(' – ');
  }, [event, timeFormatter, timeZone]);
  const { time } = agendaClassNames.event();
  return (
    <HeroText
      ref={ref}
      className={time({
        className,
      })}
      style={style}
      numberOfLines={1}
      {...restProps}
    >
      {children ?? timeLabel}
    </HeroText>
  );
});
// --------------------------------------------------
/**
 * Default card content: color tint + accent bar + title + time (time auto-hides on
 * short chips).
 */
function AgendaEventDefaultContent(props) {
  const { showTime, classNames, styles: stylesProp } = props;
  const event = useAgendaEvent();
  const { content, tint, accentBar } = agendaClassNames.event();
  return (
    <View
      className={content({
        className: classNames?.content,
      })}
      style={stylesProp?.content}
    >
      {event.color !== undefined ? (
        <View
          pointerEvents="none"
          className={tint({
            className: classNames?.tint,
          })}
          style={[
            {
              backgroundColor: event.color,
              opacity: EVENT_COLOR_TINT_OPACITY,
            },
            stylesProp?.tint,
          ]}
        />
      ) : null}
      {event.color !== undefined ? (
        <View
          pointerEvents="none"
          className={accentBar({
            className: classNames?.accentBar,
          })}
          style={[
            {
              backgroundColor: event.color,
            },
            stylesProp?.accentBar,
          ]}
        />
      ) : null}
      <AgendaEventTitle className={cn(classNames?.title)} style={stylesProp?.title} />
      {showTime ? (
        <AgendaEventTime className={cn(classNames?.time)} style={stylesProp?.time} />
      ) : null}
    </View>
  );
}
// --------------------------------------------------
const AgendaEvent = forwardRef((props, ref) => {
  const contextEvent = useAgendaEventOptional();
  const event = props.event ?? contextEvent;
  if (event === undefined) {
    throw new Error(
      'Agenda.Event requires an `event` prop or an event template context ' +
        '(rendered as Agenda.DayColumns children)'
    );
  }
  return <AgendaEventCard ref={ref} {...props} event={event} />;
});
const AgendaEventCard = forwardRef((props, ref) => {
  const {
    event,
    children,
    className,
    classNames,
    styles: stylesProp,
    animation,
    isAnimatedStyleActive = true,
    style,
    ...restProps
  } = props;
  const { startHour, endHour, selectedEventId, selectEvent, getEventLayout } = useAgendaContext();
  const { pxPerMinute, onEventMove, onEventResize, onEventPress } = useAgendaInternal();
  const { dayColumnWidth } = useAgendaPageInternal();
  const { contentHeight, dragGuides, onDragGuideChange } = useAgendaTimeGridInternal();
  const { dayIndex, daysCount } = useAgendaDayColumn();
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const isRTL = useIsRTL();
  const isSelected = selectedEventId === event.id;
  const [isDragging, setIsDragging] = useState(false);
  const durationMinutes = Math.max(getEventDurationMinutes(event), MIN_EVENT_MINUTES);
  const startMinutes = getMinutesFromMidnight(event.start);
  const topPx = clampNumber((startMinutes - startHour * 60) * pxPerMinute, 0, contentHeight);
  const heightPx = clampNumber(
    durationMinutes * pxPerMinute,
    MIN_EVENT_MINUTES * pxPerMinute,
    contentHeight - topPx
  );
  const { columnIndex, totalColumns } = getEventLayout(event.id);
  const columnSlotWidth = dayColumnWidth / totalColumns;
  const leftPx = columnIndex * columnSlotWidth + 1;
  const widthPx = Math.max(columnSlotWidth - 3, 24);
  const isMovable =
    DndDraggable !== undefined && onEventMove !== undefined && event.isReadOnly !== true;
  const isResizable = onEventResize !== undefined && event.isReadOnly !== true;
  const lastTranslationRef = useRef({
    tx: 0,
    ty: 0,
  });
  const { rEventStyle } = useAgendaEventAnimation({
    animation,
    isActive: isDragging,
  });
  const resizeExtra = useSharedValue(0);
  // Drop offset keeps the chip at its snapped drop location while the move intent
  // round-trips through consumer state; it is zeroed atomically with the base
  // position swap on the UI thread (see the position commit effect below), so
  // the chip never blinks back to its old slot.
  const dropOffsetX = useSharedValue(0);
  const dropOffsetY = useSharedValue(0);
  // The just-dragged chip must reposition instantly on its commit render (the
  // drop offset trick already placed it there); springing would fight the
  // offset reset and re-introduce the blink. Other chips reorganizing around
  // it keep the spring. Armed in `handleDragEnd`, consumed by the position
  // commit effect below via `pendingInstantPositionRef`.
  const instantPositionCommitRef = useRef(false);
  const pendingInstantPositionRef = useRef(false);
  const offsetFallbackTimerRef = useRef(null);
  const eventTimeKey = `${event.start.toString()}|${event.end.toString()}`;
  const prevEventTimeKeyRef = useRef(eventTimeKey);
  if (prevEventTimeKeyRef.current !== eventTimeKey) {
    prevEventTimeKeyRef.current = eventTimeKey;
    // The move/resize round-trip delivered the updated event, so the safety
    // fallback must not fire anymore: on a cold first drag (dev-mode warm-up)
    // it could beat this commit and blink the chip back to its old slot.
    if (offsetFallbackTimerRef.current !== null) {
      clearTimeout(offsetFallbackTimerRef.current);
      offsetFallbackTimerRef.current = null;
    }
    pendingInstantPositionRef.current = instantPositionCommitRef.current;
    instantPositionCommitRef.current = false;
  }
  // Safety net: when the consumer ignores the move/resize intent, snap the chip
  // back to the position derived from the (unchanged) event data.
  const scheduleOffsetFallbackReset = useCallback(() => {
    if (offsetFallbackTimerRef.current !== null) {
      clearTimeout(offsetFallbackTimerRef.current);
    }
    offsetFallbackTimerRef.current = setTimeout(() => {
      offsetFallbackTimerRef.current = null;
      dropOffsetX.set(0);
      dropOffsetY.set(0);
      resizeExtra.set(0);
    }, 400);
  }, [dropOffsetX, dropOffsetY, resizeExtra]);
  useEffect(() => {
    return () => {
      if (offsetFallbackTimerRef.current !== null) {
        clearTimeout(offsetFallbackTimerRef.current);
      }
    };
  }, []);
  const rDropOffsetStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: dropOffsetX.get(),
        },
        {
          translateY: dropOffsetY.get(),
        },
      ],
    };
  }, []);
  // The rendered height lives entirely on the UI thread: base height and the live
  // resize delta swap in a single UI-thread update when new event data arrives, so
  // the chip never flashes its previous height between the two writes.
  const resizeBaseHeight = useSharedValue(heightPx);
  useEffect(() => {
    scheduleOnUI(() => {
      'worklet';
      resizeBaseHeight.set(heightPx);
      resizeExtra.set(0);
    });
  }, [heightPx, resizeBaseHeight, resizeExtra]);
  const rResizeStyle = useAnimatedStyle(() => {
    return {
      height: resizeBaseHeight.get() + resizeExtra.get(),
    };
  }, []);
  // The chip's position and width live entirely on the UI thread, same as the
  // height above. On the commit render after a drag, the new base position and
  // the drop-offset reset land in one atomic UI-thread update, so the chip
  // never flashes its previous slot between the two writes (a JS-thread
  // offset reset racing the Fabric layout commit caused exactly that flicker
  // on Android). Other chips reorganizing around it spring manually, which
  // replaces the former layout transition (see `EVENT_POSITION_SPRING`).
  const basePositionTop = useSharedValue(topPx);
  const basePositionStart = useSharedValue(leftPx);
  const basePositionWidth = useSharedValue(widthPx);
  useEffect(() => {
    const instant = pendingInstantPositionRef.current || isAllAnimationsDisabled;
    pendingInstantPositionRef.current = false;
    scheduleOnUI(() => {
      'worklet';
      if (instant) {
        basePositionTop.set(topPx);
        basePositionStart.set(leftPx);
        basePositionWidth.set(widthPx);
        dropOffsetX.set(0);
        dropOffsetY.set(0);
      } else {
        basePositionTop.set(withSpring(topPx, EVENT_POSITION_SPRING));
        basePositionStart.set(withSpring(leftPx, EVENT_POSITION_SPRING));
        basePositionWidth.set(withSpring(widthPx, EVENT_POSITION_SPRING));
      }
    });
  }, [
    topPx,
    leftPx,
    widthPx,
    isAllAnimationsDisabled,
    basePositionTop,
    basePositionStart,
    basePositionWidth,
    dropOffsetX,
    dropOffsetY,
  ]);
  // `start` (not `left`): overlap sub-columns fill the day column from the
  // leading edge, which is the right side in RTL.
  const rPositionStyle = useAnimatedStyle(() => {
    return {
      top: basePositionTop.get(),
      start: basePositionStart.get(),
      width: basePositionWidth.get(),
    };
  }, []);
  const handlePress = useCallback(() => {
    if (onEventPress !== undefined) {
      onEventPress(event);
      return;
    }
    selectEvent(isSelected ? null : event.id);
  }, [onEventPress, event, selectEvent, isSelected]);
  const minStartMinutes = startHour * 60;
  const maxStartMinutes = Math.max(minStartMinutes, endHour * 60 - durationMinutes);
  /**
   * Snapped, clamped start minutes for a live vertical drag translation.
   */
  const projectStartMinutes = useCallback(
    (translationY) => {
      const minuteDelta = snapDeltaMinutes(translationY, pxPerMinute, SNAP_MINUTES);
      return clampNumber(startMinutes + minuteDelta, minStartMinutes, maxStartMinutes);
    },
    [pxPerMinute, startMinutes, minStartMinutes, maxStartMinutes]
  );
  const lastGuideMinutesRef = useRef(null);
  // `animated: false` places the lines instantly (drag start must show them at the
  // grabbed event's position, not glide in from a previous drag's position);
  // `animated: true` lightly times the 5-minute steps while dragging.
  const updateDragGuides = useCallback(
    (projectedStartMinutes, animated) => {
      const startY = (projectedStartMinutes - minStartMinutes) * pxPerMinute;
      const endY = (projectedStartMinutes + durationMinutes - minStartMinutes) * pxPerMinute;
      if (animated && !isAllAnimationsDisabled) {
        dragGuides.startY.set(
          withTiming(startY, {
            duration: DRAG_GUIDE_STEP_DURATION_MS,
          })
        );
        dragGuides.endY.set(
          withTiming(endY, {
            duration: DRAG_GUIDE_STEP_DURATION_MS,
          })
        );
      } else {
        dragGuides.startY.set(startY);
        dragGuides.endY.set(endY);
      }
      if (lastGuideMinutesRef.current !== projectedStartMinutes) {
        lastGuideMinutesRef.current = projectedStartMinutes;
        onDragGuideChange({
          start: projectedStartMinutes,
          end: projectedStartMinutes + durationMinutes,
        });
      }
    },
    [
      dragGuides,
      minStartMinutes,
      pxPerMinute,
      durationMinutes,
      isAllAnimationsDisabled,
      onDragGuideChange,
    ]
  );
  const handleDragStart = useCallback(() => {
    lastTranslationRef.current = {
      tx: 0,
      ty: 0,
    };
    setIsDragging(true);
    lastGuideMinutesRef.current = null;
    updateDragGuides(projectStartMinutes(0), false);
    dragGuides.startActive.set(true);
    dragGuides.endActive.set(true);
  }, [updateDragGuides, projectStartMinutes, dragGuides]);
  const handleDragging = useCallback(
    (payload) => {
      lastTranslationRef.current = {
        tx: payload.tx,
        ty: payload.ty,
      };
      updateDragGuides(projectStartMinutes(payload.ty), true);
    },
    [updateDragGuides, projectStartMinutes]
  );
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragGuides.startActive.set(false);
    dragGuides.endActive.set(false);
    lastGuideMinutesRef.current = null;
    onDragGuideChange(null);
    if (onEventMove === undefined) {
      return;
    }
    const { tx, ty } = lastTranslationRef.current;
    lastTranslationRef.current = {
      tx: 0,
      ty: 0,
    };
    // Gesture translation is physical; day columns flow right-to-left in
    // RTL, so a rightward (positive) drag moves the chip to an earlier day.
    const physicalDayDelta =
      daysCount > 1 && dayColumnWidth > 0 ? Math.round(tx / dayColumnWidth) : 0;
    const rawDayDelta = isRTL ? -physicalDayDelta : physicalDayDelta;
    const targetDayIndex = clampNumber(dayIndex + rawDayDelta, 0, daysCount - 1);
    const dayDelta = targetDayIndex - dayIndex;
    const newStartMinutes = projectStartMinutes(ty);
    if (dayDelta === 0 && newStartMinutes === startMinutes) {
      return;
    }
    // `translateX` is physical too — convert the semantic day delta back.
    dropOffsetX.set((isRTL ? -dayDelta : dayDelta) * dayColumnWidth);
    dropOffsetY.set((newStartMinutes - startMinutes) * pxPerMinute);
    instantPositionCommitRef.current = true;
    scheduleOffsetFallbackReset();
    const newStart = event.start
      .add({
        days: dayDelta,
      })
      .set({
        hour: Math.floor(newStartMinutes / 60),
        minute: newStartMinutes % 60,
        second: 0,
        millisecond: 0,
      });
    const newEnd = newStart.add({
      minutes: durationMinutes,
    });
    onEventMove(event.id, newStart, newEnd);
  }, [
    onEventMove,
    pxPerMinute,
    daysCount,
    dayColumnWidth,
    dayIndex,
    durationMinutes,
    startMinutes,
    event.id,
    event.start,
    dropOffsetX,
    dropOffsetY,
    scheduleOffsetFallbackReset,
    projectStartMinutes,
    dragGuides,
    onDragGuideChange,
    isRTL,
  ]);
  const maxDurationMinutes = Math.max(MIN_EVENT_MINUTES, endHour * 60 - startMinutes);
  const commitResize = useCallback(
    (translationY) => {
      if (onEventResize === undefined) {
        return;
      }
      const minuteDelta = snapDeltaMinutes(translationY, pxPerMinute, SNAP_MINUTES);
      const newDuration = clampNumber(
        durationMinutes + minuteDelta,
        MIN_EVENT_MINUTES,
        maxDurationMinutes
      );
      if (newDuration === durationMinutes) {
        resizeExtra.set(0);
        return;
      }
      scheduleOffsetFallbackReset();
      const newEnd = event.start.add({
        minutes: newDuration,
      });
      onEventResize(event.id, event.start, newEnd);
    },
    [
      onEventResize,
      pxPerMinute,
      durationMinutes,
      maxDurationMinutes,
      event.id,
      event.start,
      resizeExtra,
      scheduleOffsetFallbackReset,
    ]
  );
  const minResizeExtra = (MIN_EVENT_MINUTES - durationMinutes) * pxPerMinute;
  const maxResizeExtra = Math.max(0, contentHeight - topPx - heightPx);
  const isResizing = useSharedValue(false);
  const { rGrabberStyle } = useAgendaEventResizeGrabberAnimation({
    isResizing,
  });
  // While a touch rests on the resize handle, the event's long-press move drag is
  // disabled so a slow grab of the handle cannot turn into a move.
  const [isHandleTouched, setIsHandleTouched] = useState(false);
  // Resizing shows a single end-time guide; the snapped end minute is mirrored to
  // JS only when it changes, to update the rail label.
  const lastResizeGuideMinutes = useSharedValue(-1);
  const emitResizeGuideMinutes = useCallback(
    (endMinutes) => {
      onDragGuideChange({
        end: endMinutes,
      });
    },
    [onDragGuideChange]
  );
  const clearGuideLabels = useCallback(() => {
    onDragGuideChange(null);
  }, [onDragGuideChange]);
  const resizeGesture = useMemo(() => {
    return (
      Gesture.Pan()
        .enabled(isResizable)
        .hitSlop(RESIZE_GESTURE_HIT_SLOP)
        // Activate on minimal vertical movement so the resize wins the race against
        // both the vertical scroll and the delayed move drag.
        .activeOffsetY([-3, 3])
        .onTouchesDown(() => {
          'worklet';
          scheduleOnRN(setIsHandleTouched, true);
        })
        .onStart(() => {
          'worklet';
          isResizing.set(true);
          const endMinutes = startMinutes + durationMinutes;
          dragGuides.endY.set((endMinutes - minStartMinutes) * pxPerMinute);
          dragGuides.endActive.set(true);
          lastResizeGuideMinutes.set(endMinutes);
          scheduleOnRN(emitResizeGuideMinutes, endMinutes);
        })
        .onFinalize(() => {
          'worklet';
          isResizing.set(false);
          dragGuides.endActive.set(false);
          scheduleOnRN(setIsHandleTouched, false);
          scheduleOnRN(clearGuideLabels);
        })
        .onUpdate((gestureEvent) => {
          'worklet';
          const next = Math.min(
            Math.max(gestureEvent.translationY, minResizeExtra),
            maxResizeExtra
          );
          resizeExtra.set(next);
          const minuteDelta = snapDeltaMinutes(next, pxPerMinute, SNAP_MINUTES);
          const newDuration = Math.min(
            Math.max(durationMinutes + minuteDelta, MIN_EVENT_MINUTES),
            maxDurationMinutes
          );
          const endMinutes = startMinutes + newDuration;
          const endGuideY = (endMinutes - minStartMinutes) * pxPerMinute;
          dragGuides.endY.set(
            isAllAnimationsDisabled
              ? endGuideY
              : withTiming(endGuideY, {
                  duration: DRAG_GUIDE_STEP_DURATION_MS,
                })
          );
          if (lastResizeGuideMinutes.get() !== endMinutes) {
            lastResizeGuideMinutes.set(endMinutes);
            scheduleOnRN(emitResizeGuideMinutes, endMinutes);
          }
        })
        .onEnd((gestureEvent) => {
          'worklet';
          const finalTranslation = Math.min(
            Math.max(gestureEvent.translationY, minResizeExtra),
            maxResizeExtra
          );
          // Hold the snapped height until the resized event data arrives, so the
          // chip does not blink back to its previous height.
          const minuteDelta = snapDeltaMinutes(finalTranslation, pxPerMinute, SNAP_MINUTES);
          const newDuration = Math.min(
            Math.max(durationMinutes + minuteDelta, MIN_EVENT_MINUTES),
            maxDurationMinutes
          );
          resizeExtra.set((newDuration - durationMinutes) * pxPerMinute);
          scheduleOnRN(commitResize, finalTranslation);
        })
    );
  }, [
    isResizable,
    minResizeExtra,
    maxResizeExtra,
    resizeExtra,
    isResizing,
    commitResize,
    pxPerMinute,
    durationMinutes,
    maxDurationMinutes,
    startMinutes,
    minStartMinutes,
    dragGuides,
    lastResizeGuideMinutes,
    isAllAnimationsDisabled,
    emitResizeGuideMinutes,
    clearGuideLabels,
  ]);
  const { container: eventContainer, resizeHandle, resizeGrabber } = agendaClassNames.event();
  // Position and width come from `rPositionStyle` (UI-thread driven).
  const positionStyle = {
    position: 'absolute',
  };
  const cardStyles = isAnimatedStyleActive ? [rResizeStyle, rEventStyle] : [rResizeStyle];
  const content = (
    <Animated.View style={rDropOffsetStyle}>
      <Animated.View style={cardStyles}>
        <Pressable
          className={eventContainer({
            className: [className, classNames?.container],
          })}
          accessibilityRole="button"
          accessibilityLabel={event.title}
          accessibilityState={{
            selected: isSelected,
          }}
          style={[agendaStyleSheet.borderCurve, stylesProp?.container]}
          onPress={handlePress}
          data-selected={isSelected}
          data-unconfirmed={event.status === 'unconfirmed'}
        >
          <AgendaEventProvider value={event}>
            {children ?? (
              <AgendaEventDefaultContent
                showTime={heightPx > EVENT_TIME_MIN_HEIGHT}
                classNames={classNames}
                styles={stylesProp}
              />
            )}
          </AgendaEventProvider>
          {isResizable ? (
            <GestureDetector gesture={resizeGesture}>
              <View
                className={resizeHandle({
                  className: classNames?.resizeHandle,
                })}
                style={[
                  {
                    height: RESIZE_HANDLE_HIT_HEIGHT,
                  },
                  stylesProp?.resizeHandle,
                ]}
              >
                <Animated.View
                  className={resizeGrabber({
                    className: classNames?.resizeGrabber,
                  })}
                  style={[rGrabberStyle, stylesProp?.resizeGrabber]}
                  data-selected={isSelected}
                />
              </View>
            </GestureDetector>
          ) : null}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
  if (isMovable && DndDraggable !== undefined) {
    return (
      <Animated.View ref={ref} style={[positionStyle, rPositionStyle, style]} {...restProps}>
        <DndDraggable
          data={event.id}
          draggableId={event.id}
          dragDisabled={isHandleTouched}
          preDragDelay={EVENT_PRE_DRAG_DELAY}
          dragAxis={daysCount > 1 ? 'both' : 'y'}
          animationFunction={instantDropAnimation}
          onDragStart={handleDragStart}
          onDragging={handleDragging}
          onDragEnd={handleDragEnd}
        >
          {content}
        </DndDraggable>
      </Animated.View>
    );
  }
  return (
    <Animated.View ref={ref} style={[positionStyle, rPositionStyle, style]} {...restProps}>
      {content}
    </Animated.View>
  );
});
// ==================================================
// Current time indicator (day/week pages)
// ==================================================
const AgendaCurrentTimeIndicator = forwardRef((props, ref) => {
  const { className, classNames, styles: stylesProp, style, ...restProps } = props;
  const { startHour, endHour, locale, timeZone } = useAgendaContext();
  const { pxPerMinute } = useAgendaInternal();
  const { days, isMonthPage } = useAgendaPage();
  const [now, setNow] = useState(() => new Date());
  // Month pages never render the indicator, so they skip the clock entirely.
  // Day/week pages keep ticking even without today: at midnight the page
  // containing the new today must start rendering the indicator.
  useEffect(() => {
    if (isMonthPage) {
      return;
    }
    const interval = setInterval(() => {
      setNow(new Date());
    }, NOW_INDICATOR_INTERVAL_MS);
    return () => {
      clearInterval(interval);
    };
  }, [isMonthPage]);
  // Derived from the ticking `now` so the indicator follows midnight rollover
  // instead of staying on the page that was "today" at mount time.
  const localToday = useMemo(() => toCalendarDate(fromDate(now, timeZone)), [now, timeZone]);
  const containsToday = useMemo(
    () => days.some((day) => isSameDay(day, localToday)),
    [days, localToday]
  );
  const timeFormatter = useMemo(
    () =>
      new DateFormatter(locale, {
        hour: 'numeric',
        minute: '2-digit',
      }),
    [locale]
  );
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (isMonthPage || !containsToday || nowMinutes < startHour * 60 || nowMinutes > endHour * 60) {
    return null;
  }
  const top = (nowMinutes - startHour * 60) * pxPerMinute;
  const { container, gutter, badge, line, dot, label } = agendaClassNames.currentTimeIndicator();
  return (
    <View
      ref={ref}
      pointerEvents="none"
      className={container({
        className: [className, classNames?.container],
      })}
      style={[
        {
          top: top - 9,
        },
        stylesProp?.container,
        style,
      ]}
      {...restProps}
    >
      <View
        className={gutter({
          className: classNames?.gutter,
        })}
        style={[
          {
            minWidth: TIME_GUTTER_WIDTH,
          },
          stylesProp?.gutter,
        ]}
      >
        <View
          className={badge({
            className: classNames?.badge,
          })}
          style={[agendaStyleSheet.borderCurve, stylesProp?.badge]}
        >
          <HeroText
            className={label({
              className: classNames?.label,
            })}
            style={stylesProp?.label}
            numberOfLines={1}
          >
            {timeFormatter.format(now)}
          </HeroText>
        </View>
      </View>
      <View
        className={dot({
          className: classNames?.dot,
        })}
        style={stylesProp?.dot}
      />
      <View
        className={line({
          className: classNames?.line,
        })}
        style={stylesProp?.line}
      />
    </View>
  );
});
// ==================================================
// Month grid (month pages)
// ==================================================
/**
 * Default month chip content: color tint + title (shared by spanning bars and cell
 * chips via the `titleClassName` slot).
 */
function AgendaMonthEventDefaultContent(props) {
  const { titleClassName, titleStyle } = props;
  const event = useAgendaEvent();
  return (
    <>
      {event.color !== undefined ? (
        <View
          pointerEvents="none"
          className="agenda__absolute-fill"
          style={{
            backgroundColor: event.color,
            opacity: EVENT_COLOR_TINT_OPACITY,
          }}
        />
      ) : null}
      <HeroText className={titleClassName} style={titleStyle} numberOfLines={1}>
        {event.title}
      </HeroText>
    </>
  );
}
const AgendaMonthGrid = forwardRef((props, ref) => {
  const {
    children,
    maxEventsPerCell = DEFAULT_MAX_MONTH_EVENTS,
    moreLabel,
    className,
    classNames,
    styles: stylesProp,
    style,
    ...restProps
  } = props;
  const {
    date,
    locale,
    timeZone,
    setDate,
    setView,
    selectedEventId,
    selectEvent,
    getMonthRowLayout,
    getPerCellEvents,
  } = useAgendaContext();
  const { onEventPress } = useAgendaInternal();
  const { date: monthDate, weeks, isMonthPage } = useAgendaPage();
  const { pageWidth, isEventsLayerReady } = useAgendaPageInternal();
  const { isAllAnimationsDisabled } = useAnimationSettings();
  const eventsLayerEntering = isAllAnimationsDisabled ? undefined : FadeIn.duration(220);
  const handleEventPress = useCallback(
    (pressedEvent, isSelected) => {
      if (onEventPress !== undefined) {
        onEventPress(pressedEvent);
        return;
      }
      selectEvent(isSelected ? null : pressedEvent.id);
    },
    [onEventPress, selectEvent]
  );
  const handleMorePress = useCallback(
    (day) => {
      setDate(day);
      setView('day');
    },
    [setDate, setView]
  );
  // Intentionally not memoized: recomputing on every render keeps the
  // `data-today` highlight correct after a midnight rollover.
  const localToday = today(timeZone);
  const weekdayFormatter = useMemo(
    () =>
      new DateFormatter(locale, {
        weekday: 'narrow',
      }),
    [locale]
  );
  const weekdayLabels = useMemo(() => {
    const firstWeek = weeks[0];
    if (firstWeek === undefined) {
      return [];
    }
    return firstWeek.map((day) => weekdayFormatter.format(day.toDate(timeZone)));
  }, [weeks, weekdayFormatter, timeZone]);
  const {
    container,
    weekdayRow,
    weekdayLabel,
    row,
    spanningLayer,
    spanningEvent,
    spanningEventTitle,
    cell,
    cellDate,
    cellEvents,
    cellEvent,
    cellEventTitle,
    cellMore,
  } = agendaClassNames.monthGrid();
  if (!isMonthPage) {
    return null;
  }
  const columnWidth = pageWidth / 7;
  const resolveMoreLabel = moreLabel ?? ((count) => `+${String(count)}`);
  return (
    <View
      ref={ref}
      className={container({
        className: [className, classNames?.container],
      })}
      style={[
        {
          width: pageWidth,
        },
        stylesProp?.container,
        style,
      ]}
      {...restProps}
    >
      <View
        className={weekdayRow({
          className: classNames?.weekdayRow,
        })}
        style={stylesProp?.weekdayRow}
      >
        {weekdayLabels.map((weekday, index) => (
          <HeroText
            key={String(index)}
            className={weekdayLabel({
              className: classNames?.weekdayLabel,
            })}
            style={stylesProp?.weekdayLabel}
          >
            {weekday}
          </HeroText>
        ))}
      </View>
      {weeks.map((week, weekIndex) => {
        const rowLayout = isEventsLayerReady
          ? getMonthRowLayout(week)
          : {
              items: [],
              rowCount: 0,
              rowCountPerCol: [],
            };
        return (
          <View
            key={String(weekIndex)}
            className={row({
              className: classNames?.row,
            })}
            style={stylesProp?.row}
          >
            {rowLayout.items.length > 0 ? (
              <Animated.View
                entering={eventsLayerEntering}
                pointerEvents="box-none"
                className={spanningLayer()}
              >
                {rowLayout.items.map((item) => {
                  const isSelected = selectedEventId === item.event.id;
                  return (
                    <Pressable
                      key={item.event.id}
                      className={spanningEvent({
                        className: classNames?.spanningEvent,
                      })}
                      accessibilityRole="button"
                      accessibilityLabel={item.event.title}
                      style={[
                        agendaStyleSheet.borderCurve,
                        {
                          // `start` so spanning bars anchor to the leading
                          // edge; month columns flow right-to-left in RTL.
                          start: item.colStart * columnWidth + 2,
                          width: item.colSpan * columnWidth - 4,
                          top: MONTH_DATE_OFFSET + item.row * MONTH_EVENT_HEIGHT,
                          height: MONTH_EVENT_HEIGHT - 2,
                        },
                        stylesProp?.spanningEvent,
                      ]}
                      onPress={() => handleEventPress(item.event, isSelected)}
                    >
                      <AgendaEventProvider value={item.event}>
                        {children ?? (
                          <AgendaMonthEventDefaultContent
                            titleClassName={spanningEventTitle({
                              className: classNames?.spanningEventTitle,
                            })}
                            titleStyle={stylesProp?.spanningEventTitle}
                          />
                        )}
                      </AgendaEventProvider>
                    </Pressable>
                  );
                })}
              </Animated.View>
            ) : null}
            {week.map((day, columnIndex) => {
              const dayCellEvents = isEventsLayerReady ? getPerCellEvents(day, week) : [];
              const spanningRows = rowLayout.rowCountPerCol[columnIndex] ?? 0;
              const visibleChipCount = Math.max(0, maxEventsPerCell - spanningRows);
              const visibleChips = dayCellEvents.slice(0, visibleChipCount);
              const overflowCount = dayCellEvents.length - visibleChips.length;
              const isDayToday = isSameDay(day, localToday);
              const isDaySelected = isSameDay(day, date) && !isDayToday;
              const isOutsideMonth = !isSameMonth(day, monthDate);
              return (
                <Pressable
                  key={day.toString()}
                  className={cell({
                    className: classNames?.cell,
                  })}
                  style={stylesProp?.cell}
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${day.toString()}`}
                  onPress={() => setDate(day)}
                >
                  <HeroText
                    className={cellDate({
                      className: classNames?.cellDate,
                    })}
                    style={stylesProp?.cellDate}
                    data-today={isDayToday}
                    data-selected={isDaySelected}
                    data-outside-month={isOutsideMonth}
                  >
                    {String(day.day)}
                  </HeroText>
                  <View
                    style={{
                      height: spanningRows * MONTH_EVENT_HEIGHT,
                    }}
                  />
                  {visibleChips.length > 0 || overflowCount > 0 ? (
                    <Animated.View
                      entering={eventsLayerEntering}
                      className={cellEvents({
                        className: classNames?.cellEvents,
                      })}
                      style={stylesProp?.cellEvents}
                    >
                      {visibleChips.map((event) => {
                        const isSelected = selectedEventId === event.id;
                        return (
                          <Pressable
                            key={event.id}
                            className={cellEvent({
                              className: classNames?.cellEvent,
                            })}
                            accessibilityRole="button"
                            accessibilityLabel={event.title}
                            style={[
                              agendaStyleSheet.borderCurve,
                              {
                                height: MONTH_EVENT_HEIGHT - 2,
                              },
                              stylesProp?.cellEvent,
                            ]}
                            onPress={() => handleEventPress(event, isSelected)}
                          >
                            <AgendaEventProvider value={event}>
                              {children ?? (
                                <AgendaMonthEventDefaultContent
                                  titleClassName={cellEventTitle({
                                    className: classNames?.cellEventTitle,
                                  })}
                                  titleStyle={stylesProp?.cellEventTitle}
                                />
                              )}
                            </AgendaEventProvider>
                          </Pressable>
                        );
                      })}
                      {overflowCount > 0 ? (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${String(overflowCount)} more events`}
                          onPress={() => handleMorePress(day)}
                        >
                          <HeroText
                            className={cellMore({
                              className: classNames?.cellMore,
                            })}
                            style={stylesProp?.cellMore}
                          >
                            {resolveMoreLabel(overflowCount)}
                          </HeroText>
                        </Pressable>
                      ) : null}
                    </Animated.View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
});
// ==================================================
// View selector
// ==================================================
const isAgendaView = (value) => {
  return value === 'day' || value === 'week' || value === 'month';
};
/**
 * `Segment.Group` with the overlay shadow applied by default, so the floating pill
 * casts a shadow both in the default composition and in custom `children`.
 */
const AgendaViewSelectorGroup = forwardRef((props, ref) => {
  const { className, ...restProps } = props;
  const groupClassName = agendaClassNames.viewSelectorGroup({
    className,
  });
  return <Segment.Group ref={ref} className={groupClassName} {...restProps} />;
});
const AgendaViewSelectorRoot = forwardRef((props, ref) => {
  const {
    children,
    options = DEFAULT_VIEW_OPTIONS,
    labels,
    className,
    size = 'sm',
    ...restProps
  } = props;
  const { view, setView } = useAgendaContext();
  const collapseHeader = useAgendaHeaderCollapse();
  // View-change flow: the indicator moves and the new view's empty grid mounts
  // immediately (cheap — pages gate their event chips), the header collapses, and
  // the chips arrive once the indicator animation has settled (see
  // useDeferredEventsLayer). Local selection keeps the indicator urgent even for
  // externally controlled view updates.
  const [selectedValue, setSelectedValue] = useState(view);
  useEffect(() => {
    setSelectedValue(view);
  }, [view]);
  const handleValueChange = useCallback(
    (value) => {
      if (isAgendaView(value)) {
        setSelectedValue(value);
        setView(value);
        collapseHeader();
      }
    },
    [setView, collapseHeader]
  );
  const viewSelectorClassName = agendaClassNames.viewSelector({
    className,
  });
  return (
    <Segment
      ref={ref}
      className={viewSelectorClassName}
      value={selectedValue}
      size={size}
      onValueChange={handleValueChange}
      {...restProps}
    >
      {children ?? (
        <AgendaViewSelectorGroup>
          <Segment.Indicator />
          {options.map((option) => (
            <Segment.Item key={option} value={option}>
              <Segment.Label>{labels?.[option] ?? DEFAULT_VIEW_LABELS[option]}</Segment.Label>
            </Segment.Item>
          ))}
        </AgendaViewSelectorGroup>
      )}
    </Segment>
  );
});
/**
 * `Agenda.ViewSelector` extends `Segment`: every Segment part except `ScrollView`
 * is exposed for custom compositions (item values must be `AgendaView` strings).
 */
const AgendaViewSelector = Object.assign(AgendaViewSelectorRoot, {
  Group: AgendaViewSelectorGroup,
  Indicator: Segment.Indicator,
  Item: Segment.Item,
  Label: Segment.Label,
  Separator: Segment.Separator,
});
// ==================================================
// Compound export
// ==================================================
AgendaRoot.displayName = DISPLAY_NAME.ROOT;
AgendaBackground.displayName = DISPLAY_NAME.BACKGROUND;
AgendaHeader.displayName = DISPLAY_NAME.HEADER;
AgendaCalendar.displayName = DISPLAY_NAME.CALENDAR;
AgendaCalendarHeader.displayName = DISPLAY_NAME.CALENDAR_HEADER;
AgendaCalendarGrid.displayName = DISPLAY_NAME.CALENDAR_GRID;
AgendaHeading.displayName = DISPLAY_NAME.HEADING;
AgendaTodayButton.displayName = DISPLAY_NAME.TODAY_BUTTON;
AgendaNavButton.displayName = DISPLAY_NAME.NAV_BUTTON;
AgendaDragArea.displayName = DISPLAY_NAME.DRAG_AREA;
AgendaDragHandle.displayName = DISPLAY_NAME.DRAG_HANDLE;
AgendaBody.displayName = DISPLAY_NAME.BODY;
AgendaWeekHeader.displayName = DISPLAY_NAME.WEEK_HEADER;
AgendaAllDaySection.displayName = DISPLAY_NAME.ALL_DAY_SECTION;
AgendaTimeGrid.displayName = DISPLAY_NAME.TIME_GRID;
AgendaDayColumns.displayName = DISPLAY_NAME.DAY_COLUMNS;
AgendaEvent.displayName = DISPLAY_NAME.EVENT;
AgendaEventTitle.displayName = DISPLAY_NAME.EVENT_TITLE;
AgendaEventTime.displayName = DISPLAY_NAME.EVENT_TIME;
AgendaCurrentTimeIndicator.displayName = DISPLAY_NAME.CURRENT_TIME_INDICATOR;
AgendaMonthGrid.displayName = DISPLAY_NAME.MONTH_GRID;
AgendaViewSelector.displayName = DISPLAY_NAME.VIEW_SELECTOR;
/**
 * Compound Agenda component with sub-components.
 *
 * @component Agenda - Root container. Receives the state built by `useAgenda(options)`
 * as spread props (`<Agenda {...agenda}>`, web parity), wraps everything in a
 * `SplitView` with snap points derived from the measured top content, and renders
 * the default composition when children are omitted.
 *
 * @component Agenda.Background - Absolute-fill background container behind the
 * agenda shell. With no children, the active library theme decides the content
 * (glass theme renders a blur layer with a surface-secondary-matched fallback).
 * Accepts children to host custom content such as gradients with the container's
 * positioning and clipping applied. Replaceable via the `background` prop on Agenda.
 *
 * @component Agenda.Header - Top SplitView pane; measures its natural content height
 * so consumer content below the calendar expands the snap points dynamically.
 *
 * @component Agenda.Calendar - Month calendar bound to the agenda date, collapsing to
 * the selected week row at the minimum snap point. Children compose the calendar
 * anatomy (`Agenda.CalendarHeader`, `Agenda.CalendarGrid`, raw `Calendar.*` parts).
 *
 * @component Agenda.CalendarHeader - Measured wrapper around `Calendar.Header`;
 * children compose the header content (year picker trigger, nav, Today button).
 *
 * @component Agenda.CalendarGrid - Measured, collapse-animated month grid; children
 * customize day cells via `Calendar.GridBody`'s render API.
 *
 * @component Agenda.Heading - Localized month + year title for the active date.
 *
 * @component Agenda.TodayButton - Jumps to today and collapses the header.
 *
 * @component Agenda.NavButton - Previous / next agenda navigation for the current view.
 *
 * @component Agenda.DragArea - SplitView drag region between the header and the body.
 *
 * @component Agenda.DragHandle - Visual pill inside the drag area.
 *
 * @component Agenda.Body - Horizontally paged body kept in sync with the calendar.
 * Children act as the page template rendered per page (see `useAgendaPage`); parts
 * self-gate by view, so one template covers day, week, and month.
 *
 * @component Agenda.WeekHeader - Weekday letters (or names + date pills with
 * `showDates`) above the time grid on week pages.
 *
 * @component Agenda.AllDaySection - Packed all-day bars; children act as the
 * per-event template.
 *
 * @component Agenda.TimeGrid - Synced vertical hour grid with gutter labels, hour
 * lines, and drop guides; children compose the grid content.
 *
 * @component Agenda.DayColumns - One column per page day; children act as the
 * per-event template (default `Agenda.Event`).
 *
 * @component Agenda.Event - Positioned, draggable, resizable event card. Reads the
 * event from the template context; children customize the card content.
 *
 * @component Agenda.EventTitle - Title text of the template context event.
 *
 * @component Agenda.EventTime - Formatted time range of the template context event.
 *
 * @component Agenda.CurrentTimeIndicator - Live time badge + line on pages containing today.
 *
 * @component Agenda.MonthGrid - Month grid with spanning bars and per-cell chips;
 * children act as the per-event chip content template.
 *
 * @component Agenda.ViewSelector - Floating day / week / month selector built on
 * `Segment` (exposes `Group` / `Indicator` / `Item` / `Label` / `Separator`).
 *
 * State is built by `useAgenda(options)` and spread into the root. Inside the subtree,
 * `useAgendaContext()` exposes view, date, selection, event layout helpers, and
 * navigation actions; `useAgendaPage()` exposes the per-page date range; and
 * `useAgendaEvent()` exposes the current template event.
 */
const Agenda = Object.assign(AgendaRoot, {
  /** @optional Theme-aware background container behind the agenda shell. */
  Background: AgendaBackground,
  /** @optional Top SplitView pane with dynamic content measurement. */
  Header: AgendaHeader,
  /** @optional Collapsible month calendar bound to the agenda date. */
  Calendar: AgendaCalendar,
  /** @optional Measured wrapper around `Calendar.Header`. */
  CalendarHeader: AgendaCalendarHeader,
  /** @optional Measured, collapse-animated month grid. */
  CalendarGrid: AgendaCalendarGrid,
  /** @optional Month + year title for the active date. */
  Heading: AgendaHeading,
  /** @optional Jump-to-today button. */
  TodayButton: AgendaTodayButton,
  /** @optional Previous / next agenda navigation. */
  NavButton: AgendaNavButton,
  /** @optional SplitView drag region. */
  DragArea: AgendaDragArea,
  /** @optional SplitView drag pill. */
  DragHandle: AgendaDragHandle,
  /** @optional Paged day / week / month body (children = page template). */
  Body: AgendaBody,
  /** @optional Weekday row above the time grid on week pages. */
  WeekHeader: AgendaWeekHeader,
  /** @optional Packed all-day bars (children = per-event template). */
  AllDaySection: AgendaAllDaySection,
  /** @optional Synced vertical hour grid. */
  TimeGrid: AgendaTimeGrid,
  /** @optional One column per page day (children = per-event template). */
  DayColumns: AgendaDayColumns,
  /** @optional Positioned, draggable, resizable event card. */
  Event: AgendaEvent,
  /** @optional Title of the template context event. */
  EventTitle: AgendaEventTitle,
  /** @optional Time range of the template context event. */
  EventTime: AgendaEventTime,
  /** @optional Live time badge + line on pages containing today. */
  CurrentTimeIndicator: AgendaCurrentTimeIndicator,
  /** @optional Month grid (children = per-event chip template). */
  MonthGrid: AgendaMonthGrid,
  /** @optional Floating view mode selector built on `Segment`. */
  ViewSelector: AgendaViewSelector,
});
export { useAgenda, useAgendaContext, useAgendaEvent, useAgendaPage };
export default Agenda;
