// @ts-nocheck
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useControllableState } from '../../helpers/internal/hooks/index';
import { createContext } from '../../helpers/internal/utils/index';
import InternationalizedDatePackage from '../../optional/internationalized-date';
import { useSplitView } from '../../primitives/split-view/index';
import {
  DEFAULT_END_HOUR,
  DEFAULT_SLOT_DURATION,
  DEFAULT_SLOT_HEIGHT,
  DEFAULT_START_HOUR,
  EVENTS_LAYER_REVEAL_DELAY_MS,
} from './agenda.constants';
import {
  buildEventLayoutMap,
  clampNumber,
  getAllDayLayoutForDays,
  getMonthRowLayout,
  getPerCellEvents,
  getVisibleDays,
  getVisibleWeeks,
  toDateOnly,
} from './agenda.utils';
const { DateFormatter, getLocalTimeZone, isSameDay, today } = InternationalizedDatePackage ?? {};
// --------------------------------------------------
const [AgendaProvider, useAgendaContext] = createContext({
  name: 'AgendaContext',
  errorMessage: 'Agenda compound components must be used within Agenda',
});
const [AgendaInternalProvider, useAgendaInternal] = createContext({
  name: 'AgendaInternalContext',
  errorMessage: 'Agenda internal context must be used within Agenda',
});
const [AgendaPageProvider, useAgendaPage] = createContext({
  name: 'AgendaPageContext',
  errorMessage: 'Agenda page parts must be used within Agenda.Body (they render per pager page)',
});
const [AgendaPageInternalProvider, useAgendaPageInternal] = createContext({
  name: 'AgendaPageInternalContext',
  errorMessage: 'Agenda page parts must be used within Agenda.Body (they render per pager page)',
});
const [AgendaTimeGridInternalProvider, useAgendaTimeGridInternal] = createContext({
  name: 'AgendaTimeGridInternalContext',
  errorMessage: 'Agenda.DayColumns and Agenda.Event must be used within Agenda.TimeGrid',
});
const [AgendaDayColumnProvider, useAgendaDayColumn] = createContext({
  name: 'AgendaDayColumnContext',
  errorMessage: 'Agenda.Event must be used within Agenda.DayColumns',
});
const [AgendaCalendarInternalProvider, useAgendaCalendarInternal] = createContext({
  name: 'AgendaCalendarInternalContext',
  errorMessage: 'Agenda.CalendarHeader and Agenda.CalendarGrid must be used within Agenda.Calendar',
});
const [AgendaEventProvider, useAgendaEventOptional] = createContext({
  name: 'AgendaEventContext',
  strict: false,
});
/**
 * Returns the event of the surrounding item template (`Agenda.DayColumns`,
 * `Agenda.AllDaySection`, or `Agenda.MonthGrid` children). Throws outside a template.
 */
function useAgendaEvent() {
  const event = useAgendaEventOptional();
  if (event === undefined) {
    throw new Error(
      'useAgendaEvent must be used within an Agenda event template ' +
        '(Agenda.DayColumns / Agenda.AllDaySection / Agenda.MonthGrid children)'
    );
  }
  return event;
}
export {
  AgendaCalendarInternalProvider,
  AgendaDayColumnProvider,
  AgendaEventProvider,
  AgendaInternalProvider,
  AgendaPageInternalProvider,
  AgendaPageProvider,
  AgendaProvider,
  AgendaTimeGridInternalProvider,
  useAgendaCalendarInternal,
  useAgendaContext,
  useAgendaDayColumn,
  useAgendaEvent,
  useAgendaEventOptional,
  useAgendaInternal,
  useAgendaPage,
  useAgendaPageInternal,
  useAgendaTimeGridInternal,
};
// --------------------------------------------------
/**
 * Shared header-collapse behavior for calendar date presses, the Today button, and
 * view selector changes.
 *
 * The accompanying state update runs first as a React transition (the pager moves to
 * the new date / view while the JS thread renders the heavy content concurrently);
 * the SplitView collapses to the week row right after that transition commits, so
 * the snap spring starts on an idle JS thread and stays smooth.
 */
export function useAgendaHeaderCollapse() {
  const splitViewCtx = useSplitView();
  const [isPending, startCollapseTransition] = useTransition();
  const pendingCollapseRef = useRef(false);
  const splitViewCtxRef = useRef(splitViewCtx);
  splitViewCtxRef.current = splitViewCtx;
  useEffect(() => {
    if (!isPending && pendingCollapseRef.current) {
      pendingCollapseRef.current = false;
      if (splitViewCtxRef.current.snapIndex !== 0) {
        splitViewCtxRef.current.snapTo(0);
      }
    }
  }, [isPending]);
  return useCallback(
    (update) => {
      if (update === undefined) {
        if (splitViewCtxRef.current.snapIndex !== 0) {
          splitViewCtxRef.current.snapTo(0);
        }
        return;
      }
      pendingCollapseRef.current = true;
      startCollapseTransition(update);
    },
    [startCollapseTransition]
  );
}
// --------------------------------------------------
/**
 * Pages mount their grid chrome urgently and bring the event chips in with a
 * delayed follow-up transition: view switches show the empty grid immediately, the
 * selector indicator animates unobstructed, and the data layer "arrives" once the
 * indicator has settled. Pages prefetched by the pager mount offscreen, so their
 * chips are usually ready before a swipe lands on them.
 */
export function useDeferredEventsLayer() {
  const [isEventsLayerReady, setIsEventsLayerReady] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      startTransition(() => {
        setIsEventsLayerReady(true);
      });
    }, EVENTS_LAYER_REVEAL_DELAY_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  return isEventsLayerReady;
}
// --------------------------------------------------
/**
 * State subset of {@link UseAgendaOptions} (everything except the interaction
 * callbacks carried through verbatim by {@link useAgenda}).
 */
/**
 * Stable empty result for day lookups without events, so repeated calls do not
 * allocate a fresh array (and memoized consumers keep referential equality).
 */
const EMPTY_EVENTS = [];
/**
 * Cached month-week layout: the packed spanning rows plus the per-cell (non-spanning)
 * events of each day, computed in one pass per week instead of once per cell.
 */
/**
 * Creates the Agenda state: controlled/uncontrolled view, date and selection, plus
 * memoized event layout helpers shared through {@link AgendaProvider}.
 */
function useAgendaState(options) {
  const {
    events: eventsProp,
    view: viewProp,
    defaultView = 'day',
    onViewChange,
    date: dateProp,
    defaultDate,
    onDateChange,
    selectedEventId: selectedEventIdProp,
    defaultSelectedEventId = null,
    onEventSelect,
    startHour = DEFAULT_START_HOUR,
    endHour = DEFAULT_END_HOUR,
    slotDuration = DEFAULT_SLOT_DURATION,
    slotHeight = DEFAULT_SLOT_HEIGHT,
    firstDayOfWeek,
    locale: localeProp,
    onEventDelete,
  } = options;
  // Sanitize the grid options at the public boundary: non-positive slot sizes would
  // yield Infinity/NaN positions (`pxPerMinute = slotHeight / slotDuration`), and an
  // inverted hour range a negative grid height. Invalid values fall back to safe ones.
  const resolvedSlotDuration = slotDuration > 0 ? slotDuration : DEFAULT_SLOT_DURATION;
  const resolvedSlotHeight = slotHeight > 0 ? slotHeight : DEFAULT_SLOT_HEIGHT;
  const resolvedStartHour = clampNumber(startHour, 0, 23);
  const resolvedEndHour = clampNumber(endHour, resolvedStartHour + 1, 24);
  // Event data renders at deferred priority: urgent updates (date / view changes)
  // commit immediately with the previous data, and the recomputed event layouts
  // catch up in a follow-up render — new data "arrives" instead of blocking.
  const events = useDeferredValue(eventsProp);
  const locale = useMemo(
    () => localeProp ?? Intl.DateTimeFormat().resolvedOptions().locale,
    [localeProp]
  );
  const timeZone = useMemo(() => getLocalTimeZone(), []);
  const initialTodayRef = useRef(null);
  if (initialTodayRef.current === null) {
    initialTodayRef.current = today(timeZone);
  }
  const initialToday = initialTodayRef.current;
  const [viewState, setViewState] = useControllableState({
    prop: viewProp,
    defaultProp: defaultView,
    onChange: onViewChange,
  });
  const view = viewState ?? defaultView;
  const [dateState, setDateState] = useControllableState({
    prop: dateProp,
    defaultProp: defaultDate ?? initialToday,
    onChange: onDateChange,
  });
  const date = dateState ?? defaultDate ?? initialToday;
  const [selectedEventIdState, setSelectedEventIdState] = useControllableState({
    prop: selectedEventIdProp,
    defaultProp: defaultSelectedEventId,
    onChange: onEventSelect,
  });
  const selectedEventId = selectedEventIdState ?? null;
  const setView = useCallback(
    (nextView) => {
      setViewState(nextView);
    },
    [setViewState]
  );
  const setDate = useCallback(
    (nextDate) => {
      setDateState(nextDate);
    },
    [setDateState]
  );
  const selectEvent = useCallback(
    (id) => {
      setSelectedEventIdState(id);
    },
    [setSelectedEventIdState]
  );
  const goToNext = useCallback(() => {
    if (view === 'day') {
      setDate(
        date.add({
          days: 1,
        })
      );
    } else if (view === 'week') {
      setDate(
        date.add({
          days: 7,
        })
      );
    } else {
      setDate(
        date.add({
          months: 1,
        })
      );
    }
  }, [view, date, setDate]);
  const goToPrevious = useCallback(() => {
    if (view === 'day') {
      setDate(
        date.subtract({
          days: 1,
        })
      );
    } else if (view === 'week') {
      setDate(
        date.subtract({
          days: 7,
        })
      );
    } else {
      setDate(
        date.subtract({
          months: 1,
        })
      );
    }
  }, [view, date, setDate]);
  const goToToday = useCallback(() => {
    setDate(today(timeZone));
  }, [setDate, timeZone]);
  const visibleDays = useMemo(
    () => getVisibleDays(view, date, locale, firstDayOfWeek),
    [view, date, locale, firstDayOfWeek]
  );
  const visibleWeeks = useMemo(
    () => (view === 'month' ? getVisibleWeeks(date, locale, firstDayOfWeek) : []),
    [view, date, locale, firstDayOfWeek]
  );
  const eventLayoutMap = useMemo(() => buildEventLayoutMap(events), [events]);
  const allDayEvents = useMemo(() => events.filter((event) => event.isAllDay === true), [events]);
  // Timed events indexed by start-day key: `getEventsForDay` runs per column per
  // render, so it must be a map lookup instead of a full O(events) filter. The
  // per-day arrays also keep a stable identity between calls.
  const timedEventsByDay = useMemo(() => {
    const map = new Map();
    for (const event of events) {
      if (event.isAllDay === true) {
        continue;
      }
      const key = toDateOnly(event.start).toString();
      const bucket = map.get(key);
      if (bucket === undefined) {
        map.set(key, [event]);
      } else {
        bucket.push(event);
      }
    }
    return map;
  }, [events]);
  const getEventsForDay = useCallback(
    (day) => timedEventsByDay.get(day.toString()) ?? EMPTY_EVENTS,
    [timedEventsByDay]
  );
  const getEventLayout = useCallback(
    (eventId) => {
      return (
        eventLayoutMap.get(eventId) ?? {
          columnIndex: 0,
          totalColumns: 1,
        }
      );
    },
    [eventLayoutMap]
  );
  const getAllEventsForDay = useCallback(
    (day) => {
      return events.filter((event) => isSameDay(event.start, day));
    },
    [events]
  );
  const getAllDayLayoutForDaysCallback = useCallback(
    (days) => getAllDayLayoutForDays(allDayEvents, days),
    [allDayEvents]
  );
  // Month week layouts are cached per week (keyed by the week's first day) and
  // invalidated when `events` changes: `Agenda.MonthGrid` asks for the same week's
  // layout once per row and once per cell, which would otherwise recompute the full
  // O(events) packing 8 times per week row on every render.
  const monthWeekLayoutCacheRef = useRef(null);
  const getMonthWeekLayoutEntry = useCallback(
    (week) => {
      let holder = monthWeekLayoutCacheRef.current;
      if (holder === null || holder.events !== events) {
        holder = {
          events,
          cache: new Map(),
        };
        monthWeekLayoutCacheRef.current = holder;
      }
      const key = week[0]?.toString() ?? '';
      const cached = holder.cache.get(key);
      if (cached !== undefined) {
        return cached;
      }
      const layout = getMonthRowLayout(events, week);
      const spanningIds = new Set(layout.items.map((item) => item.event.id));
      const perCellEventsByDay = new Map();
      for (const day of week) {
        perCellEventsByDay.set(day.toString(), getPerCellEvents(events, day, spanningIds));
      }
      const entry = {
        layout,
        perCellEventsByDay,
      };
      holder.cache.set(key, entry);
      return entry;
    },
    [events]
  );
  const getMonthRowLayoutCallback = useCallback(
    (week) => getMonthWeekLayoutEntry(week).layout,
    [getMonthWeekLayoutEntry]
  );
  const getPerCellEventsCallback = useCallback(
    (day, week) =>
      getMonthWeekLayoutEntry(week).perCellEventsByDay.get(day.toString()) ?? EMPTY_EVENTS,
    [getMonthWeekLayoutEntry]
  );
  const headingFormatterRef = useRef(null);
  const headingFormatterLocaleRef = useRef(null);
  const heading = useMemo(() => {
    if (headingFormatterRef.current === null || headingFormatterLocaleRef.current !== locale) {
      headingFormatterRef.current = new DateFormatter(locale, {
        month: 'long',
        year: 'numeric',
      });
      headingFormatterLocaleRef.current = locale;
    }
    return headingFormatterRef.current.format(date.toDate(timeZone));
  }, [date, locale, timeZone]);
  return useMemo(
    () => ({
      view,
      date,
      events,
      selectedEventId,
      startHour: resolvedStartHour,
      endHour: resolvedEndHour,
      slotDuration: resolvedSlotDuration,
      slotHeight: resolvedSlotHeight,
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
      getAllDayLayoutForDays: getAllDayLayoutForDaysCallback,
      getMonthRowLayout: getMonthRowLayoutCallback,
      getPerCellEvents: getPerCellEventsCallback,
      onEventDelete,
    }),
    [
      view,
      date,
      events,
      selectedEventId,
      resolvedStartHour,
      resolvedEndHour,
      resolvedSlotDuration,
      resolvedSlotHeight,
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
      getAllDayLayoutForDaysCallback,
      getMonthRowLayoutCallback,
      getPerCellEventsCallback,
      onEventDelete,
    ]
  );
}
// --------------------------------------------------
/**
 * Builds the Agenda state from options and returns the resolved state, layout
 * helpers, navigation actions, and interaction callbacks — web Agenda parity.
 *
 * Spread the returned object into the `Agenda` root:
 *
 * ```tsx
 * const agenda = useAgenda({ events, defaultView: 'week', onEventMove });
 * return <Agenda {...agenda}>...</Agenda>;
 * ```
 *
 * Inside the Agenda subtree, compound parts read the same state through
 * {@link useAgendaContext}.
 */
export function useAgenda(options) {
  const { onEventMove, onEventResize, onEventPress, ...stateOptions } = options;
  const state = useAgendaState(stateOptions);
  return useMemo(
    () => ({
      ...state,
      onEventMove,
      onEventResize,
      onEventPress,
    }),
    [state, onEventMove, onEventResize, onEventPress]
  );
}
